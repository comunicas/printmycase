
The user wants the IntroDialog to be 100% fullscreen on mobile (instead of the current centered card with `pb-[160px]` workaround). This is also consistent with the project memory rule: "Modals: Mobile = fullscreen with straight corners, Desktop = centered cards with rounded corners."

## Plan: Fullscreen IntroDialog on mobile

### Changes to `src/components/customize/IntroDialog.tsx`

Update `DialogContent` className to:
- **Mobile**: fullscreen (`w-screen h-[100dvh] max-w-none rounded-none`), no bottom padding hack
- **Desktop (sm+)**: keep current centered card (`sm:max-w-xs sm:h-auto sm:rounded-2xl sm:max-h-[85vh]`)

Restructure inner layout to flexbox column with:
- Illustration/text area: `flex-1` and centered (so content sits in the middle of the screen on mobile)
- Dots + action buttons: pinned to bottom with safe-area padding (`pb-[env(safe-area-inset-bottom)]`) and enough bottom margin to clear the fixed `MobileTabBar` + `ContinueBar` (~140px). Use `mb-[160px] sm:mb-0` on the actions block, OR better: keep actions visible by giving the entire dialog `pb-[160px]` only on mobile fullscreen — but since fullscreen covers the whole viewport including the bottom bars, we need actions above the bars.

Actually, since this is a Radix Dialog with `z-[110]` it overlays everything including the bottom bars, so on fullscreen the buttons can sit at the actual bottom of the screen (no need to clear bars). Use `pb-[max(1rem,env(safe-area-inset-bottom))]`.

### Verification
After changes, test by clearing `localStorage.customize_intro_seen` and reloading `/customize/galaxy-a05s` at 390x844. Confirm:
- Modal covers full screen, no rounded corners on mobile
- Welcome content visually centered
- Dots + Anterior/Próximo buttons visible at bottom
- No toast overlap (already handled previously)
- Desktop unchanged (centered card)
