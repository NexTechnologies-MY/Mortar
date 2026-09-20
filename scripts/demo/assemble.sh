#!/usr/bin/env bash
# Assembles the submission cut, in two phases.
#
# PICTURE phase (no lines.json yet): joins the product capture to the pitch
# slides named by DEMO_SLIDES and extends beats.json so narration can name a
# slide the same way it names a moment on screen. DEMO_SLIDES is a list of
# `name:seconds` tokens with `@capture` marking where the capture sits; without
# the marker the capture leads, which is the plain product-walkthrough path.
#
# MUX phase (lines.json exists, i.e. narrate.sh has run): trims the joined
# picture down to the scheduled narration -- never the reverse -- then muxes
# voice, burned subtitles and the ducked music bed into demo.mp4. The no-dead-
# air rule is mechanical: every inter-beat segment keeps only FIT_TAIL_MS of
# picture after its last narrated line, so the picture shortens to fit the
# voice instead of the voice being padded to fill the picture.
set -euo pipefail

DIR="${DEMO_DIR:-${TMPDIR:-/tmp}/mortar-demo}"
FF="${DEMO_FFMPEG:-$(command -v ffmpeg || true)}"
FFPROBE="${DEMO_FFPROBE:-$(command -v ffprobe || true)}"
HERE="$(cd "$(dirname "$0")" && pwd)"
PAD="${DEMO_PAD:-#ffffff}"
SCRIPT="${DEMO_SCRIPT:-$HERE/narration.txt}"

[ -x "$FF" ] || { echo "no ffmpeg executable found at ${FF:-PATH}" >&2; exit 1; }

if [ ! -f "$DIR/lines.json" ]; then
  # ------------------------------------------------------------------ PICTURE
  [ -f "$DIR/capture.webm" ] || { echo "missing $DIR/capture.webm (run scripts/demo/record.mjs first)" >&2; exit 1; }
  [ -f "$DIR/beats.json" ] || { echo "missing $DIR/beats.json (run scripts/demo/record.mjs first)" >&2; exit 1; }

  DEMO_SLIDES="${DEMO_SLIDES:-}"

  # No slides requested: normalize the capture to the 1920x1080 deliverable
  # canvas and stop. beats.json already describes the whole timeline.
  if [ -z "${DEMO_SLIDES// /}" ]; then
    echo "No DEMO_SLIDES specified; normalizing capture to 1920x1080 canvas without slides."
    "$FF" -y -loglevel error -i "$DIR/capture.webm" \
      -vf "scale=1728:1080,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=$PAD,fps=25,format=yuv420p" \
      -an "$DIR/capture-joined.mp4"
    echo "capture prepared (no slides): $DIR/capture-joined.mp4"
    exit 0
  fi

  for pair in $DEMO_SLIDES; do
    name="${pair%%:*}"
    [ "$name" = "@capture" ] && continue
    f="$DIR/slide-$name.png"
    [ -f "$f" ] || { echo "missing $f (run scripts/demo/slides/render.mjs first)" >&2; exit 1; }
  done

  # The capture is 1440x900; the slides are 1920x1080. Normalise both here
  # rather than at mux time, because concat demands identical streams and a
  # mismatch fails silently by dropping frames rather than by erroring.
  "$FF" -y -loglevel error -i "$DIR/capture.webm" \
    -vf "scale=1728:1080,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=$PAD,fps=25,format=yuv420p" \
    -an "$DIR/seg-capture.mp4"

  : > "$DIR/concat.txt"
  for pair in $DEMO_SLIDES; do
    name="${pair%%:*}"
    secs="${pair##*:}"
    if [ "$name" = "@capture" ]; then
      printf "file '%s'\n" "$DIR/seg-capture.mp4" >> "$DIR/concat.txt"
      continue
    fi
    "$FF" -y -loglevel error -loop 1 -t "$secs" -i "$DIR/slide-$name.png" \
      -vf "scale=1920:1080,fps=25,format=yuv420p" "$DIR/seg-$name.mp4"
    printf "file '%s'\n" "$DIR/seg-$name.mp4" >> "$DIR/concat.txt"
  done
  # No @capture marker means the capture leads; slides trail.
  if ! grep -q 'seg-capture' "$DIR/concat.txt"; then
    { printf "file '%s'\n" "$DIR/seg-capture.mp4"; cat "$DIR/concat.txt"; } > "$DIR/concat.tmp"
    mv "$DIR/concat.tmp" "$DIR/concat.txt"
  fi
  "$FF" -y -loglevel error -f concat -safe 0 -i "$DIR/concat.txt" -c copy "$DIR/pitch.mp4"
  mv "$DIR/pitch.mp4" "$DIR/capture-joined.mp4"

  python3 - "$DIR" "$DEMO_SLIDES" "$FFPROBE" <<'PY'
import json, subprocess, sys
from pathlib import Path

d = Path(sys.argv[1])
tokens = sys.argv[2].split()
ffprobe_bin = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else 'ffprobe'

def secs(p):
    out = subprocess.run([ffprobe_bin, '-v', 'error', '-show_entries', 'format=duration',
                          '-of', 'csv=p=0', str(p)], capture_output=True, text=True).stdout.strip()
    return float(out)

# Walk the token stream the same way the concat did: slide names introduce a
# beat at their start, @capture introduces the shifted capture beats.
capture_ms = round(secs(d / 'seg-capture.mp4') * 1000)
capture_beats = [b for b in json.loads((d / 'beats.json').read_text()) if b['name'] != 'end']

beats = []
cursor = 0
placed_capture = False
for token in tokens:
    name, _, sec = token.partition(':')
    if name == '@capture':
        for b in capture_beats:
            beats.append({'name': b['name'], 'ms': cursor + b['ms']})
        cursor += capture_ms
        placed_capture = True
    else:
        beats.append({'name': name, 'ms': cursor})
        cursor += int(sec) * 1000
if not placed_capture:
    for b in capture_beats:
        beats.append({'name': b['name'], 'ms': b['ms']})
    cursor += capture_ms
    beats.sort(key=lambda b: b['ms'])
beats.append({'name': 'end', 'ms': cursor})
(d / 'beats.json').write_text(f'{json.dumps(beats, indent=2)}\n')
print(f'  joined timeline {cursor}ms')
for b in beats:
    print(f'    {b["ms"]:>7}ms  {b["name"]}')
PY
  exit 0
fi

# ---------------------------------------------------------------------- MUX
SRC="$DIR/capture-joined.mp4"
BGM="${DEMO_BGM:-}"
BGM_GAIN_DB="${DEMO_BGM_GAIN_DB:--20}"
FIT_TAIL_MS="${DEMO_FIT_TAIL_MS:-250}"
MUTE_SEG_MS="${DEMO_MUTE_SEG_MS:-900}"
MAX_GAP_MS="${DEMO_MAX_GAP_MS:-1000}"
MIN_DURATION="${DEMO_MIN_DURATION:-240}"
MAX_DURATION="${DEMO_MAX_DURATION:-300}"
OUT="${DEMO_OUT:-$DIR/demo.mp4}"

for f in "$SRC" "$DIR/beats.json" "$SCRIPT"; do
  [ -f "$f" ] || { echo "missing: $f" >&2; exit 1; }
done

# 1. Trim picture to narration. Each inter-beat segment keeps the picture up to
# its last narrated line plus FIT_TAIL_MS; a segment with no narration at all
# is capped at MUTE_SEG_MS so no stretch of video goes unremarked.
python3 - "$DIR" "$FIT_TAIL_MS" "$MUTE_SEG_MS" "$FF" <<'PY'
import json, subprocess, sys
from pathlib import Path

d = Path(sys.argv[1])
tail_ms = int(sys.argv[2])
mute_ms = int(sys.argv[3])
ff = sys.argv[4]

beats = json.loads((d / 'beats.json').read_text())
lines = json.loads((d / 'lines.json').read_text())

keep = []
for i in range(len(beats) - 1):
    b0, b1 = beats[i]['ms'], beats[i + 1]['ms']
    ends = [l['ms'] + l.get('dur_ms', 0) for l in lines if b0 <= l['ms'] < b1]
    want = (max(ends) - b0 + tail_ms) if ends else mute_ms
    keep.append(min(b1 - b0, max(0, want)))

filters = []
labels = []
cursor = 0
new_beats = []
for i, beat in enumerate(beats[:-1]):
    new_beats.append({'name': beat['name'], 'ms': cursor})
    start = beat['ms'] / 1000
    end = (beat['ms'] + keep[i]) / 1000
    if keep[i] < beats[i + 1]['ms'] - beat['ms']:
        print(f'  trim {beat["name"]}: {beats[i + 1]["ms"] - beat["ms"]}ms -> {keep[i]}ms')
    filters.append(f'[0:v]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[v{i}]')
    labels.append(f'[v{i}]')
    cursor += keep[i]
new_beats.append({'name': 'end', 'ms': cursor})
graph = ';'.join(filters) + f';{"".join(labels)}concat=n={len(labels)}:v=1:a=0[v]'
subprocess.run([ff, '-y', '-loglevel', 'error', '-i', str(d / 'capture-joined.mp4'),
                '-filter_complex', graph, '-map', '[v]', '-c:v', 'libx264', '-preset', 'fast',
                '-crf', '20', '-pix_fmt', 'yuv420p', str(d / 'capture-fitted.mp4')], check=True)
(d / 'beats.json').write_text(f'{json.dumps(new_beats, indent=2)}\n')
print(f'  fitted picture: {cursor}ms')
PY

# 2. Re-anchor narration to the fitted beats and re-emit subtitles. The wav
# segments do not change; only their placement does.
python3 "$HERE/manifest.py" "$DIR" "$SCRIPT"
python3 "$HERE/schedule.py" "$DIR" || exit 1
python3 "$HERE/subtitles.py" "$DIR"

# No dead air: no gap between consecutive spoken lines may exceed one second.
python3 - "$DIR" "$MAX_GAP_MS" <<'PY'
import json, sys
from pathlib import Path

d = Path(sys.argv[1])
max_gap = int(sys.argv[2])
lines = json.loads((d / 'lines.json').read_text())
worst = 0
for a, b in zip(lines, lines[1:]):
    gap = b['ms'] - (a['ms'] + a['dur_ms'])
    worst = max(worst, gap)
    if gap > max_gap:
        print(f'  DEAD AIR: {gap}ms gap between {a["beat"]!r} and {b["beat"]!r}', file=sys.stderr)
        sys.exit(1)
print(f'  widest narration gap: {worst}ms (limit {max_gap}ms)')
PY

# 3. One delayed input per line, mixed onto a common timeline.
n=$(python3 -c "import json,sys;print(len(json.load(open(sys.argv[1]))))" "$DIR/lines.json")
[ "$n" -gt 0 ] || { echo "no narration lines resolved" >&2; exit 1; }
inputs=(); filters=""; labels=""
for i in $(seq 0 $((n - 1))); do
  ms=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))[int(sys.argv[2])]['ms'])" "$DIR/lines.json" "$i")
  inputs+=(-i "$DIR/seg/$i.wav")
  filters="$filters[$i:a]adelay=$ms|$ms[a$i];"
  labels="$labels[a$i]"
done
"$FF" -y "${inputs[@]}" \
  -filter_complex "${filters}${labels}amix=inputs=$n:normalize=0,loudnorm=I=-18:TP=-2:LRA=7[out]" \
  -map "[out]" -ar 44100 "$DIR/narration.wav" >/dev/null 2>&1

dur() {
  local probe
  probe=$({ "$FF" -i "$1" 2>&1 || true; })
  awk -F'Duration: ' '/Duration: /{split($2,a,","); split(a[1],t,":");
    print t[1]*3600+t[2]*60+t[3]; exit}' <<<"$probe"
}
vid=$(dur "$DIR/capture-fitted.mp4"); aud=$(dur "$DIR/narration.wav")

# If the closing line outruns the fitted picture, hold the last frame rather
# than cutting the sentence off.
pad=$(awk -v a="$aud" -v v="$vid" 'BEGIN{d=a-v; print (d>0)? d+0.4 : 0}')
tpad=$(awk -v p="$pad" 'BEGIN{ if (p>0) printf "tpad=stop_mode=clone:stop_duration=%.3f,", p }')
total=$(awk -v p="$pad" -v v="$vid" 'BEGIN{printf "%.3f", v+p}')
# BorderStyle=3 draws a box behind the text rather than an outline, which is the
# only thing that stays readable over a screenshot whose background we do not
# control. Geist matches the product.
subs="subtitles='$DIR/narration.srt':force_style='FontName=Geist,FontSize=10.5,PrimaryColour=&H00FFFFFF,OutlineColour=&H70101310,BorderStyle=3,Outline=0.75,Shadow=0,Alignment=2,MarginV=10,Spacing=0.2'"

# 4. Mux: fitted picture + burned subtitles + voice + the music bed ducked
# under the voice. The bed loops to length, sits ~20 dB down, fades in and out,
# and ducks further whenever a line is speaking -- under, never over.
if [ -n "$BGM" ]; then
  [ -f "$BGM" ] || { echo "missing BGM: $BGM" >&2; exit 1; }
  fade_in=$(awk -v t="$total" 'BEGIN{printf "%.3f", (t<6)? t/3 : 2}')
  fade_out=$(awk -v t="$total" 'BEGIN{printf "%.3f", (t<12)? t/3 : 4}')
  fade_start=$(awk -v t="$total" -v d="$fade_out" 'BEGIN{printf "%.3f", t-d}')
  "$FF" -y -i "$DIR/capture-fitted.mp4" -i "$DIR/narration.wav" -stream_loop -1 -i "$BGM" \
    -filter_complex "[0:v]${tpad}${subs}[v];[1:a]pan=stereo|c0=c0|c1=c0,asplit=2[voice][side-source];[side-source]apad=whole_dur=$total[side];[2:a]atrim=start=0:end=$total,asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=stereo,volume=${BGM_GAIN_DB}dB,afade=t=in:st=0:d=$fade_in,afade=t=out:st=$fade_start:d=$fade_out[music];[music][side]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=500:knee=2.8[ducked];[voice][ducked]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0,alimiter=limit=0.95:attack=5:release=50:level=false:latency=true[a]" \
    -map "[v]" -map "[a]" -t "$total" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 44100 -ac 2 -movflags +faststart "$OUT" >/dev/null 2>&1
else
  "$FF" -y -i "$DIR/capture-fitted.mp4" -i "$DIR/narration.wav" \
    -filter_complex "[0:v]${tpad}${subs}[v]" \
    -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart "$OUT" >/dev/null 2>&1
fi

delivered=$(dur "$OUT")
if ! awk -v d="$delivered" -v lo="$MIN_DURATION" -v hi="$MAX_DURATION" \
  'BEGIN { exit !(d >= lo && d <= hi) }'; then
  echo "deliverable duration ${delivered}s is outside ${MIN_DURATION}-${MAX_DURATION}s" >&2
  exit 1
fi

printf 'video %.1fs  narration %.1fs  tail-pad %.1fs\n' "$vid" "$aud" "$pad"
ls -lh "$OUT" | awk '{print "output: " $NF " (" $5 ")"}'
