# Shopify integration setup

This app talks to Shopify through the **Storefront API** (GraphQL) for products and cart, and hands off to Shopify's **hosted checkout** for payment — no card data ever touches this codebase. Until it's configured, the app runs exactly as it did before: mock products from `src/data.js` and a fake demo checkout (no real payment).

## 1. Create a store

Use an existing Shopify store, or create a free development store via [Shopify Partners](https://partners.shopify.com) (Partners account → Stores → Add store → Development store).

## 2. Generate a Storefront API token

In the Shopify admin: **Settings → Apps and sales channels → Develop apps → Create an app**.

- Give it a name (e.g. "nexus-commerce storefront").
- **Configuration → Storefront API** → enable these scopes:
  - `unauthenticated_read_product_listings`
  - `unauthenticated_read_product_inventory`
  - `unauthenticated_write_checkouts` (or `unauthenticated_write_carts` on newer API versions — enable whichever your store offers)
  - `unauthenticated_read_checkouts` / `unauthenticated_read_carts`
- **Install app**, then **API credentials** tab → copy the **Storefront API access token** (NOT the Admin API token — those are different and the Admin token must never ship to a browser).

## 3. Configure this app

```bash
cp .env.example .env
```

Fill in:

```
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Restart `npm run dev` (Vite only reads `.env` at startup). The product grid, hero keycaps, and cart now read from Shopify; "Add to Cart" creates/updates a real Shopify cart; the Checkout step redirects to Shopify's hosted checkout for payment.

## 4. (Optional) Custom spec metafields

The product grid shows `type` / `force` / `travel` / `sound` (e.g. "Linear", "45g", "4.0mm", "Thock") and an `accent` (which switch illustration colors to use: `linear`/`tactile`/`clicky`) and `flagship` (shows an "Editor's Pick" badge). None of these are native Shopify product fields — they're optional **metafields** this app reads under namespace `custom`. Without them, the UI shows "—" for the spec row and rotates through the three accent colors by product order.

To wire them up: **Settings → Custom data → Products → Add definition**, namespace `custom`, for each of: `type`, `force`, `travel`, `sound`, `accent` (single line text), `flagship` (boolean). Then set values per product.

## What's NOT wired up yet

- **Real-time shipping**: the cart drawer's "free shipping over $X" hint is a local display estimate (`FREE_SHIP_OVER` in `src/data.js`), not Shopify's actual shipping rates — those are calculated correctly on Shopify's hosted checkout page itself, just not previewed in this app's cart drawer.
- **Inventory beyond in-stock/sold-out**: `availableForSale` disables the Add to Cart button, but quantity-available / low-stock messaging isn't surfaced.
- **Discount codes, customer accounts, order history**: out of scope for this pass — Shopify's hosted checkout handles discount codes natively once you're redirected there.

## Files involved

- `src/shopify/client.js` — the GraphQL fetch wrapper + `shopifyEnabled` flag every call site checks.
- `src/shopify/queries.js` — all GraphQL query/mutation strings.
- `src/shopify/mapProduct.js` — maps a Storefront API product into this app's existing display shape.
- `src/hooks/useProducts.js` — fetches (and caches) the product list; falls back to `src/data.js`'s `SWITCHES` when unconfigured.
- `src/CartContext.jsx` — cart state; talks to the real Shopify Cart API when configured, otherwise the original localStorage-backed mock cart.
- `src/Checkout.jsx` — redirects to `cart.checkoutUrl` when configured, otherwise the original fake demo form.
