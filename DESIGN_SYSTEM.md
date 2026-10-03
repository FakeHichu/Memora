# Memora Design System

## Color System

### Primary Palette
- Background: #08080C (near black with subtle blue)
- Surface Background: rgba(8, 8, 12, 0.98)
- Surface Navigation: rgba(13, 13, 18, 0.88)
- Surface Floating: rgba(17, 17, 22, 0.78)
- Surface Modal: rgba(17, 17, 22, 0.92)
- Surface Overlay: rgba(8, 8, 12, 0.96)

### Text Colors
- Text Primary: #F5F3F7 (warm off-white)
- Text Secondary: #A8A4AE
- Text Muted: #68646F
- Text Inverse: #08080C

### Accent Colors
- Accent: #7A9FD8 (icy blue)
- Accent Soft: rgba(122, 159, 216, 0.12)
- Accent Subtle: rgba(122, 159, 216, 0.06)
- Accent Deep: #4A75B8
- Accent Lavender: #B8A8D8
- Chrome: #C8CCD4

### Status Colors
- Success: #5A8A6E
- Warning: #B8A05A
- Error: #C05A5A

### Border Colors
- Hairline: rgba(255, 255, 255, 0.04)
- Subtle: rgba(255, 255, 255, 0.06)
- Default: rgba(255, 255, 255, 0.08)
- Emphasized: rgba(255, 255, 255, 0.12)

## Spacing System
- xs: 4
- sm: 8
- md: 12
- lg: 16
- xxl: 24
- xxxl: 32
- huge: 48
- massive: 64

## Radius System
- xs: 8
- sm: 10
- md: 14
- lg: 18
- xl: 22
- xxl: 28
- round: 999
- full: 999
- circle: 9999

## Border Widths
- hairline: 0.5
- thin: 1
- medium: 1.5
- thick: 2

## Shadows
### Basic Shadows
- none: transparent, 0 elevation
- xs: shadow-color, 1px offset, 0.08 opacity, 2px radius, 1 elevation
- sm: shadow-color, 2px offset, 0.1 opacity, 4px radius, 2 elevation
- md: shadow-color, 4px offset, 0.12 opacity, 8px radius, 3 elevation
- lg: shadow-color, 8px offset, 0.15 opacity, 16px radius, 5 elevation
- xl: shadow-color, 16px offset, 0.18 opacity, 24px radius, 8 elevation

### Y2K Chrome Effects
- chrome: shadow-color, 1px offset, 1 opacity, 2px radius, 1 elevation
- chromeLg: shadow-color, 4px offset, 1 opacity, 8px radius, 3 elevation

### Accent Glow Effects
- glowSm: shadow-color, 0 offset, 0.15 opacity, 6px radius, 0 elevation
- glowMd: shadow-color, 0 offset, 0.12 opacity, 12px radius, 0 elevation

## Typography System

### Sans-Serif (System)
- **Display**: 36pt, 700, 44 line-height, -0.6 letter-spacing
- **Title**: 28pt, 700, 36 line-height, -0.4 letter-spacing
- **Title2**: 22pt, 700, 30 line-height, -0.3 letter-spacing
- **Title3**: 18pt, 600, 24 line-height, -0.1 letter-spacing
- **Headline**: 17pt, 600, 22 line-height
- **Body**: 16pt, 400, 24 line-height
- **BodyStrong**: 16pt, 500, 24 line-height
- **Callout**: 15pt, 400, 22 line-height
- **Subheadline**: 14pt, 400, 20 line-height
- **Footnote**: 13pt, 400, 18 line-height
- **Caption**: 12pt, 500, 16 line-height, 0.3 letter-spacing
- **Caption2**: 11pt, 500, 14 line-height, 0.4 letter-spacing
- **Micro**: 10pt, 600, 12 line-height, uppercase, 0.6 letter-spacing

### Serif (Georgia)
- **Display**: 36pt, 400, 44 line-height, -0.5 letter-spacing
- **Title**: 28pt, 400, 36 line-height, -0.3 letter-spacing
- **Title2**: 22pt, 400, 30 line-height, -0.2 letter-spacing
- **Title3**: 18pt, 400, 26 line-height, -0.1 letter-spacing
- **Headline**: 17pt, 400, 24 line-height
- **Body**: 16pt, 400, 24 line-height
- **Callout**: 15pt, 400, 22 line-height
- **Caption**: 13pt, 400, 18 line-height

### Monospace (Menlo)
- **Title**: 13pt, 400, 18 line-height, 0.5 letter-spacing
- **Body**: 12pt, 400, 16 line-height, 0.4 letter-spacing
- **Caption**: 11pt, 400, 14 line-height, 0.3 letter-spacing
- **Micro**: 10pt, 500, 12 line-height, uppercase, 0.5 letter-spacing

### Legacy Flat Structure
- **Display**: 36pt, 700, 44 line-height, -0.6 letter-spacing
- **Title**: 28pt, 700, 36 line-height, -0.4 letter-spacing
- **Title2**: 22pt, 700, 30 line-height, -0.3 letter-spacing
- **Title3**: 18pt, 600, 24 line-height, -0.1 letter-spacing
- **Headline**: 17pt, 600, 22 line-height
- **Body**: 16pt, 400, 24 line-height
- **BodyStrong**: 16pt, 500, 24 line-height
- **Callout**: 15pt, 400, 22 line-height
- **Subheadline**: 14pt, 400, 20 line-height
- **Footnote**: 13pt, 400, 18 line-height
- **Caption**: 12pt, 500, 16 line-height, 0.3 letter-spacing
- **Caption2**: 11pt, 500, 14 line-height, 0.4 letter-spacing

## Layout Constants
- screenPadding: spacing.lg
- screenPaddingHorizontal: spacing.lg
- screenPaddingVertical: spacing.xl
- maxContentWidth: 720
- tabBarHeight: 92
- headerHeight: 56
- safeAreaTop: 44
- safeAreaBottom: 34

## Animation System
- fast: 120ms
- normal: 220ms
- slow: 320ms
- spring: damping 20, stiffness 180
- springGentle: damping 24, stiffness 140

## Breakpoints
- phone: 0
- tablet: 768
- desktop: 1024

## Background Pattern Configuration
- symbols: ['star', 'sparkle', 'cross', 'heart', 'diamond', 'moon']
- defaultOpacity: 0.025
- defaultDensity: 0.6
- defaultScale: 1
- defaultRotation: 0

## Effect Presets
### Material Surfaces
- surfaceNavigation: background-color, border-width, border-color
- surfaceFloating: background-color, border-width, border-color
- surfaceModal: background-color, border-width, border-color
- surfaceOverlay: background-color, border-width, border-color

### Chrome Accent
- chromeAccent: border-width, border-color

### Active/Focus
- accentBorder: border-width, border-color

### Glass Surface
- glassSurfaceWeb: background-color, backdrop-filter, border-width, border-color

## Component Variants
### Memory Card
- editorial: aspectRatio 4/5, imageRadius xl, padding lg, gap md
- compact: aspectRatio 1, imageRadius lg, padding 0, gap xs
- timeline: aspectRatio 4/3, imageRadius lg, padding md, gap sm
- immersive: aspectRatio 3/4, imageRadius 0, padding 0, gap lg

### Button
- primary: background-color chromeDim, color textPrimary, border-color chrome
- primaryPressed: background-color chrome
- secondary: background-color backgroundElevated, border-color borderDefault
- ghost: background-color transparent, border-color borderSubtle
- accent: background-color accent, color textInverse
- accentPressed: background-color accentDeep
- destructive: background-color errorSoft, border-color error
- chrome: background-color chrome, color textInverse

### Input
- default: background-color backgroundElevated, border-width hairline, border-color borderSubtle, color textPrimary
- focused: border-color accent, border-width thin
- error: border-color error, border-width thin

## Implementation Strategy
1. Start with Phase 1: Foundation Improvements
2. Focus on Supabase integration first to enable cloud sync
3. Modernize the design system while maintaining Y2K essence
4. Implement responsive navigation structure
5. Proceed through phases systematically

## Success Metrics
- Existing functionality preserved
- New features actually work
- UI visually cohesive across devices
- Responsive layouts work on mobile/desktop
- Search and filtering work effectively
- No obvious console errors
- Production build succeeds
- Tests pass
- No unnecessary mock data remains