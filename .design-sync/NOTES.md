# design-sync notes — nexus-commerce

## Why this repo needed manual setup (not the documented happy path)

This repo is a Vite **app**, not a publishable component library: `package.json` has no `module`/`main`/`exports`, no TypeScript, and no `build.lib` mode — `dist/` is a bundled single-page app, not per-component exports. The converter's synth-entry fallback (`export * from` every `src/*.jsx`) would have pulled in `main.jsx`, which runs `createRoot(...).render(...)` as a **module-load side effect** — that would crash every preview (no `#root` element in the DS sandbox). So this sync uses a **hand-written entry file** instead of synth-entry, and `componentSrcMap` pins each component explicitly (there's no `.d.ts` to discover them from).

Before re-running the build, regenerate the two generated `.cache/` inputs (gitignored, deterministic, regenerate-on-demand — not part of the durable set):

```bash
mkdir -p .design-sync/.cache
cat > .design-sync/.cache/pkg-entry.mjs << 'EOF'
export { default as AnatomySection } from '../../src/AnatomySection.jsx'
export { default as Cart } from '../../src/Cart.jsx'
export { default as Checkout } from '../../src/Checkout.jsx'
export { default as ErrorBoundary } from '../../src/ErrorBoundary.jsx'
export { default as HeroCanvas } from '../../src/HeroCanvas.jsx'
export { default as HeroKeycaps } from '../../src/HeroKeycaps.jsx'
export { default as Loader } from '../../src/Loader.jsx'
export { default as SwitchCanvas } from '../../src/SwitchCanvas.jsx'
export { default as SwitchIllustration } from '../../src/SwitchIllustration.jsx'
export { CartProvider, useCart } from '../../src/CartContext.jsx'
EOF
{ echo "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap');"; cat src/index.css; } > .design-sync/.cache/css-entry.css
```

Then run the build with `--entry .design-sync/.cache/pkg-entry.mjs` (this is why `cfg.cssEntry` points at the generated `css-entry.css`, not `src/index.css` directly — the real stylesheet has no `@font-face`/`@import` for its Google Fonts, which only load via a `<link>` in `index.html`; without the prepended `@import`, validate would report `[FONT_MISSING]` for DM Sans/DM Mono/Playfair Display instead of the accepted `[FONT_REMOTE]`).

`App.jsx`, `main.jsx`, `data.js`, `ScrollAnimations.js` are deliberately excluded — app glue / page composition / a constants module / a global GSAP scroll-reveal wired up outside any single component, not reusable design-system pieces.

## Known limitations (re-sync risks — read before trusting a clean re-sync)

- **`SwitchCanvas` / `AnatomySection` render without the real 3D model.** `SwitchCanvas` fetches `/switch_parts.glb` (an 887KB binary in `public/`) at runtime. This sync's output layout has no slot for arbitrary public assets (only `fonts/`, `tokens/`, `_vendor/`, `components/` are uploaded), so that fetch 404s in the DS sandbox — exactly as it would in any design built with this component on claude.ai/design. The component already degrades gracefully (GLTFLoader failure is caught, not thrown), but only the procedurally-built `spring` and `contact` parts render; `lower`/`upper`/`stem` (which come from the GLB) stay empty. If this matters, the fix is outside this skill's scope — host `switch_parts.glb` somewhere with a stable public URL and point `SwitchCanvas`'s `loadParts()` at it instead of a relative `/switch_parts.glb`.
- **`SwitchCanvas`'s `explodeProgress`/label reveal animates via `requestAnimationFrame` lerp**, not an instant prop — there's no way to render an already-exploded frame synchronously. The "Exploded" preview cell shows whatever the lerp reached by capture time, not necessarily the fully-separated end state.
- **`Loader`'s pressed/rippling states are interaction-only** (a real click + internal `setTimeout` choreography) — only the idle state has an authored preview. Same for `Cart`'s drawer-closing animation.
- **`AnatomySection`'s heading/description (`.reveal` class) and `HeroKeycaps`'s entrance (`.keycap`/`.keycaps-prompt`)** both start at `opacity:0` and only animate to `opacity:1` via either a site-wide GSAP `ScrollTrigger` (`ScrollAnimations.js`, never imported by the component) or a CSS `@keyframes` with a >1s delay. Both authored previews include a scoped `<style>` override neutralizing the entrance animation so the card shows real content instead of a blank capture — the same technique the site's own `prefers-reduced-motion` rule uses. If `AnatomySection` or `HeroKeycaps`'s entrance styling changes, re-check these overrides still match the real class names.
- **No local fonts ship.** `DM Sans`, `DM Mono`, `Playfair Display` load via a remote Google Fonts `@import` (see above) — validated as `[FONT_REMOTE]`, not an error, but every design built with this DS depends on that CDN being reachable.
- **`CartContext`'s `localStorage` key (`nexus-cart`) is shared across every rendered preview on the same origin.** Authored previews for `Cart`/`Checkout` call `cart.clear()` before seeding, so this is self-correcting, but a hand-edited preview that skips `clear()` could show stale state from a previous capture.

## Known render warns (validate clean as of this sync — nothing currently triaged)

None — render check is 9/9 clean with no warnings after the fixes above.
