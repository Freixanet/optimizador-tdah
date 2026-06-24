import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.freixanet.nucleo',
  appName: 'Nucleo',
  webDir: 'dist',
  backgroundColor: '#fafafa',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    backgroundColor: '#fafafa',
    // The web UI owns its safe areas through viewport-fit=cover and CSS env().
    // Letting UIKit add automatic insets as well makes fixed panels drift under
    // the status bar and creates a second scroll coordinate system.
    contentInset: 'never',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 400,
      backgroundColor: '#fafafa',
    },
  },
};

export default config;
