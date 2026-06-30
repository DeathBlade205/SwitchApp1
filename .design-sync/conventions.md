## Wrapping and setup

Components that read cart state — `Cart`, `Checkout` — must be rendered inside `<CartProvider>` (exported from this package alongside the components). Without it, `useCart()` throws `"useCart must be used within CartProvider"`. There is no theme/i18n provider — `CartProvider` is the only context this library needs.

```jsx
import { CartProvider, Cart, Checkout, HeroKeycaps } from 'nexus-commerce'

<CartProvider>
  <HeroKeycaps onPick={() => {}} />
  <Cart />
</CartProvider>
```

`CartProvider` persists cart state to `localStorage` and exposes `useCart()` returning `{ items, lines, count, subtotal, shipping, total, open, setOpen, add, setQty, remove, clear }`. `Cart`/`Checkout` read everything from that hook, not from props — to show a populated/open cart, call `cart.add(id, qty)` and `cart.setOpen(true)` rather than passing props.

## Styling idiom

Plain hand-written CSS, no CSS-in-JS, no utility framework. Components use literal class names (BEM-ish, hyphenated, no modules/scoping) — e.g. `btn-primary`, `cart-drawer`, `cart-line`, `checkout-modal`, `keycap`, `keycap-cap`. Reuse these exact names for new layout glue that should look native to the system; inventing new ones is fine for structure but won't pick up the system's look unless it composes the existing classes.

Color/spacing values are CSS custom properties defined once in `:root` (shipped inside `_ds_bundle.css`):

| Token | Value | Use |
|---|---|---|
| `--ivory` | `#f7f4ef` | page/card background |
| `--ivory-dark` | `#ede9e2` | secondary surface |
| `--ink` | `#1c1917` | primary text, dark fills |
| `--ink-mid` / `--ink-light` | `#44403c` / `#78716c` | secondary/tertiary text |
| `--gold` / `--gold-light` / `--gold-dim` | `#b8985a` / `#d4b87a` / `rgba(184,152,90,.15)` | brand accent, borders, glows |
| `--gold-text` | `#7a5e2a` | accent text (AA-contrast on ivory) |
| `--white` / `--stone` | `#fdfcfa` / `#d4cfc8` | overlays, dividers |

Use `var(--token-name)`, never hex literals, when extending these components.

Typography: `'Playfair Display'` (serif, headings/prices) and `'DM Sans'` (body) and `'DM Mono'` (uppercase labels/meta), loaded via a remote Google Fonts `@import` already present in `styles.css` — no local font files ship with this bundle.

## Where the truth lives

Read `styles.css` (root) and its one `@import` target, `_ds_bundle.css`, before styling anything new — that's the complete, real stylesheet (every class above is defined there) and the font `@import`. Per-component usage notes are in each `<Name>.prompt.md`.

## Build snippet

```jsx
import { CartProvider, HeroKeycaps, Cart, Checkout } from 'nexus-commerce'

function Storefront() {
  return (
    <CartProvider>
      <section style={{ background: 'var(--ivory)', padding: '3rem 2rem' }}>
        <HeroKeycaps onPick={(variant) => console.log('picked', variant)} />
      </section>
      <Cart />
    </CartProvider>
  )
}
```
