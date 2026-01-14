// Configuración de API
export const API_CONFIG = {
  // Para desarrollo local
  baseURL: 'https://softwarebycg.shop/',

  // Para producción (descomentar y comentar la de arriba)
  
  // Timeout para peticiones (en milisegundos)
  timeout: 30000,
  
  // Headers por defecto
  headers: {
    'Content-Type': 'application/json',
  }
};

// Helper para construir URLs completas
export const buildUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, devolverlo tal cual
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Si el endpoint empieza con /, quitarlo para evitar dobles barras
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${API_CONFIG.baseURL}/${cleanEndpoint}`;
};

// Helper para headers de autenticación
export const authHeaders = (token: string | null | undefined, includeContentType: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper para manejo de errores
export const handleApiError = async (response: Response): Promise<Response> => {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.message || errorData.error) {
        errorMessage = errorData.message || errorData.error;
      }
    } catch (e) {
      // Si no puede parsear JSON, usar el mensaje por defecto
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
};
