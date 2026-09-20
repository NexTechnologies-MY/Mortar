#!/usr/bin/env bash
# Produces the scheduled voice track for the capture: resolves the script
# against measured beats, synthesizes (or accepts) one wav per line, clears
# collisions, and emits the subtitle plan. assemble.sh then trims the picture
# to THIS schedule and does the final mux -- picture fits voice, never the
# other way round.
#
# Narration is rendered one line at a time and delayed to the beat it describes,
# using the offsets record.mjs measured. One continuous read drifts out of sync
# within a few seconds and then actively contradicts the picture.
#
# Swapping the voice: drop replacement wavs into $DEMO_DIR/seg/ as 0.wav .. n-1.wav
# in lines.json order and run with DEMO_SEGMENTS=external. Schedule, subtitles
# and mux re-run against the new durations, so only the audio changes hands.
set -euo pipefail

DIR="${DEMO_DIR:-${TMPDIR:-/tmp}/mortar-demo}"
HERE="$(cd "$(dirname "$0")" && pwd)"
SPEAK="${DEMO_SPEAK:-$HERE/speak.py}"

# Resolve the portable Kokoro runtime path. KOKORO_HOME can point elsewhere.
KOKORO="${KOKORO_HOME:-$HOME/.local/share/mortar-demo}"

# speak.py re-execs itself into the Chatterbox venv when DEMO_TTS=chatterbox, so
# this only has to be a Python that can import the Kokoro path, or plain python3.
PY="${DEMO_PYTHON:-$KOKORO/.venv/bin/python}"
[ -x "$PY" ] || PY="$(command -v python3)"
SCRIPT="${DEMO_SCRIPT:-$HERE/narration.txt}"

for f in "$DIR/beats.json" "$SCRIPT"; do
  [ -f "$f" ] || { echo "missing: $f (run record.mjs and assemble.sh first)" >&2; exit 1; }
done

# Resolve each line against its measured beat and record the next visual boundary.
# schedule.py rejects speech that outlives that boundary instead of silently
# narrating over a different screen.
python3 "$HERE/manifest.py" "$DIR" "$SCRIPT"

n=$(python3 -c "import json,sys;print(len(json.load(open(sys.argv[1]))))" "$DIR/lines.json")
[ "$n" -gt 0 ] || { echo "no narration lines resolved" >&2; exit 1; }

if [ "${DEMO_SEGMENTS:-synthesize}" = "external" ]; then
  for i in $(seq 0 $((n - 1))); do
    [ -f "$DIR/seg/$i.wav" ] || { echo "DEMO_SEGMENTS=external but missing $DIR/seg/$i.wav" >&2; exit 1; }
  done
  echo "using $n external voice segments from $DIR/seg"
else
  # Batch mode keeps heavyweight voice models resident for the whole script. A
  # per-line process spends most of its time reloading the same model.
  rm -rf "$DIR/seg" && mkdir -p "$DIR/seg"
  "$PY" "$SPEAK" --batch "$DIR/lines.json" "$DIR/seg"
fi

# A beat says when a moment happens, not how long the line about it takes to
# read. Clear any narration-to-narration collision, then reject a line that would
# outlive its matching visual -- before subtitles inherit those timings. A
# failure here means the picture is too short for the voice; lengthen the hold
# in walk.mjs or the slide seconds in DEMO_SLIDES and re-run.
python3 "$HERE/schedule.py" "$DIR" || exit 1

# Subtitles come from the same lines.json and the same wavs, so the words on
# screen cannot drift from the words being spoken.
python3 "$HERE/subtitles.py" "$DIR"

echo "voice scheduled: $n lines -- run assemble.sh to fit the picture and mux"
