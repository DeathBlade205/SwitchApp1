import { useState, useEffect, useRef } from 'react'
import Loader from './Loader'
import HeroCanvas from './HeroCanvas'
import HeroKeycaps from './HeroKeycaps'
import SwitchIllustration from './SwitchIllustration.jsx'
import AnatomySection from './AnatomySection'
import ErrorBoundary from './ErrorBoundary'
import Cart from './Cart'
import { useCart } from './CartContext'
import { setupScrollAnimations } from './ScrollAnimations'
import { useProducts } from './hooks/useProducts'
import { SPECS_HERO, SPECS, PROCESS } from './data'
import './index.css'

export default function App() {
  const [siteVisible, setSiteVisible] = useState(false)
  const [skipLoader,  setSkipLoader]  = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const cursorRef = useRef(null)
  const cart = useCart()
  const { products } = useProducts()

  useEffect(() => {
    if (sessionStorage.getItem('nexus_seen') === '1') {
      setSkipLoader(true)
      setSiteVisible(true)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const move = e => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
    }
    const over = e => {
      const h = !!e.target.closest('button,a,.prod-card,.process-step')
      cursorRef.current?.classList.toggle('hover', h)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', over) }
  }, [])

  useEffect(() => {
    if (!siteVisible) return
    sessionStorage.setItem('nexus_seen', '1')
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 80)
      }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    const t = setTimeout(() => setupScrollAnimations(), 200)
    return () => { obs.disconnect(); clearTimeout(t) }
  }, [siteVisible])

  const closeMenu = () => setMenuOpen(false)
  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  const openCart = () => { setMenuOpen(false); cart.setOpen(true) }

  return (
    <>
      <div id="cursor" ref={cursorRef} />
      {!skipLoader && <Loader onComplete={() => setSiteVisible(true)} />}

      <div id="site" className={siteVisible ? 'visible' : ''}>

        {/* NAV */}
        <nav>
          <div className="nav-logo">Nexus</div>
          <div className="nav-links">
            <a href="#collection">Collection</a>
            <a href="#anatomy">Anatomy</a>
            <a href="#specs">Specifications</a>
            <a href="#process">Craft</a>
          </div>
          <div className="nav-right">
            <button className="nav-cta" onClick={() => scrollTo('collection')}>Shop</button>
            <button className="cart-btn" onClick={openCart} aria-label={`Open cart, ${cart.count} items`}>
              <CartIcon />
              {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
            </button>
            <button
              className={`nav-burger ${menuOpen ? 'open' : ''}`}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mobile-menu" role="dialog" aria-label="Navigation">
            <a href="#collection" onClick={closeMenu}>Collection</a>
            <a href="#anatomy"    onClick={closeMenu}>Anatomy</a>
            <a href="#specs"      onClick={closeMenu}>Specifications</a>
            <a href="#process"    onClick={closeMenu}>Craft</a>
            <a href="#contact"    onClick={closeMenu}>Contact</a>
            <button className="mobile-menu-cart" onClick={openCart}>Cart ({cart.count})</button>
          </div>
        )}

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
                <button className="btn-primary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>
                  Shop Collection
                </button>
                <button className="btn-ghost" onClick={() => document.getElementById('anatomy')?.scrollIntoView({ behavior: 'smooth' })}>
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

        {/* COLLECTION */}
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
              {products.map((sw, i) => (
                <div className={`prod-card reveal ${sw.flagship ? 'prod-flagship' : ''}`} key={i}>
                  {sw.flagship && <div className="prod-pick">Editor's Pick</div>}
                  <div className="prod-canvas-wrap">
                    <SwitchIllustration variant={sw.variant} darkBg={true} />
                  </div>
                  <div className="prod-body">
                    <div className="prod-head">
                      <h3 className="prod-name">{sw.name}</h3>
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
            <button className="btn-primary" onClick={() => scrollTo('collection')}>Shop the Collection</button>
            <button className="btn-ghost" onClick={() => scrollTo('process')}>Our Process</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer id="contact" className="footer-v2">
          <div className="footer-v2-inner">
            <p className="footer-logo">Nexus</p>
            <p className="footer-tagline">Precision switches. Sydney.</p>
            <div className="footer-meta">
              <a href="mailto:hello@nexus.co">hello@nexus.co</a>
              <span>·</span>
              <a href="#">@nexus.switches</a>
              <span>·</span>
              <span>© 2025 Nexus</span>
            </div>
          </div>
        </footer>

      </div>

      {/* CART DRAWER + CHECKOUT + TOAST */}
      <Cart />
      <Toast />
    </>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function Toast() {
  const { toast, toastShow, setToastShow, setOpen } = useCart()
  // toast content persists after hide, so text stays during the slide-out
  return (
    <div
      className={`toast ${toastShow ? 'show' : ''}`}
      onClick={() => { setToastShow(false); setOpen(true) }}
    >
      <span className="toast-check">✓</span>
      <span><strong>{toast?.name}</strong> added to cart</span>
      <span className="toast-view">View →</span>
    </div>
  )
}
