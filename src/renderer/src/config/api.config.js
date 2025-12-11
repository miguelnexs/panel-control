// Configuración global de API para el dashboard de Electron
// Este archivo centraliza la configuración de la API

export const API_BASE_URL = 'https://softwarebycg.shop';

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
export const buildMediaUrl = (path) => {
  if (!path) return '';
  
  // Si ya es una URL completa, devolverla
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si empieza con /, es relativa al dominio
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  
  // Si empieza con media/, agregar la barra
  if (path.startsWith('media/')) {
    return `${API_BASE_URL}/${path}`;
  }
  
  // Por defecto, asumir que es relativa a /media/
  return `${API_BASE_URL}/media/${path}`;
};

// Función auxiliar para peticiones API (opcional pero recomendada)
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const headers = options.headers || {};
  
  // Si hay token en las opciones, agregarlo a los headers
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  
  // Si no se especifica Content-Type y es un método que envía datos, agregarlo
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } catch (e) {
        // Si no es JSON válido, usar el texto como mensaje
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Si esperamos JSON, parsearlo
    if (options.expectJson !== false) { // Por defecto esperamos JSON
      return await response.json();
    }
    
    return response;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
    }
    throw error;
  }
};
