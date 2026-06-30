const DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const API_VERSION = '2025-01'

// True once both env vars are set — every call site checks this before
// touching the network, so the app runs on local fallback data (see
// data.js) until a real store is wired up.
export const shopifyEnabled = Boolean(DOMAIN && TOKEN)

const ENDPOINT = shopifyEnabled
  ? `https://${DOMAIN}/api/${API_VERSION}/graphql.json`
  : null

export async function shopifyFetch(query, variables = {}) {
  if (!shopifyEnabled) {
    throw new Error('shopifyFetch called without VITE_SHOPIFY_STORE_DOMAIN / VITE_SHOPIFY_STOREFRONT_TOKEN set')
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    throw new Error(`Shopify Storefront API ${res.status}: ${await res.text()}`)
  }
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(`Shopify Storefront API: ${json.errors.map(e => e.message).join('; ')}`)
  }
  return json.data
}
