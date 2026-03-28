export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://softwarebycg.shop';

export const buildApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
