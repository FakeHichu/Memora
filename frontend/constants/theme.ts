export const darkColors = {
  background: '#090A10',
  card: '#151720',
  surface: 'rgba(255,255,255,0.055)',
  glass: 'rgba(19,21,31,0.74)',
  glassStrong: 'rgba(19,21,31,0.94)',
  primary: '#9E82F4',
  primaryDark: '#D3C4FF',
  primarySoft: 'rgba(158,130,244,0.16)',
  secondary: '#222B38',
  accent: '#92E1E8',
  neon: '#D7F586',
  pink: '#F19CDA',
  metal: '#CDD1DF',
  onPrimary: '#100D1A',
  text: '#F4F2FA',
  muted: '#A0A2B2',
  border: 'rgba(222,224,255,0.14)',
  success: '#244337',
  warning: '#72552F',
  error: '#914456',
  shadow: '#000000',
};

export const lightColors = {
  background: '#FAFAF8',
  card: '#FFFFFF',
  surface: '#F4EEE9',
  glass: 'rgba(255,255,255,0.76)',
  glassStrong: 'rgba(255,255,255,0.94)',
  primary: '#C86B4A',
  primaryDark: '#A95236',
  primarySoft: '#F7DDD2',
  secondary: '#4F5D75',
  accent: '#E7A86E',
  neon: '#2E8B57',
  pink: '#C767A8',
  metal: '#5B6274',
  onPrimary: '#FFFFFF',
  text: '#171717',
  muted: '#6B6B6B',
  border: '#EAE5E0',
  success: '#DDF3E8',
  warning: '#D98A26',
  error: '#C74C4C',
  shadow: '#D8C9BF',
};

export type ThemeColors = typeof darkColors;
export type ThemeMode = 'dark' | 'light';

export const themePalettes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
};

export const typography = {
  title: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  heading: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  subheading: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 18 },
};
