import { Stack } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { CommandPaletteProvider } from '@/components/ui/CommandPalette';
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <CommandPaletteProvider>
            <RootNavigator />
          </CommandPaletteProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
function RootNavigator() {
  const { mode, colors: themeColors } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: themeColors.background },
          navigationBarColor: Platform.OS === 'android' ? themeColors.background : undefined,
        }}
      />
    </View>
  );
}