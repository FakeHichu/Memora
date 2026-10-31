// Memora Design System - Clean Apple iOS Light Aesthetic

export const lightColors = {
  // Backgrounds - iOS system light grouped style
  background: '#F2F2F7', // iOS grouped system background
  backgroundSecondary: '#FFFFFF', // Clean white
  backgroundTertiary: '#E5E5EA', // iOS system gray 5
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',

  // Surfaces
  surface: '#FFFFFF', // Crisp white card surface
  surfaceElevated: '#FFFFFF',
  surfaceOverlay: 'rgba(0, 0, 0, 0.4)',
  surfaceWarm: '#F9F9FB',
  surfaceFloating: 'rgba(255, 255, 255, 0.94)',
  surfaceModal: '#FFFFFF',
  surfaceNavigation: 'rgba(255, 255, 255, 0.90)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassStrong: 'rgba(255, 255, 255, 0.95)',
  secondary: '#F2F2F7',

  // iOS System Accent (Apple Blue & clean modern tints)
  chromeDark: '#D1D1D6',
  chromeDim: '#8E8E93',
  chrome: '#007AFF', // Standard iOS Blue
  chromeHighlight: '#E5E5EA',
  chromeGlow: 'rgba(0, 122, 255, 0.08)',
  primaryDark: '#0056B3',
  onPrimary: '#FFFFFF',
  neon: '#34C759', // iOS Mint/Green

  // Primary & Accent
  primary: '#007AFF', // iOS System Blue
  primaryLight: '#47A0FF',
  primarySoft: '#E8F2FF',
  primaryUltraSoft: '#F2F7FF',
  accent: '#007AFF', // iOS Blue
  accentLight: '#34C759', // iOS Green
  accentLavender: '#5856D6', // iOS Purple
  accentSoft: 'rgba(0, 122, 255, 0.10)',
  accentSubtle: 'rgba(0, 122, 255, 0.06)',
  text: '#1C1C1E', // iOS Primary label
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70', // iOS Secondary label
  textTertiary: '#8E8E93', // iOS Tertiary label
  textMuted: '#8E8E93',
  muted: '#8E8E93',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnChrome: '#FFFFFF',
  border: '#E5E5EA', // iOS Separator
  borderSubtle: '#F2F2F7',
  borderDefault: '#E5E5EA',
  borderEmphasized: '#D1D1D6',
  borderSoft: '#E5E5EA',
  borderChrome: '#E5E5EA',
  borderHighlight: '#D1D1D6',
  divider: '#E5E5EA',
  dividerSoft: '#F2F2F7',
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowStrong: 'rgba(0, 0, 0, 0.10)',
  overlay: 'rgba(0, 0, 0, 0.40)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',
  overlayStrong: 'rgba(0, 0, 0, 0.65)',

  // Status (iOS standard)
  success: '#34C759',
  successSoft: '#E8F8EE',
  warning: '#FF9500',
  warningSoft: '#FFF4E5',
  error: '#FF3B30',
  errorSoft: '#FFEBEA',
  errorBackground: '#FFEBEA',

  // Additional aliases
  accentDeep: '#0056B3',
  accentSoftGlow: '#47A0FF',
  accentGlow: 'rgba(0, 122, 255, 0.15)',
  coolHighlight: '#5AC8FA',
  coolGlow: 'rgba(90, 200, 250, 0.12)',
  patternTint: 'rgba(0, 122, 255, 0.02)',
  patternTintCool: 'rgba(90, 200, 250, 0.02)',
};

export const darkColors = {
  ...lightColors,
  background: '#09090C',
  backgroundSecondary: '#101116',
  backgroundTertiary: '#14151A',
  backgroundElevated: '#1D1E27',
  card: '#171820',
  surface: '#171820',
  surfaceElevated: '#1D1E27',
  surfaceOverlay: '#22232C',
  surfaceWarm: '#1A1B22',
  surfaceFloating: 'rgba(29, 30, 39, 0.88)',
  surfaceModal: 'rgba(29, 30, 39, 0.96)',
  surfaceNavigation: 'rgba(13, 13, 18, 0.88)',
  glass: 'rgba(23, 24, 32, 0.85)',
  glassStrong: 'rgba(23, 24, 32, 0.96)',
  secondary: '#1D1E27',
  chromeDark: '#555963',
  chromeDim: '#8A8E98',
  chrome: '#BFC3CC',
  chromeHighlight: '#F1F2F5',
  chromeGlow: 'rgba(191, 195, 204, 0.15)',
  primaryDark: '#D4D8DD',
  onPrimary: '#09090C',
  neon: '#5A8A6E',
  primary: '#0A84FF',
  primaryLight: '#5AC8FA',
  primarySoft: '#1A2E44',
  primaryUltraSoft: '#122030',
  accent: '#0A84FF',
  accentLight: '#30D158',
  accentLavender: '#BF5AF2',
  accentSoft: 'rgba(10, 132, 255, 0.15)',
  text: '#F4F2F5',
  textPrimary: '#F4F2F5',
  textSecondary: '#96949E',
  textTertiary: '#65646D',
  textMuted: '#65646D',
  muted: '#96949E',
  textInverse: '#09090C',
  textOnPrimary: '#09090C',
  textOnChrome: '#09090C',
  border: '#2A2C35',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderDefault: 'rgba(255, 255, 255, 0.08)',
  borderEmphasized: 'rgba(255, 255, 255, 0.12)',
  borderSoft: '#1F2028',
  borderChrome: '#4A4E58',
  borderHighlight: '#6E7380',
  divider: '#252630',
  dividerSoft: '#1A1B22',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(9, 9, 12, 0.8)',
  overlayLight: 'rgba(9, 9, 12, 0.4)',
  overlayStrong: 'rgba(9, 9, 12, 0.95)',
  success: '#30D158',
  successSoft: '#1A3D2A',
  warning: '#FF9F0A',
  warningSoft: '#3D3510',
  error: '#FF453A',
  errorSoft: '#3D1A1A',
  errorBackground: '#3D1A1A',
};

// Default export is the clean light iOS theme
export const colors = lightColors;

export type ThemeColors = typeof lightColors;
export type ThemeMode = 'dark' | 'light';

export const themePalettes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  round: 999,
  circle: 9999,
};

export const borders = {
  hairline: 0.5,
  thin: 1,
  medium: 1.5,
  thick: 2,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
  chrome: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  chromeLg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  glowSm: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  glowMd: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 3,
  },
  glowLg: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
};

// Web-compatible shadow styles - smooth Apple style diffused box-shadows
export const webShadows = {
  none: { boxShadow: 'none' },
  xs: { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' },
  sm: { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)' },
  md: { boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)' },
  lg: { boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)' },
  xl: { boxShadow: '0 18px 36px rgba(0, 0, 0, 0.10), 0 4px 10px rgba(0, 0, 0, 0.04)' },
  chrome: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' },
  chromeLg: { boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)' },
  glowSm: { boxShadow: '0 2px 10px rgba(0, 122, 255, 0.18)' },
  glowMd: { boxShadow: '0 4px 16px rgba(0, 122, 255, 0.24)' },
  glowLg: { boxShadow: '0 8px 24px rgba(0, 122, 255, 0.30)' },
  chromeReflection: {
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
};

export const blur = {
  none: 0,
  light: 10,
  medium: 20,
  heavy: 40,
  chrome: 30,
};

export const opacity = {
  disabled: 0.4,
  pressed: 0.85,
  hover: 0.9,
  overlay: 0.85,
  pattern: 0.02,
  patternAccent: 0.03,
  chromeReflection: 0.05,
  chromeHighlight: 0.1,
};

// Typography - iOS-style SF Pro hierarchy + clean accents
export const typography = {
  // Sans-serif (System) - iOS standard typography
  sans: {
    display: {
      fontFamily: 'System',
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 41,
      letterSpacing: -0.4,
    },
    title: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
      letterSpacing: -0.3,
    },
    title2: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 28,
      letterSpacing: -0.2,
    },
    title3: {
      fontFamily: 'System',
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 25,
      letterSpacing: -0.1,
    },
    headline: {
      fontFamily: 'System',
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
      letterSpacing: -0.1,
    },
    body: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyStrong: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    callout: {
      fontFamily: 'System',
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    subheadline: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 19,
    },
    footnote: {
      fontFamily: 'System',
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    caption: {
      fontFamily: 'System',
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    caption2: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 14,
      letterSpacing: 0.2,
    },
    micro: {
      fontFamily: 'System',
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 12,
      letterSpacing: 0.4,
      textTransform: 'uppercase' as const,
    },
  },

  // Serif (Georgia) - for emotional content
  serif: {
    display: {
      fontFamily: 'Georgia',
      fontSize: 34,
      fontWeight: '400' as const,
      lineHeight: 42,
      letterSpacing: -0.4,
    },
    title: {
      fontFamily: 'Georgia',
      fontSize: 26,
      fontWeight: '400' as const,
      lineHeight: 34,
      letterSpacing: -0.2,
    },
    title2: {
      fontFamily: 'Georgia',
      fontSize: 21,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    title3: {
      fontFamily: 'Georgia',
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    headline: {
      fontFamily: 'Georgia',
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    body: {
      fontFamily: 'Georgia',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    callout: {
      fontFamily: 'Georgia',
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    caption: {
      fontFamily: 'Georgia',
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
  },

  serifItalic: {
    title: {
      fontFamily: 'Georgia',
      fontSize: 26,
      fontWeight: '400' as const,
      lineHeight: 34,
      fontStyle: 'italic' as const,
    },
    body: {
      fontFamily: 'Georgia',
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      fontStyle: 'italic' as const,
    },
    callout: {
      fontFamily: 'Georgia',
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
      fontStyle: 'italic' as const,
    },
    caption: {
      fontFamily: 'Georgia',
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
      fontStyle: 'italic' as const,
    },
  },

  mono: {
    title: {
      fontFamily: 'Menlo',
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
      letterSpacing: 0.5,
    },
    body: {
      fontFamily: 'Menlo',
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0.3,
    },
    caption: {
      fontFamily: 'Menlo',
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 14,
      letterSpacing: 0.2,
    },
    micro: {
      fontFamily: 'Menlo',
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },

  // Legacy flat structure (for backward compatibility)
  display: {
    fontFamily: 'System',
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  title2: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  title3: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  headline: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  callout: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  subheadline: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 19,
  },
  heading: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  subheading: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  footnote: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  caption2: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
};

export const layout = {
  screenPadding: spacing.lg,
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.xl,
  maxContentWidth: 720,
  tabBarHeight: 90,
  headerHeight: 54,
  safeAreaTop: 44,
  safeAreaBottom: 34,
};

export const animation = {
  fast: 120,
  normal: 220,
  slow: 320,
  spring: {
    damping: 18,
    stiffness: 180,
  },
  springGentle: {
    damping: 22,
    stiffness: 140,
  },
};

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// Background pattern configuration
export const backgroundPattern = {
  symbols: ['star', 'sparkle', 'circle', 'dot'],
  defaultOpacity: 0.015,
  defaultDensity: 0.5,
  defaultScale: 0.8,
  defaultRotation: 0,
};

export const effects = {
  chromeBorder: {
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
  chromeBorderActive: {
    borderWidth: borders.thin,
    borderColor: colors.accent,
  },
  accentBorder: {
    borderWidth: borders.hairline,
    borderColor: colors.accent,
  },
  accentBorderActive: {
    borderWidth: borders.thin,
    borderColor: colors.accent,
  },
  glassSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
  },
  glassSurfaceWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  glowAccent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  glowChrome: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
};

// Component variant configurations
export const variants = {
  memoryCard: {
    editorial: { aspectRatio: 4 / 5, imageRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
    compact: { aspectRatio: 1, imageRadius: radius.lg, padding: 0, gap: spacing.xs },
    timeline: { aspectRatio: 4 / 3, imageRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
    immersive: { aspectRatio: 3 / 4, imageRadius: 0, padding: 0, gap: spacing.lg },
  },
  button: {
    primary: { backgroundColor: colors.accent, color: colors.textInverse },
    primaryPressed: { backgroundColor: colors.primaryDark },
    secondary: { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent', borderColor: colors.border },
    accent: { backgroundColor: colors.accent, color: colors.textInverse },
    accentPressed: { backgroundColor: colors.primaryDark },
    destructive: { backgroundColor: colors.errorSoft, borderColor: colors.error },
  },
};
