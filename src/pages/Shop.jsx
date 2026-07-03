import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SwitchIllustration from '../SwitchIllustration.jsx'
import { useCart } from '../CartContext'
import { useProducts } from '../hooks/useProducts'
import { accentBgFor } from '../theme'

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0) },
  'price-asc': { label: 'Price: Low to High', fn: (a, b) => a.setPriceNum - b.setPriceNum },
  'price-desc': { label: 'Price: High to Low', fn: (a, b) => b.setPriceNum - a.setPriceNum },
  name: { label: 'Name: A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

export default function Shop() {
  const cart = useCart()
  const { products, loading } = useProducts()
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('featured')

  const types = useMemo(() => {
    const seen = new Map()
    for (const p of products) if (!seen.has(p.variant)) seen.set(p.variant, p.variant)
    return [...seen.keys()]
  }, [products])

  const shown = useMemo(() => {
    const filtered = type === 'all' ? products : products.filter(p => p.variant === type)
    return [...filtered].sort(SORTS[sort].fn)
  }, [products, type, sort])

  return (
    <section className="shop-page">
      <div className="section-wrap">
        <div className="shop-header">
          <div>
            <span className="sec-label reveal">Full Range</span>
            <h1 className="sec-title reveal">Shop<br /><em>the Collection.</em></h1>
          </div>
          <p className="shop-header-sub reveal">
            {products.length} switch{products.length === 1 ? '' : 'es'}, hand-inspected before it ships.
          </p>
        </div>

        <div className="shop-toolbar">
          <div className="shop-filter" role="group" aria-label="Filter by switch type">
            <button
              className={`shop-pill ${type === 'all' ? 'active' : ''}`}
              onClick={() => setType('all')}
            >
              All
            </button>
            {types.map(t => (
              <button
                key={t}
                className={`shop-pill ${type === t ? 'active' : ''}`}
                style={{ '--pill-accent': accentBgFor(t) }}
                onClick={() => setType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <label className="shop-sort">
            <span>Sort</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="shop-empty">Loading collection…</p>
        ) : shown.length === 0 ? (
          <p className="shop-empty">No switches match that filter.</p>
        ) : (
          <div className="shop-grid">
            {shown.map(sw => (
              <div className="shop-card reveal" key={sw.id} style={{ '--accent-bg': accentBgFor(sw.variant) }}>
                <Link to={`/products/${sw.id}`} className="prod-media-link" aria-label={`View ${sw.name}`}>
                  <div className="shop-card-canvas">
                    <SwitchIllustration variant={sw.variant} darkBg />
                    {sw.flagship && <span className="shop-card-badge">Editor's Pick</span>}
                  </div>
                </Link>
                <div className="shop-card-body">
                  <Link to={`/products/${sw.id}`} className="prod-name-link"><h3 className="prod-name">{sw.name}</h3></Link>
                  <p className="prod-tagline">{sw.tagline}</p>
                  <div className="shop-card-foot">
                    <p className="prod-price">{sw.setPrice}</p>
                    <button
                      className="prod-buy"
                      onClick={() => cart.add(sw.id)}
                      disabled={sw.availableForSale === false}
                    >
                      {sw.availableForSale === false ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
