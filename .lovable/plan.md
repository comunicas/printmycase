

## Bug Fix: Hero Text Invisible — Missing `fade-in` Keyframe

### Problem

The hero section text (title, subtitle, CTAs, social proof badge) is completely invisible. All four elements have `opacity-0 animate-fade-in`, but the `fade-in` keyframe and animation are **not defined** in `tailwind.config.ts`. Without the animation running, the elements stay at `opacity: 0` permanently.

The header glassmorphism scroll transition works correctly.

### Fix

**`tailwind.config.ts`** — Add the `fade-in` keyframe and animation to the theme:

```ts
keyframes: {
  // ... existing accordion keyframes
  'fade-in': {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  // ... existing accordion animations
  'fade-in': 'fade-in 0.6s ease-out',
},
```

Single file change, ~6 lines added. This will make all four hero elements animate in with a staggered fade-in + slide-up effect as originally intended.

