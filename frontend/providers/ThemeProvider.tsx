import React, { createContext, useContext } from 'react';
import { darkColors, type ThemeColors, type ThemeMode } from '@/constants/theme';

type AppThemeContextValue = {
  mode: 'dark';
  colors: ThemeColors;
  /** Kept for compatibility with older screens; Memora is permanently dark. */
  setMode: (mode: ThemeMode) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <AppThemeContext.Provider value={{ mode: 'dark', colors: darkColors, setMode: () => undefined }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside ThemeProvider.');
  return context;
}
