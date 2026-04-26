import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// SplitText alternative — split text into spans
function splitChars(el) {
  if (!el || el.dataset.split === '1') return []
  const text = el.textContent
  el.textContent = ''
  const chars = []
  for (const ch of text) {
    const span = document.createElement('span')
    span.textContent = ch
    span.style.cssText = 'display:inline-block;will-change:transform;'
    if (ch === ' ') span.innerHTML = '&nbsp;'
    el.appendChild(span)
    chars.push(span)
  }
  el.dataset.split = '1'
  return chars
}

function splitWords(el) {
  if (!el || el.dataset.splitw === '1') return []
  const words = el.textContent.split(/(\s+)/)
  el.textContent = ''
  const out = []
  words.forEach(w => {
    if (/^\s+$/.test(w)) {
      el.appendChild(document.createTextNode(w))
    } else {
      const wrap = document.createElement('span')
      wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;'
      const inner = document.createElement('span')
      inner.style.cssText = 'display:inline-block;will-change:transform;'
      inner.textContent = w
      wrap.appendChild(inner)
      el.appendChild(wrap)
      out.push(inner)
    }
  })
  el.dataset.splitw = '1'
  return out
}

export function setupScrollAnimations() {
  ScrollTrigger.refresh()

  /* ── KINETIC HEADERS ── 
   * Section titles: split into words, each reveals with mask and rise */
  gsap.utils.toArray('.sec-title, .cta-title').forEach(el => {
    // Ensure parent allows mask
    el.style.lineHeight = el.style.lineHeight || '1.05'
    const words = splitWords(el)
    if (!words.length) return
    gsap.set(words, { yPercent: 100 })
    gsap.to(words, {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.07,
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      }
    })
  })

  /* ── HORIZONTAL MARQUEE on hero bleed ─ scrubs with scroll ── */
  gsap.utils.toArray('.hero-bleed').forEach(el => {
    gsap.fromTo(el,
      { xPercent: 5 },
      {
        xPercent: -45,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.hero'),
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      }
    )
  })

  /* ── HERO 3D SWITCH — slight scale & rotate as you scroll past ── */
  const heroSwitch = document.querySelector('.hero-switch-wrap')
  if (heroSwitch) {
    gsap.to(heroSwitch, {
      scale: 0.92,
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    })
  }

  /* ── SECTION LABELS — line draws in then text fades ── */
  gsap.utils.toArray('.sec-label').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, letterSpacing: '0.6em' },
      {
        opacity: 1, letterSpacing: '0.3em',
        duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* ── PRODUCT CARDS — clip-path reveal + 3D tilt on hover ── */
  const productCards = gsap.utils.toArray('.prod-card')
  if (productCards.length) {
    gsap.set(productCards, { clipPath: 'inset(100% 0 0 0)', y: 60 })
    gsap.to(productCards, {
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      duration: 1.4,
      ease: 'power4.out',
      stagger: 0.18,
      scrollTrigger: {
        trigger: productCards[0].parentElement,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      }
    })

    // 3D mouse tilt
    productCards.forEach(card => {
      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power2.out' })
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power2.out' })
      const ty   = gsap.quickTo(card, 'y',         { duration: 0.6, ease: 'power2.out' })

      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width  - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        rotY(x * 8); rotX(-y * 8); ty(-6)
      })
      card.addEventListener('mouseleave', () => { rotX(0); rotY(0); ty(0) })
      card.style.transformStyle = 'preserve-3d'
      card.style.transformPerspective = '900'
    })
  }

  /* ── FEATURE GRID — staggered reveal with mask wipe ── */
  const features = gsap.utils.toArray('.feat')
  if (features.length) {
    gsap.set(features, { y: 80, opacity: 0 })
    gsap.to(features, {
      y: 0, opacity: 1,
      duration: 1, ease: 'power3.out',
      stagger: { each: 0.08, grid: 'auto', from: 'start' },
      scrollTrigger: {
        trigger: features[0].parentElement,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      }
    })
  }

  /* ── STATS BAND — sticky pin + count up ── */
  const statsBand = document.querySelector('.stats-band')
  if (statsBand) {
    gsap.utils.toArray('.stat-num').forEach(el => {
      const text = el.textContent
      const match = text.match(/^(<?)(\d+\.?\d*)(.*)$/)
      if (!match) return
      const [, prefix, num, suffix] = match
      const target = parseFloat(num)
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        onUpdate: () => {
          const v = target % 1 === 0 ? Math.floor(obj.v) : obj.v.toFixed(1)
          el.textContent = `${prefix}${v}${suffix}`
        }
      })
    })

    // Stat columns slide up with stagger
    gsap.utils.toArray('.stat').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: statsBand, start: 'top 85%', toggleActions: 'play none none reverse' }
        }
      )
    })
  }

  /* ── SPECS TABLE — rows draw from left like inventory list ── */
  gsap.utils.toArray('.spec-row').forEach((el, i) => {
    gsap.fromTo(el,
      { x: -40, opacity: 0 },
      {
        x: 0, opacity: 1,
        duration: 0.7,
        delay: i * 0.04,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* ── PROCESS STEPS — alternating slide direction ── */
  gsap.utils.toArray('.process-step').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 80, opacity: 0, scale: 0.96 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 1, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* ── TECH TAGS — sequential elastic pop ── */
  const tags = gsap.utils.toArray('.tech-tag')
  if (tags.length) {
    gsap.set(tags, { scale: 0, opacity: 0 })
    gsap.to(tags, {
      scale: 1, opacity: 1,
      duration: 0.6,
      ease: 'back.out(1.6)',
      stagger: 0.04,
      scrollTrigger: {
        trigger: tags[0].parentElement,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      }
    })
  }

  /* ── MANIFESTO — split chars + sequential reveal ── */
  gsap.utils.toArray('.manifesto-quote').forEach(el => {
    const chars = splitChars(el)
    gsap.set(chars, { opacity: 0.08, y: 20 })
    gsap.to(chars, {
      opacity: 1, y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.012,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        end: 'bottom 50%',
        scrub: 1,
      }
    })
  })

  /* ── HERO TITLE LETTERS — already animate via CSS, augment with subtle drift ── */

  /* ── CTA BAND — scale up + fade ── */
  gsap.utils.toArray('.cta-band').forEach(el => {
    const sub = el.querySelector('.cta-sub')
    if (sub) {
      gsap.fromTo(sub,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1.2, delay: 0.3, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      )
    }
    const buttons = el.querySelector('.reveal')
    if (buttons) {
      gsap.fromTo(buttons,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1, delay: 0.5, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      )
    }
  })

  /* ── NAV behaviour ── */
  ScrollTrigger.create({
    start: 'top -50',
    end: 99999,
    toggleClass: { className: 'nav-scrolled', targets: 'nav' },
  })

  /* ── PARALLAX on illustration backgrounds ── */
  gsap.utils.toArray('.prod-canvas-wrap').forEach(el => {
    const img = el.querySelector('svg')
    if (!img) return
    gsap.to(img, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    })
  })
}