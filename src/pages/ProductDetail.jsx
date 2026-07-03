import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SwitchIllustration from '../SwitchIllustration.jsx'
import { useCart } from '../CartContext'
import { useProducts } from '../hooks/useProducts'
import { accentBgFor } from '../theme'
import { SET_KEYS } from '../data'

export default function ProductDetail() {
  const { handle } = useParams()
  const cart = useCart()
  const { products, loading } = useProducts()
  const [qty, setQty] = useState(1)

  const product = products.find(p => p.id === handle)
  const related = products.filter(p => p.id !== handle).slice(0, 3)

  if (loading) {
    return (
      <section className="section-wrap">
        <p className="shop-empty">Loading…</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="section-wrap product-not-found">
        <span className="sec-label">Not Found</span>
        <h1 className="sec-title">That switch isn't<br /><em>in the collection.</em></h1>
        <Link className="btn-primary" to="/shop">Back to Shop</Link>
      </section>
    )
  }

  const sw = product

  return (
    <section className="product-page">
      <div className="section-wrap">
        <div className="product-crumb reveal">
          <Link to="/shop">Shop</Link> <span>/</span> <span>{sw.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-media" style={{ '--accent-bg': accentBgFor(sw.variant) }}>
            {sw.flagship && <span className="shop-card-badge">Editor's Pick</span>}
            <SwitchIllustration variant={sw.variant} darkBg />
          </div>

          <div className="product-info">
            <p className="sec-label">{sw.type !== '—' ? sw.type : 'Mechanical Switch'}</p>
            <h1 className="product-title">{sw.name}</h1>
            <p className="product-tagline">{sw.tagline}</p>

            <div className="product-price-block">
              <p className="product-price">{sw.setPrice}</p>
              <p className="product-price-sub">{sw.price} · {SET_KEYS}-key build</p>
            </div>

            <div className="prod-specs-row product-specs">
              <div className="prod-spec"><p className="prod-spec-label">Type</p><p className="prod-spec-val">{sw.type}</p></div>
              <div className="prod-spec"><p className="prod-spec-label">Force</p><p className="prod-spec-val">{sw.force}</p></div>
              <div className="prod-spec"><p className="prod-spec-label">Travel</p><p className="prod-spec-val">{sw.travel}</p></div>
              <div className="prod-spec"><p className="prod-spec-label">Sound</p><p className="prod-spec-val">{sw.sound}</p></div>
            </div>

            <div className="product-buy-row">
              <div className="qty-stepper" role="group" aria-label="Quantity">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button
                className="btn-primary product-add"
                onClick={() => cart.add(sw.id, qty)}
                disabled={sw.availableForSale === false}
              >
                {sw.availableForSale === false ? 'Sold Out' : `Add ${qty > 1 ? qty + ' ' : ''}to Cart`}
              </button>
            </div>

            <p className="product-note">Hand-inspected. Krytox 205g0. PTFE-filmed. Ships in 3–5 days.</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="product-related">
            <span className="sec-label reveal">You Might Also Like</span>
            <div className="shop-grid shop-grid-related">
              {related.map(r => (
                <div className="shop-card reveal" key={r.id} style={{ '--accent-bg': accentBgFor(r.variant) }}>
                  <Link to={`/products/${r.id}`} className="prod-media-link" aria-label={`View ${r.name}`}>
                    <div className="shop-card-canvas">
                      <SwitchIllustration variant={r.variant} darkBg />
                    </div>
                  </Link>
                  <div className="shop-card-body">
                    <Link to={`/products/${r.id}`} className="prod-name-link"><h3 className="prod-name">{r.name}</h3></Link>
                    <div className="shop-card-foot">
                      <p className="prod-price">{r.setPrice}</p>
                      <button className="prod-buy" onClick={() => cart.add(r.id)}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
