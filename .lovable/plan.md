

## Fix: Instagram Embeds conflicting with React DOM

### Problem
Instagram's `embed.js` script replaces the `blockquote` elements with iframes. Since React manages those DOM nodes, when React tries to update or unmount, it fails with `removeChild` errors because the original nodes no longer exist.

### Solution
Use a ref-based approach where each embed container is managed outside React's virtual DOM. Instead of rendering `blockquote` elements as JSX, inject them via `innerHTML` on a ref'd div. This way Instagram can freely replace the content without conflicting with React.

### Changes

**1 file edited: `src/components/InstagramShowcase.tsx`**

- Create a sub-component `InstaEmbed` that:
  - Uses a `ref` on a wrapper `div`
  - On mount, sets `ref.current.innerHTML` with the blockquote HTML
  - Calls `window.instgrm.Embeds.process()` after injection
  - Returns an empty div (React never touches the inner content)
- Remove the direct `blockquote` JSX rendering
- Keep the data fetching, layout grid, and `@printmycasebr` link unchanged

### Key code pattern

```tsx
const InstaEmbed = ({ url }: { url: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="..."></blockquote>`;
    loadEmbedScript();
  }, [url]);
  return <div ref={ref} />;
};
```

This isolates Instagram's DOM mutations from React's reconciliation, eliminating the `removeChild` error.

