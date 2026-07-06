const statusData = {
  segar: {
    title: 'Daging Masih Segar',
    desc: 'Warna ungu menunjukkan kondisi awal daging yang masih segar dan cenderung sedikit asam. Daging dapat segera diolah dengan tetap menjaga kebersihan dan suhu penyimpanan.',
    ph: 'pH ±6',
    action: 'Boleh diolah',
    source: 'Kategori terbaca sebagai SEGAR.'
  },
  menurun: {
    title: 'Kualitas Mulai Menurun',
    desc: 'Warna biru atau biru keunguan menjadi sinyal awal kenaikan pH. Periksa aroma, tekstur, dan tampilan daging. Gunakan hanya jika masih tidak berbau busuk dan tetap aman secara organoleptik.',
    ph: 'pH ±7',
    action: 'Cek ulang',
    source: 'Kategori terbaca sebagai WASPADA / MULAI MENURUN.'
  },
  'tidak-layak': {
    title: 'Tidak Layak Konsumsi',
    desc: 'Warna hijau atau hijau kekuningan menunjukkan kondisi basa yang berkaitan dengan pembusukan. Jangan konsumsi daging, terutama jika muncul bau busuk, lendir, atau bercak putih/jamur.',
    ph: 'pH ±8',
    action: 'Jangan konsumsi',
    source: 'Kategori terbaca sebagai TIDAK LAYAK KONSUMSI.'
  }
};

const buttons = document.querySelectorAll('.color-card');
const panel = document.getElementById('status-panel');
const title = document.getElementById('status-title');
const desc = document.getElementById('status-desc');
const ph = document.getElementById('status-ph');
const action = document.getElementById('status-action');
const sourceNote = document.getElementById('source-note');

function setStatus(key, sourceText = ''){
  const data = statusData[key] || statusData.segar;
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.status === key));
  panel.className = `status-panel ${key}`;
  title.textContent = data.title;
  desc.textContent = data.desc;
  ph.textContent = data.ph;
  action.textContent = data.action;
  sourceNote.textContent = sourceText || data.source;
}

buttons.forEach(btn => btn.addEventListener('click', () => setStatus(btn.dataset.status, 'Status dipilih manual berdasarkan warna film indikator.')));

function normalizeStatus(value){
  const v = (value || '').toLowerCase().trim();
  if(['segar','fresh','ungu','purple'].includes(v)) return 'segar';
  if(['menurun','waspada','biru','blue','warning'].includes(v)) return 'menurun';
  if(['tidak-layak','tidak_layak','busuk','hijau','green','spoiled'].includes(v)) return 'tidak-layak';
  return '';
}

const params = new URLSearchParams(window.location.search);
const statusFromQr = normalizeStatus(params.get('status') || params.get('warna'));
if(statusFromQr){
  setStatus(statusFromQr, 'Status ini muncul otomatis dari QR berparameter.');
  document.getElementById('cek-warna').scrollIntoView({behavior:'smooth'});
}

// Kamera: deteksi warna dari kotak tengah video
const video = document.getElementById('camera-video');
const canvas = document.getElementById('camera-canvas');
const placeholder = document.getElementById('camera-placeholder');
const cameraResult = document.getElementById('camera-result');
const startBtn = document.getElementById('start-camera');
const detectBtn = document.getElementById('detect-color');
let stream = null;

async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    placeholder.style.display = 'none';
    cameraResult.textContent = 'Kamera aktif. Arahkan kotak tengah ke film indikator, lalu tekan Deteksi Warna.';
  }catch(err){
    cameraResult.textContent = 'Kamera belum bisa aktif. Pastikan website dibuka melalui HTTPS dan izin kamera diberikan.';
  }
}

function rgbToHsv(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const d = max - min;
  let h = 0;
  if(d !== 0){
    if(max === r) h = 60 * (((g - b) / d) % 6);
    else if(max === g) h = 60 * (((b - r) / d) + 2);
    else h = 60 * (((r - g) / d) + 4);
  }
  if(h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return {h, s, v:max};
}

function classifyColor(r, g, b){
  const {h, s, v} = rgbToHsv(r,g,b);
  // Kondisi cahaya terlalu redup/putih sekali biasanya tidak valid
  if(v < 0.18 || s < 0.12) return {key:'', label:'Warna kurang jelas. Dekatkan kamera ke film atau perbaiki pencahayaan.'};
  // Hijau sampai hijau kekuningan
  if(h >= 55 && h <= 165) return {key:'tidak-layak', label:'Hijau / hijau kekuningan'};
  // Biru sampai cyan/blue-purple
  if(h >= 175 && h <= 255) return {key:'menurun', label:'Biru / biru keunguan'};
  // Ungu / violet / magenta
  if(h >= 256 && h <= 330) return {key:'segar', label:'Ungu'};
  // Kuning kehijauan tetap dianggap bahaya karena mendekati kondisi basa
  if(h >= 35 && h < 55) return {key:'tidak-layak', label:'Hijau kekuningan'};
  return {key:'', label:'Warna tidak cocok dengan skala CiFiRa. Coba ulangi dari jarak lebih dekat.'};
}

function detectColor(){
  if(!video.srcObject || video.readyState < 2){
    cameraResult.textContent = 'Aktifkan kamera terlebih dahulu.';
    return;
  }
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  const w = canvas.width, h = canvas.height;
  ctx.drawImage(video, 0, 0, w, h);
  const box = 70;
  const x0 = Math.floor((w - box) / 2);
  const y0 = Math.floor((h - box) / 2);
  const data = ctx.getImageData(x0, y0, box, box).data;
  let r = 0, g = 0, b = 0, count = 0;
  for(let i=0; i<data.length; i+=4){
    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
  }
  r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
  const result = classifyColor(r,g,b);
  if(result.key){
    setStatus(result.key, `Status terdeteksi dari kamera: ${result.label}. RGB rata-rata: ${r}, ${g}, ${b}.`);
    cameraResult.textContent = `Terdeteksi: ${result.label}. Status: ${statusData[result.key].title}.`;
    document.getElementById('cek-warna').scrollIntoView({behavior:'smooth'});
  }else{
    cameraResult.textContent = result.label + ` RGB rata-rata: ${r}, ${g}, ${b}.`;
  }
}

startBtn?.addEventListener('click', startCamera);
detectBtn?.addEventListener('click', detectColor);
