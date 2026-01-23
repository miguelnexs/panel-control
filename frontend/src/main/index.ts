import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { URL } from 'url';

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
    titleBarOverlay: {
      color: '#030712', // gray-950
      symbolColor: '#9ca3af', // gray-400
      height: 32
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    const htmlPath = path.join(__dirname, '..', '..', 'out', 'renderer', 'index.html');
    mainWindow.loadFile(htmlPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

// Register IPC handlers globally
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

ipcMain.handle('print-silent', async (_, { content, printerName }) => {
    console.log('Main: Received print-silent request');
    const printWindow = new BrowserWindow({
      show: false,
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
      
      // Wait for content to render - Critical for thermal printers
      console.log('Main: Waiting for render...');
      await new Promise(r => setTimeout(r, 1000));

      const options = {
        silent: true,
        deviceName: printerName || undefined,
        margins: {
          marginType: 'none'
        },
        printBackground: true
      };
      
      console.log('Main: Printing with options:', JSON.stringify(options));

      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        printWindow.webContents.print(options, (success, errorType) => {
          console.log('Main: Print callback', success, errorType);
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
