const fs = require('fs');
const path = require('path');

// Asegurar que el directorio de preload existe
const preloadDir = path.join(__dirname, 'src', 'preload');
if (!fs.existsSync(preloadDir)) {
  fs.mkdirSync(preloadDir, { recursive: true });
}

// Verificar que el archivo preload existe
const preloadFile = path.join(preloadDir, 'index.js');
if (!fs.existsSync(preloadFile)) {
  // Crear archivo preload básico si no existe
  const preloadContent = `import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  // Aquí puedes agregar APIs personalizadas
};

// Use \`contextBridge\` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
`;
  
  fs.writeFileSync(preloadFile, preloadContent);
  console.log('✅ Archivo preload creado exitosamente');
} else {
  console.log('✅ Archivo preload ya existe');
}

console.log('✅ Verificación de preload completada');