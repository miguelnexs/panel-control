const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', cb),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', cb),
  onUpdateError: (cb) => ipcRenderer.on('update-error', cb),
  onUpdateProgress: (cb) => ipcRenderer.on('update-progress', cb),
  onUpdateChecking: (cb) => ipcRenderer.on('update-checking', cb),
  onUpdateNone: (cb) => ipcRenderer.on('update-none', cb),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  getVersion: () => ipcRenderer.invoke('get-version'),
});
