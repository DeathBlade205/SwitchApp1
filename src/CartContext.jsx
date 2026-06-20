/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { SWITCHES, FREE_SHIP_OVER, SHIP_FLAT } from './data'

const CartContext = createContext(null)
const STORAGE_KEY = 'nexus-cart'

export function CartProvider({ children }) {
  // cart shape: { [productId]: setCount }
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })
  const [open, setOpen] = useState(false)
  // toast content persists; toastShow drives the slide animation
  const [toast, setToast] = useState(null)
  const [toastShow, setToastShow] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToastShow(false), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const add = useCallback((id, qty = 1) => {
    setItems(prev => ({ ...prev, [id]: (prev[id] || 0) + qty }))
    const p = SWITCHES.find(s => s.id === id)
    setToast({ name: p?.name, n: Date.now() })
    setToastShow(true)
  }, [])

  const setQty = useCallback((id, qty) => {
    setItems(prev => {
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => { const next = { ...prev }; delete next[id]; return next })
  }, [])

  const clear = useCallback(() => setItems({}), [])

  const lines = Object.entries(items)
    .map(([id, qty]) => {
      const p = SWITCHES.find(s => s.id === id)
      if (!p) return null
      return { ...p, qty, lineTotal: p.setPriceNum * qty }
    })
    .filter(Boolean)

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0)
  const shipping = subtotal > 0 && subtotal < FREE_SHIP_OVER ? SHIP_FLAT : 0
  const total = subtotal + shipping

  const value = {
    items, lines, count, subtotal, shipping, total,
    open, setOpen, toast, toastShow, setToastShow,
    add, setQty, remove, clear,
    FREE_SHIP_OVER,
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
