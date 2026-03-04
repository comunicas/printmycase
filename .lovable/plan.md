

# Fix: Image clipping above 150% scale

## Problem
The image layer uses a fixed `oversize = 150` (150% of the phone frame). When `scale` exceeds ~150%, `backgroundSize` surpasses the container bounds, causing visible clipping.

Math: `backgroundSize = scale * (100 / 150)%` → at scale 200, that's 133%, but the container is only 150% wide/tall with offset -25%. The image overflows.

## Solution

**`src/components/PhonePreview.tsx`** — Make `oversize` dynamic based on scale:

```ts
const oversize = Math.max(150, scale * 1.25);
const offset = -(oversize - 100) / 2;
```

This ensures the container always has enough room for the current scale level. At scale 200, oversize becomes 250, and backgroundSize = `200 * (100/250) = 80%` — well within bounds.

Single change, ~2 lines modified (lines 70-71).

