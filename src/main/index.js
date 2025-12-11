const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const preloadPath = path.join(__dirname, '..', 'preload', 'index.js');

  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadPath,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, '..', 'resources', 'localix-logo.png'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const htmlPath = path.join(__dirname, '..', '..', 'out', 'renderer', 'index.html');
    mainWindow.loadFile(htmlPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  if (!isDev) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('update-available', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('update-available');
      }
    });
    autoUpdater.on('checking-for-update', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('update-checking');
      }
    });
    autoUpdater.on('update-not-available', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('update-none');
      }
    });
    autoUpdater.on('update-downloaded', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('update-downloaded');
      }
      autoUpdater.quitAndInstall();
    });
    autoUpdater.on('error', () => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('update-error');
      }
    });
    autoUpdater.on('download-progress', (progress) => {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('update-progress', { percent: progress.percent, bytesPerSecond: progress.bytesPerSecond, transferred: progress.transferred, total: progress.total });
      }
    });
    autoUpdater.checkForUpdatesAndNotify();
  }

  ipcMain.on('check-for-updates', () => {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  ipcMain.handle('get-version', () => app.getVersion());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
