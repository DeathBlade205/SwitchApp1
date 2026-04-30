import { useState, useEffect, useRef } from 'react'
import SwitchCanvas from './SwitchCanvas'

export default function AnatomySection() {
  const [progress, setProgress]     = useState(0)
  const [activated, setActivated]   = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const sectionRef = useRef(null)

  // Mount the canvas only when the section is near the viewport —
  // avoids creating a full Three.js scene on page load.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCanvasReady(true) },
      { rootMargin: '400px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!activated) return
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect  = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) return
      setProgress(Math.max(0, Math.min(1, -rect.top / total)))
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
                  <div className="anatomy-progress-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <p className="anatomy-progress-label">
                  Scroll · {Math.round(progress * 100)}%
                </p>
              </div>
            )}
          </div>
          <div className="anatomy-right">
            {canvasReady && (
              <SwitchCanvas
                variant="hero"
                bg={0xede9e2}
                spin={0.3}
                explodeProgress={activated ? progress : 0}
                showLabels={activated}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
