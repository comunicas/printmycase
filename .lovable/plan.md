

# Fix: sessionStorage QuotaExceededError

## Problem
The error `QuotaExceededError: Failed to execute 'setItem' on 'Storage'` occurs because `handleContinue` stores both the full original image AND the edited snapshot as base64 in `sessionStorage`, which has a ~5MB limit. Two large base64 strings easily exceed this.

## Solution

**`src/pages/Customize.tsx`** — Stop storing the full original image in `sessionStorage`. Instead, store only the smaller edited snapshot (260×532px JPEG) and the metadata. The original image will be re-read from the draft or re-uploaded if needed.

Actually, a better approach: store the original image separately (it's already in the draft key), and only put the edited snapshot + metadata in the `customization` key. But even the draft auto-save has the same problem.

**Simplest fix**: Reduce what goes into `sessionStorage`:
1. Store the original image as a `Blob` URL (not base64) — but blob URLs don't survive page navigation.
2. **Best approach**: Compress the edited snapshot more aggressively (smaller canvas, lower quality), and for the original image, compress it further before storing (max 1000×2000, quality 0.7). This keeps both under ~1-2MB total.

**Revised approach** — two changes in `src/pages/Customize.tsx`:

1. **Reduce `compressImage` limits**: Change from 2000×4000 to **1200×2400** with quality **0.75** to keep the base64 small enough for sessionStorage.
2. **Reduce `renderSnapshot` quality**: Already 260×532 at 0.85 — this is fine (~50-100KB).
3. **Wrap `sessionStorage.setItem` in try/catch** with a fallback that strips the original image and only keeps the edited snapshot + metadata. Show a toast if fallback is used.
4. **Also wrap the draft auto-save** in try/catch to prevent errors there too.

### Changes in `src/pages/Customize.tsx`:
- `compressImage`: maxW=1200, maxH=2400, quality=0.75
- `handleContinue`: try/catch around `sessionStorage.setItem` with fallback (store without original image)
- Draft auto-save effect: wrap in try/catch

