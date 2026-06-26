const DEFAULT_API_BASE = 'https://optimizador-tdah-production.up.railway.app';

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (__DEV__) {
    return 'http://127.0.0.1:3000';
  }
  return DEFAULT_API_BASE;
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
