import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Camera App',
  slug: 'camera-app',
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? 'cameraapp',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:4000',
    appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'Camera App',
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Camera App to use the camera for daily class photos.',
      },
    ],
  ],
});
