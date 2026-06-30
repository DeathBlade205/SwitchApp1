// Custom product metafields this storefront reads (namespace "custom" —
// Shopify's default namespace for metafields defined in the admin UI
// without a companion app). None are required: every field has a fallback
// in mapProduct.js, so products display fine even on a fresh store with no
// metafield definitions set up yet. See SHOPIFY_SETUP.md.
const METAFIELDS = `
  metafields(identifiers: [
    {namespace: "custom", key: "type"},
    {namespace: "custom", key: "force"},
    {namespace: "custom", key: "travel"},
    {namespace: "custom", key: "sound"},
    {namespace: "custom", key: "accent"},
    {namespace: "custom", key: "flagship"},
  ]) {
    key
    value
  }
`

export const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        descriptionHtml
        ${METAFIELDS}
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        variants(first: 1) {
          nodes {
            id
            availableForSale
            price { amount currencyCode }
          }
        }
      }
    }
  }
`

const CART_FIELDS = `
  id
  checkoutUrl
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      merchandise {
        ... on ProductVariant {
          id
          price { amount currencyCode }
          product {
            handle
            title
            featuredImage { url altText }
          }
        }
      }
    }
  }
`

export const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`

export const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) { ${CART_FIELDS} }
  }
`

export const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`

export const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`

export const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message }
    }
  }
`
