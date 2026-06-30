import { SET_KEYS } from '../data'

const ACCENTS = ['linear', 'tactile', 'clicky']

const metafield = (node, key) =>
  node.metafields?.find(m => m?.key === key)?.value ?? null

const money = (amount) =>
  '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Maps a Storefront API Product node (queries.js PRODUCTS_QUERY) into the
// shape the UI already expects (the same shape src/data.js's SWITCHES
// hardcodes). Every custom-spec field (type/force/travel/sound/accent/
// flagship) is an optional metafield — falls back to a placeholder or a
// deterministic accent rotation so the app renders cleanly on a store that
// hasn't set those metafields up yet. See SHOPIFY_SETUP.md.
export function mapProduct(node, index) {
  const variant = node.variants?.nodes?.[0]
  const setPriceNum = Number(variant?.price?.amount ?? node.priceRange?.minVariantPrice?.amount ?? 0)
  return {
    id: node.handle,
    shopifyProductId: node.id,
    shopifyVariantId: variant?.id ?? null,
    availableForSale: variant?.availableForSale ?? false,
    variant: metafield(node, 'accent') ?? ACCENTS[index % ACCENTS.length],
    name: node.title,
    tagline: node.descriptionHtml?.replace(/<[^>]+>/g, '').trim().slice(0, 120) || '',
    type: metafield(node, 'type') ?? '—',
    force: metafield(node, 'force') ?? '—',
    travel: metafield(node, 'travel') ?? '—',
    sound: metafield(node, 'sound') ?? '—',
    flagship: metafield(node, 'flagship') === 'true',
    price: `${money(setPriceNum / SET_KEYS)} / switch`,
    setPrice: money(setPriceNum),
    setPriceNum,
    image: node.featuredImage ? { url: node.featuredImage.url, alt: node.featuredImage.altText } : null,
  }
}
