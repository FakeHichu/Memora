import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Memora',
  slug: 'memora',
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? 'memora',
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: 'com.memora.classmemories',
    infoPlist: {
      NSCameraUsageDescription: 'Allow Memora to use the camera for capturing daily memories.',
      NSPhotoLibraryUsageDescription:
        'Allow Memora to access your photo library to select memories.',
    },
  },
  android: {
    ...config.android,
    package: 'com.memora.classmemories',
    permissions: ['android.permission.CAMERA', 'android.permission.READ_MEDIA_IMAGES'],
  },
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
        cameraPermission: 'Allow Memora to use the camera for capturing daily memories.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Memora to access your photo library to select memories.',
        cameraPermission: 'Allow Memora to use your camera to capture memories.',
      },
    ],
  ],
});
