#!/usr/bin/env bash
#
# Rebuild public/assets/img from the source screenshots.
#
# Strips the Instagram carousel chrome (prev/next arrows and dot indicators)
# by inpainting rather than cropping, grades the result, and emits WebP at two
# sizes: native for cards and galleries, and a 1500px upscale for the plates
# that go full-bleed.
#
# Expects the originals under $SRC in folders named Borj / Dentist / Hopital /
# "Living Room". Set FF to any ffmpeg build. The per-image flags below record
# which controls each screenshot actually carried, so nothing is smudged that
# did not need it — re-check them if the sources are replaced.
#
# Usage:  FF=/path/to/ffmpeg bash tools/process-images.sh
set -u
FF="${FF:-ffmpeg}"
SRC="${SRC:-$HOME/Desktop}"
OUT="${OUT:-$(cd "$(dirname "$0")/.." && pwd)/public/assets/img}"

# folder | file | slug | out-index | left-arrow | right-arrow | dots
JOBS="
Borj|1.png|tangier-sky-ring|01|0|1|1
Borj|2.png|tangier-sky-ring|02|1|1|1
Borj|3.png|tangier-sky-ring|03|1|0|1
Hopital|1.png|hopital-tetouan|01|0|1|1
Hopital|2.png|hopital-tetouan|02|1|1|1
Hopital|3.png|hopital-tetouan|03|1|1|0
Dentist|1.png|smile-lab-brussels|01|0|1|1
Dentist|2.png|smile-lab-brussels|02|1|0|1
Dentist|3.png|smile-lab-brussels|03|0|1|1
Dentist|4.png|smile-lab-brussels|04|1|0|1
Dentist|5.png|smile-lab-brussels|05|0|1|1
Dentist|6.png|smile-lab-brussels|06|1|0|1
Living Room|1.png|residence-terracotta|01|0|1|1
Living Room|2.png|residence-terracotta|02|1|1|1
Living Room|3.png|residence-terracotta|03|1|0|1
"

echo "$JOBS" | while IFS='|' read -r folder file slug idx left right dots; do
  [ -z "${slug:-}" ] && continue
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

  # The concept diagram is line art on white; a contrast lift would clip it.
  if [ "$slug" = "hopital-tetouan" ] && [ "$idx" = "03" ]; then
    grade="eq=contrast=1.02:saturation=1.00"
    sharp="unsharp=3:3:0.25:3:3:0.0"
  else
    grade="eq=contrast=1.055:saturation=1.06:brightness=0.004:gamma=0.995"
    sharp="unsharp=3:3:0.42:3:3:0.0"
  fi

  "$FF" -nostdin -y -v error -i "$in" -vf "${chain}${grade},${sharp}" \
    -c:v libwebp -quality 90 -compression_level 6 "$OUT/$slug/$idx.webp"

  # Larger copy for full-bleed use: lanczos up, then sharpen to recover bite.
  "$FF" -nostdin -y -v error -i "$in" -vf "${chain}${grade},scale=1500:-2:flags=lanczos,unsharp=5:5:0.55:5:5:0.0" \
    -c:v libwebp -quality 84 -compression_level 6 "$OUT/$slug/$idx-lg.webp"

  echo "ok $slug/$idx  (${W}x${H})  L=$left R=$right dots=$dots"
done
