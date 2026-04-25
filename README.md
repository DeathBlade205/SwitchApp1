# Nexus — Precision Switch Co.

A luxury mechanical keyboard switch showcase site. Vite + React + Three.js, deployable to Vercel in under a minute.

## What's inside

- **Keyswitch intro** — click the keycap, hear a synthesised mechanical click (Web Audio API, no files), watch ripple rings expand into the page
- **3D switch renders** — live Three.js scenes for each switch variant (Linear, Tactile, Clicky) with studio lighting and hover spin
- **Flowing abstract background** — sine-wave line field with gold particle dust, mouse-parallax reactive
- **Full product showcase** — collection grid, deep-dive specs, process breakdown, CTA band
- **Custom cursor** with blend-mode multiply + gold hover state

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8 (`npm i -g pnpm`)

## Local development

```bash
pnpm install
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev server with HMR |
| `pnpm build` | Production build → `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | ESLint |

## Deploy to Vercel

**Option A — CLI (30 seconds)**
```bash
pnpm add -g vercel
vercel
```

**Option B — GitHub → Dashboard**
1. Push to GitHub
2. [vercel.com](https://vercel.com) → New Project → Import repo
3. Vercel auto-detects Vite. Leave all settings as-is.
4. Deploy ✓

Every push to `main` auto-redeploys.

## Project structure

```
src/
  App.jsx           Page layout + all content data
  Loader.jsx        Keyswitch intro screen + ripple transition
  HeroCanvas.jsx    Three.js flowing lines + gold dust background
  SwitchCanvas.jsx  3D switch renderer (reused per variant)
  index.css         Design tokens + global styles
  main.jsx          React entry point
```

## Editing content

All page content lives at the bottom of `src/App.jsx` as plain JS arrays:

```js
// Product cards
const SWITCHES = [ { name, tagline, type, force, travel, sound, price, ... } ]

// Spec table
const SPECS = [ { key, value } ]

// Stats band
const STATS = [ { num, label } ]

// Process steps
const PROCESS = [ { title, body } ]
```

## Design tokens

Edit `src/index.css` `:root` to retheme everything:

```css
:root {
  --ivory: #f7f4ef;        /* page background */
  --ivory-dark: #ede9e2;   /* section backgrounds */
  --stone: #d4cfc8;        /* borders, dividers */
  --ink: #1c1917;          /* primary text */
  --ink-mid: #44403c;      /* secondary text */
  --ink-light: #78716c;    /* tertiary / labels */
  --gold: #b8985a;         /* accent — badges, CTAs, labels */
  --gold-light: #d4b87a;   /* accent light — footer, hover states */
}
```

## Switch variants

`SwitchCanvas` accepts a `variant` prop: `'hero'` | `'linear'` | `'tactile'` | `'clicky'`

Each maps to a different stem colour:
- `hero` → gold stem, black keycap
- `linear` → red stem
- `tactile` → blue stem
- `clicky` → green stem

Pass `bg` (hex number) to match the card background and `spin` (float) to control rotation speed.

## License

MIT
