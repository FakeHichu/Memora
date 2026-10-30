// Memora Design System - Soft Minimalist Light Theme

export const colors = {
  // Backgrounds
  background: '#E8EDF0', // Primary - soft blue-grey
  backgroundSecondary: '#DFE4E8', // Secondary
  backgroundTertiary: '#D6DCE0', // Tertiary
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',

  // Surfaces
  surface: '#FFFFFF', // Default card/surface - white
  surfaceElevated: '#F8FAFB', // Elevated surfaces
  surfaceOverlay: '#F0F4F6', // Overlay surfaces
  surfaceWarm: '#F5F2EF', // Warm surface
  surfaceFloating: 'rgba(255, 255, 255, 0.95)',
  surfaceModal: 'rgba(255, 255, 255, 0.98)',
  surfaceNavigation: 'rgba(23, 25, 29, 0.92)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassStrong: 'rgba(255, 255, 255, 0.96)',
  secondary: '#F0F4F6',

  // Accent / Chrome
  chromeDark: '#8A9099',
  chromeDim: '#A0A8B0',
  chrome: '#81947B', // Sage green
  chromeHighlight: '#6B7D66',
  chromeGlow: 'rgba(129, 148, 123, 0.15)',
  primaryDark: '#6B7D66',
  onPrimary: '#FFFFFF',
  neon: '#81947B',

  // Semantic color names
  primary: '#81947B', // Sage green
  primaryLight: '#9AAD94',
  primarySoft: '#C5D1C0',
  primaryUltraSoft: '#EAF0E8',
  accent: '#81947B', // Sage green accent
  accentLight: '#9AAD94',
  accentLavender: '#B8C4D4',
  accentSoft: 'rgba(129, 148, 123, 0.12)',
  text: '#17191D',
  textPrimary: '#17191D', // Near-black
  textSecondary: '#707983', // Medium grey
  textTertiary: '#9BA3AA',
  textMuted: '#9BA3AA', // Light grey
  muted: '#707983',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnChrome: '#FFFFFF',
  border: '#E4E8EB', // Light border
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  borderDefault: 'rgba(0, 0, 0, 0.08)',
  borderEmphasized: 'rgba(0, 0, 0, 0.12)',
  borderSoft: '#EEF1F3',
  divider: '#E4E8EB',
  dividerSoft: '#F0F4F6',
  shadow: 'rgba(23, 25, 29, 0.08)', // Light shadow
  shadowStrong: 'rgba(23, 25, 29, 0.15)',
  overlay: 'rgba(23, 25, 29, 0.6)',
  overlayLight: 'rgba(23, 25, 29, 0.3)',
  overlayStrong: 'rgba(23, 25, 29, 0.85)',

  // Status
  success: '#4A8A62',
  successSoft: '#E8F5ED',
  warning: '#C49A2A',
  warningSoft: '#FBF5E0',
  error: '#C0392B',
  errorSoft: '#FDECEA',
  errorBackground: '#FDECEA', // Soft error surface (background tint)

  // Additional
  accentDeep: '#5C7056',
  accentSoftGlow: '#9AAD94',
  accentGlow: 'rgba(129, 148, 123, 0.25)',
  coolHighlight: '#8EA6C5',
  coolGlow: 'rgba(142, 166, 197, 0.15)',
  borderChrome: '#D0D8DC',
  borderHighlight: '#C0C8CC',
  accentSubtle: 'rgba(129, 148, 123, 0.12)',
  patternTint: 'rgba(129, 148, 123, 0.03)',
  patternTintCool: 'rgba(142, 166, 197, 0.02)',
};

// Dark theme palette (preserved for dark mode support)
export const darkColors = {
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
  primary: '#BFC3CC',
  primaryLight: '#D4D8DD',
  primarySoft: '#E8EBEE',
  primaryUltraSoft: '#F1F2F5',
  accent: '#B84F7D',
  accentLight: '#C875A0',
  accentLavender: '#B8A8D8',
  accentSoft: 'rgba(184, 79, 125, 0.12)',
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
  divider: '#252630',
  dividerSoft: '#1A1B22',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(9, 9, 12, 0.8)',
  overlayLight: 'rgba(9, 9, 12, 0.4)',
  overlayStrong: 'rgba(9, 9, 12, 0.95)',
  success: '#2E7D4A',
  successSoft: '#1A3D2A',
  warning: '#B8860B',
  warningSoft: '#3D3510',
  error: '#C0392B',
  errorSoft: '#3D1A1A',
  errorBackground: '#3D1A1A', // Soft error surface (background tint)
  accentDeep: '#651F42',
  accentSoftGlow: '#C875A0',
  accentGlow: 'rgba(184, 79, 125, 0.25)',
  coolHighlight: '#8EA6C5',
  coolGlow: 'rgba(142, 166, 197, 0.15)',
  borderChrome: '#4A4E58',
  borderHighlight: '#6E7380',
  accentSubtle: 'rgba(184, 79, 125, 0.12)',
  patternTint: 'rgba(184, 79, 125, 0.03)',
  patternTintCool: 'rgba(142, 166, 197, 0.02)',
};

// Light theme palette (current active theme)
export const lightColors = {
  ...colors,
};

export type ThemeColors = typeof darkColors;
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
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  // Chrome-specific shadows
  chrome: {
    shadowColor: colors.chromeGlow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  chromeLg: {
    shadowColor: colors.chromeGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  glowSm: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 0,
  },
  glowMd: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 0,
  },
  glowLg: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 0,
  },
};

// Web-compatible shadow styles (light theme)
export const webShadows = {
  none: { boxShadow: 'none' },
  xs: { boxShadow: '0 1px 3px rgba(23, 25, 29, 0.08)' },
  sm: { boxShadow: '0 2px 6px rgba(23, 25, 29, 0.08), 0 1px 2px rgba(23, 25, 29, 0.06)' },
  md: { boxShadow: '0 4px 12px rgba(23, 25, 29, 0.10), 0 2px 4px rgba(23, 25, 29, 0.06)' },
  lg: { boxShadow: '0 8px 24px rgba(23, 25, 29, 0.12), 0 4px 8px rgba(23, 25, 29, 0.08)' },
  xl: { boxShadow: '0 16px 40px rgba(23, 25, 29, 0.14), 0 8px 16px rgba(23, 25, 29, 0.08)' },
  chrome: { boxShadow: '0 2px 4px rgba(129, 148, 123, 0.08)' },
  chromeLg: { boxShadow: '0 8px 16px rgba(129, 148, 123, 0.08)' },
  glowSm: { boxShadow: '0 0 8px rgba(129, 148, 123, 0.3)' },
  glowMd: { boxShadow: '0 0 16px rgba(129, 148, 123, 0.25)' },
  glowLg: { boxShadow: '0 0 24px rgba(129, 148, 123, 0.2)' },
  chromeReflection: {
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 2px rgba(23, 25, 29, 0.08)',
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
  pattern: 0.04,
  patternAccent: 0.06,
  chromeReflection: 0.1,
  chromeHighlight: 0.15,
};

// Component style presets — single source of truth for reusable components.
// Screens and composed components should consume these (or the tokens above)
// instead of hardcoding style values. To restyle the whole app, change tokens here.
export const componentStyles = {
  card: {
    resting: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    elevated: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      borderWidth: 0,
    },
    image: {
      borderRadius: radius.xl,
    },
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: radius.md,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    accent: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      borderWidth: 0,
    },
    destructive: {
      backgroundColor: colors.errorSoft,
      borderRadius: radius.md,
      borderWidth: borders.hairline,
      borderColor: colors.error,
    },
  },
  navBar: {
    floatingPill: {
      backgroundColor: colors.card,
      borderRadius: 999,
      borderWidth: borders.thin,
      borderColor: colors.borderSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  searchBar: {
    field: {
      backgroundColor: colors.card,
      borderRadius: 999,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
      paddingHorizontal: spacing.md,
      minHeight: 48,
    },
  },
  chip: {
    resting: {
      backgroundColor: colors.card,
      borderRadius: 999,
      borderWidth: borders.hairline,
      borderColor: colors.borderSoft,
    },
    selected: {
      backgroundColor: colors.accentSubtle,
      borderWidth: borders.thin,
      borderColor: colors.accent,
    },
  },
};

// Typography - iOS-style sans + editorial serif + technical mono
export const typography = {
  // Sans-serif (System) - for UI, navigation, controls, buttons, metadata, labels
  sans: {
    display: {
      fontFamily: 'System',
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    title: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    title2: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 30,
      letterSpacing: -0.2,
    },
    title3: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
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
      lineHeight: 24,
    },
    bodyStrong: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    callout: {
      fontFamily: 'System',
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    subheadline: {
      fontFamily: 'System',
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
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
      letterSpacing: 0.2,
    },
    caption2: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 14,
      letterSpacing: 0.3,
    },
    micro: {
      fontFamily: 'System',
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },

  // Serif (Georgia) - for emotional content: major headings, memory titles, dates
  serif: {
    display: {
      fontFamily: 'Georgia',
      fontSize: 36,
      fontWeight: '400' as const,
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    title: {
      fontFamily: 'Georgia',
      fontSize: 28,
      fontWeight: '400' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    title2: {
      fontFamily: 'Georgia',
      fontSize: 22,
      fontWeight: '400' as const,
      lineHeight: 30,
      letterSpacing: -0.2,
    },
    title3: {
      fontFamily: 'Georgia',
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 26,
      letterSpacing: -0.1,
    },
    headline: {
      fontFamily: 'Georgia',
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 24,
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

  // Serif Italic - for quotes, captions, emotional text
  serifItalic: {
    title: {
      fontFamily: 'Georgia',
      fontSize: 28,
      fontWeight: '400' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
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

  // Monospace - for technical: memory IDs, timestamps, camera metadata
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
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  title2: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  title3: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
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
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  callout: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  subheadline: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  heading: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
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
    letterSpacing: 0.2,
  },
  caption2: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
};

export const layout = {
  screenPadding: spacing.lg,
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.xl,
  maxContentWidth: 720,
  tabBarHeight: 92,
  headerHeight: 56,
  safeAreaTop: 44,
  safeAreaBottom: 34,
  // Responsive photo grid columns per breakpoint (favorites / related photos)
  photoGridColumns: {
    phone: 2,
    tablet: 3,
    desktop: 3,
  },
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
  symbols: ['star', 'sparkle', 'cross', 'heart', 'diamond', 'moon'],
  defaultOpacity: 0.03,
  defaultDensity: 0.8,
  defaultScale: 1,
  defaultRotation: 0,
};

export const effects = {
  chromeBorder: {
    borderWidth: borders.hairline,
    borderColor: colors.border,
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
    borderColor: colors.accentSoft,
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
    shadowColor: colors.accentGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
  },
  glowChrome: {
    shadowColor: colors.chromeGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 0,
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
    primary: { backgroundColor: colors.primary, color: colors.textOnPrimary },
    primaryPressed: { backgroundColor: colors.accentDeep },
    secondary: { backgroundColor: colors.surface, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent', borderColor: colors.border },
    accent: { backgroundColor: colors.accent, color: '#FFFFFF' },
    accentPressed: { backgroundColor: colors.accentDeep },
    destructive: { backgroundColor: colors.errorSoft, borderColor: colors.error },
  },
};
