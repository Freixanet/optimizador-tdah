export const APP_VARIANT_OPTIONS = [
  { id: 'classic', label: 'Clásica', hint: 'Mapas de acción paso a paso' },
  { id: 'comprension', label: 'Comprensión', hint: 'Lectura guiada con objetivos' },
] as const;

export type AppVariant = (typeof APP_VARIANT_OPTIONS)[number]['id'];

const STORAGE_KEY = 'nucleo-app-variant';

const DEFAULT_CLASSIC_URL = 'https://optimizador-tdah-production.up.railway.app';
const DEFAULT_COMPRENSION_URL = 'https://nucleo-comprension-production.up.railway.app';

function readConfiguredUrl(envKey: 'VITE_CLASSIC_APP_URL' | 'VITE_COMPRENSION_APP_URL', fallback: string): string {
  const configured = import.meta.env[envKey] as string | undefined;
  return configured?.trim() || fallback;
}

export function getClassicAppUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:3000`;
    }
  }
  return readConfiguredUrl('VITE_CLASSIC_APP_URL', DEFAULT_CLASSIC_URL);
}

export function getComprensionAppUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:3002`;
    }
  }
  return readConfiguredUrl('VITE_COMPRENSION_APP_URL', DEFAULT_COMPRENSION_URL);
}

export function getVariantUrl(variant: AppVariant): string {
  return variant === 'classic' ? getClassicAppUrl() : getComprensionAppUrl();
}

export function getCurrentDeploymentVariant(): AppVariant {
  const baked = import.meta.env.VITE_APP_VARIANT as string | undefined;
  if (baked === 'classic' || baked === 'comprension') return baked;

  if (typeof window !== 'undefined') {
    if (window.location.port === '3002') return 'comprension';
    const host = window.location.hostname;
    if (host.includes('comprension') || host.includes('3002')) return 'comprension';
  }

  return 'classic';
}

export function saveAppVariant(variant: AppVariant): void {
  localStorage.setItem(STORAGE_KEY, variant);
}

export function applyVariantFromUrl(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const param = params.get('appVariant');
  if (param !== 'classic' && param !== 'comprension') return;

  saveAppVariant(param);
  params.delete('appVariant');
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);
}

export function switchAppVariant(next: AppVariant): void {
  if (next === getCurrentDeploymentVariant()) return;

  saveAppVariant(next);
  const target = new URL(getVariantUrl(next));
  target.searchParams.set('appVariant', next);
  window.location.assign(target.toString());
}
