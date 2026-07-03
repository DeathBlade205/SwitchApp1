import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import HeroCanvas from '../HeroCanvas'
import HeroKeycaps from '../HeroKeycaps'
import SwitchIllustration from '../SwitchIllustration.jsx'
import AnatomySection from '../AnatomySection'
import ErrorBoundary from '../ErrorBoundary'
import { useCart } from '../CartContext'
import { useProducts } from '../hooks/useProducts'
import { accentBgFor } from '../theme'
import { SPECS_HERO, SPECS, PROCESS } from '../data'

export default function Home() {
  const cart = useCart()
  const { products } = useProducts()
  const location = useLocation()

  // Layout's nav links to in-page anchors as `/#anatomy` etc. — a client-side
  // route change doesn't get the browser's native hash-scroll, so do it
  // ourselves once this page (and its .reveal targets) have mounted. Fires
  // after Layout's own setupScrollAnimations() call (its 200ms timeout) —
  // GSAP ScrollTrigger.refresh() briefly scrolls to 0 to measure pinned
  // elements and restores the scroll position it saw at refresh time, which
  // stomps an in-flight scrollIntoView if this runs first.
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 350)
    return () => clearTimeout(t)
  }, [location.hash])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* HERO */}
      <section className="hero hero-v2">
        <ErrorBoundary><HeroCanvas /></ErrorBoundary>
        <div className="hero-inner">
          <div className="hero-left">
            <p className="hero-eyebrow">Nº 01 — 2026 Collection</p>
            <h1 className="hero-title">
              <span className="ht"><span>The Art</span></span>
              <span className="ht"><span>of the</span></span>
              <span className="ht"><span><em>Keystroke.</em></span></span>
            </h1>
            <p className="hero-desc">
              Hand-lubed, hand-tuned mechanical switches.
              Built in Sydney, made for those who hear the difference.
            </p>
            <div className="hero-actions">
              <Link className="btn-primary" to="/shop">
                Shop Collection
              </Link>
              <button className="btn-ghost" onClick={() => scrollTo('anatomy')}>
                See Inside
              </button>
            </div>
            <div className="hero-specs">
              <div className="spec-item"><p className="spec-label">Actuation</p><p className="spec-val">45g</p></div>
              <div className="spec-item"><p className="spec-label">Travel</p><p className="spec-val">4.0mm</p></div>
              <div className="spec-item"><p className="spec-label">Lifespan</p><p className="spec-val">100M</p></div>
              <div className="spec-item"><p className="spec-label">Material</p><p className="spec-val">POM / PC</p></div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-side-rail" aria-hidden="true">
              <span>Nº</span><span>01</span><span>—</span><span>03</span>
            </div>
            <HeroKeycaps onPick={() => scrollTo('collection')} />
            <p className="hero-label">Three switches · One standard</p>
          </div>
        </div>
        <div className="hero-bleed" aria-hidden="true">NEXUS</div>
      </section>

      {/* COLLECTION PREVIEW */}
      <section id="collection">
        <div className="section-wrap">
          <div className="products-header">
            <div>
              <span className="sec-label reveal">2025 Collection</span>
              <h2 className="sec-title reveal">Three Switches.<br /><em>One Standard.</em></h2>
            </div>
            <p className="products-header-right reveal">
              Hand-inspected. Krytox 205g0. PTFE-filmed.
              Built one batch at a time.
            </p>
          </div>

          <div className="products-grid">
            {[...products]
              .sort((a, b) => (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0))
              .map((sw, i) => (
              <div
                className={`prod-card reveal ${sw.flagship ? 'prod-flagship' : ''} ${i === 0 ? 'prod-feature' : ''}`}
                key={sw.id ?? i}
                style={{ '--accent-bg': accentBgFor(sw.variant) }}
              >
                <span className="prod-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                {sw.flagship && <div className="prod-pick">Editor's Pick</div>}
                <Link to={`/products/${sw.id}`} className="prod-media-link" aria-label={`View ${sw.name}`}>
                  <div className="prod-canvas-wrap">
                    <SwitchIllustration variant={sw.variant} darkBg={true} />
                  </div>
                </Link>
                <div className="prod-body">
                  <div className="prod-head">
                    <Link to={`/products/${sw.id}`} className="prod-name-link"><h3 className="prod-name">{sw.name}</h3></Link>
                    <p className="prod-tagline">{sw.tagline}</p>
                  </div>
                  <div className="prod-specs-row">
                    <div className="prod-spec"><p className="prod-spec-label">Type</p><p className="prod-spec-val">{sw.type}</p></div>
                    <div className="prod-spec"><p className="prod-spec-label">Force</p><p className="prod-spec-val">{sw.force}</p></div>
                    <div className="prod-spec"><p className="prod-spec-label">Travel</p><p className="prod-spec-val">{sw.travel}</p></div>
                    <div className="prod-spec"><p className="prod-spec-label">Sound</p><p className="prod-spec-val">{sw.sound}</p></div>
                  </div>
                  <div className="prod-price-row">
                    <div>
                      <p className="prod-price">{sw.setPrice}</p>
                      <p className="prod-price-sub">{sw.price} · 65-key build</p>
                    </div>
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

          <div className="products-footer reveal">
            <Link className="btn-ghost" to="/shop">View Full Collection →</Link>
          </div>
        </div>
      </section>

      {/* ANATOMY */}
      <AnatomySection />

      {/* SPECS */}
      <section id="specs" className="specs-section specs-v2">
        <div className="specs-inner-v2">
          <span className="sec-label reveal">Engineering</span>
          <h2 className="sec-title reveal">Built<br /><em>to last.</em></h2>

          <div className="specs-grid-v2">
            {SPECS_HERO.map((s, i) => (
              <div className="spec-block reveal" key={i}>
                <p className="spec-block-num">{s.num}</p>
                <p className="spec-block-unit">{s.unit}</p>
                <p className="spec-block-label">{s.label}</p>
              </div>
            ))}
          </div>

          <details className="specs-deep">
            <summary>Full technical sheet</summary>
            <div className="specs-list">
              {SPECS.map((s, i) => (
                <div className="spec-row" key={i}>
                  <span className="spec-key">{s.key}</span>
                  <span className="spec-value">{s.value}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <div className="section-wrap">
          <span className="sec-label reveal">The Craft</span>
          <h2 className="sec-title reveal">Four steps.<br /><em>One promise.</em></h2>
          <div className="process-grid">
            {PROCESS.map((p, i) => (
              <div className="process-step reveal" key={i}>
                <p className="process-num">0{i + 1}</p>
                <h3 className="process-title">{p.title}</h3>
                <p className="process-body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2 className="cta-title reveal">Feel the<br /><em>Difference.</em></h2>
        <p className="cta-sub reveal">500 units per variant. Free shipping over {`$${cart.FREE_SHIP_OVER}`}.</p>
        <div className="reveal" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn-primary" to="/shop">Shop the Collection</Link>
          <button className="btn-ghost" onClick={() => scrollTo('process')}>Our Process</button>
        </div>
      </div>
    </>
  )
}
