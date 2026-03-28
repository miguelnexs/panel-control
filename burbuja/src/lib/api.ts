export const API_BASE_URL = 'https://softwarebycg.shop';

export const buildApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getPublicParams = () => {
  const params = new URLSearchParams(window.location.search);
  const siteParam = params.get('site');
  const aidParam = params.get('aid');
  
  if (siteParam) return `?site=${encodeURIComponent(siteParam)}`;
  if (aidParam) return `?aid=${encodeURIComponent(aidParam)}`;

  // Obtiene el origen actual (ej: http://localhost:5173 o https://mitienda.com)
  let site = window.location.origin;
  
  // En desarrollo local, usamos la URL registrada del usuario "burbuja" si estamos en localhost
  if (site.includes('localhost') || site.includes('127.0.0.1')) {
    site = 'http://192.168.101.11:8080';
  }
  
  return `?site=${encodeURIComponent(site)}`;
};

export const buildMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/media/${path}`;
};
