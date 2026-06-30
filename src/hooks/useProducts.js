import { useEffect, useState } from 'react'
import { shopifyEnabled, shopifyFetch } from '../shopify/client'
import { PRODUCTS_QUERY } from '../shopify/queries'
import { mapProduct } from '../shopify/mapProduct'
import { SWITCHES } from '../data'

// Module-level cache so the several components that call useProducts()
// (App.jsx's collection grid, CartContext for variant lookups) share one
// fetch instead of each hitting the Storefront API independently.
let cachedPromise = null
function fetchProducts() {
  if (!cachedPromise) {
    cachedPromise = shopifyFetch(PRODUCTS_QUERY, { first: 12 })
      .then(data => data.products.nodes.map(mapProduct))
      .catch(err => {
        cachedPromise = null // allow a retry on the next mount
        throw err
      })
  }
  return cachedPromise
}

// Real products from the connected Shopify store when VITE_SHOPIFY_* env
// vars are set; otherwise the local mock catalog in data.js, unchanged from
// before this integration existed.
export function useProducts() {
  const [products, setProducts] = useState(shopifyEnabled ? null : SWITCHES)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shopifyEnabled || products) return
    let cancelled = false
    fetchProducts()
      .then(list => { if (!cancelled) setProducts(list) })
      .catch(err => {
        if (cancelled) return
        console.error('Failed to load products from Shopify:', err)
        setError(err)
        setProducts(SWITCHES) // fall back so the page still renders
      })
    return () => { cancelled = true }
  }, [products])

  return { products: products ?? [], loading: products === null, error }
}
