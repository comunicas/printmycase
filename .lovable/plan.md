

## Fix: Header Button Contrast on Dark Hero

### Problem

The "Ver Modelos" and "Entrar" buttons in the transparent header state are barely visible against the dark hero background. The ghost variant buttons don't have enough contrast on dark backgrounds.

### Fix

**`src/components/AppHeader.tsx`** — The "Ver Modelos" button already has conditional white styling when `isTransparent && !scrolled`, but it needs stronger contrast. Currently uses `text-white/90` which may be too subtle.

**`src/components/UserMenu.tsx`** — The "Entrar" button uses `variant="ghost"` with no conditional styling for transparent headers. It needs to accept a prop to know when it's on a dark background.

### Approach

1. **`src/components/AppHeader.tsx`**: Pass a prop or apply direct styling to both the "Ver Modelos" button and UserMenu to use white text when in transparent-not-scrolled state.

2. **`src/components/UserMenu.tsx`**: Accept a `transparent` prop and apply `text-white hover:bg-white/10` to the "Entrar" button when true.

3. Both buttons get `text-white` (full opacity, not `/90`) for maximum contrast in the transparent header state.

Two files changed, minimal edits.

