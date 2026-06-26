import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.freixanet.nucleo',
  appName: 'Núcleo',
  webDir: 'dist',
  backgroundColor: '#1A1A1A',
  ios: {
    contentInset: 'never',
    backgroundColor: '#1A1A1A',
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.None,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 400,
      backgroundColor: '#1A1A1A',
    },
  },
};

export default config;
