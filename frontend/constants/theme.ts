// =============================================================================
// MEMORA DESIGN SYSTEM – Catppuccin Mocha (Dark) + Catppuccin Latte (Light)
// Default theme: Catppuccin Mocha (dark)
// =============================================================================

// ---------------------------------------------------------------------------
// Catppuccin Mocha palette (exact hex values)
// ---------------------------------------------------------------------------
export const catppuccinMocha = {
  // Accents
  rosewater: '#F5E0DC',
  flamingo: '#F2CDCD',
  pink: '#F5C2E7',
  mauve: '#8052C8',
  red: '#F38BA8',
  maroon: '#EBA0AC',
  peach: '#FAB387',
  yellow: '#F9E2AF',
  green: '#A6E3A1',
  teal: '#94E2D5',
  sky: '#89DCEB',
  sapphire: '#74C7EC',
  blue: '#89B4FA',
  lavender: '#C3A6F2',
  // Text
  text: '#F6F0FF',
  subtext1: '#C6B9D9',
  subtext0: '#A99BB9',
  overlay2: '#9399B2',
  overlay1: '#7F849C',
  overlay0: '#6C7086',
  // Surfaces
  surface2: '#585B70',
  surface1: '#38304D',
  surface0: '#211633',
  base: '#0B0813',
  mantle: '#151021',
  crust: '#0B0813',
};

// ---------------------------------------------------------------------------
// Catppuccin Latte palette (exact hex values)
// ---------------------------------------------------------------------------
export const catppuccinLatte = {
  // Accents
  rosewater: '#DC8A78',
  flamingo: '#DD7878',
  pink: '#EA76CB',
  mauve: '#8839EF',
  red: '#D20F39',
  maroon: '#E64553',
  peach: '#FE640B',
  yellow: '#DF8E1D',
  green: '#40A02B',
  teal: '#179299',
  sky: '#04A5E5',
  sapphire: '#209FB5',
  blue: '#1E66F5',
  lavender: '#7287FD',
  // Text
  text: '#4C4F69',
  subtext1: '#5C5F77',
  subtext0: '#6C6F85',
  overlay2: '#7C7F93',
  overlay1: '#8C8FA1',
  overlay0: '#9CA0B0',
  // Surfaces
  surface2: '#ACB0BE',
  surface1: '#BCC0CC',
  surface0: '#CCD0DA',
  base: '#EFF1F5',
  mantle: '#E6E9EF',
  crust: '#DCE0E8',
};

// ---------------------------------------------------------------------------
// Dark theme (Catppuccin Mocha) color assignments
// ---------------------------------------------------------------------------
export const darkColors = {
  // ---- Main backgrounds ----
  background: catppuccinMocha.base,            // #1E1E2E – main canvas
  backgroundSecondary: catppuccinMocha.mantle, // #181825
  backgroundTertiary: catppuccinMocha.crust,   // #11111B
  backgroundElevated: '#2A2040',

  // ---- Cards / surfaces ----
  card: catppuccinMocha.surface0,              // #313244
  surface: catppuccinMocha.surface0,           // #313244
  surfaceElevated: '#2A2040',
  surfaceOverlay: '#2A2040',
  surfaceWarm: catppuccinMocha.surface0,
  surfaceSecondary: '#2A2040',
  surfaceFloating: 'rgba(42, 32, 64, 0.95)',
  surfaceModal: 'rgba(11, 8, 19, 0.98)',
  surfaceNavigation: catppuccinMocha.mantle,
  glass: 'rgba(42, 32, 64, 0.80)',
  glassStrong: 'rgba(42, 32, 64, 0.96)',
  secondary: '#2A2040',

  // ---- Chrome (navigation, bars) ----
  chromeDark: catppuccinMocha.surface2,
  chromeDim: catppuccinMocha.overlay1,
  chrome: catppuccinMocha.overlay2,
  chromeHighlight: catppuccinMocha.lavender,
  chromeGlow: 'rgba(195, 166, 242, 0.20)',

  // ---- Accent (Lavender primary) ----
  primary: catppuccinMocha.lavender,
  primaryDark: '#8052C8',
  primaryLight: '#D7C2FF',
  primarySoft: '#D7C2FF',
  primaryUltraSoft: '#E7DCFA',
  onPrimary: catppuccinMocha.crust,
  neon: catppuccinMocha.lavender,
  accent: catppuccinMocha.lavender,
  accentLight: '#D7C2FF',
  accentLavender: catppuccinMocha.lavender,
  accentSoft: 'rgba(195, 166, 242, 0.15)',
  accentSubtle: 'rgba(195, 166, 242, 0.12)',
  accentDeep: catppuccinMocha.mauve,
  accentSoftGlow: catppuccinMocha.lavender,
  accentGlow: 'rgba(195, 166, 242, 0.30)',
  accentOptional1: catppuccinMocha.pink,
  accentOptional2: catppuccinMocha.teal,

  // ---- Highlight / secondary accent ----
  highlight: catppuccinMocha.yellow,           // #F9E2AF
  coolHighlight: catppuccinMocha.mauve,
  coolGlow: 'rgba(203, 166, 247, 0.20)',

  // ---- Text ----
  text: catppuccinMocha.text,                  // #CDD6F4
  textPrimary: catppuccinMocha.text,
  textSecondary: catppuccinMocha.subtext1,     // #BAC2DE
  textTertiary: catppuccinMocha.subtext0,
  textMuted: catppuccinMocha.subtext0,
  muted: catppuccinMocha.subtext1,
  textInverse: catppuccinMocha.crust,
  textOnPrimary: catppuccinMocha.crust,
  textOnChrome: catppuccinMocha.text,

  // ---- Borders ----
  border: catppuccinMocha.surface1,            // #45475A
  borderSubtle: 'rgba(195, 166, 242, 0.08)',
  borderDefault: 'rgba(195, 166, 242, 0.14)',
  borderEmphasized: 'rgba(195, 166, 242, 0.24)',
  borderSoft: catppuccinMocha.surface1,
  borderChrome: catppuccinMocha.surface2,
  borderHighlight: catppuccinMocha.overlay0,
  divider: catppuccinMocha.surface1,
  dividerSoft: catppuccinMocha.surface0,

  // ---- Shadows ----
  shadow: 'rgba(0, 0, 0, 0.55)',
  shadowStrong: 'rgba(0, 0, 0, 0.75)',
  overlay: 'rgba(17, 17, 27, 0.80)',
  overlayLight: 'rgba(17, 17, 27, 0.45)',
  overlayStrong: 'rgba(17, 17, 27, 0.96)',

  // ---- Status ----
  success: catppuccinMocha.green,              // #A6E3A1
  successSoft: 'rgba(166, 227, 161, 0.14)',
  warning: catppuccinMocha.yellow,             // #F9E2AF
  warningSoft: 'rgba(249, 226, 175, 0.14)',
  error: catppuccinMocha.red,                  // #F38BA8
  errorSoft: 'rgba(243, 139, 168, 0.14)',
  errorBackground: 'rgba(243, 139, 168, 0.14)',

  // ---- Misc ----
  patternTint: 'rgba(195, 166, 242, 0.04)',
  patternTintCool: 'rgba(195, 166, 242, 0.03)',

  // ---- Raw palette access (use catppuccinMocha.text, etc. directly to avoid collision) ----
  rosewater: catppuccinMocha.rosewater,
  flamingo: catppuccinMocha.flamingo,
  pink: catppuccinMocha.pink,
  mauve: catppuccinMocha.mauve,
  red: catppuccinMocha.red,
  maroon: catppuccinMocha.maroon,
  peach: catppuccinMocha.peach,
  yellow: catppuccinMocha.yellow,
  green: catppuccinMocha.green,
  teal: catppuccinMocha.teal,
  sky: catppuccinMocha.sky,
  sapphire: catppuccinMocha.sapphire,
  blue: catppuccinMocha.blue,
  lavender: catppuccinMocha.lavender,
  subtext1: catppuccinMocha.subtext1,
  subtext0: catppuccinMocha.subtext0,
  overlay2: catppuccinMocha.overlay2,
  overlay1: catppuccinMocha.overlay1,
  overlay0: catppuccinMocha.overlay0,
  surface2: catppuccinMocha.surface2,
  surface1: catppuccinMocha.surface1,
  surface0: catppuccinMocha.surface0,
  base: catppuccinMocha.base,
  mantle: catppuccinMocha.mantle,
  crust: catppuccinMocha.crust,
};

// ---------------------------------------------------------------------------
// Light theme (Catppuccin Latte) color assignments
// ---------------------------------------------------------------------------
export const lightColors = {
  // ---- Main backgrounds ----
  background: catppuccinLatte.base,            // #EFF1F5
  backgroundSecondary: catppuccinLatte.mantle, // #E6E9EF
  backgroundTertiary: catppuccinLatte.crust,   // #DCE0E8
  backgroundElevated: '#FFFFFF',

  // ---- Cards / surfaces ----
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: catppuccinLatte.surface0,   // #CCD0DA
  surfaceOverlay: catppuccinLatte.surface1,    // #BCC0CC
  surfaceWarm: catppuccinLatte.base,
  surfaceSecondary: catppuccinLatte.surface0,
  surfaceFloating: 'rgba(255, 255, 255, 0.95)',
  surfaceModal: 'rgba(255, 255, 255, 0.98)',
  surfaceNavigation: 'rgba(230, 233, 239, 0.96)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassStrong: 'rgba(255, 255, 255, 0.96)',
  secondary: catppuccinLatte.surface0,

  // ---- Chrome ----
  chromeDark: catppuccinLatte.subtext1,
  chromeDim: catppuccinLatte.overlay1,
  chrome: catppuccinLatte.lavender,
  chromeHighlight: catppuccinLatte.lavender,
  chromeGlow: 'rgba(114, 135, 253, 0.18)',

  // ---- Accent (Lavender primary) ----
  primary: catppuccinLatte.lavender,           // #7287FD
  primaryDark: '#5A70F0',
  primaryLight: '#8FA1FE',
  primarySoft: '#B8C5FE',
  primaryUltraSoft: '#E6EAFF',
  onPrimary: '#FFFFFF',
  neon: catppuccinLatte.lavender,
  accent: catppuccinLatte.lavender,            // #7287FD
  accentLight: '#8FA1FE',
  accentLavender: catppuccinLatte.lavender,
  accentSoft: 'rgba(114, 135, 253, 0.12)',
  accentSubtle: 'rgba(114, 135, 253, 0.10)',
  accentDeep: catppuccinLatte.mauve,
  accentSoftGlow: catppuccinLatte.lavender,
  accentGlow: 'rgba(114, 135, 253, 0.25)',
  accentOptional1: catppuccinLatte.pink,
  accentOptional2: catppuccinLatte.teal,

  // ---- Highlight ----
  highlight: catppuccinLatte.yellow,           // #DF8E1D
  coolHighlight: catppuccinLatte.mauve,
  coolGlow: 'rgba(136, 57, 239, 0.15)',

  // ---- Text ----
  text: catppuccinLatte.text,                  // #4C4F69
  textPrimary: catppuccinLatte.text,
  textSecondary: catppuccinLatte.subtext1,     // #5C5F77
  textTertiary: catppuccinLatte.subtext0,
  textMuted: catppuccinLatte.overlay1,         // #8C8FA1
  muted: catppuccinLatte.subtext1,
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnChrome: '#FFFFFF',

  // ---- Borders ----
  border: catppuccinLatte.surface0,            // #CCD0DA
  borderSubtle: 'rgba(114, 135, 253, 0.06)',
  borderDefault: 'rgba(76, 79, 105, 0.10)',
  borderEmphasized: 'rgba(76, 79, 105, 0.18)',
  borderSoft: catppuccinLatte.surface1,        // #BCC0CC
  borderChrome: catppuccinLatte.surface2,
  borderHighlight: catppuccinLatte.overlay2,
  divider: catppuccinLatte.surface1,
  dividerSoft: catppuccinLatte.surface0,

  // ---- Shadows ----
  shadow: 'rgba(76, 79, 105, 0.08)',
  shadowStrong: 'rgba(76, 79, 105, 0.16)',
  overlay: 'rgba(76, 79, 105, 0.60)',
  overlayLight: 'rgba(76, 79, 105, 0.30)',
  overlayStrong: 'rgba(76, 79, 105, 0.85)',

  // ---- Status ----
  success: catppuccinLatte.green,              // #40A02B
  successSoft: 'rgba(64, 160, 43, 0.12)',
  warning: catppuccinLatte.yellow,             // #DF8E1D
  warningSoft: 'rgba(223, 142, 29, 0.12)',
  error: catppuccinLatte.red,                  // #D20F39
  errorSoft: 'rgba(210, 15, 57, 0.10)',
  errorBackground: 'rgba(210, 15, 57, 0.10)',

  // ---- Misc ----
  patternTint: 'rgba(114, 135, 253, 0.04)',
  patternTintCool: 'rgba(114, 135, 253, 0.03)',

  // ---- Raw palette access ----
  rosewater: catppuccinLatte.rosewater,
  flamingo: catppuccinLatte.flamingo,
  pink: catppuccinLatte.pink,
  mauve: catppuccinLatte.mauve,
  red: catppuccinLatte.red,
  maroon: catppuccinLatte.maroon,
  peach: catppuccinLatte.peach,
  yellow: catppuccinLatte.yellow,
  green: catppuccinLatte.green,
  teal: catppuccinLatte.teal,
  sky: catppuccinLatte.sky,
  sapphire: catppuccinLatte.sapphire,
  blue: catppuccinLatte.blue,
  lavender: catppuccinLatte.lavender,
  subtext1: catppuccinLatte.subtext1,
  subtext0: catppuccinLatte.subtext0,
  overlay2: catppuccinLatte.overlay2,
  overlay1: catppuccinLatte.overlay1,
  overlay0: catppuccinLatte.overlay0,
  surface2: catppuccinLatte.surface2,
  surface1: catppuccinLatte.surface1,
  surface0: catppuccinLatte.surface0,
  base: catppuccinLatte.base,
  mantle: catppuccinLatte.mantle,
  crust: catppuccinLatte.crust,
};

// Legacy export (always references Mocha for static usage; use useAppTheme() in components)
export const catppuccin = catppuccinMocha;
export const colors = darkColors;

export type ThemeColors = typeof darkColors;
export type ThemeMode = 'dark' | 'light';

export const themePalettes: Record<ThemeMode, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 999,
  circle: 9999,
};

// ---------------------------------------------------------------------------
// Border widths
// ---------------------------------------------------------------------------
export const borders = {
  hairline: 0.5,
  thin: 1,
  medium: 1.5,
  thick: 2,
};

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
export const layout = {
  maxContentWidth: 720,
  tabBarHeight: 88,
  screenPadding: 16,
};

// ---------------------------------------------------------------------------
// Shadows (mobile – React Native)
// ---------------------------------------------------------------------------
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
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
};

// ---------------------------------------------------------------------------
// Web box shadows
// ---------------------------------------------------------------------------
export const webShadows = {
  none: { boxShadow: 'none' },
  xs: { boxShadow: '0 1px 3px rgba(0,0,0,0.10)' },
  sm: { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
  md: { boxShadow: '0 4px 16px rgba(0,0,0,0.14)' },
  lg: { boxShadow: '0 8px 24px rgba(0,0,0,0.16)' },
  xl: { boxShadow: '0 16px 40px rgba(0,0,0,0.18)' },
};

// ---------------------------------------------------------------------------
// Blur
// ---------------------------------------------------------------------------
export const blur = {
  none: 0,
  light: 10,
  medium: 20,
  heavy: 40,
};

// ---------------------------------------------------------------------------
// Opacity
// ---------------------------------------------------------------------------
export const opacity = {
  disabled: 0.4,
  pressed: 0.85,
  hover: 0.9,
  overlay: 0.85,
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const typography = {
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
  // Flat shortcuts (alias to sans)
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
};

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------
export const animation = {
  fast: 120,
  normal: 220,
  slow: 320,
  spring: { damping: 20, stiffness: 200, mass: 1 },
};

// ---------------------------------------------------------------------------
// Component style helpers
// ---------------------------------------------------------------------------
export const componentStyles = {
  card: {
    resting: {
      backgroundColor: darkColors.card,
      borderRadius: radius.xl,
      borderWidth: borders.thin,
      borderColor: darkColors.borderSoft,
    },
    elevated: {
      backgroundColor: darkColors.card,
      borderRadius: radius.xl,
    },
  },
  button: {
    primary: {
      backgroundColor: darkColors.primary,
      borderRadius: radius.md,
    },
    secondary: {
      backgroundColor: darkColors.card,
      borderRadius: radius.md,
      borderWidth: borders.thin,
      borderColor: darkColors.borderSoft,
    },
  },
};

// ---------------------------------------------------------------------------
// Background pattern config
// ---------------------------------------------------------------------------
export const backgroundPattern = {
  symbols: ['◇', '○', '△', '☆', '◎', '⬡', '✦', '◈'],
  opacity: 0.025,
  density: 12,
};
