import json
import os
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path


DEMO_DIR = Path(__file__).resolve().parents[1]

FAKE_SPEAKER = textwrap.dedent(
    '''
    import json, sys, wave
    from pathlib import Path

    marker = Path(sys.argv[-1]).parent / 'speaker-invocations.txt'
    if len(sys.argv) == 4 and sys.argv[1] == '--batch':
        lines = json.loads(Path(sys.argv[2]).read_text())
        out = Path(sys.argv[3])
        out.mkdir(parents=True, exist_ok=True)
        marker.write_text('batch\\n')
        for index, _line in enumerate(lines):
            with wave.open(str(out / f'{index}.wav'), 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(24000)
                wav.writeframes(b'\\0\\0' * 24000)
        raise SystemExit(0)
    marker.write_text(marker.read_text() + 'single\\n' if marker.exists() else 'single\\n')
    raise SystemExit(1)
    '''
).lstrip()


def write_wav(path: Path, seconds: float = 0.5) -> None:
    import wave

    frames = int(24_000 * seconds)
    with wave.open(str(path), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(24_000)
        output.writeframes(b'\0\0' * frames)


class NarrateTests(unittest.TestCase):
    def setUp(self) -> None:
        self._tmp = tempfile.TemporaryDirectory()
        root = Path(self._tmp.name)
        (root / 'beats.json').write_text(
            json.dumps([{'name': 'chase_queue', 'ms': 0}, {'name': 'end', 'ms': 8000}]), encoding='utf-8'
        )
        script = root / 'narration.txt'
        script.write_text('chase_queue | 100 | Every stalled booking, named.\n', encoding='utf-8')
        speaker = root / 'fake_speaker.py'
        speaker.write_text(FAKE_SPEAKER, encoding='utf-8')
        self.root = root
        self.env = {
            **os.environ,
            'DEMO_DIR': str(root),
            'DEMO_SCRIPT': str(script),
            'DEMO_SPEAK': str(speaker),
            'DEMO_PYTHON': sys.executable,
        }

    def tearDown(self) -> None:
        self._tmp.cleanup()

    def run_narrate(self) -> subprocess.CompletedProcess:
        return subprocess.run(
            ['bash', str(DEMO_DIR / 'narrate.sh')], capture_output=True, text=True, env=self.env, timeout=60
        )

    def test_voice_is_synthesized_once_per_line_in_one_batch(self) -> None:
        result = self.run_narrate()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.root / 'speaker-invocations.txt').read_text(), 'batch\n')
        self.assertTrue((self.root / 'seg/0.wav').is_file())
        self.assertTrue((self.root / 'lines.json').is_file())
        self.assertTrue((self.root / 'narration.srt').is_file())
        # narrate.sh plans the voice; assemble.sh owns the mux.
        self.assertFalse((self.root / 'demo.mp4').exists())

    def test_external_segments_replace_the_voice_without_synthesis(self) -> None:
        seg = self.root / 'seg'
        seg.mkdir()
        write_wav(seg / '0.wav', 1.5)
        self.env['DEMO_SEGMENTS'] = 'external'

        result = self.run_narrate()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.root / 'speaker-invocations.txt').exists())
        lines = json.loads((self.root / 'lines.json').read_text())
        self.assertEqual(lines[0]['dur_ms'], 1500)

    def test_external_segments_must_cover_every_line(self) -> None:
        self.env['DEMO_SEGMENTS'] = 'external'

        result = self.run_narrate()

        self.assertNotEqual(result.returncode, 0)
        self.assertIn('seg/0.wav', result.stderr)


if __name__ == '__main__':
    unittest.main()
