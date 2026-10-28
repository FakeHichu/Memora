import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { CommandPaletteProvider } from '@/components/ui/CommandPalette';
import { colors } from '@/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <CommandPaletteProvider>
                <RootNavigator />
              </CommandPaletteProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </View>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { mode, colors: themeColors } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: themeColors.background },
          navigationBarColor: Platform.OS === 'android' ? themeColors.background : undefined,
        }}
      />
    </>
  );
}
