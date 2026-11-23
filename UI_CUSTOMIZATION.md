# Memora UI Customization Guide

This guide explains how to make design changes to the Memora app UI. All visual
language is centralized in the design tokens so that future changes (colors,
typography, spacing, radius, shadows, buttons, cards, navigation) only require
editing a small number of files — never screen-by-screen rewrites.

## Source of Truth

All design tokens live in:

```
frontend/constants/theme.ts
```

Screens never hardcode design values. Instead they read tokens through the
theme context:

```ts
import { useAppTheme } from '@/providers/ThemeProvider';
import { colors, radius, spacing, typography, shadows, borders, layout, componentStyles } from '@/constants/theme';

const { colors } = useAppTheme();
const styles = createStyles(colors);
```

`frontend/providers/ThemeProvider.tsx` resolves the active palette
(`themePalettes[themeMode]`) and exposes it via `useAppTheme()`.

## Token Categories

| Token | Purpose | Location |
| --- | --- | --- |
| Colors | Backgrounds, surfaces, text, accent, status, borders | `colors`, `darkColors`, `lightColors`, `themePalettes` |
| Typography | Font families, sizes, weights, line heights, letter spacing | `typography` (sans / serif / mono families) |
| Spacing | 4px-based vertical/horizontal rhythm scale | `spacing` |
| Radius | Corner radii scale | `radius` |
| Borders | Hairline / thin / medium / thick widths | `borders` |
| Shadows | Elevation shadows (`shadows`) + web variants (`webShadows`) | `shadows`, `webShadows` |
| Component Styles | Per-component presets (card, button, navBar, searchBar, chip) | `componentStyles` |
| Layout | Screen padding, max content width, tab bar height, photo grid columns, breakpoints | `layout`, `breakpoints` |
| Effects | Borders, glows, overlays | `effects` |
| Animation | Durations & springs | `animation` |

## Making Design Changes

### 1. Change the color palette (e.g. new accent color, dark mode toggle)

Edit the token values in `frontend/constants/theme.ts`:

- Change a single key (e.g. `accent`) in both `darkColors` and `lightColors`
  (both palettes must stay in sync; the type is derived from `darkColors`).
- Status colors: `success`, `warning`, `error` (+ soft/background variants).
- Text colors: `textPrimary`, `textSecondary`, `textMuted`, `textInverse`.

To switch modes, toggle the theme mode in the ThemeProvider — no screen changes
are required because all components read via `useAppTheme()`.

### 2. Change a component style (buttons, cards, nav bar, search bar, chips)

Edit the preset in `componentStyles` in `frontend/constants/theme.ts`:

- `card` — `resting`, `elevated`, `image` presets
- `button` — `primary`, `secondary`, `ghost`, `accent`, `destructive`
- `navBar` — `floatingPill` for the floating pill tab bar
- `searchBar` — `field` for rounded search bars
- `chip` — `resting`, `selected` for filter chips

### 3. Change typography

Edit named styles inside `typography` (e.g. `sans.title`, `serif.title`,
`serif.body`, `mono.micro`). Typography families live under `serif`, `sans`,
and `mono` groups.

### 4. Change spacing / radius / shadows / borders

Edit the corresponding numeric token (`spacing.*`, `radius.*`, `shadows.*`,
`borders.*`) or spread them into component styles.

### 5. Change layout behavior

- `layout.maxContentWidth` — content max width
- `layout.photoGridColumns.phone / tablet / desktop` — responsive photo grids
- `layout.screenPadding*` — screen margins
- `breakpoints.phone / tablet / desktop` — responsive layout switches

## Workflow for Future Design Requests

Example requests and where the change goes:

| Request | Where to change |
| --- | --- |
| "Switch to dark mode" | ThemeProvider mode + `darkColors` (light palette becomes the inverted set) |
| "Change the accent to purple" | `accent`, `accentSubtle`, `accentSoft`, `accentLavender`, glow/shadow accents in both palettes |
| "Make cards more rounded" | `radius.*` tokens + `componentStyles.card.*` |
| "Increase base spacing" | `spacing.*` tokens |
| "Bigger search bar" | `componentStyles.searchBar.field` + related paddings |
| "Change button corner radius" | `componentStyles.button.*` and/or `radius.*` |
| "Add new screen background color" | `colors.background` (+ status-bar / safe-area handling via tokens) |

Steps:

1. Open `frontend/constants/theme.ts`.
2. Change the token value(s). Both light and dark palettes must be updated if
   the token is mode-aware.
3. If a component preset should change, update `componentStyles`.
4. Run `npx tsc --noEmit` and `npx eslint` in `frontend/` — no screen edits
   should be needed because shared components read tokens via `useAppTheme()`.

## Rules of Engagement

- Screens may only consume tokens through `useAppTheme()` and the shared
  component library (`frontend/components/ui/*`).
- Never hardcode hex colors, font sizes, or radii in screen files; add or reuse
  tokens instead.
- New design values must be added to both palettes if they are theme-aware.
- Feature logic (photo drafts, favorites, persistence, navigation data) must not
  be touched when making purely visual changes.

## Related Docs

- `DESIGN_SYSTEM.md` — high-level design principles and token reference.
- `design/FRONTEND_REFERENCE_PACK.md` — component reference for the frontend.
