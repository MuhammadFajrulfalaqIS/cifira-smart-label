CARA MEMBUAT QR CiFiRa AGAR SAAT DISCAN HP MASUK WEBSITE DAN MUNCUL KATEGORI

PENTING DULU
QR statis tidak bisa mengetahui warna film yang berubah sendiri. Jadi ada 2 pilihan:

1) MODE DEMO / PAMERAN: QR langsung menampilkan kategori.
   Caranya buat QR dengan parameter status:
   - https://link-website-kamu/?status=segar
   - https://link-website-kamu/?status=menurun
   - https://link-website-kamu/?status=tidak-layak
   Saat discan, website langsung membuka kategori tersebut.

2) MODE REALISTIS / SATU QR UNTUK PRODUK NYATA:
   Pakai QR umum yang membuka website utama.
   Setelah itu konsumen mengaktifkan kamera HP dan mengarahkan kotak tengah ke film indikator.
   Website membaca warna film lalu menampilkan kategori.

LANGKAH UPLOAD WEBSITE
1. Extract ZIP.
2. Upload seluruh isi folder ini ke Netlify/Vercel/GitHub Pages.
3. Salin link website yang diberikan, misalnya:
   https://cifira-smart-label.netlify.app

CARA GENERATE QR DENGAN PYTHON
1. Buka terminal di folder cifira_smart_label_website.
2. Install library jika belum ada:
   pip install qrcode[pil] pillow
3. Jalankan:
   python generate_qr.py "https://link-website-kamu"
4. Hasil QR akan muncul di folder assets:
   - qr_cifira_umum.png = QR utama untuk produk nyata
   - qr_cifira_segar.png = QR demo langsung kategori segar
   - qr_cifira_waspada.png = QR demo langsung kategori waspada
   - qr_cifira_busuk.png = QR demo langsung kategori tidak layak konsumsi
   - label_cifira_final.png = label final dengan QR umum

CARA TANPA PYTHON
Masukkan URL berikut ke QR generator online:
- QR umum: https://link-website-kamu/
- QR segar: https://link-website-kamu/?status=segar
- QR waspada: https://link-website-kamu/?status=menurun
- QR busuk: https://link-website-kamu/?status=tidak-layak

ARAH LABEL DAGING
- Film indikator CiFiRa ditempel dekat/di dalam area daging agar merespons pH/amonia.
- QR ditempel di luar kemasan agar mudah dipindai HP.
- Untuk pameran, siapkan 3 contoh label: segar, waspada, dan busuk.
- Untuk penggunaan nyata, pakai QR umum + fitur deteksi kamera.

CATATAN
- Fitur kamera hanya bekerja jika website dibuka dengan HTTPS.
- Hasil kamera bisa dipengaruhi cahaya. Untuk demo, gunakan lampu putih stabil.
- Jika film hijau/hijau kekuningan, daging sebaiknya tidak dikonsumsi.
