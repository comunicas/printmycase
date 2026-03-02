

# Fix Image Sizing and Hover in PhonePreview

## Bug 1: Image oversized/cropped incorrectly (ROOT CAUSE)

The image layer div is intentionally 150% of the phone frame to prevent gaps during rotation. But `backgroundSize: ${scale}%` is calculated relative to this oversized div, not the phone frame.

At `scale=100`:
- Oversized div = 150% of phone frame
- `backgroundSize: 100%` = image fills 100% of oversized div = **150% of phone frame**
- Result: image appears zoomed in / cropped too tight

**Fix**: Normalize `backgroundSize` by the oversize factor:
```
backgroundSize: `${scale * (100 / oversize)}%`
```
At scale=100, this gives ~66.7% of the oversized div = 100% of the phone frame.

## Bug 2: Move icon never visible on hover

The Move icon div has `pointer-events-none` AND `hover:opacity-100`. Since pointer events are disabled, the CSS `:hover` state is never triggered. The icon remains invisible.

**Fix**: Use the parent interaction div's group hover. Add `group/drag` to the interaction container and use `group-hover/drag:opacity-100` on the Move icon wrapper.

## File Changed

**`src/components/PhonePreview.tsx`**:
1. Change `backgroundSize` from `${scale}%` to `${scale * (100 / oversize)}%` (line 75)
2. Add `group/drag` class to interaction layer div (line 107)
3. Change Move icon div from `hover:opacity-100` to `group-hover/drag:opacity-100` (line 113)

