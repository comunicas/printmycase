

# Add explicit width/height to unsized images

Three images need explicit `width` and `height` attributes to prevent layout shift (CLS) and resolve unsized-images warnings:

## Changes

### 1. `src/components/PaymentBadges.tsx` (line 51)
- Stripe logo `<img>`: add `width={60} height={20}`

### 2. `src/components/WhyArtisCase.tsx` (lines 65-66)
- Epson logo: add `width={80} height={28}`
- PrecisionCore logo: add `width={100} height={32}`

All images already use CSS classes for visual sizing (`h-5`, `h-7`, etc.), so the HTML attributes serve as intrinsic ratio hints for the browser without changing appearance.

