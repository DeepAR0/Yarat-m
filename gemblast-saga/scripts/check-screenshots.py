"""Validate actual screenshots, not mockups. Requires Pillow: python3 -m pip install Pillow."""
import sys
from pathlib import Path
from PIL import Image
if len(sys.argv)<2:
    raise SystemExit('Kullanım: python3 scripts/check-screenshots.py release/screenshots/*.png')
failed=False
for filename in sys.argv[1:]:
    with Image.open(filename) as im:
        alpha='A' in im.getbands() or 'transparency' in im.info
        print(f'{Path(filename).name}: {im.width} × {im.height}, {im.mode}, alfa={alpha}')
        if alpha:
            print('HATA: App Store ekran görüntüsünde alfa kanalı olmamalı.'); failed=True
        if im.width<1000 or im.height<1000:
            print('HATA: Bu görüntü telefon/tablet mağaza görseli için çok küçük.');failed=True
print('Kesin piksel boyutlarını Apple screenshot-specifications sayfasıyla karşılaştır. Bu kontrol içerik veya cihaz doğrulaması değildir.')
raise SystemExit(1 if failed else 0)
