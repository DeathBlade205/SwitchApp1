import { useState, useEffect, useRef } from 'react'
import Loader from './Loader'
import HeroCanvas from './HeroCanvas'
import SwitchCanvas from './SwitchCanvas'
import SwitchIllustration from './SwitchIllustration.jsx'
import AnatomySection from './AnatomySection'
import { setupScrollAnimations } from './ScrollAnimations'
import { SWITCHES, SPECS_HERO, SPECS, PROCESS } from './data'
import './index.css'

export default function App() {
  const [siteVisible, setSiteVisible] = useState(false)
  const [skipLoader,  setSkipLoader]  = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const cursorRef = useRef(null)

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
            <button className="nav-cta">Shop</button>
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
          </div>
        )}

        {/* HERO */}
        <section className="hero hero-v2">
          <HeroCanvas />
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
              <div className="hero-switch-wrap">
                <SwitchCanvas variant="hero" bg={0xede9e2} spin={0.5} explodeProgress={0} showLabels={false} fps={30} />
              </div>
              <p className="hero-label">Nexus Linear — Gold Edition</p>
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
              {SWITCHES.map((sw, i) => (
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
                        <p className="prod-price">{sw.price}</p>
                        <p className="prod-price-sub">{sw.setPrice} for a 65-key build</p>
                      </div>
                      <button className="prod-buy">Notify Me</button>
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
          <p className="cta-sub reveal">500 units per variant. First drop launching 2026.</p>
          <div className="reveal" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary">Join the Waitlist</button>
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
    </>
  )
}
