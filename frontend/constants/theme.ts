// Memora Design System — Dark + Translucent + Y2K + Gothic + iOS
// A private digital memory archive from an alternate early-2000s future.

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  // ── Background Hierarchy ──────────────────────────────────────────────
  // Deep, atmospheric dark surfaces
  background: '#08080C',        // Primary app background — near black with subtle blue
  backgroundElevated: '#0D0D12', // Elevated surfaces (cards, panels)
  backgroundOverlay: '#111116',  // Overlays, modals, sheets

  // ── Surface Materials (Alpha-based for translucency) ──────────────────
  // Material 01 — Background (opaque)
  surfaceBackground: 'rgba(8, 8, 12, 0.98)',

  // Material 02 — Navigation (slightly translucent)
  surfaceNavigation: 'rgba(13, 13, 18, 0.88)',

  // Material 03 — Floating (search, contextual controls)
  surfaceFloating: 'rgba(17, 17, 22, 0.78)',

  // Material 04 — Modal/Sheet (stronger separation)
  surfaceModal: 'rgba(17, 17, 22, 0.92)',

  // Material 05 — Overlay (highest focus)
  surfaceOverlay: 'rgba(8, 8, 12, 0.96)',

  // ── Text Hierarchy ───────────────────────────────────────────────────
  textPrimary: '#F5F3F7',        // Primary content — warm off-white
  textSecondary: '#A8A4AE',      // Secondary content
  textMuted: '#68646F',          // Metadata, captions, disabled
  textInverse: '#08080C',        // On accent/chrome surfaces

  // ── Borders (extremely subtle) ────────────────────────────────────────
  borderHairline: 'rgba(255, 255, 255, 0.04)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderDefault: 'rgba(255, 255, 255, 0.08)',
  borderEmphasized: 'rgba(255, 255, 255, 0.12)',

  // ── Accent Palette (restrained, hardware-inspired) ────────────────────
  // Icy blue — primary interactive accent
  accent: '#7A9FD8',
  accentSoft: 'rgba(122, 159, 216, 0.12)',
  accentSubtle: 'rgba(122, 159, 216, 0.06)',
  accentDeep: '#4A75B8',

  // Pale lavender — secondary atmospheric accent
  accentLavender: '#B8A8D8',
  accentLavenderSoft: 'rgba(184, 168, 216, 0.10)',
  accentLavenderSubtle: 'rgba(184, 168, 216, 0.05)',

  // Silver/chrome — Y2K hardware references
  chrome: '#C8CCD4',
  chromeDim: '#8A8E98',
  chromeDark: '#4A4E58',
  chromeHighlight: '#E8EBF0',
  chromeGlow: 'rgba(200, 204, 212, 0.08)',

  // ── Status Colors (muted, not neon) ──────────────────────────────────
  success: '#5A8A6E',
  successSoft: 'rgba(90, 138, 110, 0.12)',
  warning: '#B8A05A',
  warningSoft: 'rgba(184, 160, 90, 0.12)',
  error: '#C05A5A',
  errorSoft: 'rgba(192, 90, 90, 0.12)',

  // ── Legacy aliases (for gradual migration) ───────────────────────────
  surface: '#111116',
  surfaceElevated: '#16161C',
  backgroundSecondary: '#0D0D12',
  backgroundTertiary: '#111116',
  border: 'rgba(255, 255, 255, 0.06)',
  borderSoft: 'rgba(255, 255, 255, 0.04)',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.05)',
  dividerSoft: 'rgba(255, 255, 255, 0.03)',
  text: '#F5F3F7',
  textTertiary: '#68646F',
  textOnChrome: '#08080C',
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowStrong: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(8, 8, 12, 0.8)',
  overlayLight: 'rgba(8, 8, 12, 0.4)',
  overlayStrong: 'rgba(8, 8, 12, 0.95)',
  accentLight: '#9AB8E8',
  accentGlow: 'rgba(122, 159, 216, 0.15)',
  coolHighlight: '#B8A8D8',
  coolGlow: 'rgba(184, 168, 216, 0.10)',
  borderChrome: 'rgba(255, 255, 255, 0.08)',
  borderHighlight: 'rgba(255, 255, 255, 0.12)',
  patternTint: 'rgba(122, 159, 216, 0.03)',
  patternTintCool: 'rgba(184, 168, 216, 0.02)',
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================

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

// ============================================================================
// RADIUS HIERARCHY
// Small controls: 8px | Buttons: 10px | Cards: 14px | Large panels: 18px | Sheets/modals: 22px+
// ============================================================================

export const radius = {
  xs: 8,      // Small controls, chips, badges
  sm: 10,     // Buttons, inputs
  md: 14,     // Cards, standard panels
  lg: 18,     // Large panels, hero sections
  xl: 22,     // Sheets, modals, major containers
  xxl: 28,    // Full-screen sheets, immersive views
  round: 999, // Pills, circular elements
  full: 999,
  circle: 9999,
};

// ============================================================================
// BORDER WIDTHS
// ============================================================================

export const borders = {
  hairline: 0.5,
  thin: 1,
  medium: 1.5,
  thick: 2,
};

// ============================================================================
// SHADOWS / DEPTH
// Soft depth rather than obvious shadows. Avoid excessive floating-card effects.
// ============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle depth for cards at rest
  xs: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },

  xl: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  // Chrome-specific subtle reflection (Y2K hardware)
  chrome: {
    shadowColor: colors.chromeGlow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },

  chromeLg: {
    shadowColor: colors.chromeGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Accent glow — used extremely sparingly for active/focus states
  glowSm: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 0,
  },

  glowMd: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 0,
  },
};

// Web-compatible shadow styles
export const webShadows = {
  none: { boxShadow: 'none' },
  xs: { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)' },
  sm: { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
  md: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)' },
  lg: { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)' },
  xl: { boxShadow: '0 16px 24px rgba(0, 0, 0, 0.18)' },
  chrome: { boxShadow: '0 1px 2px rgba(200, 204, 212, 0.05)' },
  chromeLg: { boxShadow: '0 4px 8px rgba(200, 204, 212, 0.05)' },
  glowSm: { boxShadow: '0 0 6px rgba(122, 159, 216, 0.15)' },
  glowMd: { boxShadow: '0 0 12px rgba(122, 159, 216, 0.12)' },
  glowLg: { boxShadow: '0 0 20px rgba(122, 159, 216, 0.08)' },
  chromeReflection: {
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 0 rgba(0, 0, 0, 0.2)',
  },
};

// ============================================================================
// BLUR / MATERIAL SYSTEM
// Five material levels for hierarchical translucency
// ============================================================================

export const blur = {
  none: 0,
  light: 12,      // Material 02 — Navigation
  medium: 24,     // Material 03 — Floating
  heavy: 40,      // Material 04 — Modal
  intense: 60,    // Material 05 — Overlay
};

// ============================================================================
// OPACITY VALUES
// ============================================================================

export const opacity = {
  disabled: 0.35,
  pressed: 0.8,
  hover: 0.9,
  overlay: 0.88,
  pattern: 0.025,
  patternAccent: 0.04,
  chromeReflection: 0.06,
  chromeHighlight: 0.1,
};

// ============================================================================
// TYPOGRAPHY
// Primary: System (SF Pro / Roboto) — UI, navigation, controls, metadata
// Secondary: Georgia (serif) — Major headings, memory titles, editorial moments
// Technical: Menlo (mono) — IDs, timestamps, technical metadata
// ============================================================================

export const typography = {
  // ── Sans-Serif (System) ──────────────────────────────────────────────
  sans: {
    display: {
      fontFamily: 'System',
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.6,
    },
    title: {
      fontFamily: 'System',
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.4,
    },
    title2: {
      fontFamily: 'System',
      fontSize: 22,
      fontWeight: '700' as const,
      lineHeight: 30,
      letterSpacing: -0.3,
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
      letterSpacing: 0.3,
    },
    caption2: {
      fontFamily: 'System',
      fontSize: 11,
      fontWeight: '500' as const,
      lineHeight: 14,
      letterSpacing: 0.4,
    },
    micro: {
      fontFamily: 'System',
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 12,
      letterSpacing: 0.6,
      textTransform: 'uppercase' as const,
    },
  },

  // ── Serif (Georgia) — Editorial / Atmospheric ────────────────────────
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

  // ── Serif Italic — Quotes, captions, emotional text ──────────────────
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

  // ── Monospace (Menlo) — Technical metadata ───────────────────────────
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
      letterSpacing: 0.4,
    },
    caption: {
      fontFamily: 'Menlo',
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 14,
      letterSpacing: 0.3,
    },
    micro: {
      fontFamily: 'Menlo',
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 12,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },

  // ── Legacy flat structure (backward compatibility) ───────────────────
  display: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  title2: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
    letterSpacing: -0.3,
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
    letterSpacing: 0.3,
  },
  caption2: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
};

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

export const layout = {
  screenPadding: spacing.lg,
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.xl,
  maxContentWidth: 720,
  tabBarHeight: 92,
  headerHeight: 56,
  safeAreaTop: 44,
  safeAreaBottom: 34,
};

// ============================================================================
// ANIMATION / MOTION
// 150–250ms normal transitions. Subtle spring-like easing.
// ============================================================================

export const animation = {
  fast: 120,
  normal: 220,
  slow: 320,
  spring: {
    damping: 20,
    stiffness: 180,
  },
  springGentle: {
    damping: 24,
    stiffness: 140,
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// ============================================================================
// BACKGROUND PATTERN CONFIGURATION
// Extremely subtle atmospheric symbols (Y2K nostalgia, gothic atmosphere)
// ============================================================================

export const backgroundPattern = {
  symbols: ['star', 'sparkle', 'cross', 'heart', 'diamond', 'moon'],
  defaultOpacity: 0.025,
  defaultDensity: 0.6,
  defaultScale: 1,
  defaultRotation: 0,
};

// ============================================================================
// EFFECT PRESETS (reusable material combinations)
// ============================================================================

export const effects = {
  // Material 02 — Navigation surface
  surfaceNavigation: {
    backgroundColor: colors.surfaceNavigation,
    borderWidth: borders.hairline,
    borderColor: colors.borderSubtle,
  },

  // Material 03 — Floating surface
  surfaceFloating: {
    backgroundColor: colors.surfaceFloating,
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },

  // Material 04 — Modal/Sheet surface
  surfaceModal: {
    backgroundColor: colors.surfaceModal,
    borderWidth: borders.hairline,
    borderColor: colors.borderEmphasized,
  },

  // Material 05 — Overlay surface
  surfaceOverlay: {
    backgroundColor: colors.surfaceOverlay,
    borderWidth: borders.thin,
    borderColor: colors.borderEmphasized,
  },

  // Subtle chrome accent border (Y2K hardware)
  chromeAccent: {
    borderWidth: borders.hairline,
    borderColor: colors.chromeGlow,
  },

  // Active/focus accent border
  accentBorder: {
    borderWidth: borders.thin,
    borderColor: colors.accent,
  },

  // Glass surface for web (backdrop-filter)
  glassSurfaceWeb: {
    backgroundColor: 'rgba(17, 17, 22, 0.78)',
    backdropFilter: 'blur(24px) saturate(120%)',
    WebkitBackdropFilter: 'blur(24px) saturate(120%)',
    borderWidth: borders.hairline,
    borderColor: colors.borderDefault,
  },
};

// ============================================================================
// COMPONENT VARIANT CONFIGURATIONS
// ============================================================================

export const variants = {
  memoryCard: {
    editorial: { aspectRatio: 4 / 5, imageRadius: radius.xl, padding: spacing.lg, gap: spacing.md },
    compact: { aspectRatio: 1, imageRadius: radius.lg, padding: 0, gap: spacing.xs },
    timeline: { aspectRatio: 4 / 3, imageRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
    immersive: { aspectRatio: 3 / 4, imageRadius: 0, padding: 0, gap: spacing.lg },
  },
  button: {
    primary: { backgroundColor: colors.chromeDim, color: colors.textPrimary, borderColor: colors.chrome },
    primaryPressed: { backgroundColor: colors.chrome },
    secondary: { backgroundColor: colors.backgroundElevated, borderColor: colors.borderDefault },
    ghost: { backgroundColor: 'transparent', borderColor: colors.borderSubtle },
    accent: { backgroundColor: colors.accent, color: colors.textInverse },
    accentPressed: { backgroundColor: colors.accentDeep },
    destructive: { backgroundColor: colors.errorSoft, borderColor: colors.error },
    chrome: { backgroundColor: colors.chrome, color: colors.textInverse },
  },
  input: {
    default: {
      backgroundColor: colors.backgroundElevated,
      borderWidth: borders.hairline,
      borderColor: colors.borderSubtle,
      color: colors.textPrimary,
    },
    focused: {
      borderColor: colors.accent,
      borderWidth: borders.thin,
    },
    error: {
      borderColor: colors.error,
      borderWidth: borders.thin,
    },
  },
};