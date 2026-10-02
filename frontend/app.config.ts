import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Memora',
  slug: 'memora',
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? 'memora',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:4000',
    appName: process.env.EXPO_PUBLIC_APP_NAME ?? 'Memora',
  },
  plugins: [
    'expo-router',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Memora to use the camera for daily class photos.',
      },
    ],
  ],
});
