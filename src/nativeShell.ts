import { Capacitor } from '@capacitor/core';

export function isNativeShell(): boolean {
  return Capacitor.isNativePlatform();
}

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const [{ App }, { StatusBar, Style }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar'),
  ]);

  App.addListener('appUrlOpen', ({ url }) => {
    try {
      const callback = new URL(url);
      if (!callback.search.includes('code=') && !callback.hash.includes('access_token')) {
        return;
      }
      window.location.replace(`${window.location.pathname}${callback.search}${callback.hash}`);
    } catch {
      // ignore malformed callback URLs
    }
  });

  if (Capacitor.getPlatform() === 'ios') {
    await StatusBar.setStyle({ style: Style.Default });
  }
}
