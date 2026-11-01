# Memora Design System

## Dual Theme Color Palette

### 1. Dark Theme (Midnight & Deep Purple with Catppuccin Elements)
- **Midnight background**: `#0B0813`
- **Deep purple (surfaces / cards)**: `#211633`
- **Purple accent**: `#8052C8`
- **Lavender**: `#C3A6F2`
- **Warm yellow**: `#FFC857`
- **Primary text**: `#F6F0FF`
- **Secondary text**: `#A99BB9`

#### Visual Elements (Catppuccin Palette)
- **Rosewater**: `#f5e0dc`
- **Flamingo**: `#f2cdcd`
- **Pink**: `#f5c2e7`
- **Mauve**: `#cba6f7`
- **Red**: `#f38ba8`
- **Maroon**: `#eba0ac`
- **Peach**: `#fab387`
- **Yellow**: `#f9e2af`
- **Green**: `#a6e3a1`
- **Teal**: `#94e2d5`
- **Sky**: `#89dceb`
- **Sapphire**: `#74c7ec`
- **Blue**: `#89b4fa`
- **Lavender**: `#b4befe`
- **Text**: `#cdd6f4`
- **Subtext 1**: `#bac2de`
- **Subtext 0**: `#a6adc8`
- **Overlay 2**: `#9399b2`
- **Overlay 1**: `#7f849c`
- **Overlay 0**: `#6c7086`
- **Surface 2**: `#585b70`
- **Surface 1**: `#45475a`
- **Surface 0**: `#313244`
- **Base**: `#1e1e2e`
- **Mantle**: `#181825`
- **Crust**: `#11111b`

---

### 2. Light Theme (Warm Minimalist)
- **Background**: `#F7F2E9` (Warm linen)
- **Card surfaces**: `#FFFDF8`
- **Secondary surfaces**: `#E9DFF3`
- **Primary accent**: `#80658F`
- **Primary text**: `#30243D`
- **Secondary text**: `#75677E`
- **Highlight**: `#E6B957`
- **Optional accents**: `#E9C9C5` and `#C8D3BF`

---

## Component Visual Language

### 1. WhatsApp-Style Splash Loader
- Centers an animated breathing/pulsing Memora emblem.
- Smooth fill progress bar moving over 2.4 seconds.
- Displays for 2.5 seconds on initial application launch.
- Brand footer: `FROM MEMORA`.

### 2. Floating Pill Navigation Bar
- Pinned bottom-center capsule with `borderRadius: 999`.
- **Active state**: Expanded capsule chip with contrasting background (`#FFFFFF` in light mode or `#8052C8` in dark mode) displaying both the tab icon and label side-by-side (`[ ⌂ Home ]`).
- **Inactive state**: Minimal circular icon buttons with subtle touch states.

### 3. Modern Headers & Search
- Profile header with user avatar, greeting, and circular pill buttons for actions.
- Full pill search bar (`borderRadius: 999`) with embedded circular magnifying glass search button.
- Clean category pill chips (`[ All ]`, `[ People ]`, `[ Places ]`, `[ Events ]`).

### 4. Hero Editorial Cards
- Generous corner radius (`borderRadius: 26 - 28`).
- Top-left floating translucent pill badge: `⏱ {time}`.
- Top-right floating translucent pill badge: `♡ {reactions}`.
- Floating bottom card overlay with title and rating capsule (`★ 4.9`).

### 5. Details & Favorites Grid
- Sub-screen navigation: circular back pill button `<`, centered title, and circular action pills (`♡`, `⇪`, `🔍`).
- 2-column favorite grid with top title, heart pill button, centered photo, and bottom metadata pill.
