import { getComprensionAppUrl } from './appVariant';
import { isNativeShell } from './nativeShell';

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured?.trim()) return configured.trim().replace(/\/$/, '');
  if (isNativeShell()) return getComprensionAppUrl();
  return '';
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
