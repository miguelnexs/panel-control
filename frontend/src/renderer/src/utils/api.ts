// Utilidad para centralizar la configuración de API
// Este archivo permite cambiar fácilmente entre desarrollo y producción

// Para desarrollo local

// Para producción (descomentar y comentar la de arriba)
export const API_BASE_URL: string = 'https://softwarebycg.shop/';

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, devolverlo tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Si el endpoint empieza con /, quitarlo para evitar dobles barras
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Helper para headers de autenticación
export const buildAuthHeaders = (token: string | null | undefined, includeContentType: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper para construir URLs de medios/imágenes
export const buildMediaUrl = (path: string | null | undefined, apiBase: string = API_BASE_URL): string => {
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
