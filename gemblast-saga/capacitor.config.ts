import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gemblastsaga.game',
  appName: 'Gemblast Saga',
  webDir: 'dist/client',
  backgroundColor: '#f8f7f2',
  ios: { contentInset: 'never', preferredContentMode: 'mobile', backgroundColor: '#f8f7f2' },
  plugins: {
    SplashScreen: { launchAutoHide: false, backgroundColor: '#f8f7f2', showSpinner: false },
    StatusBar: { style: 'LIGHT', backgroundColor: '#f8f7f2' },
  },
};
export default config;
