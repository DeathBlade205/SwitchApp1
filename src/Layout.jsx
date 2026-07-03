import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Loader from './Loader'
import Cart from './Cart'
import { useCart } from './CartContext'
import { setupScrollAnimations } from './ScrollAnimations'
import './index.css'

export default function Layout() {
  const [siteVisible, setSiteVisible] = useState(false)
  const [skipLoader,  setSkipLoader]  = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const cursorRef = useRef(null)
  const cart = useCart()
  const location = useLocation()

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

  // Re-arms the .reveal fade-in observer and the GSAP scroll animations
  // whenever the route changes — a client-side navigation doesn't remount
  // Layout, so without keying on location.pathname the new page's elements
  // would never get observed/animated (only the very first page would).
  useEffect(() => {
    if (!siteVisible) return
    sessionStorage.setItem('nexus_seen', '1')
    // Don't stomp a same-navigation in-page anchor (e.g. Link to="/#anatomy")
    // — the target page's own effect scrolls to the hash. Reads the live
    // browser hash rather than the location object from this closure, which
    // can still reflect the pre-navigation value when this effect's deps
    // (siteVisible, pathname) fire slightly ahead of the hash committing.
    if (!window.location.hash) window.scrollTo(0, 0)
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
  }, [siteVisible, location.pathname])

  const closeMenu = () => setMenuOpen(false)
  const openCart = () => { setMenuOpen(false); cart.setOpen(true) }

  return (
    <>
      <div id="cursor" ref={cursorRef} />
      {!skipLoader && <Loader onComplete={() => setSiteVisible(true)} />}

      <div id="site" className={siteVisible ? 'visible' : ''}>

        {/* NAV */}
        <nav>
          <Link to="/" className="nav-logo" onClick={closeMenu}>Nexus</Link>
          <div className="nav-links">
            <Link to="/shop">Shop</Link>
            <Link to="/#anatomy">Anatomy</Link>
            <Link to="/#specs">Specifications</Link>
            <Link to="/#process">Craft</Link>
          </div>
          <div className="nav-right">
            <Link className="nav-cta" to="/shop">Shop</Link>
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
            <Link to="/shop"      onClick={closeMenu}>Shop</Link>
            <Link to="/#anatomy"  onClick={closeMenu}>Anatomy</Link>
            <Link to="/#specs"    onClick={closeMenu}>Specifications</Link>
            <Link to="/#process"  onClick={closeMenu}>Craft</Link>
            <Link to="/#contact"  onClick={closeMenu}>Contact</Link>
            <button className="mobile-menu-cart" onClick={openCart}>Cart ({cart.count})</button>
          </div>
        )}

        <Outlet />

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

      {/* CART DRAWER + TOAST */}
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
