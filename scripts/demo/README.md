# Mortar Demo Recorder

Records the deployed Mortar site (`https://mortar-ppdggwxxjq-as.a.run.app`),
interleaves it with rendered pitch-deck slides, dubs the result with synthesized
or supplied narration, burns synchronized subtitles, adds a ducked music bed,
and muxes everything into a 1920x1080 H.264/AAC MP4 for the submission video.

```
narration.txt ──► manifest.py ──► speak.py ──► seg/*.wav ──► schedule.py ──┐
                                              └──► subtitles.py ──────────┤
                                                                          ├──► assemble.sh ──► demo.mp4
walk.mjs ──► record.mjs ──► capture.webm ──► assemble.sh (picture) ────────┘
                        └► beats.json ───────┘
slides/render.mjs ──► slide-sXX.png ─────────┘
```

- **Single source of truth**: `narration.txt` feeds both the voice segments and
  the burned subtitles through `lines.json`. What is spoken and what is
  displayed cannot diverge.
- **Beat-keyed timing**: Narration anchors to UI beats measured during the
  browser recording, not static timestamps. If production is slow, narration
  follows the picture.
- **Picture fits voice**: `assemble.sh` trims each beat segment to its last
  narrated line instead of padding audio. No stretch of video goes unremarked
  for more than `DEMO_MUTE_SEG_MS`.
- **No dead air**: The mux rejects any gap between spoken lines over
  `DEMO_MAX_GAP_MS` (1s).
- **Production-safe**: The walk mutates production (one task, two confirmed Jev
  proposals, one buyer message). `record.mjs` verifies the clean seed before
  filming and restores it from `/settings` afterwards.
- **Swappable voice**: The pipeline runs end to end on the placeholder Kokoro
  voice. Another lane can replace the audio by dropping wavs into
  `$DEMO_DIR/seg/` and re-running with `DEMO_SEGMENTS=external`.
- **Target runtime**: 4:00–4:45, hard ceiling 5:00
  (`DEMO_MIN_DURATION`/`DEMO_MAX_DURATION`).

---

## Provenance

This harness was carried across from `~/CS/Layak/scripts/demo`, which was itself
adapted from `TolongLabs/codenection-dev/scripts/demo` (earlier origin
`TolongLabs/MakanLah`, August 2026). It is shared team tooling — a camera and
dubber, not an application feature. Nothing in `scripts/demo/` ships to users.

---

## The Cut

The video follows the spine: pitch-deck slides frame the argument, then an
eight-step live walkthrough, then closing slides. `DEMO_SLIDES` orders them with
`@capture` marking where the product capture sits:

```bash
export DEMO_SLIDES="s01:20 s02:25 s04:34 s05:26 @capture s10:25 s17:19 s18:13 s20:10"
```

Slide names pin deck slide numbers in `docs/demo/mortar-pitch-deck.html` (`s01`
= slide 1). The seconds are first-draft holds; the mux trims each to its last
narrated line plus `DEMO_FIT_TAIL_MS`, so the values only need to be long enough
to cover the voice.

The capture's beat sequence (see `contract.mjs`):

| Beat             | What is on screen                                                   |
| ---------------- | ------------------------------------------------------------------- |
| `chase_queue`    | `/chase` as Sales Admin; the BK-9001 card with the suggested action |
| `chase_task`     | The task created from the suggestion, with owner and due date       |
| `case_overview`  | `/bookings/BK-9001`: loan and legal tracks, evidence provenance     |
| `case_risk`      | The financing-risk chip's tooltip naming what drives the flag       |
| `banker_message` | The banker's mixed Malay/English message; payslip missing           |
| `doc_pending`    | `Payslip Outstanding` on the case after confirming the proposal     |
| `buyer_reply`    | The pasted Malay buyer reply; Jev answers `Documents Received`      |
| `case_cleared`   | The outstanding-document pill leaves the case header                |
| `playbooks`      | The ranked playbook panel                                           |
| `stale_unknown`  | A stale-evidence booking under the unknown filter                   |
| `legal_persona`  | Legal Admin persona; the `/legal` signing queue                     |
| `forecast`       | `/forecast`: expected signings within 30 days and the validation    |
| `end`            | Closing hold before the capture stops                               |

---

## Harness Structure

| File                | Role                                                                 | Changes When                        |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| **`walk.mjs`**      | Camera choreography for the eight-step walkthrough; `mark()` beats   | App UI, routing, or the cut changes |
| **`narration.txt`** | Script lines keyed to beat names: `beat \| offset_ms \| text`        | The script or the cut changes       |
| `record.mjs`        | Browser runner; records `capture.webm` + `beats.json`, then resets   | Rarely                              |
| `contract.mjs`      | Exact required beat sequence and capture-completeness audit          | When the walkthrough changes        |
| `warmup.mjs`        | Clean-seed check + off-camera warm-up of `/chase`, case, `/forecast` | When the seed or routes change      |
| `proof.mjs`         | `/api/snapshot` clean-seed verification (27 messages, 0 tasks, ...)  | When the fixture changes            |
| `motion.mjs`        | Constant-rate camera scrolling with CSS easing suspended             | Rarely                              |
| `manifest.py`       | Resolves narrated beats; fails on missing visual moments             | Never (timing contract)             |
| `speak.py`          | Batch synthesis (Kokoro or reference-cloned Chatterbox)              | Rarely (TTS settings)               |
| `schedule.py`       | Clears speech collisions; rejects lines crossing visual beats        | Never (scheduling math)             |
| `subtitles.py`      | Generates line-wrapped SRT subtitle cards from `lines.json`          | Never (subtitle layout rules)       |
| `narrate.sh`        | Voice + schedule + subtitles; accepts external segments              | Rarely                              |
| `assemble.sh`       | Two phases: picture timeline, then fit-to-voice trim and final mux   | When the cut changes                |
| `slides/render.mjs` | Renders deck slides to PNG, broadcast-safe above the subtitle plate  | When the deck changes               |

---

## Install

Browser and audio dependencies stay in scratch directories and virtualenvs. **Do
not add them to `package.json` or the app workspaces.**

### 1. Playwright (Scratch Directory)

```bash
export DEMO_DIR="${TMPDIR:-/tmp}/mortar-demo"
mkdir -p "$DEMO_DIR" && cd "$DEMO_DIR"
bun add -d playwright
bunx playwright install chromium   # or use system Chrome via DEMO_CHANNEL=chrome
```

### 2. Kokoro TTS (Default Placeholder Voice)

```bash
export KOKORO_HOME="$HOME/.local/share/mortar-demo"
mkdir -p "$KOKORO_HOME" && cd "$KOKORO_HOME"
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python kokoro-onnx soundfile
curl -sLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

### 3. Chatterbox TTS (Optional, Cloned Voice)

```bash
export CHATTERBOX_HOME="$HOME/.local/share/mortar-demo/chatterbox"
mkdir -p "$CHATTERBOX_HOME" && cd "$CHATTERBOX_HOME"
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python \
  -r scripts/demo/chatterbox-requirements.txt

# Reference clip: 10-20 seconds of clean speech from one speaker.
cp /path/to/reference_sample.wav "$CHATTERBOX_HOME/reference.wav"
```

### 4. Music Bed

`assemble.sh` expects a music file when `DEMO_BGM` is set. The suite carries
`lofi-bgm.mp3` (see `lofi-bgm-track-list.txt`), looped to the cut's length,
faded in/out, held at `DEMO_BGM_GAIN_DB` (-20 dB), and sidechain-ducked further
whenever a line is speaking.

### System Tools

```bash
command -v ffmpeg && command -v ffprobe   # libass support is required for the subtitle burn
```

---

## Execution Commands

### 1. Capture

```bash
export DEMO_DIR="${TMPDIR:-/tmp}/mortar-demo"
node scripts/demo/record.mjs
```

`record.mjs` first calls `/api/snapshot` and refuses to film unless the seed is
clean (exactly 27 messages, 0 tasks, the four `MSG-9001-*` fixtures on BK-9001,
one provisional payslip proposal, no `documents_received`, no confirmed Jev
events). It then warms `/chase`, `/bookings/BK-9001` and `/forecast` off-camera
(retrying once), records the walk at 1440x900, and finally drives the
`Reset Demo Data` dialog on `/settings` in a second, unrecorded context and
re-verifies the seed. Set `DEMO_RESET_AFTER=0` only when filming a throwaway
deployment.

Outputs `$DEMO_DIR/capture.webm` and `$DEMO_DIR/beats.json`. The runner exits
non-zero unless every required beat was marked in order.

### 2. Slides + Picture Timeline

```bash
export DEMO_SLIDES="s01:20 s02:25 s04:34 s05:26 @capture s10:25 s17:19 s18:13 s20:10"
node scripts/demo/slides/render.mjs
bash scripts/demo/assemble.sh
```

`render.mjs` loads the deck from `docs/demo/mortar-pitch-deck.html` (`DEMO_DECK`
overrides), navigates each named slide, and screenshots at 1920x1080. Every
slide is rendered broadcast-safe: the canvas is scaled so its bottom edge ends
at the subtitle plate top (852px) and the band below stays deck-black for
captions.

`assemble.sh` (picture phase, no `lines.json` yet) normalizes the capture to
1920x1080, loops each slide PNG for its seconds, concatenates them in
`DEMO_SLIDES` order with `@capture` marking the capture's position, and rewrites
`beats.json` so slide names are narratable beats (`s01`, `s02`, ...). If
`DEMO_SLIDES` is empty it just normalizes the capture.

### 3. Voice + Mux

```bash
# Placeholder voice (Kokoro):
bash scripts/demo/narrate.sh
bash scripts/demo/assemble.sh

# Real voice from the narration lane -- drop seg/0.wav .. seg/N.wav in
# lines.json order, then re-schedule and mux against the new durations:
DEMO_SEGMENTS=external bash scripts/demo/narrate.sh
DEMO_BGM=scripts/demo/lofi-bgm.mp3 bash scripts/demo/assemble.sh
```

The second `assemble.sh` (mux phase) trims every beat segment to its last
narrated line plus `DEMO_FIT_TAIL_MS`, re-anchors the schedule and subtitles to
the fitted timeline, rejects any narration gap over `DEMO_MAX_GAP_MS`, mixes the
voice with the ducked music bed, burns subtitles, and writes
`$DEMO_DIR/demo.mp4`.

### 4. Verify the Deliverable

```bash
DELIVERABLE="$DEMO_DIR/demo.mp4"

# Runtime inside the 4:00-5:00 window (assemble.sh already enforces this):
ffprobe -v error -show_entries format=duration -of csv=p=0 "$DELIVERABLE"

# 1920x1080 H.264 + AAC stereo:
ffprobe -v error -show_entries stream=codec_name,width,height,channels -of csv=p=0 "$DELIVERABLE"

# No silence longer than one second anywhere in the finished file:
ffmpeg -i "$DELIVERABLE" -af "silencedetect=noise=-35dB:d=1" -vn -f null - 2>&1 | grep silence

# Audible, non-clipping audio:
ffmpeg -i "$DELIVERABLE" -af volumedetect -vn -f null - 2>&1 | grep -E "max_volume|mean_volume"
```

### 5. Tests

```bash
cd scripts/demo
node --test                                        # contract, proof, warmup, motion tests
python3 -m unittest discover -s tests -p 'test_*.py'   # pipeline tests (need ffmpeg)
```

---

## Environment Configuration

| Variable             | Default                                         | Description                                                       |
| -------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| `DEMO_DIR`           | `$TMPDIR/mortar-demo`                           | Scratch directory for captures, segments, slides and the MP4      |
| `DEMO_WEB`           | `https://mortar-ppdggwxxjq-as.a.run.app`        | Target deployment to film                                         |
| `DEMO_WARMUP`        | `1`                                             | Set `0` to skip the clean-seed check and off-camera warm-up       |
| `DEMO_RESET_AFTER`   | `1`                                             | Set `0` to skip restoring the seed from `/settings` after capture |
| `DEMO_CHANNEL`       | unset (bundled Chromium)                        | Browser channel for Playwright, e.g. `chrome`                     |
| `DEMO_SLIDES`        | `""`                                            | `name:seconds` tokens; `@capture` marks where the capture sits    |
| `DEMO_DECK`          | `docs/demo/mortar-pitch-deck.html`              | Pitch-deck HTML for `slides/render.mjs`                           |
| `DEMO_SCRIPT`        | `scripts/demo/narration.txt`                    | Narration source: `beat \| offset_ms \| text` per line            |
| `DEMO_SEGMENTS`      | `synthesize`                                    | `external` to use supplied `seg/N.wav` instead of synthesis       |
| `DEMO_TTS`           | `kokoro` when installed, else `chatterbox`      | TTS engine for the placeholder voice                              |
| `DEMO_SPEAK`         | `scripts/demo/speak.py`                         | Speaker entry point used by `narrate.sh`                          |
| `DEMO_PYTHON`        | `$KOKORO_HOME/.venv/bin/python`, else `python3` | Interpreter for `speak.py`                                        |
| `DEMO_VOICE`         | `jf_nezumi`                                     | Kokoro voice ID                                                   |
| `DEMO_SPEED`         | `1.15` Kokoro / `1.0` Chatterbox                | Narration playback speed factor                                   |
| `KOKORO_HOME`        | `~/.local/share/mortar-demo`                    | Kokoro model and voices directory                                 |
| `CHATTERBOX_HOME`    | `~/.local/share/mortar-demo/chatterbox`         | Chatterbox virtualenv and model cache                             |
| `CHATTERBOX_REF`     | `$CHATTERBOX_HOME/reference.wav`                | Reference audio for voice cloning                                 |
| `CHATTERBOX_VARIANT` | `nano`                                          | Chatterbox model (`nano`, `turbo`, or `base`)                     |
| `CHATTERBOX_CACHE`   | `$CHATTERBOX_HOME/cache`                        | Content-addressed cache of synthesized lines                      |
| `DEMO_PAD`           | `#ffffff`                                       | Pillarbox pad color for the 16:10→16:9 capture canvas             |
| `DEMO_BGM`           | `""`                                            | Music file; looped, faded, ducked under the voice when set        |
| `DEMO_BGM_GAIN_DB`   | `-20`                                           | Music gain before speech-triggered ducking                        |
| `DEMO_FIT_TAIL_MS`   | `250`                                           | Picture kept after a segment's last narrated line                 |
| `DEMO_MUTE_SEG_MS`   | `900`                                           | Max picture kept for a beat with no narration                     |
| `DEMO_MAX_GAP_MS`    | `1000`                                          | Max allowed gap between consecutive spoken lines (dead-air rule)  |
| `DEMO_MIN_DURATION`  | `240`                                           | Reject a deliverable shorter than this many seconds               |
| `DEMO_MAX_DURATION`  | `300`                                           | Reject a deliverable longer than this many seconds                |
| `DEMO_OUT`           | `$DEMO_DIR/demo.mp4`                            | Target path of the muxed deliverable                              |
| `DEMO_FFMPEG`        | `ffmpeg` on `PATH`                              | ffmpeg executable                                                 |
| `DEMO_FFPROBE`       | `ffprobe` on `PATH`                             | ffprobe executable                                                |

---

## Preserved Technical Cautions

- **Chatterbox variants**: Nano is the CPU default; `turbo` is a larger model;
  `base` is impractically slow without a GPU. The reference embedding and model
  load once per script and content-addressed audio caches outside the
  repository.
- **CPU attention trap**: Fused paths in both Nano and the base model emit
  silent all-NaN audio on this host. `speak.py` disables MKL-DNN before every
  Chatterbox import and forces `SDPBackend.MATH`; keep those intact.
- **Perth/setuptools compatibility**: `chatterbox-requirements.txt` pins
  `setuptools<81` because older Perth builds import `pkg_resources`. Do not
  loosen that bound without a voice smoke test.
- **16-bit PCM audio**: Speech segments are 16-bit signed PCM WAVs; Python's
  `wave` module rejects 32-bit float (`unknown format: 3`).
- **Beat deconfliction**: A beat marks when a moment appears, not how long the
  line about it takes. `schedule.py` may move a line only to clear prior speech,
  then fails if it would cross into the next visual beat — retime the capture or
  the slide seconds instead.
- **Pacing and scrolling**: Camera moves use constant-speed
  `requestAnimationFrame` interpolation from `motion.mjs`; do not restore
  `scrollIntoViewIfNeeded`. Beat intervals are floored against the measured
  Kokoro placeholder lines (see `MIN_BEAT_INTERVAL_MS` in `walk.mjs`), so each
  line finishes inside its own picture.
- **16:10 to 16:9 canvas**: The capture viewport is 1440x900. It is scaled to
  1728x1080 and padded to 1920x1080 with `DEMO_PAD` (`#ffffff`, matching
  Mortar's paper background).
- **Subtitle layout**: Geist at `FontSize=10.5`, `MarginV=10`, translucent
  `BorderStyle=3` scrim, `Outline=0.75`; cards wrap at 36 characters over at
  most two rows.
- **Slide subtitle clearance**: `slides/render.mjs` scales the deck canvas so no
  slide content can reach below `SUBTITLE_TOP` (852px) — the deck's own
  foot-lines would otherwise sit under the burned captions.
- **Production mutation**: The walk creates a task, confirms two proposals and
  posts a message. Never run it with `DEMO_RESET_AFTER=0` against the shared
  deployment, and never narrate beats that the audit marked `NOT FILMED`.
- **Synthetic data only**: The buyer reply, banker message and all on-screen
  records are seeded fixtures. No real people or brands appear in the narration
  or the capture.
