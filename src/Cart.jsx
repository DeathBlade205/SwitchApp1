import { useEffect, useState } from 'react'
import { useCart } from './CartContext'
import { formatMoney, FREE_SHIP_OVER, SET_KEYS } from './data'
import SwitchIllustration from './SwitchIllustration.jsx'
import Checkout from './Checkout'

export default function Cart() {
  const cart = useCart()
  const { open, setOpen, lines, subtotal, shipping, total, count } = cart
  const [checkout, setCheckout] = useState(false)

  // Lock body scroll while drawer or checkout is open
  useEffect(() => {
    const lock = open || checkout
    document.body.style.overflow = lock ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open, checkout])

  // Close drawer on Escape
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <>
      <div className={`cart-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Shopping cart">
        <div className="cart-head">
          <div>
            <p className="cart-head-label">Your Cart</p>
            <p className="cart-head-count">{count} {count === 1 ? 'set' : 'sets'}</p>
          </div>
          <button className="cart-close" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-title">Your cart is empty</p>
            <p className="cart-empty-sub">Add a switch set to feel the difference.</p>
            <button className="btn-primary" onClick={() => setOpen(false)}>Browse Collection</button>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lines.map(l => (
                <div className="cart-line" key={l.id}>
                  <div className="cart-line-thumb">
                    <SwitchIllustration variant={l.variant} darkBg={true} />
                  </div>
                  <div className="cart-line-body">
                    <div className="cart-line-top">
                      <p className="cart-line-name">{l.name}</p>
                      <button className="cart-line-remove" onClick={() => cart.remove(l.id)} aria-label={`Remove ${l.name}`}>Remove</button>
                    </div>
                    <p className="cart-line-meta">{l.setPrice} · {SET_KEYS}-key build</p>
                    <div className="cart-line-bottom">
                      <div className="qty">
                        <button onClick={() => cart.setQty(l.id, l.qty - 1)} aria-label="Decrease quantity">−</button>
                        <span>{l.qty}</span>
                        <button onClick={() => cart.setQty(l.id, l.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <p className="cart-line-total">{formatMoney(l.lineTotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-row">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="cart-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatMoney(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="cart-ship-hint">Add {formatMoney(FREE_SHIP_OVER - subtotal)} more for free shipping</p>
              )}
              <div className="cart-row cart-row-total">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <button className="btn-primary cart-checkout" onClick={() => setCheckout(true)}>
                Checkout
              </button>
              <button className="cart-continue" onClick={() => setOpen(false)}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>

      {checkout && <Checkout onClose={() => setCheckout(false)} />}
    </>
  )
}
