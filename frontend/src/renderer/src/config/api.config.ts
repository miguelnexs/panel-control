// Configuración global de API para el dashboard de Electron
// Este archivo centraliza la configuración de la API

// ===== CONFIGURACIÓN DE API =====
// Para desarrollo local (backend Django en localhost:8085)

// Para producción (descomentar la siguiente línea y comentar la de arriba)
export const API_BASE_URL: string = 'https://softwarebycg.shop/';
// ===== FIN CONFIGURACIÓN =====

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
export const buildMediaUrl = (path: string | null | undefined): string => {
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

export interface ApiRequestOptions extends RequestInit {
  token?: string | null;
  expectJson?: boolean;
  headers?: Record<string, string>;
}

// Función auxiliar para peticiones API (opcional pero recomendada)
export const apiRequest = async <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T | Response> => {
  const url = buildApiUrl(endpoint);
  const headers: Record<string, string> = options.headers || {};
  
  // Si hay token en las opciones, agregarlo a los headers
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  
  // Si no se especifica Content-Type y es un método que envía datos, agregarlo
  if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  const config: RequestInit = {
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
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando.');
    }
    throw error;
  }
};
