import { useState, useEffect, useRef } from 'react'
import Loader from './Loader'
import HeroCanvas from './HeroCanvas'
import SwitchCanvas from './SwitchCanvas'
import SwitchIllustration from './SwitchIllustration'
import './index.css'

export default function App() {
  const [siteVisible, setSiteVisible] = useState(false)
  const cursorRef = useRef(null)

  useEffect(() => {
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
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 80)
      }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [siteVisible])

  return (
    <>
      <div id="cursor" ref={cursorRef} />
      <Loader onComplete={() => setSiteVisible(true)} />

      <div id="site" className={siteVisible ? 'visible' : ''}>

        {/* NAV */}
        <nav>
          <div className="nav-logo">Nexus</div>
          <div className="nav-links">
            <a href="#collection">Collection</a>
            <a href="#specs">Specifications</a>
            <a href="#process">Craft</a>
            <a href="#contact">Contact</a>
          </div>
          <button className="nav-cta">Explore Switches</button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <HeroCanvas />
          <div className="hero-inner">
            <div className="hero-left">
              <p className="hero-eyebrow">Precision Switch Co. — 2025 Collection</p>
              <h1 className="hero-title">
                <span className="ht"><span>The Art</span></span>
                <span className="ht"><span>of the</span></span>
                <span className="ht"><span><em>Keystroke.</em></span></span>
              </h1>
              <p className="hero-desc">
                Every switch is obsessed over. Lubed by hand. Tuned to perfection.
                Built for those who hear the difference between good and extraordinary.
              </p>
              <div className="hero-actions">
                <button className="btn-primary">Shop Collection</button>
                <button className="btn-ghost">Hear the Sound</button>
              </div>
              <div className="hero-specs">
                <div className="spec-item">
                  <p className="spec-label">Actuation</p>
                  <p className="spec-val">45g</p>
                </div>
                <div className="spec-item">
                  <p className="spec-label">Travel</p>
                  <p className="spec-val">4.0mm</p>
                </div>
                <div className="spec-item">
                  <p className="spec-label">Lifespan</p>
                  <p className="spec-val">100M</p>
                </div>
                <div className="spec-item">
                  <p className="spec-label">Material</p>
                  <p className="spec-val">POM / PC</p>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-switch-wrap">
                <SwitchCanvas variant="hero" bg={0xede9e2} spin={0.5} />
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
                <h2 className="sec-title reveal">Three Voices,<br /><em>One Standard.</em></h2>
              </div>
              <p className="products-header-right reveal">
                Each switch is hand-inspected, lubed with Krytox 205g0, and filmed with
                0.3mm PTFE for the most consistent, premium feel available.
              </p>
            </div>

            <div className="products-grid">
              {SWITCHES.map((sw, i) => (
                <div className="prod-card reveal" key={i}>
                  {sw.badge && <div className="prod-badge">{sw.badge}</div>}
                  <div className="prod-canvas-wrap" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"2.5rem",background:"#2c3a3f"}}>
                    <SwitchIllustration variant={sw.variant} darkBg={true} />
                  </div>
                  <div className="prod-body">
                    <h3 className="prod-name">{sw.name}</h3>
                    <p className="prod-tagline">{sw.tagline}</p>
                    <div className="prod-specs-row">
                      <div className="prod-spec">
                        <p className="prod-spec-label">Type</p>
                        <p className="prod-spec-val">{sw.type}</p>
                      </div>
                      <div className="prod-spec">
                        <p className="prod-spec-label">Force</p>
                        <p className="prod-spec-val">{sw.force}</p>
                      </div>
                      <div className="prod-spec">
                        <p className="prod-spec-label">Travel</p>
                        <p className="prod-spec-val">{sw.travel}</p>
                      </div>
                      <div className="prod-spec">
                        <p className="prod-spec-label">Sound</p>
                        <p className="prod-spec-val">{sw.sound}</p>
                      </div>
                    </div>
                    <div className="prod-price-row">
                      <p className="prod-price">{sw.price}</p>
                      <button className="prod-buy">Notify Me</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MANIFESTO */}
        <div className="manifesto">
          <p className="manifesto-quote reveal">
            "We don't make switches for keyboards.<br />
            We make switches for <strong>people who close their eyes</strong><br />
            and listen while they type."
          </p>
          <p className="manifesto-attr reveal">— Nexus Design Philosophy</p>
        </div>

        {/* SPECS DEEP DIVE */}
        <section id="specs" className="specs-section">
          <div className="specs-inner">
            <div className="specs-canvas-wrap reveal">
              <SwitchIllustration variant="tactile" size={420} darkBg={false} />
            </div>
            <div className="specs-content">
              <span className="sec-label reveal">Full Specifications</span>
              <h2 className="sec-title reveal">Engineered<br /><em>to Obsession.</em></h2>
              <div className="specs-list">
                {SPECS.map((s, i) => (
                  <div className="spec-row reveal" key={i}>
                    <span className="spec-key">{s.key}</span>
                    <span className="spec-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-band">
          <div className="stats-inner">
            {STATS.map((s, i) => (
              <div className="stat reveal" key={i}>
                <p className="stat-num">{s.num}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PROCESS */}
        <section id="process">
          <div className="section-wrap">
            <span className="sec-label reveal">The Craft</span>
            <h2 className="sec-title reveal">How Every Switch<br /><em>Is Born.</em></h2>
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
            Join the waitlist. First drop is limited to 500 units per variant.
            Hand-lubed. Hand-inspected. Shipped in bespoke packaging.
          </p>
          <div className="reveal" style={{ display:'flex', gap:'1rem', justifyContent:'center' }}>
            <button className="btn-primary">Join the Waitlist</button>
            <button className="btn-ghost">Learn More</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer id="contact">
          <div className="footer-inner">
            <div className="footer-brand">
              <p className="footer-logo">Nexus</p>
              <p className="footer-tagline">Precision mechanical switches for those who demand the extraordinary.</p>
            </div>
            <div>
              <p className="footer-col-title">Collection</p>
              <div className="footer-links">
                <a href="#">Nexus Linear</a>
                <a href="#">Nexus Tactile</a>
                <a href="#">Nexus Clicky</a>
                <a href="#">Upcoming Drops</a>
              </div>
            </div>
            <div>
              <p className="footer-col-title">Company</p>
              <div className="footer-links">
                <a href="#">About</a>
                <a href="#">The Process</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div>
              <p className="footer-col-title">Community</p>
              <div className="footer-links">
                <a href="#">Discord</a>
                <a href="#">Reddit</a>
                <a href="#">Instagram</a>
                <a href="#">GitHub</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 Nexus Precision Switch Co. All rights reserved.</p>
            <p className="footer-copy">Sydney, Australia</p>
          </div>
        </footer>

      </div>
    </>
  )
}

const SWITCHES = [
  {
    variant: 'linear',
    bg: 0xe8e4dd,
    badge: 'Bestseller',
    name: 'Nexus Linear',
    tagline: 'Smooth as silk. Silent as thought.',
    type: 'Linear',
    force: '45g',
    travel: '4.0mm',
    sound: 'Thock',
    price: '$0.95 / switch',
  },
  {
    variant: 'tactile',
    bg: 0xe2e6ec,
    badge: 'New Drop',
    name: 'Nexus Tactile',
    tagline: 'Precision bump. Zero pre-travel.',
    type: 'Tactile',
    force: '55g',
    travel: '4.0mm',
    sound: 'Muted',
    price: '$1.10 / switch',
  },
  {
    variant: 'clicky',
    bg: 0xe2ece6,
    badge: null,
    name: 'Nexus Clicky',
    tagline: 'The click that never gets old.',
    type: 'Clicky',
    force: '60g',
    travel: '4.0mm',
    sound: 'Click',
    price: '$1.05 / switch',
  },
]

const SPECS = [
  { key: 'Switch type', value: 'MX-compatible, 3-pin' },
  { key: 'Housing material', value: 'Polycarbonate (top) / Nylon (bottom)' },
  { key: 'Stem material', value: 'POM (Polyoxymethylene)' },
  { key: 'Spring', value: 'Gold-plated stainless, single-stage' },
  { key: 'Actuation force', value: '45g (Linear) / 55g (Tactile) / 60g (Clicky)' },
  { key: 'Actuation point', value: '2.0mm' },
  { key: 'Total travel', value: '4.0mm' },
  { key: 'Pre-travel', value: '0mm (zero pre-travel design)' },
  { key: 'Lube', value: 'Krytox 205g0 — hand applied' },
  { key: 'Filming', value: '0.3mm PTFE switch films' },
  { key: 'Rated lifespan', value: '100 million keystrokes' },
  { key: 'Compatibility', value: 'MX footprint — universal' },
]

const STATS = [
  { num: '100M', label: 'Keystroke lifespan' },
  { num: '0.0mm', label: 'Pre-travel' },
  { num: '500', label: 'Units per drop' },
  { num: '48hr', label: 'Hand-lube time per batch' },
]

const PROCESS = [
  { title: 'Sourced', body: 'Premium POM stems and polycarbonate housings sourced from a single manufacturer. We inspect every batch.' },
  { title: 'Disassembled', body: 'Each switch is opened. Springs are removed, sorted by weight variance, and any outliers discarded.' },
  { title: 'Lubed & Filmed', body: 'Stems hand-lubed with Krytox 205g0. PTFE 0.3mm films applied to eliminate wobble entirely.' },
  { title: 'Certified', body: 'Reassembled, tested for actuation consistency, and rated before packing into bespoke Nexus packaging.' },
]