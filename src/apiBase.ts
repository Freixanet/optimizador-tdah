import { isNativeShell } from './nativeShell';

const DEFAULT_NATIVE_API_BASE = 'https://optimizador-tdah-production.up.railway.app';

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured?.trim()) return configured.trim().replace(/\/$/, '');
  // Capacitor has no same-origin server; relative /api/* URLs fail in WKWebView.
  if (isNativeShell()) return DEFAULT_NATIVE_API_BASE;
  return '';
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
