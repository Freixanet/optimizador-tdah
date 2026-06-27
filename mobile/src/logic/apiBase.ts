import Constants from 'expo-constants';
import { createApiUrlResolver, DEFAULT_API_BASE } from '@shared/apiBase';

export { DEFAULT_API_BASE };

const LOCAL_API_PORT = 3000;

function getMetroHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    null;

  if (!hostUri || typeof hostUri !== 'string') return null;
  return hostUri.split(':')[0]?.trim() || null;
}

function isLocalApiUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.startsWith('192.168.')) return true;
    if (hostname.startsWith('10.')) return true;
    return /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  } catch {
    return false;
  }
}

function isPhysicalDeviceHost(host: string): boolean {
  return host !== '127.0.0.1' && host !== 'localhost';
}

function rewriteLocalHost(url: string, metroHost: string): string {
  const parsed = new URL(url);
  parsed.hostname = metroHost;
  return parsed.toString().replace(/\/$/, '');
}

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');
  const metroHost = __DEV__ ? getMetroHost() : null;

  if (configured) {
    if (__DEV__ && metroHost && isLocalApiUrl(configured)) {
      const parsed = new URL(configured);
      const loopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';

      if (loopback && isPhysicalDeviceHost(metroHost)) {
        return rewriteLocalHost(configured, metroHost);
      }

      if (isPhysicalDeviceHost(metroHost) && parsed.hostname !== metroHost) {
        return rewriteLocalHost(configured, metroHost);
      }
    }
    return configured;
  }

  if (__DEV__) {
    if (metroHost && isPhysicalDeviceHost(metroHost)) {
      return `http://${metroHost}:${LOCAL_API_PORT}`;
    }
    return `http://127.0.0.1:${LOCAL_API_PORT}`;
  }

  return DEFAULT_API_BASE;
}

export const apiUrl = createApiUrlResolver(getApiBaseUrl);
