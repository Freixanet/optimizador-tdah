import { Capacitor } from '@capacitor/core';

type StatusBarModule = typeof import('@capacitor/status-bar');

let statusBarModule: StatusBarModule | null = null;

export function isNativeShell(): boolean {
  return Capacitor.isNativePlatform();
}

function syncNativeChromeTheme(): void {
  const isDark = document.documentElement.classList.contains('dark');
  const backgroundColor = isDark ? '#121212' : '#FAFAFA';
  document.documentElement.style.backgroundColor = backgroundColor;
  document.body.style.backgroundColor = backgroundColor;
  document.getElementById('root')?.style.setProperty('background-color', backgroundColor);

  if (Capacitor.getPlatform() === 'ios' && statusBarModule) {
    const { StatusBar, Style } = statusBarModule;
    void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  }
}

export async function initNativeShell(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  document.documentElement.classList.add('native-shell');
  syncNativeChromeTheme();

  const themeObserver = new MutationObserver(syncNativeChromeTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  const [{ App }, statusBar, { Keyboard, KeyboardResize }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar'),
    import('@capacitor/keyboard'),
  ]);

  statusBarModule = statusBar;

  const { StatusBar, Style } = statusBar;

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
    await StatusBar.setOverlaysWebView({ overlay: true });
    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    await StatusBar.setStyle({
      style: document.documentElement.classList.contains('dark') ? Style.Dark : Style.Light,
    });
  }
}
