import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { themePalettes, type ThemeColors, type ThemeMode } from '@/constants/theme';

const themeStorageKey = 'memora.appearance.v1';

type AppThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    let isActive = true;

    AsyncStorage.getItem(themeStorageKey)
      .then((storedMode) => {
        if (isActive && (storedMode === 'dark' || storedMode === 'light')) setModeState(storedMode);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    AsyncStorage.setItem(themeStorageKey, nextMode).catch(() => undefined);
  };

  return (
    <AppThemeContext.Provider value={{ mode, colors: themePalettes[mode], setMode }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside ThemeProvider.');
  return context;
}
