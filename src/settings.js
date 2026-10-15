const api = window.blinkApi;
const $ = (id) => document.getElementById(id);
const preview = $('preview');
const FIELDS = ['enabled', 'intervalSec', 'jitter', 'idlePauseSec', 'breakReminder', 'startAtLogin',
  'animation', 'sound', 'volume', 'size', 'position', 'showCard', 'removeWhiteBg', 'caption'];

let previewTimer = null;

function fileUrl(id) {
  return 'file:///' + encodeURI(id.slice(5).replace(/\\/g, '/'));
}

function fillSelect(el, items, extra = []) {
  el.innerHTML = '';
  for (const it of [...extra, ...items]) {
    const o = document.createElement('option');
    o.value = it.id;
    o.textContent = it.name;
    el.appendChild(o);
  }
}

function showPreview(id) {
  clearInterval(previewTimer);
  preview.innerHTML = '';
  if (id === 'random') id = 'builtin:eyes';
  if (id.startsWith('builtin:')) {
    preview.innerHTML = window.Blink.CHARACTERS[id.slice(8)]();
    const svg = preview.querySelector('svg');
    const blinkOnce = () => {
      svg.classList.remove('blinking');
      void svg.getBoundingClientRect(); // restart the CSS animation
      svg.classList.add('blinking');
    };
    blinkOnce();
    previewTimer = setInterval(blinkOnce, 2200);
    return;
  }
  const ext = id.split('.').pop().toLowerCase();
  if (ext === 'json') {
    preview.innerHTML = '<div class="note">Lottie animation<br>use “Test blink”</div>';
  } else if (ext === 'webm' || ext === 'mp4') {
    const v = document.createElement('video');
    Object.assign(v, { src: fileUrl(id), muted: true, autoplay: true, loop: true });
    preview.appendChild(v);
  } else {
    const img = new Image();
    img.src = fileUrl(id);
    preview.appendChild(img);
  }
}

function read(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'number' || el.type === 'range') return Number(el.value);
  return el.value;
}

async function refreshLibrary(selectAnim, selectSound) {
  const lib = await api.listLibrary();
  fillSelect($('animation'), lib.animations, [{ id: 'random', name: '🎲 Random each time' }]);
  fillSelect($('sound'), lib.sounds);
  if (selectAnim) $('animation').value = selectAnim;
  if (selectSound) $('sound').value = selectSound;
}

async function init() {
  const s = await api.getSettings();
  await refreshLibrary(s.animation, s.sound);
  for (const f of FIELDS) {
    const el = $(f);
    if (el.type === 'checkbox') el.checked = !!s[f];
    else el.value = s[f];
    el.addEventListener(el.type === 'text' ? 'input' : 'change', async () => {
      let v = read(el);
      if (f === 'intervalSec') v = Math.max(3, v || 20);
      await api.saveSettings({ [f]: v });
      if (f === 'animation') showPreview(v);
      if (f === 'sound' || f === 'volume') {
        const snd = $('sound').value;
        if (snd.startsWith('builtin:')) window.Blink.playSound({ type: 'builtin', id: snd.slice(8) }, $('volume').valueAsNumber);
        else if (snd.startsWith('file:')) window.Blink.playSound({ type: 'file', url: fileUrl(snd) }, $('volume').valueAsNumber);
      }
    });
  }
  showPreview(s.animation);

  $('test').onclick = () => api.testBlink();
  $('openLib').onclick = () => api.openLibrary();
  $('addAnim').onclick = async () => {
    const added = await api.importFiles('animations');
    if (!added.length) return;
    await api.saveSettings({ animation: added[0] });
    await refreshLibrary(added[0], $('sound').value);
    showPreview(added[0]);
  };
  $('addSound').onclick = async () => {
    const added = await api.importFiles('sounds');
    if (!added.length) return;
    await api.saveSettings({ sound: added[0] });
    await refreshLibrary($('animation').value, added[0]);
  };
}

init();
