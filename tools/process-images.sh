#!/usr/bin/env bash
#
# Rebuild public/assets/img from the source screenshots.
#
# Strips the Instagram carousel chrome (prev/next arrows and dot indicators)
# by inpainting rather than cropping, grades the result, and emits WebP at two
# sizes: native for cards and galleries, and a 2x lanczos upscale for the plates
# that go full-bleed. Nothing is sharpened — see the note in the loop.
#
# Expects the originals under $SRC in folders named Borj / Dentist / Hopital /
# "Living Room" / Opticien. Set FF to any ffmpeg build — `npm install` provides
# one through ffmpeg-static, which is the default below. The per-image flags
# record which carousel controls each screenshot actually carried, so nothing
# is smudged that did not need it — re-check them if the sources are replaced.
# Renders supplied clean carry 0|0|0 and go through grading and encoding only.
# The hospital, the Brussels apartment and Smile Lab were re-sourced from the
# studio's own 1080px posts once those were available; their numbered .png
# screenshots remain in the folders but are unused.
#
# Usage:  bash tools/process-images.sh
#         ONLY=regard-opticien bash tools/process-images.sh   # one project
set -u
HERE="$(cd "$(dirname "$0")/.." && pwd)"
FF="${FF:-$(node -p "require('ffmpeg-static')" 2>/dev/null || echo ffmpeg)}"
SRC="${SRC:-$HOME/Desktop}"
OUT="${OUT:-$HERE/public/assets/img}"
ONLY="${ONLY:-}"

# folder | file | slug | out-index | left-arrow | right-arrow | dots | kind
#
# kind is "photo" (default) or "line" for drawings on white — a plan, a
# diagram — which get a gentler grade, since a contrast lift clips line art.
JOBS="
Borj|1.png|tangier-sky-ring|01|0|1|1
Borj|2.png|tangier-sky-ring|02|1|1|1
Borj|3.png|tangier-sky-ring|03|1|0|1
Hopital|aerial.jpg|hopital-tetouan|01|0|0|0
Hopital|canopy.jpg|hopital-tetouan|02|0|0|0
Hopital|concept.jpg|hopital-tetouan|03|0|0|0|line
Hopital|plan-rdc.jpg|hopital-tetouan|04|0|0|0|line
Dentist|meeting.jpg|smile-lab-brussels|01|0|0|0
Dentist|office.jpg|smile-lab-brussels|02|0|0|0
Dentist|treatment.jpg|smile-lab-brussels|03|0|0|0
Dentist|treatment-2.jpg|smile-lab-brussels|04|0|0|0
Dentist|reception.jpg|smile-lab-brussels|05|0|0|0
Dentist|lounge.jpg|smile-lab-brussels|06|0|0|0
Living Room|bedroom.jpg|appartement-f3-brussels|01|0|0|0
Living Room|living.jpg|appartement-f3-brussels|02|0|0|0
Living Room|kitchen.jpg|appartement-f3-brussels|03|0|0|0
Opticien|1.jpg|regard-opticien|01|0|0|0
Opticien|2.jpg|regard-opticien|02|0|0|0
Opticien|3.jpg|regard-opticien|03|0|0|0
MediaTheque Tetouan|1.png|mediatheque-tetouan|01|0|1|1
MediaTheque Tetouan|3.png|mediatheque-tetouan|02|1|1|1
MediaTheque Tetouan|4.png|mediatheque-tetouan|03|1|1|1
MediaTheque Tetouan|6.png|mediatheque-tetouan|04|1|0|0
MediaTheque Tetouan|5.png|mediatheque-tetouan|05|1|1|0|line
MediaTheque Tetouan|2.png|mediatheque-tetouan|06|1|1|1
"

echo "$JOBS" | while IFS='|' read -r folder file slug idx left right dots kind; do
  [ -z "${slug:-}" ] && continue
  [ -n "$ONLY" ] && [ "$slug" != "$ONLY" ] && continue
  in="$SRC/$folder/$file"
  [ -f "$in" ] || { echo "MISSING $in"; continue; }

  read W H < <("$FF" -nostdin -hide_banner -i "$in" 2>&1 | grep -o ' [0-9]\{3,\}x[0-9]\{3,\}' | head -1 | tr -d ' ' | tr 'x' ' ')
  mkdir -p "$OUT/$slug"

  # Inpaint the carousel chrome. delogo interpolates the box from its border,
  # which is clean at this size because each control is small and sits on a
  # fairly even part of the picture.
  chain=""
  [ "$left"  = "1" ] && chain="${chain}delogo=x=8:y=$((H/2-27)):w=44:h=54,"
  [ "$right" = "1" ] && chain="${chain}delogo=x=$((W-52)):y=$((H/2-27)):w=44:h=54,"
  [ "$dots"  = "1" ] && chain="${chain}delogo=x=$((W/2-42)):y=$((H-30)):w=84:h=24,"

  # Tone only — no sharpening at either size. The sources are Instagram JPEGs,
  # already soft and already compressed; an unsharp pass does not recover
  # detail they never had, it sharpens their compression artefacts into halos
  # and grit. Measured side by side, the old sharpened -lg plate came out
  # visibly worse than the source it was made from.
  if [ "${kind:-photo}" = "line" ]; then
    grade="eq=contrast=1.02:saturation=1.00"
    preset=drawing
  else
    grade="eq=contrast=1.055:saturation=1.06:brightness=0.004:gamma=0.995"
    preset=photo
  fi

  # Native size, for cards, galleries and splits. q94 is transparent for WebP;
  # above that the bytes buy nothing visible.
  "$FF" -nostdin -y -v error -i "$in" -vf "${chain}${grade}" \
    -c:v libwebp -preset "$preset" -quality 94 -compression_level 6 "$OUT/$slug/$idx.webp"

  # Full-bleed copy at exactly 2x. A 1080 source cannot gain detail, but one
  # lanczos resample to an integer multiple is cleaner than the browser
  # stretching it live — and at 2x it covers a 1920 display at 1.25 DPR, or a
  # 1440 one at 1.5, without a second resample on the way to the screen.
  "$FF" -nostdin -y -v error -i "$in" -vf "${chain}${grade},scale=iw*2:-2:flags=lanczos" \
    -c:v libwebp -preset "$preset" -quality 92 -compression_level 6 "$OUT/$slug/$idx-lg.webp"

  echo "ok $slug/$idx  (${W}x${H})  L=$left R=$right dots=$dots  ${kind:-photo}"
done
