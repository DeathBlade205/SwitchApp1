import { useState, useEffect, useRef } from 'react'
import Loader from './Loader'
import HeroCanvas from './HeroCanvas'
import SwitchCanvas from './SwitchCanvas'
import SwitchIllustration from './SwitchIllustration'
import { setupScrollAnimations } from './ScrollAnimations'
import './index.css'

export default function App() {
  const [siteVisible, setSiteVisible] = useState(false)
  const [skipLoader, setSkipLoader] = useState(false)
  const cursorRef = useRef(null)

  // Auto-skip loader on returning visits
  useEffect(() => {
    if (typeof window === 'undefined') return
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
      const h = !!e.target.closest('button,a,.prod-card,.process-step,.nav-links a')
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
          <button className="nav-cta">Shop</button>
        </nav>

        {/* HERO — assembled switch, no scroll pin, no explode */}
        <section className="hero hero-v2">
          <HeroCanvas />
          <div className="hero-inner">
            <div className="hero-left">
              <p className="hero-eyebrow">Nº 01 — 2025 Collection</p>
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
                <button className="btn-primary" onClick={() => document.getElementById('collection')?.scrollIntoView({behavior:'smooth'})}>
                  Shop Collection
                </button>
                <button className="btn-ghost" onClick={() => document.getElementById('anatomy')?.scrollIntoView({behavior:'smooth'})}>
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
                <span>Nº</span>
                <span>01</span>
                <span>—</span>
                <span>03</span>
              </div>
              <div className="hero-switch-wrap">
                <SwitchCanvas variant="hero" bg={0xede9e2} spin={0.5} explodeProgress={0} showLabels={false} />
              </div>
              <p className="hero-label">Nexus Linear — Gold Edition</p>
            </div>
          </div>
          <div className="hero-bleed">NEXUS</div>
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

        {/* ANATOMY — gated explode, opt-in via button */}
        <AnatomySection />

        {/* SPECS DEEP DIVE — typographic, not tabular */}
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
          <p className="cta-sub reveal">
            500 units per variant. First drop ships March 2025.
          </p>
          <div className="reveal" style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
            <button className="btn-primary">Join the Waitlist</button>
          </div>
        </div>

        {/* FOOTER — collapsed */}
        <footer id="contact" className="footer-v2">
          <div className="footer-v2-inner">
            <p className="footer-logo">Nexus</p>
            <p className="footer-tagline">Precision switches. Sydney.</p>
            <div className="footer-meta">
              <a href="#">hello@nexus.co</a>
              <span>·</span>
              <a href="#">@nexus.switches</a>
              <span>·</span>
              <span>© 2025</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}

// ── ANATOMY SECTION — gated explode ──
function AnatomySection() {
  const [progress, setProgress] = useState(0)
  const [activated, setActivated] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!activated) return
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const winH = window.innerHeight
      // Section is 200vh tall, sticky inner. Track scroll progress within section.
      const scrolled = -rect.top
      const total = rect.height - winH
      if (total <= 0) return
      const raw = scrolled / total
      setProgress(Math.max(0, Math.min(1, raw)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [activated])

  return (
    <section id="anatomy" className="anatomy" ref={sectionRef}>
      <div className="anatomy-sticky">
        <div className="anatomy-inner">
          <div className="anatomy-left">
            <span className="sec-label reveal">Anatomy</span>
            <h2 className="sec-title reveal">Five parts.<br /><em>One feeling.</em></h2>
            <p className="anatomy-desc reveal">
              Every Nexus switch is built from five precision-tuned components.
              Each one chosen, lubed, and tested before assembly.
            </p>
            {!activated ? (
              <button className="btn-primary anatomy-trigger" onClick={() => setActivated(true)}>
                Disassemble →
              </button>
            ) : (
              <div className="anatomy-progress">
                <div className="anatomy-progress-bar">
                  <div className="anatomy-progress-fill" style={{ width: `${progress*100}%` }} />
                </div>
                <p className="anatomy-progress-label">
                  Scroll · {Math.round(progress*100)}%
                </p>
              </div>
            )}
          </div>
          <div className="anatomy-right">
            <SwitchCanvas
              variant="hero"
              bg={0xede9e2}
              spin={0.3}
              explodeProgress={activated ? progress : 0}
              showLabels={activated}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const SWITCHES = [
  {
    variant: 'linear',
    name: 'Nexus Linear',
    tagline: 'For typists.',
    type: 'Linear',
    force: '45g',
    travel: '4.0mm',
    sound: 'Thock',
    price: '$0.95 / switch',
    setPrice: '$62',
  },
  {
    variant: 'tactile',
    flagship: true,
    name: 'Nexus Tactile',
    tagline: 'The Nexus signature.',
    type: 'Tactile',
    force: '55g',
    travel: '4.0mm',
    sound: 'Muted',
    price: '$1.10 / switch',
    setPrice: '$72',
  },
  {
    variant: 'clicky',
    name: 'Nexus Clicky',
    tagline: 'For the office rebel.',
    type: 'Clicky',
    force: '60g',
    travel: '4.0mm',
    sound: 'Click',
    price: '$1.05 / switch',
    setPrice: '$68',
  },
]

const SPECS_HERO = [
  { num: '100',  unit: 'million', label: 'Rated keystrokes per switch' },
  { num: '4.0',  unit: 'mm',      label: 'Total travel, zero pre-travel' },
  { num: '500',  unit: 'units',   label: 'Per variant, per drop' },
  { num: '48',   unit: 'hours',   label: 'Hand-lube time per batch' },
]

const SPECS = [
  { key: 'Switch type', value: 'MX-compatible, 3-pin' },
  { key: 'Housing material', value: 'Polycarbonate (top) / Nylon (bottom)' },
  { key: 'Stem material', value: 'POM (Polyoxymethylene)' },
  { key: 'Spring', value: 'Gold-plated stainless, single-stage' },
  { key: 'Actuation force', value: '45g (Linear) / 55g (Tactile) / 60g (Clicky)' },
  { key: 'Actuation point', value: '2.0mm' },
  { key: 'Total travel', value: '4.0mm' },
  { key: 'Pre-travel', value: '0mm' },
  { key: 'Lube', value: 'Krytox 205g0, hand applied' },
  { key: 'Filming', value: '0.3mm PTFE' },
  { key: 'Rated lifespan', value: '100 million keystrokes' },
  { key: 'Compatibility', value: 'MX footprint, universal' },
]

const PROCESS = [
  { title: 'Sourced', body: 'Premium POM stems and polycarbonate housings from a single Chinese OEM. Every batch inspected.' },
  { title: 'Disassembled', body: 'Each switch is opened. Springs sorted by weight variance, outliers discarded.' },
  { title: 'Lubed & Filmed', body: 'Stems hand-lubed with Krytox 205g0. PTFE 0.3mm films eliminate housing wobble.' },
  { title: 'Certified', body: 'Reassembled, tested for actuation consistency, packed in bespoke boxes.' },
]