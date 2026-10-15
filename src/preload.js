const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('blinkApi', {
  onBlink: (cb) => ipcRenderer.on('blink', (_e, payload) => cb(payload)),
  blinkDone: () => ipcRenderer.send('blink-done'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (patch) => ipcRenderer.invoke('save-settings', patch),
  listLibrary: () => ipcRenderer.invoke('list-library'),
  importFiles: (kind) => ipcRenderer.invoke('import-files', kind),
  openLibrary: () => ipcRenderer.invoke('open-library'),
  testBlink: () => ipcRenderer.invoke('test-blink'),
});
