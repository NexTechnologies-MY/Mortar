import json
import os
import subprocess
import tempfile
import unittest
import wave
from pathlib import Path


DEMO_DIR = Path(__file__).resolve().parents[1]


def ff(*args: str) -> None:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *args], check=True)


def color_video(path: Path, seconds: float, size: str = '1920x1080') -> None:
    ff('-f', 'lavfi', '-i', f'color=c=white:s={size}:d={seconds}:r=25', '-pix_fmt', 'yuv420p', str(path))


def slide_png(path: Path, color: str = 'red') -> None:
    ff('-f', 'lavfi', '-i', f'color=c={color}:s=1920x1080:d=1:r=1', '-frames:v', '1', str(path))


def write_wav(path: Path, seconds: float) -> None:
    frames = int(24_000 * seconds)
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(24_000)
        output.writeframes(b'\0\0' * frames)


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    return float(out)


@unittest.skipUnless(__import__('shutil').which('ffmpeg'), 'ffmpeg is required')
class AssemblePictureTests(unittest.TestCase):
    def test_slides_can_sit_before_and_after_the_capture(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            color_video(root / 'capture.webm', 2)
            slide_png(root / 'slide-s01.png')
            slide_png(root / 'slide-s02.png')
            (root / 'beats.json').write_text(
                json.dumps([{'name': 'chase_queue', 'ms': 100}, {'name': 'end', 'ms': 1900}]), encoding='utf-8'
            )
            env = {
                **os.environ,
                'DEMO_DIR': str(root),
                'DEMO_SLIDES': 's01:2 @capture s02:1',
            }

            result = subprocess.run(
                ['bash', str(DEMO_DIR / 'assemble.sh')], capture_output=True, text=True, env=env, timeout=120
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            beats = json.loads((root / 'beats.json').read_text())
            names = [b['name'] for b in beats]
            self.assertEqual(names, ['s01', 'chase_queue', 's02', 'end'])
            by_name = {b['name']: b['ms'] for b in beats}
            self.assertEqual(by_name['s01'], 0)
            self.assertAlmostEqual(by_name['chase_queue'], 2100, delta=50)
            self.assertAlmostEqual(by_name['s02'], 4000, delta=200)
            self.assertAlmostEqual(by_name['end'], 5000, delta=200)
            self.assertGreaterEqual(probe_duration(root / 'capture-joined.mp4'), 4.5)


@unittest.skipUnless(__import__('shutil').which('ffmpeg'), 'ffmpeg is required')
class AssembleMuxTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        root = Path(self._tmp.name)
        color_video(root / 'capture-joined.mp4', 6)
        (root / 'beats.json').write_text(
            json.dumps(
                [{'name': 'a', 'ms': 0}, {'name': 'b', 'ms': 3000}, {'name': 'end', 'ms': 6000}]
            ),
            encoding='utf-8',
        )
        script = root / 'narration.txt'
        script.write_text('a | 100 | First line.\nb | 100 | Second line.\n', encoding='utf-8')
        (root / 'seg').mkdir()
        write_wav(root / 'seg/0.wav', 1.0)
        write_wav(root / 'seg/1.wav', 1.0)
        bgm = root / 'bgm.wav'
        ff('-f', 'lavfi', '-i', 'sine=frequency=220:duration=30', str(bgm))
        self.root = root
        self.script = script
        self.env = {
            **os.environ,
            'DEMO_DIR': str(root),
            'DEMO_SCRIPT': str(script),
            'DEMO_BGM': str(bgm),
            'DEMO_MIN_DURATION': '0',
            'DEMO_MAX_DURATION': '30',
        }

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def run_assemble(self, env_update: dict | None = None) -> subprocess.CompletedProcess:
        env = {**self.env, **(env_update or {})}
        return subprocess.run(
            ['bash', str(DEMO_DIR / 'assemble.sh')], capture_output=True, text=True, env=env, timeout=120
        )

    def test_mux_fits_picture_to_voice_and_ducks_music(self) -> None:
        # Voice needs lines.json with durations, exactly as narrate.sh leaves it.
        narrate_env = {**self.env, 'DEMO_SEGMENTS': 'external'}
        scheduled = subprocess.run(
            ['bash', str(DEMO_DIR / 'narrate.sh')], capture_output=True, text=True, env=narrate_env, timeout=60
        )
        self.assertEqual(scheduled.returncode, 0, scheduled.stderr)

        result = self.run_assemble()

        self.assertEqual(result.returncode, 0, result.stderr)
        out = self.root / 'demo.mp4'
        self.assertTrue(out.is_file())
        # The 6s picture is trimmed to two 1350ms segments (line + 250ms tail).
        duration = probe_duration(out)
        self.assertLess(duration, 4.0)
        self.assertGreaterEqual(duration, 2.5)
        audio = json.loads(
            subprocess.run(
                ['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels,codec_name',
                 '-of', 'json', str(out)],
                check=True, capture_output=True, text=True,
            ).stdout
        )['streams'][0]
        self.assertEqual(audio['channels'], 2)
        self.assertEqual(audio['codec_name'], 'aac')
        self.assertIn('widest narration gap', result.stdout)

    def test_dead_air_between_lines_fails_the_mux(self) -> None:
        # Two lines inside one long beat, 5s apart: after the picture is fitted
        # the gap between the end of line one and the start of line two is
        # still 4.9s, so the mux must refuse to ship it.
        (self.root / 'beats.json').write_text(
            json.dumps([{'name': 'a', 'ms': 0}, {'name': 'end', 'ms': 15000}]), encoding='utf-8'
        )
        color_video(self.root / 'capture-joined.mp4', 15)
        self.script.write_text('a | 100 | First line.\na | 6000 | Second line, far too late.\n', encoding='utf-8')
        narrate_env = {**self.env, 'DEMO_SEGMENTS': 'external'}
        scheduled = subprocess.run(
            ['bash', str(DEMO_DIR / 'narrate.sh')], capture_output=True, text=True, env=narrate_env, timeout=60
        )
        self.assertEqual(scheduled.returncode, 0, scheduled.stderr)

        result = self.run_assemble()

        self.assertNotEqual(result.returncode, 0)
        self.assertIn('DEAD AIR', result.stderr)


if __name__ == '__main__':
    unittest.main()
