const {
  app, BrowserWindow, Tray, Menu, Notification, screen, ipcMain,
  shell, nativeImage, powerMonitor, dialog,
} = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const BUILTIN_ANIMATIONS = [
  { id: 'builtin:eyes', name: 'Friendly Eyes' },
  { id: 'builtin:cat', name: 'Sleepy Cat' },
  { id: 'builtin:owl', name: 'Wise Owl' },
  { id: 'builtin:frog', name: 'Happy Frog' },
  { id: 'builtin:capybara', name: 'Chill Capybara' },
  { id: 'builtin:panda', name: 'Cuddly Panda' },
  { id: 'builtin:dog', name: 'Loyal Pup' },
  { id: 'builtin:bunny', name: 'Fluffy Bunny' },
  { id: 'builtin:fox', name: 'Clever Fox' },
  { id: 'builtin:koala', name: 'Sleepy Koala' },
  { id: 'builtin:penguin', name: 'Little Penguin' },
];
const BUILTIN_SOUNDS = [
  { id: 'none', name: 'No sound' },
  { id: 'builtin:pop', name: 'Soft pop' },
  { id: 'builtin:chime', name: 'Gentle chime' },
  { id: 'builtin:boing', name: 'Cartoon boing' },
];
const ANIMATION_EXT = ['.gif', '.png', '.webp', '.apng', '.webm', '.mp4', '.json'];
const SOUND_EXT = ['.mp3', '.wav', '.ogg', '.m4a'];
const MIME = {
  '.gif': 'image/gif', '.png': 'image/png', '.apng': 'image/apng', '.webp': 'image/webp',
  '.webm': 'video/webm', '.mp4': 'video/mp4',
};

const DEFAULTS = {
  enabled: true,
  intervalSec: 20,
  jitter: true,
  animation: 'random',
  sound: 'builtin:pop',
  volume: 0.35,
  size: 170,
  position: 'bottom-right',
  showCard: false,
  removeWhiteBg: true,
  caption: 'blink~',
  idlePauseSec: 60,
  breakReminder: true,
  startAtLogin: false,
};

let settings;
let pausedUntil = 0;
let tray = null;
let overlay = null;
let settingsWin = null;
let blinkTimer = null;
let breakTimer = null;
let overlayBusy = false;

// ---------- paths & settings ----------
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
const userLibrary = () => path.join(app.getPath('userData'), 'library');
const bundledLibrary = () => path.join(__dirname, '..', 'library');

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));
}

function ensureLibrary() {
  for (const sub of ['animations', 'sounds']) {
    fs.mkdirSync(path.join(userLibrary(), sub), { recursive: true });
  }
}

function scanDir(dir, exts) {
  try {
    return fs.readdirSync(dir)
      .filter((f) => exts.includes(path.extname(f).toLowerCase()))
      .map((f) => ({ id: 'file:' + path.join(dir, f), name: path.parse(f).name }));
  } catch {
    return [];
  }
}

function listLibrary() {
  const anims = [
    ...scanDir(path.join(bundledLibrary(), 'animations'), ANIMATION_EXT),
    ...scanDir(path.join(userLibrary(), 'animations'), ANIMATION_EXT),
  ];
  const sounds = [
    ...scanDir(path.join(bundledLibrary(), 'sounds'), SOUND_EXT),
    ...scanDir(path.join(userLibrary(), 'sounds'), SOUND_EXT),
  ];
  return {
    animations: [...BUILTIN_ANIMATIONS, ...anims],
    sounds: [...BUILTIN_SOUNDS, ...sounds],
  };
}

// ---------- resolving what to play ----------
function resolveAnimation(id) {
  if (id === 'random') {
    const all = listLibrary().animations;
    id = all[Math.floor(Math.random() * all.length)].id;
  }
  if (id.startsWith('builtin:')) return { type: 'builtin', id: id.slice(8) };
  const file = id.slice(5);
  if (!fs.existsSync(file)) return { type: 'builtin', id: 'eyes' };
  const ext = path.extname(file).toLowerCase();
  if (ext === '.json') {
    try {
      return { type: 'lottie', data: JSON.parse(fs.readFileSync(file, 'utf8')) };
    } catch {
      return { type: 'builtin', id: 'eyes' };
    }
  }
  // Send the raw bytes; the overlay plays them from a blob: URL so it can edit pixels (background removal).
  return { type: ['.webm', '.mp4'].includes(ext) ? 'video' : 'image', bytes: fs.readFileSync(file), mime: MIME[ext] };
}

function resolveSound(id) {
  if (!id || id === 'none') return null;
  if (id.startsWith('builtin:')) return { type: 'builtin', id: id.slice(8) };
  const file = id.slice(5);
  return fs.existsSync(file) ? { type: 'file', url: pathToFileURL(file).href } : null;
}

// ---------- overlay ----------
function createOverlay() {
  overlay = new BrowserWindow({
    width: 200, height: 220,
    transparent: true, frame: false, resizable: false, movable: false,
    skipTaskbar: true, focusable: false, show: false, hasShadow: false,
    alwaysOnTop: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false },
  });
  overlay.setAlwaysOnTop(true, 'screen-saver');
  overlay.setIgnoreMouseEvents(true);
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.loadFile(path.join(__dirname, 'overlay.html'));
}

function positionOverlay() {
  const size = settings.size;
  const w = size + 30;
  const h = size + (settings.caption ? 60 : 30);
  const { workArea: a } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const m = 24;
  const spots = {
    'bottom-right': [a.x + a.width - w - m, a.y + a.height - h - m],
    'bottom-left': [a.x + m, a.y + a.height - h - m],
    'top-right': [a.x + a.width - w - m, a.y + m],
    'top-left': [a.x + m, a.y + m],
    'top-center': [a.x + Math.round((a.width - w) / 2), a.y + m],
  };
  const [x, y] = spots[settings.position] || spots['bottom-right'];
  overlay.setBounds({ x, y, width: w, height: h });
}

function blink() {
  if (!overlay || overlayBusy) return;
  overlayBusy = true;
  positionOverlay();
  overlay.showInactive();
  overlay.webContents.send('blink', {
    animation: resolveAnimation(settings.animation),
    sound: resolveSound(settings.sound),
    volume: settings.volume,
    size: settings.size,
    showCard: settings.showCard,
    removeWhiteBg: settings.removeWhiteBg,
    caption: settings.caption,
  });
  // Safety net in case the renderer never reports back.
  setTimeout(finishBlink, 8000);
}

function finishBlink() {
  if (!overlayBusy) return;
  overlayBusy = false;
  overlay?.hide();
}

// ---------- scheduling ----------
function isIdle() {
  return settings.idlePauseSec > 0 && powerMonitor.getSystemIdleTime() >= settings.idlePauseSec;
}

function isActive() {
  return settings.enabled && Date.now() >= pausedUntil;
}

function scheduleBlink() {
  clearTimeout(blinkTimer);
  let ms = settings.intervalSec * 1000;
  if (settings.jitter) ms *= 0.75 + Math.random() * 0.5; // vary timing so it doesn't become "invisible"
  blinkTimer = setTimeout(() => {
    if (isActive() && !isIdle()) blink();
    scheduleBlink();
  }, Math.max(3000, ms));
}

function scheduleBreak() {
  clearInterval(breakTimer);
  if (!settings.breakReminder) return;
  breakTimer = setInterval(() => {
    if (!isActive() || isIdle() || !Notification.isSupported()) return;
    new Notification({
      title: 'Time for a 20-20-20 eye break',
      body: 'Look at something ~20 feet (6 m) away for 20 seconds, and blink slowly a few times.',
      silent: false,
    }).show();
  }, 20 * 60 * 1000);
}

function applySettings() {
  app.setLoginItemSettings({ openAtLogin: !!settings.startAtLogin });
  scheduleBlink();
  scheduleBreak();
  refreshTray();
}

// ---------- tray ----------
function makeTrayIcon() {
  // Draw a small eye procedurally so the app needs no icon file.
  const S = 32;
  const buf = Buffer.alloc(S * S * 4);
  const c = S / 2;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x + 0.5 - c, dy = y + 0.5 - c;
      // Almond shape: intersection of two circles offset vertically.
      const R = 20, off = 12;
      const d1 = Math.hypot(dx, dy - off), d2 = Math.hypot(dx, dy + off);
      const inside = d1 < R && d2 < R;
      const edge = inside && (d1 > R - 2.2 || d2 > R - 2.2);
      const r = Math.hypot(dx, dy);
      let px = [0, 0, 0, 0]; // BGRA
      if (edge) px = [40, 40, 40, 255];
      else if (inside && r < 3.2) px = [20, 20, 20, 255];
      else if (inside && r < 7) px = [230, 150, 60, 255];
      else if (inside) px = [255, 255, 255, 255];
      buf.set(px, (y * S + x) * 4);
    }
  }
  return nativeImage.createFromBitmap(buf, { width: S, height: S });
}

function pauseFor(minutes) {
  pausedUntil = Date.now() + minutes * 60 * 1000;
  refreshTray();
  setTimeout(refreshTray, minutes * 60 * 1000 + 500);
}

function refreshTray() {
  if (!tray) return;
  const paused = Date.now() < pausedUntil;
  const status = !settings.enabled ? 'Off' : paused
    ? `Paused until ${new Date(pausedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `Blinking every ~${settings.intervalSec}s`;
  tray.setToolTip(`BlinkBuddy — ${status}`);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `BlinkBuddy — ${status}`, enabled: false },
    { type: 'separator' },
    { label: 'Blink now', click: blink },
    {
      label: 'Enabled', type: 'checkbox', checked: settings.enabled,
      click: (i) => { settings.enabled = i.checked; saveSettings(); applySettings(); },
    },
    paused
      ? { label: 'Resume', click: () => { pausedUntil = 0; refreshTray(); } }
      : {
        label: 'Pause', submenu: [
          { label: '15 minutes', click: () => pauseFor(15) },
          { label: '30 minutes', click: () => pauseFor(30) },
          { label: '1 hour', click: () => pauseFor(60) },
          { label: '2 hours', click: () => pauseFor(120) },
        ],
      },
    { type: 'separator' },
    { label: 'Settings & Library…', click: openSettings },
    { label: 'Open library folder', click: () => shell.openPath(userLibrary()) },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
}

// ---------- settings window ----------
function openSettings() {
  if (settingsWin) { settingsWin.show(); settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 560, height: 760, title: 'BlinkBuddy Settings', autoHideMenuBar: true,
    icon: makeTrayIcon(),
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  settingsWin.loadFile(path.join(__dirname, 'settings.html'));
  settingsWin.on('closed', () => { settingsWin = null; });
}

async function importFiles(kind) {
  const isAnim = kind === 'animations';
  const exts = (isAnim ? ANIMATION_EXT : SOUND_EXT).map((e) => e.slice(1));
  const res = await dialog.showOpenDialog(settingsWin, {
    title: isAnim ? 'Add animations to your library' : 'Add sounds to your library',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: isAnim ? 'Animations (GIF, WebP, PNG, WebM, MP4, Lottie JSON)' : 'Audio', extensions: exts }],
  });
  if (res.canceled) return [];
  const dest = path.join(userLibrary(), kind);
  return res.filePaths.map((src) => {
    const target = path.join(dest, path.basename(src));
    fs.copyFileSync(src, target);
    return 'file:' + target;
  });
}

// ---------- IPC ----------
ipcMain.on('blink-done', finishBlink);
ipcMain.handle('get-settings', () => settings);
ipcMain.handle('save-settings', (_e, patch) => {
  settings = { ...settings, ...patch };
  saveSettings();
  applySettings();
  return settings;
});
ipcMain.handle('list-library', () => listLibrary());
ipcMain.handle('import-files', (_e, kind) => importFiles(kind));
ipcMain.handle('open-library', () => shell.openPath(userLibrary()));
ipcMain.handle('test-blink', () => { finishBlink(); blink(); });

// ---------- app lifecycle ----------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', openSettings);
  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.blinkbuddy.app');
    settings = loadSettings();
    ensureLibrary();
    createOverlay();
    tray = new Tray(makeTrayIcon());
    tray.on('click', openSettings);
    applySettings();
    powerMonitor.on('resume', scheduleBlink);
    if (!fs.existsSync(settingsFile())) { saveSettings(); openSettings(); }
  });
  // Tray app: keep running when the settings window closes.
  app.on('window-all-closed', (e) => e.preventDefault());
}
