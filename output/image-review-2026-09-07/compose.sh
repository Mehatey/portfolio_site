#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p originals layers
cp ../../5.mool/cover.jpg originals/mool.jpg
cp ../../assets/img/marriott/cover.webp originals/marriott.webp
cp ../../7.naavo/cover.webp originals/naavo.webp
cp '../../7.naavo/13.5 solo.webp' originals/naavo-bottles.webp
# Edge-connected blue only. Screen pixels enclosed by device remain untouched.
magick originals/mool.jpg -crop 1790x1238+5+5 +repage -alpha on -fuzz 6% -fill none -draw 'color 30,30 floodfill' -trim +repage -draw 'color 365,550 floodfill' layers/mool.png
magick originals/marriott.webp -crop 1012x706+244+69 +repage layers/marriott.png
magick originals/naavo-bottles.webp -crop 340x814+0+0 +repage -trim +repage layers/naavo-gold.png
magick originals/naavo-bottles.webp -crop 340x814+1460+0 +repage -trim +repage layers/naavo-green.png
magick originals/naavo-bottles.webp -crop 340x814+380+0 +repage -trim +repage layers/naavo-angle.png
for variant in a b; do
  plate="mool-$variant-generated.png"
  if [ "$variant" = a ]; then plate=mool-a-revision-generated.png; fi
  magick "$plate" \( layers/mool.png -resize x970 \) -gravity south -geometry +0+0 -composite "mool-$variant.png"
done
magick marriott-a-generated.png \( layers/marriott.png -resize 1300x \( +clone -background black -shadow 35x18+0+20 \) +swap -background none -layers merge +repage \) -gravity center -composite marriott-a.png
magick marriott-b-generated.png \( layers/marriott.png -resize 1120x \( +clone -background black -shadow 40x12+0+14 \) +swap -background none -layers merge +repage \) -gravity north -geometry +0+78 -composite marriott-b.png
# Use existing alpha and original labels; only scale, position and contact shadows.
magick -size 1536x1024 xc:none -fill '#00000070' -draw 'ellipse 780,900 245,20 0,360' -blur 0x12 layers/shadow.png
magick naavo-a-generated.png layers/shadow.png -composite \( layers/naavo-green.png -resize x640 \) -geometry +842+260 -composite \( layers/naavo-gold.png -resize x745 \) -geometry +545+155 -composite naavo-a.png
magick naavo-b-generated.png layers/shadow.png -composite \( layers/naavo-angle.png -resize x680 \) -geometry +433+220 -composite \( layers/naavo-green.png -resize x725 \) -geometry +878+175 -composite \( layers/naavo-gold.png -resize x780 \) -geometry +652+120 -composite naavo-b.png
for name in mool-a mool-b marriott-a marriott-b naavo-a naavo-b; do
  magick "$name.png" -quality 88 "$name.webp"
done
