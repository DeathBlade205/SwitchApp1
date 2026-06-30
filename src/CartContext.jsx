/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { FREE_SHIP_OVER, SHIP_FLAT } from './data'
import { useProducts } from './hooks/useProducts'
import { shopifyEnabled, shopifyFetch } from './shopify/client'
import { CART_CREATE, CART_QUERY, CART_LINES_ADD, CART_LINES_UPDATE, CART_LINES_REMOVE } from './shopify/queries'

const CartContext = createContext(null)
const STORAGE_KEY = 'nexus-cart'
const SHOPIFY_CART_ID_KEY = 'nexus-shopify-cart-id'

// A live Shopify cart's lines only carry merchandise/price info, not this
// app's display fields (tagline, illustration variant, etc.) — cross-
// reference back to the fetched catalog by variant id so Cart.jsx/
// Checkout.jsx see the same line shape regardless of mode.
function shopifyLinesToDisplayLines(cart, products) {
  if (!cart) return []
  return cart.lines.nodes.map(line => {
    const variantId = line.merchandise.id
    const product = products.find(p => p.shopifyVariantId === variantId)
    const unitPrice = Number(line.merchandise.price.amount)
    return {
      ...(product ?? {
        id: line.merchandise.product.handle,
        name: line.merchandise.product.title,
        variant: 'hero',
        setPrice: '',
      }),
      shopifyLineId: line.id,
      qty: line.quantity,
      lineTotal: unitPrice * line.quantity,
    }
  })
}

export function CartProvider({ children }) {
  const { products } = useProducts()
  const productsRef = useRef(products)
  useEffect(() => { productsRef.current = products }, [products])

  // Local-mode cart shape: { [productId]: qty }. Unused once a Shopify
  // cart exists, but kept so the app still works with zero env vars set.
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // Shopify-mode cart: the live cart object from the Storefront API
  // (id, checkoutUrl, lines, cost) — the source of truth once it exists.
  const [shopifyCart, setShopifyCart] = useState(null)
  const [shopifyLoading, setShopifyLoading] = useState(false)

  const [open, setOpen] = useState(false)
  // toast content persists; toastShow drives the slide animation
  const [toast, setToast] = useState(null)
  const [toastShow, setToastShow] = useState(false)

  useEffect(() => {
    if (shopifyEnabled) return // Shopify mode persists via the cart id below, not this key
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items])

  // Restore a previous session's Shopify cart, if any. A stored id that's
  // expired/invalid on the server just gets dropped — the next add() makes
  // a fresh cart.
  useEffect(() => {
    if (!shopifyEnabled) return
    const id = localStorage.getItem(SHOPIFY_CART_ID_KEY)
    if (!id) return
    setShopifyLoading(true)
    shopifyFetch(CART_QUERY, { id })
      .then(data => {
        if (data.cart) setShopifyCart(data.cart)
        else localStorage.removeItem(SHOPIFY_CART_ID_KEY)
      })
      .catch(err => {
        console.error('Failed to restore Shopify cart:', err)
        localStorage.removeItem(SHOPIFY_CART_ID_KEY)
      })
      .finally(() => setShopifyLoading(false))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToastShow(false), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const add = useCallback(async (id, qty = 1) => {
    const product = productsRef.current.find(p => p.id === id)

    if (shopifyEnabled && product?.shopifyVariantId) {
      setShopifyLoading(true)
      try {
        const data = shopifyCart
          ? await shopifyFetch(CART_LINES_ADD, {
              cartId: shopifyCart.id,
              lines: [{ merchandiseId: product.shopifyVariantId, quantity: qty }],
            })
          : await shopifyFetch(CART_CREATE, {
              lines: [{ merchandiseId: product.shopifyVariantId, quantity: qty }],
            })
        const cart = data.cartCreate?.cart ?? data.cartLinesAdd?.cart
        const userErrors = data.cartCreate?.userErrors ?? data.cartLinesAdd?.userErrors
        if (userErrors?.length) throw new Error(userErrors.map(e => e.message).join('; '))
        setShopifyCart(cart)
        localStorage.setItem(SHOPIFY_CART_ID_KEY, cart.id)
      } catch (err) {
        console.error('Failed to add to Shopify cart:', err)
      } finally {
        setShopifyLoading(false)
      }
    } else {
      setItems(prev => ({ ...prev, [id]: (prev[id] || 0) + qty }))
    }

    setToast({ name: product?.name, n: Date.now() })
    setToastShow(true)
  }, [shopifyCart])

  const setQty = useCallback(async (id, qty) => {
    if (shopifyEnabled && shopifyCart) {
      const product = productsRef.current.find(p => p.id === id)
      const line = shopifyCart.lines.nodes.find(l => l.merchandise.id === product?.shopifyVariantId)
      if (!line) return
      setShopifyLoading(true)
      try {
        const data = qty <= 0
          ? await shopifyFetch(CART_LINES_REMOVE, { cartId: shopifyCart.id, lineIds: [line.id] })
          : await shopifyFetch(CART_LINES_UPDATE, { cartId: shopifyCart.id, lines: [{ id: line.id, quantity: qty }] })
        const cart = data.cartLinesRemove?.cart ?? data.cartLinesUpdate?.cart
        setShopifyCart(cart)
      } catch (err) {
        console.error('Failed to update Shopify cart line:', err)
      } finally {
        setShopifyLoading(false)
      }
      return
    }
    setItems(prev => {
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }, [shopifyCart])

  const remove = useCallback((id) => setQty(id, 0), [setQty])

  const clear = useCallback(() => {
    if (shopifyEnabled) {
      setShopifyCart(null)
      localStorage.removeItem(SHOPIFY_CART_ID_KEY)
      return
    }
    setItems({})
  }, [])

  const lines = shopifyEnabled
    ? shopifyLinesToDisplayLines(shopifyCart, products)
    : Object.entries(items)
        .map(([id, qty]) => {
          const p = products.find(s => s.id === id)
          if (!p) return null
          return { ...p, qty, lineTotal: p.setPriceNum * qty }
        })
        .filter(Boolean)

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0)
  // Real shipping is calculated by Shopify on the hosted checkout page from
  // the buyer's address — this threshold is a local display-only estimate
  // for the cart drawer, not what gets charged.
  const shipping = subtotal > 0 && subtotal < FREE_SHIP_OVER ? SHIP_FLAT : 0
  const total = subtotal + shipping

  const value = {
    items, lines, count, subtotal, shipping, total,
    open, setOpen, toast, toastShow, setToastShow,
    add, setQty, remove, clear,
    FREE_SHIP_OVER,
    // Shopify-mode extras — undefined/false in local-mock mode.
    checkoutUrl: shopifyCart?.checkoutUrl ?? null,
    shopifyLoading,
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
