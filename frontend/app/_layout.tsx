import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { ToastProvider } from '@/components/ui/Toast';
import { CommandPaletteProvider } from '@/components/ui/CommandPalette';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CommandPaletteProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </CommandPaletteProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
