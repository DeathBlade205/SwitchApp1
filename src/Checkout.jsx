import { useEffect, useState } from 'react'
import { useCart } from './CartContext'
import { formatMoney } from './data'
import { shopifyEnabled } from './shopify/client'

const FIELDS = [
  { name: 'email',   label: 'Email',       placeholder: 'you@example.com',      col: 2, type: 'email' },
  { name: 'name',    label: 'Full name',   placeholder: 'Jane Doe',             col: 2 },
  { name: 'address', label: 'Address',     placeholder: '123 Keystroke St',     col: 2 },
  { name: 'city',    label: 'City',        placeholder: 'Sydney',               col: 1 },
  { name: 'zip',     label: 'Postcode',    placeholder: '2000',                 col: 1 },
  { name: 'card',    label: 'Card number', placeholder: '4242 4242 4242 4242',  col: 2 },
  { name: 'exp',     label: 'Expiry',      placeholder: 'MM/YY',                col: 1 },
  { name: 'cvc',     label: 'CVC',         placeholder: '123',                  col: 1 },
]

export default function Checkout({ onClose }) {
  const { lines, subtotal, shipping, total, clear, checkoutUrl } = useCart()
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(null) // order number once placed

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && !placing) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, placing])

  // Shopify mode: this app never touches card data — handing off to
  // Shopify's hosted checkout is the standard, PCI-compliant way to take
  // real payment from a custom storefront. clear() runs on return via
  // CartProvider's restore effect finding an empty/completed cart next load.
  useEffect(() => {
    if (shopifyEnabled && checkoutUrl) window.location.href = checkoutUrl
  }, [checkoutUrl])

  if (shopifyEnabled) {
    return (
      <div className="checkout-overlay">
        <div className="checkout-modal" role="dialog" aria-modal="true">
          <div className="checkout-done">
            <h2 className="checkout-done-title">Taking you to checkout…</h2>
            <p className="checkout-done-sub">
              {checkoutUrl
                ? "Redirecting to Shopify's secure checkout."
                : 'Preparing your order — one moment.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    FIELDS.forEach(f => { if (!(form[f.name] || '').trim()) e[f.name] = 'Required' })
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Invalid email'
    if (form.card && form.card.replace(/\s/g, '').length < 12) e.card = 'Invalid card'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setPlacing(true)
    // Simulate a payment/network round-trip
    setTimeout(() => {
      setDone('NX-' + Math.random().toString(36).slice(2, 8).toUpperCase())
      clear()
      setPlacing(false)
    }, 1400)
  }

  return (
    <div className="checkout-overlay" onClick={() => !placing && onClose()}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {done ? (
          <div className="checkout-done">
            <div className="checkout-check">✓</div>
            <h2 className="checkout-done-title">Order Confirmed</h2>
            <p className="checkout-done-sub">
              Thank you. A confirmation has been sent to your email. Your switches are
              being hand-lubed and inspected before they ship.
            </p>
            <p className="checkout-order-no">Order <strong>{done}</strong></p>
            <button className="btn-primary" onClick={onClose}>Continue</button>
          </div>
        ) : (
          <>
            <div className="checkout-head">
              <h2 className="checkout-title">Checkout</h2>
              <button className="cart-close" onClick={onClose} aria-label="Close checkout">✕</button>
            </div>

            <div className="checkout-grid">
              <form className="checkout-form" onSubmit={submit} noValidate>
                <p className="checkout-section-label">Contact & Shipping</p>
                <div className="checkout-fields">
                  {FIELDS.map(f => (
                    <label key={f.name} className={`field col-${f.col} ${errors[f.name] ? 'err' : ''}`}>
                      <span className="field-label">{f.label}{errors[f.name] && <em> — {errors[f.name]}</em>}</span>
                      <input
                        type={f.type || 'text'}
                        placeholder={f.placeholder}
                        value={form[f.name] || ''}
                        onChange={e => update(f.name, e.target.value)}
                        autoComplete="off"
                      />
                    </label>
                  ))}
                </div>
                <button className="btn-primary checkout-pay" type="submit" disabled={placing}>
                  {placing ? 'Processing…' : `Pay ${formatMoney(total)}`}
                </button>
                <p className="checkout-note">Demo store — no real payment is processed.</p>
              </form>

              <aside className="checkout-summary">
                <p className="checkout-section-label">Order Summary</p>
                <div className="checkout-summary-lines">
                  {lines.map(l => (
                    <div className="checkout-sum-line" key={l.id}>
                      <span>{l.name} <em>× {l.qty}</em></span>
                      <span>{formatMoney(l.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="cart-row"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                <div className="cart-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatMoney(shipping)}</span></div>
                <div className="cart-row cart-row-total"><span>Total</span><span>{formatMoney(total)}</span></div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
