

# Fix: Input placeholder vs value confusion in bulk price bar

## Problem
The bulk price input shows "10" as a placeholder, which visually looks like an actual value. But the "+ Aumentar" and "- Diminuir" buttons remain disabled because the state `bulkAdjustValue` is an empty string `""`. Users may click the buttons and nothing happens, causing confusion.

## Solution
Set a default initial value of `"10"` for `bulkAdjustValue` instead of `""`, so the buttons are immediately active when products are selected.

## File to edit
- `src/pages/Admin.tsx` -- change line initializing `bulkAdjustValue` from `""` to `"10"`

