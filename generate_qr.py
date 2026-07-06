import sys
from pathlib import Path
from urllib.parse import urlparse, urlunparse, urlencode
from PIL import Image, ImageDraw, ImageFont
import qrcode

if len(sys.argv) < 2:
    print('Cara pakai: python generate_qr.py "https://link-website-cifira-kamu"')
    print('Contoh: python generate_qr.py "https://cifira-smart-label.netlify.app"')
    sys.exit(1)

base_url = sys.argv[1].strip().rstrip('/')
out_dir = Path('assets')
out_dir.mkdir(exist_ok=True)


def with_status(url, status):
    parsed = urlparse(url)
    query = urlencode({'status': status})
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path or '/', parsed.params, query, parsed.fragment))


def make_qr(url, filename):
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white').convert('RGB')
    path = out_dir / filename
    img.save(path)
    print(f'{filename} -> {url}')
    return path

qr_umum = make_qr(base_url + '/', 'qr_cifira_umum.png')
make_qr(with_status(base_url, 'segar'), 'qr_cifira_segar.png')
make_qr(with_status(base_url, 'menurun'), 'qr_cifira_waspada.png')
make_qr(with_status(base_url, 'tidak-layak'), 'qr_cifira_busuk.png')

# Buat label final dari template sederhana memakai QR umum
W, H = 1600, 1000
label = Image.new('RGB', (W, H), '#fff7e8')
d = ImageDraw.Draw(label)
try:
    font_bold = ImageFont.truetype('DejaVuSans-Bold.ttf', 76)
    font_med = ImageFont.truetype('DejaVuSans-Bold.ttf', 38)
    font = ImageFont.truetype('DejaVuSans.ttf', 34)
    font_small = ImageFont.truetype('DejaVuSans.ttf', 26)
except Exception:
    font_bold = font_med = font = font_small = None

# background cards
d.rounded_rectangle((60,60,1540,940), radius=48, fill='#ffffff', outline='#ead8c0', width=4)
d.rounded_rectangle((90,90,1510,235), radius=34, fill='#16213e')
d.text((135,118), 'CiFiRa Smart Meat Label', fill='white', font=font_bold)
d.text((138,197), 'QR umum + deteksi warna film dengan kamera HP', fill='#ffe7b8', font=font_small)

# QR
qr_img = Image.open(qr_umum).resize((360,360))
d.rounded_rectangle((1080,300,1470,690), radius=38, fill='#ffffff', outline='#16213e', width=3)
label.paste(qr_img, (1095,315))
d.text((1110,705), 'SCAN QR', fill='#16213e', font=font_med)
d.text((1070,750), 'Buka website + deteksi warna', fill='#5b6278', font=font_small)

# indicator and arrows
colors = [('#7c3aed','UNGU = SEGAR'),('#2563eb','BIRU = WASPADA'),('#16a34a','HIJAU = TIDAK LAYAK')]
y=330
for col, txt in colors:
    d.rounded_rectangle((130,y,215,y+80), radius=20, fill=col)
    d.text((240,y+18), txt, fill='#16213e', font=font_med)
    y += 105

# arrow direction
d.line((660,485,990,485), fill='#f59e0b', width=18)
d.polygon([(990,485),(925,445),(925,525)], fill='#f59e0b')
d.text((675,535), 'Arahkan kamera ke film', fill='#5b6278', font=font)
d.text((710,575), 'untuk baca kategori', fill='#5b6278', font=font)

# footer
d.rounded_rectangle((120,810,1480,900), radius=28, fill='#fff2dc')
d.text((160,832), 'Film indikator: dekat daging • QR: luar kemasan • Scan: baca status digital', fill='#16213e', font=font)

label_path = out_dir / 'label_cifira_final.png'
label.save(label_path)
print(f'label_cifira_final.png dibuat di {label_path}')
print('Selesai. Gunakan qr_cifira_umum.png untuk label nyata. Gunakan QR status untuk demo/pameran.')
