const useProxy = import.meta.env.MODE === 'production';
const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = useProxy
  ? '/api'
  : envBaseUrl || '/api';

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
