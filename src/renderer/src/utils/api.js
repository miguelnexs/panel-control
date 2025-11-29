// Utilidad para centralizar la configuración de API
// Este archivo permite cambiar fácilmente entre desarrollo y producción

// Para desarrollo local
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Para producción (descomentar y comentar la de arriba)
// export const API_BASE_URL = 'https://softwarebycg.shop';

// Helper para construir URLs completas
export const buildApiUrl = (endpoint) => {
  // Si el endpoint ya es una URL completa, devolverlo tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Si el endpoint empieza con /, quitarlo para evitar dobles barras
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Helper para headers de autenticación
export const buildAuthHeaders = (token, includeContentType = true) => {
  const headers = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper para construir URLs de medios/imágenes
export const buildMediaUrl = (path, apiBase = API_BASE_URL) => {
  if (!path) return '';
  
  // Si ya es una URL completa, devolverla
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si empieza con /, es relativa al dominio
  if (path.startsWith('/')) {
    return `${apiBase}${path}`;
  }
  
  // Si empieza con media/, agregar la barra
  if (path.startsWith('media/')) {
    return `${apiBase}/${path}`;
  }
  
  // Por defecto, asumir que es relativa a /media/
  return `${apiBase}/media/${path}`;
};
