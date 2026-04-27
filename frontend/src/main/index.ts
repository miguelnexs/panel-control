import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { URL } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

autoUpdater.logger = require('electron-log');
// @ts-ignore
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = false;

const UPDATE_PROVIDER = process.env.UPDATE_PROVIDER || 'github';
const UPDATE_URL = process.env.UPDATE_URL || '';
if (UPDATE_PROVIDER === 'generic' && UPDATE_URL) {
  autoUpdater.setFeedURL({ provider: 'generic', url: UPDATE_URL, channel: 'latest' });
} else {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: process.env.GITHUB_OWNER || 'miguelnexs',
    repo: process.env.GITHUB_REPO || 'panel-control',
    releaseType: 'release'
  });
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('update-status', { status: 'checking', message: 'Buscando actualizaciones...' });
});

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-status', { status: 'available', message: `Actualización disponible: v${info.version}`, version: info.version });
});

autoUpdater.on('update-not-available', (_info) => {
  mainWindow?.webContents.send('update-status', { status: 'not-available', message: 'La aplicación está actualizada.' });
});

autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('update-status', { status: 'error', message: 'Error en actualización: ' + err.message, error: err });
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('update-status', { 
    status: 'progress', 
    message: `Descargando: ${Math.round(progressObj.percent)}%`, 
    percent: progressObj.percent,
    transferred: progressObj.transferred,
    total: progressObj.total
  });
});

autoUpdater.on('update-downloaded', (_info) => {
  mainWindow?.webContents.send('update-status', { status: 'downloaded', message: 'Actualización descargada. Instalando...' });
  // Automatically quit and install after a short delay
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 3000);
});

// Templates Server Configuration
const TEMPLATES_ROOT = 'd:\\Desktop\\miguel\\cgbycaro\\Plantillas';
const TEMPLATES_PORT = 9000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const templatesServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let urlPath = req.url || '/';
  urlPath = urlPath.split('?')[0];
  
  if (urlPath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (urlPath.startsWith('/templates/')) {
    const parts = urlPath.split('/').filter(p => p);
    if (parts.length < 2) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    const templateName = parts[1];
    const relativePath = parts.slice(2).join('/');
    
    // Serve from dist folder
    let filePath = path.join(TEMPLATES_ROOT, templateName, 'dist', relativePath);
    
    if (!relativePath || relativePath === '') {
       filePath = path.join(TEMPLATES_ROOT, templateName, 'dist', 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        // SPA Fallback: if file extension is missing or it's not found, try index.html
        if (!path.extname(filePath) || path.extname(filePath) === '.html') {
           const indexPath = path.join(TEMPLATES_ROOT, templateName, 'dist', 'index.html');
           fs.readFile(indexPath, (err2, content) => {
             if (err2) {
               res.writeHead(404);
               res.end(`File not found: ${req.url}`);
               return;
             }
             res.writeHead(200, { 'Content-Type': 'text/html' });
             res.end(content, 'utf-8');
           });
           return;
        }
        res.writeHead(404);
        res.end(`File not found: ${req.url}`);
        return;
      }

      if (stats.isDirectory()) {
         const indexPath = path.join(filePath, 'index.html');
         fs.readFile(indexPath, (err2, content) => {
             if (err2) {
               res.writeHead(404);
               res.end(`Index not found`);
               return;
             }
             res.writeHead(200, { 'Content-Type': 'text/html' });
             res.end(content, 'utf-8');
           });
           return;
      }

      const extname = String(path.extname(filePath)).toLowerCase();
      const contentType = mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
           res.writeHead(500);
           res.end('Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

templatesServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${TEMPLATES_PORT} is already in use. Templates server skipped.`);
  } else {
    console.error('Templates server error:', err);
  }
});

templatesServer.listen(TEMPLATES_PORT, () => {
  console.log(`Templates server running at http://localhost:${TEMPLATES_PORT}/`);
});

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
type UiSettings = { preset: string; zoom: number };
const defaultUiSettings: UiSettings = { preset: 'default', zoom: 0.9 };
let uiSettingsCache: UiSettings = { ...defaultUiSettings };

const getUiSettingsPath = () => {
  try {
    const base = app.getPath('userData');
    return path.join(base, 'ui.json');
  } catch {
    return null;
  }
};

const readUiSettings = (): UiSettings => {
  const p = getUiSettingsPath();
  if (!p) return { ...defaultUiSettings };
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    const preset = String(data?.preset || defaultUiSettings.preset);
    const zoom = normalizeZoomFactor(data?.zoom);
    return { preset, zoom };
  } catch {
    return { ...defaultUiSettings };
  }
};

const writeUiSettings = (s: UiSettings) => {
  const p = getUiSettingsPath();
  if (!p) return;
  try {
    fs.writeFileSync(p, JSON.stringify(s), 'utf8');
  } catch {}
};

const deleteUiSettings = () => {
  const p = getUiSettingsPath();
  if (!p) return;
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
};

const normalizeZoomFactor = (value: any) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0.6, Math.min(1.5, n));
};

const applyUiSettings = (win: BrowserWindow, preset: string, zoom: number) => {
  const z = normalizeZoomFactor(zoom);
  try {
    win.webContents.setZoomFactor(z);
  } catch {}

  if (preset === 'maximized') {
    if (!win.isMaximized()) win.maximize();
    return;
  }

  if (win.isMaximized()) win.unmaximize();

  const sizes: Record<string, { w: number; h: number }> = {
    compact: { w: 1280, h: 720 },
    normal: { w: 1400, h: 900 },
    large: { w: 1600, h: 1000 },
    fullhd: { w: 1920, h: 1080 },
    default: { w: 1400, h: 900 },
  };

  const s = sizes[preset] || sizes.default;
  try {
    win.setSize(s.w, s.h);
    win.center();
  } catch {}
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

function createWindow(): BrowserWindow {
  const preloadPath = path.join(__dirname, '..', 'preload', 'index.js');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    icon: path.join(__dirname, '..', 'resources', 'localix-logo.png'),
    show: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    const htmlPath = path.join(__dirname, '..', '..', 'out', 'renderer', 'index.html');
    mainWindow.loadFile(htmlPath);
  }

  mainWindow.webContents.on('did-finish-load', () => {
    uiSettingsCache = readUiSettings();
    applyUiSettings(mainWindow as BrowserWindow, uiSettingsCache.preset, uiSettingsCache.zoom);
  });

  // Wait for window to be ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      // Use a small timeout to allow UI to render first
    setTimeout(() => {
        mainWindow?.show();
    }, 100);
      // Check for updates after window is visible
      if (!isDev) {
        // Delay update check to ensure UI is responsive first
        setTimeout(() => {
          autoUpdater.checkForUpdatesAndNotify().catch(err => {
            console.error('Error checking for updates:', err);
          });
        }, 3000);
        setInterval(() => {
          autoUpdater.checkForUpdatesAndNotify().catch(() => {});
        }, 15 * 60 * 1000);
      }
    }
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-unmaximized');
  });

  return mainWindow;
}

// Register IPC handlers globally
ipcMain.handle('ui:get-settings', async () => {
  return {
    preset: String(uiSettingsCache.preset || 'default'),
    zoom: normalizeZoomFactor(uiSettingsCache.zoom),
  };
});

ipcMain.handle('ui:apply-settings', async (_, args: any) => {
  const preset = String(args?.preset || 'default');
  const zoom = normalizeZoomFactor(args?.zoom);
  uiSettingsCache = { preset, zoom };
  writeUiSettings(uiSettingsCache);
  if (mainWindow) applyUiSettings(mainWindow, preset, zoom);
  return { ok: true };
});

ipcMain.handle('ui:reset-settings', async () => {
  uiSettingsCache = { ...defaultUiSettings };
  deleteUiSettings();
  if (mainWindow) applyUiSettings(mainWindow, 'default', 1);
  return { ok: true };
});

// Window control handlers
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

// Allow renderer to trigger update checks
ipcMain.on('check-for-updates', () => {
  try {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  } catch {}
});

ipcMain.handle('start-google-auth', async (_, clientId: string) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url || '', `http://${req.headers.host}`);
      
      if (reqUrl.pathname === '/callback') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Autenticación Exitosa - Localix</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                  background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
                  height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  color: white;
                }
                .card {
                  background: rgba(31, 41, 55, 0.5);
                  backdrop-filter: blur(12px);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  padding: 3rem;
                  border-radius: 1.5rem;
                  text-align: center;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                  max-width: 400px;
                  width: 90%;
                  animation: slideIn 0.5s ease-out;
                }
                @keyframes slideIn {
                  from { transform: translateY(20px); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
                .icon-container {
                  width: 80px;
                  height: 80px;
                  background: rgba(16, 185, 129, 0.2);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 1.5rem;
                }
                .icon {
                  width: 40px;
                  height: 40px;
                  color: #10b981;
                }
                h1 {
                  font-size: 1.5rem;
                  margin-bottom: 0.5rem;
                  font-weight: 600;
                  background: linear-gradient(to right, #34d399, #2dd4bf);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                }
                p {
                  color: #9ca3af;
                  line-height: 1.6;
                  margin-bottom: 2rem;
                }
                .loader {
                  border: 3px solid rgba(255,255,255,0.1);
                  border-left-color: #10b981;
                  border-radius: 50%;
                  width: 30px;
                  height: 30px;
                  animation: spin 1s linear infinite;
                  margin: 0 auto;
                }
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
                .success-msg {
                  display: none;
                }
                .error-msg {
                  display: none;
                  color: #ef4444;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div id="loading-state">
                  <div class="loader"></div>
                  <h1 style="margin-top: 1.5rem; background: none; -webkit-text-fill-color: white; font-size: 1.25rem;">Autenticando...</h1>
                  <p>Por favor espera un momento</p>
                </div>

                <div id="success-state" class="success-msg">
                  <div class="icon-container">
                    <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1>¡Inicio de sesión exitoso!</h1>
                  <p>Ya puedes cerrar esta ventana y volver a la aplicación.</p>
                  <button onclick="window.close()" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
                    Cerrar ventana
                  </button>
                </div>

                <div id="error-state" class="error-msg">
                  <div class="icon-container" style="background: rgba(239, 68, 68, 0.2);">
                    <svg class="icon" style="color: #ef4444;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 style="background: none; -webkit-text-fill-color: #ef4444;">Error de autenticación</h1>
                  <p id="error-text">No se pudo completar el inicio de sesión.</p>
                </div>
              </div>

              <script>
                // Extract hash params
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const error = params.get('error');

                const showSuccess = () => {
                  document.getElementById('loading-state').style.display = 'none';
                  document.getElementById('success-state').style.display = 'block';
                };

                const showError = (msg) => {
                  document.getElementById('loading-state').style.display = 'none';
                  document.getElementById('error-state').style.display = 'block';
                  document.getElementById('error-text').innerText = msg;
                };

                if (accessToken) {
                  fetch('/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: accessToken })
                  })
                  .then(() => {
                    showSuccess();
                    // Auto close after 3s
                    setTimeout(() => window.close(), 3000);
                  })
                  .catch(err => {
                    showError('Error al comunicar con la aplicación.');
                  });
                } else if (error) {
                  showError('Google rechazó la conexión: ' + error);
                } else {
                  // Check if query params instead of hash
                  const queryParams = new URLSearchParams(window.location.search);
                  if (queryParams.get('error')) {
                     showError(queryParams.get('error'));
                  } else {
                     // Just loading...
                  }
                }
              </script>
            </body>
          </html>
        `);
        return;
      }

      // Step 2: Handle Token POST
      if (reqUrl.pathname === '/token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { token } = JSON.parse(body);
            res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
            res.end('ok');
            
            // Success!
            resolve(token);
            server.close();
          } catch (e) {
            res.writeHead(400);
            res.end('error');
          }
        });
        return;
      }

      res.writeHead(404);
      res.end();
    });

    // Start server on port 4200 (as configured in Google Console)
    server.listen(4200, () => {
      const redirectUri = 'http://localhost:4200/callback';
      const scope = 'email profile';
      // Added prompt=select_account to force account chooser
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
      
      shell.openExternal(authUrl);
    });

    server.on('error', (err) => {
      reject(err);
      server.close();
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Timeout esperando autenticación'));
    }, 300000);
  });
});

ipcMain.handle('open-path', async (_, pathStr: string) => {
  try {
    await shell.openPath(pathStr);
    return { success: true };
  } catch (error) {
    console.error('Failed to open path:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('print-silent', async (_, { content, printerName, paperWidthMm }) => {
    console.log('Main: Received print-silent request');
    const widthMm = Number(paperWidthMm || 58);
    const widthPx = Math.max(320, Math.min(900, Math.round((widthMm / 25.4) * 203)));
    const printWindow = new BrowserWindow({
      show: false,
      width: widthPx,
      height: 900,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      console.log('Main: Loading content...');
      // Get available printers for debugging
      const printers = await printWindow.webContents.getPrintersAsync();
      console.log('Available printers:', printers.map(p => p.name).join(', '));
      
      const targetPrinter = printerName ? printers.find(p => p.name === printerName) : printers.find(p => p.isDefault);
      console.log('Target printer:', targetPrinter ? targetPrinter.name : 'Unknown');

      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(content)}`);
      await new Promise<void>((resolve) => printWindow.webContents.once('did-finish-load', () => resolve()));
      await printWindow.webContents.executeJavaScript(
        'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))',
      );

      const heightPx = await printWindow.webContents.executeJavaScript(
        'Math.max(document.body?.scrollHeight||0, document.documentElement?.scrollHeight||0, document.body?.offsetHeight||0, 1)',
      );
      const heightMicrons = Math.max(80000, Math.min(2000000, Math.round((Number(heightPx) * 25.4 / 96) * 1000)));

      const options = {
        silent: true,
        deviceName: printerName || undefined,
        margins: {
          marginType: 'none'
        },
        pageSize: {
          width: Math.round(widthMm * 1000),
          height: heightMicrons,
        },
        printBackground: true,
      };
      
      console.log('Main: Printing with options:', JSON.stringify(options));

      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('print-timeout')), 15000);
        // @ts-ignore
        printWindow.webContents.print(options, (success, errorType) => {
          console.log('Main: Print callback', success, errorType);
          clearTimeout(timeoutId);
          if (!success) {
            reject(new Error(errorType));
          } else {
            resolve();
          }
        });
      });
      
      return { success: true };
    } catch (error) {
      console.error('Print failed:', error);
      return { success: false, error: String(error) };
    } finally {
      printWindow.close();
    }
  });

ipcMain.on('check-for-updates', () => {
  if (isDev) {
    mainWindow?.webContents.send('update-status', 'Modo desarrollo: No se buscan actualizaciones.');
    return;
  }
  autoUpdater.checkForUpdates().catch(err => {
    mainWindow?.webContents.send('update-status', 'Error al buscar actualizaciones: ' + err.message);
  });
});

ipcMain.on('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (templatesServer) {
    templatesServer.close();
  }
});
