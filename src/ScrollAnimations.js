import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Split text into wrapped words for masked reveal.
// Walks child nodes so <br> and inline tags like <em>/<strong> are preserved.
function splitWords(el) {
  if (!el || el.dataset.splitw === '1') return []
  const out = []

  const wrapWord = (text, italic = false) => {
    if (!text) return null
    const wrap = document.createElement('span')
    wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;'
    const inner = document.createElement(italic ? 'em' : 'span')
    inner.style.cssText = 'display:inline-block;will-change:transform;'
    inner.textContent = text
    wrap.appendChild(inner)
    out.push(inner)
    return wrap
  }

  const processText = (text, parent, italic) => {
    const tokens = text.split(/(\s+)/)
    tokens.forEach(t => {
      if (!t) return
      if (/^\s+$/.test(t)) {
        parent.appendChild(document.createTextNode(t))
      } else {
        const w = wrapWord(t, italic)
        if (w) parent.appendChild(w)
      }
    })
  }

  // Build a fresh fragment by walking the original children
  const frag = document.createDocumentFragment()
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      processText(node.textContent, frag, false)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase()
      if (tag === 'br') {
        frag.appendChild(document.createElement('br'))
      } else if (tag === 'em' || tag === 'i') {
        processText(node.textContent, frag, true)
      } else if (tag === 'strong' || tag === 'b') {
        const bWrap = document.createElement('strong')
        processText(node.textContent, bWrap, false)
        frag.appendChild(bWrap)
      } else {
        // Unknown inline element — flatten its text
        processText(node.textContent, frag, false)
      }
    }
  })

  el.textContent = ''
  el.appendChild(frag)
  el.dataset.splitw = '1'
  return out
}

export function setupScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ScrollTrigger.refresh()

  /* Section titles — masked word reveal. Kept. */
  gsap.utils.toArray('.sec-title, .cta-title').forEach(el => {
    const words = splitWords(el)
    if (!words.length) return
    gsap.set(words, { yPercent: 100 })
    gsap.to(words, {
      yPercent: 0,
      duration: 1.0,
      ease: 'power4.out',
      stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
    })
  })

  /* Hero bleed text horizontal scrub — kept */
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

  /* Section labels — letterspacing fade-in. Kept (subtle). */
  gsap.utils.toArray('.sec-label').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, letterSpacing: '0.5em' },
      {
        opacity: 1, letterSpacing: '0.3em',
        duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* Product cards — clip-path wipe. Kept. NO 3D TILT. */
  const productCards = gsap.utils.toArray('.prod-card')
  if (productCards.length) {
    gsap.set(productCards, { clipPath: 'inset(100% 0 0 0)', y: 40 })
    gsap.to(productCards, {
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
      stagger: 0.15,
      clearProps: 'transform',   // release inline transform so CSS :hover can take over
      scrollTrigger: {
        trigger: productCards[0].parentElement,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      }
    })
  }

  /* Spec blocks — count up + fade in. Kept (the new typographic specs need impact). */
  gsap.utils.toArray('.spec-block-num').forEach(el => {
    const text = el.textContent.trim()
    const target = parseFloat(text)
    if (Number.isNaN(target)) return
    const isInt = target % 1 === 0
    const obj = { v: 0 }
    el.textContent = isInt ? '0' : '0.0'
    gsap.to(obj, {
      v: target,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      onUpdate: () => {
        el.textContent = isInt ? Math.floor(obj.v).toString() : obj.v.toFixed(1)
      }
    })
  })

  gsap.utils.toArray('.spec-block').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.9, delay: i * 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* Process steps — simple slide. Kept. */
  gsap.utils.toArray('.process-step').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.9, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* Anatomy section description fade. Kept. */
  gsap.utils.toArray('.anatomy-desc').forEach(el => {
    gsap.fromTo(el,
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* CTA sub fade. Kept. */
  gsap.utils.toArray('.cta-sub').forEach(el => {
    gsap.fromTo(el,
      { y: 20, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1, delay: 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: el.closest('.cta-band'), start: 'top 80%', toggleActions: 'play none none reverse' }
      }
    )
  })

  /* Nav scroll state */
  ScrollTrigger.create({
    start: 'top -50',
    end: 99999,
    toggleClass: { className: 'nav-scrolled', targets: 'nav' },
  })

  /* REMOVED:
   * - 3D card tilt (gsap.quickTo rotation on mousemove) — cheap effect
   * - Manifesto character-by-character scrub — delays content
   * - Tech tags elastic stagger
   * - Stats grid (replaced by specs typography)
   * - Spec rows accordion stagger (now hidden in <details>)
   * - Big section title parallax X drift — caused layout overflow
   * - Product canvas SVG yPercent parallax — distracting
   */
}