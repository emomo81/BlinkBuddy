const wrap = document.getElementById('wrap');
const stage = document.getElementById('stage');
const caption = document.getElementById('caption');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_MS = 6000;

// Make near-white pixels transparent, but only where they connect to the image edge,
// so white parts *inside* the character (like eye whites) are kept.
function removeEdgeWhite(d, w, h) {
  const T = 225;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const isBg = (i) => {
    const p = i * 4;
    return d[p + 3] < 20 || (d[p] > T && d[p + 1] > T && d[p + 2] > T);
  };
  const push = (i) => { if (!seen[i] && isBg(i)) { seen[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop();
    d[i * 4 + 3] = 0;
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  // Soften the light fringe left around the character's outline.
  for (let i = 0; i < w * h; i++) {
    if (seen[i]) continue;
    const x = i % w;
    const touchesBg = (x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1])
      || (i >= w && seen[i - w]) || (i < w * (h - 1) && seen[i + w]);
    if (!touchesBg) continue;
    const p = i * 4;
    const m = Math.min(d[p], d[p + 1], d[p + 2]);
    if (m > 150) d[p + 3] = Math.min(d[p + 3], Math.round(((255 - m) * 255) / 105));
  }
}

// Draws an <img> or <video> onto a canvas every frame with the white background removed.
function keyedCanvas(source, getSize) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let running = true;
  const draw = () => {
    if (!running) return;
    const [sw, sh] = getSize();
    if (sw && sh) {
      const scale = Math.min(1, 360 / Math.max(sw, sh)); // cap per-frame work
      const w = Math.round(sw * scale), h = Math.round(sh * scale);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(source, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      removeEdgeWhite(frame.data, w, h);
      ctx.putImageData(frame, 0, 0);
    }
    requestAnimationFrame(draw);
  };
  draw();
  return { canvas, stop: () => { running = false; } };
}

// The source element stays in the page (so GIFs keep animating and videos keep their audio) but is invisible.
function hideSource(el) {
  Object.assign(el.style, { position: 'absolute', width: '1px', height: '1px', opacity: '0', pointerEvents: 'none' });
}

function blobUrl(anim) {
  return URL.createObjectURL(new Blob([anim.bytes], { type: anim.mime }));
}

// Each renderer puts content on the stage, plays it, and resolves when finished.
async function playBuiltin(anim, sound, volume) {
  const make = window.Blink.CHARACTERS[anim.id] || window.Blink.CHARACTERS.eyes;
  stage.innerHTML = make();
  const svg = stage.querySelector('svg');
  await sleep(280);
  svg.classList.add('blinking');
  setTimeout(() => window.Blink.playSound(sound, volume), window.Blink.BLINK_MS * 0.4);
  await sleep(window.Blink.BLINK_MS * 2 + 350);
}

async function playImage(anim, sound, volume, removeBg) {
  const url = blobUrl(anim);
  const img = new Image();
  img.src = url;
  stage.appendChild(img);
  let keyed = null;
  if (removeBg) {
    hideSource(img);
    keyed = keyedCanvas(img, () => [img.naturalWidth, img.naturalHeight]);
    stage.appendChild(keyed.canvas);
  }
  window.Blink.playSound(sound, volume);
  await sleep(2600);
  keyed?.stop();
  URL.revokeObjectURL(url);
}

async function playVideo(anim, sound, volume, removeBg) {
  const url = blobUrl(anim);
  const v = document.createElement('video');
  Object.assign(v, { src: url, volume, autoplay: true, playsInline: true });
  stage.appendChild(v);
  let keyed = null;
  if (removeBg) {
    hideSource(v);
    keyed = keyedCanvas(v, () => [v.videoWidth, v.videoHeight]);
    stage.appendChild(keyed.canvas);
  }
  // Videos play their own audio; fall back to the chosen sound only if the video is silent.
  setTimeout(() => {
    if (!v.webkitAudioDecodedByteCount) window.Blink.playSound(sound, volume);
  }, 300);
  await new Promise((resolve) => {
    v.onended = resolve;
    v.onerror = resolve;
    setTimeout(resolve, MAX_MS);
  });
  v.pause();
  keyed?.stop();
  URL.revokeObjectURL(url);
}

function playLottie(anim, sound, volume) {
  return new Promise((resolve) => {
    const a = lottie.loadAnimation({
      container: stage, renderer: 'svg', loop: false, autoplay: true, animationData: anim.data,
    });
    a.addEventListener('complete', resolve);
    a.addEventListener('data_failed', resolve);
    window.Blink.playSound(sound, volume);
    setTimeout(resolve, MAX_MS);
  });
}

const PLAYERS = { builtin: playBuiltin, image: playImage, video: playVideo, lottie: playLottie };

window.blinkApi.onBlink(async ({ animation, sound, volume, size, showCard, removeWhiteBg, caption: text }) => {
  try {
    stage.innerHTML = '';
    stage.style.width = stage.style.height = size + 'px';
    wrap.classList.toggle('card', !!showCard);
    caption.textContent = text || '';
    caption.style.display = text ? '' : 'none';
    requestAnimationFrame(() => wrap.classList.add('show'));
    await (PLAYERS[animation.type] || playBuiltin)(animation, sound, volume, !!removeWhiteBg);
  } catch (err) {
    console.error(err);
  }
  wrap.classList.remove('show');
  await sleep(280);
  stage.innerHTML = '';
  window.blinkApi.blinkDone();
});
