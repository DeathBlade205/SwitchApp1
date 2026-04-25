import { useEffect, useRef, useState } from 'react'

function playKeyswitchClick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const now = ctx.currentTime

  // Noise transient — the "tick"
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 80) * 0.5
            + Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 50) * 0.35
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const g1 = ctx.createGain(); g1.gain.value = 0.8
  src.connect(g1); g1.connect(ctx.destination); src.start(now)

  // Deep thump
  const osc1 = ctx.createOscillator()
  const g2 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(110, now)
  osc1.frequency.exponentialRampToValueAtTime(38, now + 0.1)
  g2.gain.setValueAtTime(0.6, now)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
  osc1.connect(g2); g2.connect(ctx.destination)
  osc1.start(now); osc1.stop(now + 0.14)

  // Spring ring
  const osc2 = ctx.createOscillator()
  const g3 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(3200, now)
  osc2.frequency.exponentialRampToValueAtTime(900, now + 0.07)
  g3.gain.setValueAtTime(0.09, now)
  g3.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
  osc2.connect(g3); g3.connect(ctx.destination)
  osc2.start(now); osc2.stop(now + 0.09)
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

export default function Loader({ onComplete }) {
  const [pressed, setPressed] = useState(false)
  const [phase, setPhase] = useState('idle')
  const overlayRef = useRef(null)
  const busy = useRef(false)

  const trigger = async () => {
    if (busy.current) return
    busy.current = true
    setPhase('pressing')
    setPressed(true)
    playKeyswitchClick()
    await delay(85)
    setPressed(false)
    await delay(130)
    setPhase('rippling')
    runRipple()
  }

  function runRipple() {
    const overlay = overlayRef.current
    if (!overlay) return
    const cx = innerWidth / 2, cy = innerHeight / 2
    const maxR = Math.hypot(cx, cy) * 2.2

    const mkFill = (color) => {
      const el = document.createElement('div')
      el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;
        background:${color};left:${cx}px;top:${cy}px;
        transform:translate(-50%,-50%) scale(0);will-change:transform;`
      overlay.appendChild(el); return el
    }
    const mkRing = () => {
      const el = document.createElement('div')
      el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;
        border:1px solid rgba(184,152,90,0.35);left:${cx}px;top:${cy}px;
        transform:translate(-50%,-50%) scale(0);will-change:transform;`
      overlay.appendChild(el); return el
    }
    const anim = (el, scale, delayMs, dur, cb) => {
      const start = performance.now() + delayMs
      const frame = (now) => {
        if (now < start) { requestAnimationFrame(frame); return }
        const t = Math.min((now - start) / (dur * 1000), 1)
        const e = 1 - Math.pow(1 - t, 3)
        el.style.transform = `translate(-50%,-50%) scale(${e * scale})`
        if (t < 1) requestAnimationFrame(frame)
        else cb && cb()
      }
      requestAnimationFrame(frame)
    }

    const scale = maxR / 2
    // Ring pulses
    for (let i = 0; i < 4; i++) {
      const ring = mkRing()
      anim(ring, scale * (0.5 + i * 0.18), i * 55, 0.7)
    }
    // Fill wave 1
    const w1 = mkFill('var(--ivory-dark)')
    anim(w1, scale, 0, 0.68, () => {
      // Fill wave 2 (ivory — matches site bg)
      const w2 = mkFill('var(--ivory)')
      anim(w2, scale, 0, 0.58, () => {
        onComplete()
        setTimeout(() => {
          overlay.style.transition = 'opacity .5s'
          overlay.style.opacity = '0'
          setTimeout(() => overlay.remove(), 500)
        }, 80)
      })
    })
  }

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'Enter') trigger() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div ref={overlayRef} style={{
        position:'fixed',inset:0,zIndex:999,pointerEvents:'none',overflow:'hidden'
      }}/>

      {phase !== 'rippling' && (
        <div id="loader">
          <DotGrid />

          <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:'2.5rem' }}>

            {/* Ripple rings on press */}
            {pressed && [120,200,300].map((s,i) => <Ring key={i} size={s} delay={i*70}/>)}

            {/* Direction arrows */}
            {phase === 'pressing' && <Arrows />}

            {/* Keycap */}
            <div
              onClick={trigger}
              style={{
                width: 92, height: 92,
                background: pressed ? '#2c2420' : '#1c1917',
                borderRadius: 14, display:'flex',
                alignItems:'center', justifyContent:'center',
                fontFamily:"'DM Mono',monospace",
                color:'#f7f4ef', fontSize:'0.78rem',
                fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase',
                boxShadow: pressed
                  ? '0 2px 0 #0a0806, 0 3px 10px rgba(0,0,0,0.2)'
                  : '0 11px 0 #0a0806, 0 16px 36px rgba(0,0,0,0.28)',
                transform: pressed ? 'translateY(9px)' : 'translateY(0)',
                transition:'transform .07s cubic-bezier(.25,.46,.45,.94),box-shadow .07s',
                cursor:'pointer', userSelect:'none', position:'relative', zIndex:2,
              }}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && trigger()}
            >
              NX
            </div>
          </div>

          <p style={{
            fontFamily:"'DM Mono',monospace", fontSize:'.58rem',
            letterSpacing:'.28em', textTransform:'uppercase', color:'#a8a29e',
            animation:'breathe 2.5s ease-in-out infinite'
          }}>
            {phase === 'idle' ? 'Press to enter' : '· · ·'}
          </p>

          <style>{`@keyframes breathe{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
        </div>
      )}
    </>
  )
}

function DotGrid() {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
      <defs>
        <pattern id="dg" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(28,25,23,0.09)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dg)"/>
    </svg>
  )
}

function Ring({ size, delay: d }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    setTimeout(() => {
      el.style.transition = 'transform .9s cubic-bezier(.25,.46,.45,.94), opacity .9s ease'
      el.style.transform = `translate(-50%,-50%) scale(${size / 4})`
      el.style.opacity = '0'
    }, d)
  }, [])
  return (
    <div ref={ref} style={{
      position:'absolute', width:4, height:4, borderRadius:'50%',
      border:'1px solid rgba(184,152,90,0.5)',
      top:'50%', left:'50%',
      transform:'translate(-50%,-50%) scale(1)',
      opacity:1, pointerEvents:'none', zIndex:1
    }}/>
  )
}

function Arrows() {
  const items = [
    { style:{ top:'-56px', left:'50%', transform:'translateX(-50%)' }, ch:'↑' },
    { style:{ bottom:'-56px', left:'50%', transform:'translateX(-50%)' }, ch:'↓' },
    { style:{ top:'50%', left:'-68px', transform:'translateY(-50%)' }, ch:'←' },
    { style:{ top:'50%', right:'-68px', transform:'translateY(-50%)' }, ch:'→' },
  ]
  return (
    <>
      {items.map((a,i) => (
        <div key={i} style={{
          position:'absolute', ...a.style, pointerEvents:'none',
          fontFamily:"'DM Mono',monospace", fontSize:'1.1rem',
          color:'rgba(184,152,90,0.6)',
          animation:`arrowIn .5s ${i*55}ms ease forwards`,
          opacity:0,
        }}>{a.ch}</div>
      ))}
      <style>{`@keyframes arrowIn{to{opacity:0.5}}`}</style>
    </>
  )
}
