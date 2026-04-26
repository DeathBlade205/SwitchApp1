import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 5-part anatomy (3 CAD + 2 synthetic), bottom→top
const PARTS = [
  { id: 'bottom',  label: 'PA66 Bottom Case',                     explodeY: -1.05, source: 'cad' },
  { id: 'spring',  label: 'Spring',                                explodeY: -0.45, source: 'synthetic' },
  { id: 'contact', label: 'Alloy Copper & Palladium Gold Reeds',   explodeY: -0.25, source: 'synthetic' },
  { id: 'upper',   label: 'PC Upper Housing',                      explodeY:  0.35, source: 'cad' },
  { id: 'stem',    label: 'POK Stem',                              explodeY:  1.05, source: 'cad' },
]

const COLORS = {
  bottom:  0x1a2638,
  spring:  0xc8b878,
  contact: 0xd4a64a,
  upper:   0x6aaec8,
  stem:    0xb8985a,
}

const STEM_OVERRIDE = { hero: 0xb8985a, linear: 0xc94040, tactile: 0x4a7ab8, clicky: 0x4a9e6a }

let cached = null
function loadParts() {
  if (!cached) cached = new Promise((res, rej) =>
    new GLTFLoader().load('/switch_parts.glb', res, undefined, rej)
  )
  return cached
}

const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2

// ── Synthetic spring (helix tube) — matches reference proportions ──
function makeSpring() {
  const g = new THREE.Group()
  const radius = 0.18, height = 0.75, coils = 9
  const segs = coils * 28
  const points = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const a = t * coils * Math.PI * 2
    points.push(new THREE.Vector3(
      Math.cos(a) * radius,
      -height/2 + t * height,
      Math.sin(a) * radius
    ))
  }
  const curve = new THREE.CatmullRomCurve3(points)
  const tube = new THREE.TubeGeometry(curve, segs, 0.024, 10, false)
  const mat = new THREE.MeshStandardMaterial({
    color: COLORS.spring, roughness: 0.22, metalness: 0.9
  })
  const mesh = new THREE.Mesh(tube, mat)
  mesh.castShadow = true; mesh.receiveShadow = true
  g.add(mesh)
  return g
}

// ── Synthetic contact leaf — bent metal bracket like Akko/Gateron reference ──
function makeContact() {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({
    color: COLORS.contact, roughness: 0.18, metalness: 0.9
  })
  // Main vertical body (the wide flat leaf)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.04), mat)
  body.position.set(0, 0, 0)
  g.add(body)
  // Top bent contact tab (the gold flag at top)
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), mat)
  tab.position.set(0.05, 0.3, 0.06)
  tab.rotation.x = -0.5
  g.add(tab)
  // Lower extension foot
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.04), mat)
  foot.position.set(-0.06, -0.2, 0.04)
  foot.rotation.z = 0.3
  g.add(foot)
  // Pin going down through case
  const pin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), mat)
  pin.position.set(0, -0.34, 0)
  g.add(pin)
  // Side pin (the second gold pin you see in reference)
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), mat)
  pin2.position.set(-0.12, -0.32, 0)
  g.add(pin2)
  g.children.forEach(m => { m.castShadow = true; m.receiveShadow = true })
  return g
}

export default function SwitchCanvas({ variant = 'hero', bg = 0xf0ece6, spin = 0.3 }) {
  const canvasRef = useRef(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    let raf, renderer

    const init = async () => {
      const w = canvas.offsetWidth || 500
      const h = canvas.offsetHeight || 500

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setSize(w, h, false)
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setClearColor(bg, 1)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2

      const scene = new THREE.Scene()

      const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 50)
      camera.position.set(1.5, 1.0, 6.4)
      camera.lookAt(0, 0.05, 0)

      // Studio lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.55))
      const key = new THREE.DirectionalLight(0xffffff, 2.5)
      key.position.set(4, 8, 5); key.castShadow = true
      key.shadow.mapSize.set(2048, 2048); scene.add(key)
      const fill = new THREE.DirectionalLight(0xdde8f0, 1.0)
      fill.position.set(-5, 1, 3); scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.7)
      rim.position.set(0, -3, -4); scene.add(rim)

      const sp = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 14),
        new THREE.ShadowMaterial({ opacity: 0.09 })
      )
      sp.rotation.x = -Math.PI / 2
      sp.position.y = -2.0
      sp.receiveShadow = true
      scene.add(sp)

      const root = new THREE.Group()
      scene.add(root)
      const partGroups = {}
      PARTS.forEach(p => {
        const g = new THREE.Group()
        g.name = p.id
        root.add(g)
        partGroups[p.id] = g
      })

      // Label overlay
      const overlay = document.createElement('div')
      overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;'
      const wrap = canvas.parentElement
      if (wrap) { wrap.style.position = 'relative'; wrap.appendChild(overlay) }

      const labelEls = {}
      PARTS.forEach(p => {
        const el = document.createElement('div')
        el.style.cssText = `position:absolute;display:flex;align-items:center;gap:8px;
          opacity:0;transition:opacity 0.4s ease;`
        const line = document.createElement('div')
        line.style.cssText = 'width:36px;height:1px;background:rgba(28,25,23,0.4);flex-shrink:0;'
        const txt = document.createElement('span')
        txt.style.cssText = `font-family:'DM Mono',monospace;font-size:.55rem;
          letter-spacing:.14em;text-transform:uppercase;color:rgba(28,25,23,0.65);
          white-space:nowrap;`
        txt.textContent = p.label
        el.appendChild(line); el.appendChild(txt)
        overlay.appendChild(el)
        labelEls[p.id] = el
      })

      const stemColor = STEM_OVERRIDE[variant] || STEM_OVERRIDE.hero

      try {
        const gltf = await loadParts()
        if (!alive.current) return

        // Sort CAD meshes by Y centroid → [bottom, upper, stem]
        const allMeshes = []
        gltf.scene.traverse(n => { if (n.isMesh) allMeshes.push(n.clone()) })
        allMeshes.sort((a, b) => {
          const ba = new THREE.Box3().setFromObject(a)
          const bb = new THREE.Box3().setFromObject(b)
          return ba.getCenter(new THREE.Vector3()).y - bb.getCenter(new THREE.Vector3()).y
        })

        // 3 CAD parts now: bottom, upper, stem
        const cadIds = ['bottom', 'upper', 'stem']
        allMeshes.forEach((m, i) => {
          const id = cadIds[i] || cadIds[cadIds.length - 1]
          m.castShadow = true; m.receiveShadow = true
          const color = id === 'stem' ? stemColor : COLORS[id]
          m.material = new THREE.MeshStandardMaterial({
            color,
            roughness: id === 'upper' ? 0.32 : 0.55,
            metalness: 0.04,
          })
          partGroups[id].add(m)
        })

        // Synthetic parts — placed where they would sit inside the assembled switch
        const spring = makeSpring()
        spring.position.set(0, -0.05, 0)  // centred, in middle vertically
        partGroups.spring.add(spring)

        const contact = makeContact()
        contact.position.set(0.45, -0.05, 0.05)  // to right of spring
        partGroups.contact.add(contact)

        // Scale entire assembly to fit
        const box = new THREE.Box3().setFromObject(root)
        const size = box.getSize(new THREE.Vector3())
        root.scale.setScalar(1.35 / Math.max(size.x, size.y, size.z))

        // Centre on origin
        const box2 = new THREE.Box3().setFromObject(root)
        root.position.sub(box2.getCenter(new THREE.Vector3()))

        // Initial 3/4 angle
        root.rotation.y = Math.PI / 12

      } catch (e) { console.warn('GLB failed:', e) }

      const onResize = () => {
        const w2 = canvas.offsetWidth, h2 = canvas.offsetHeight
        renderer.setSize(w2, h2, false)
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      const toScreen = pos3 => {
        const v = pos3.clone().project(camera)
        return { x: (v.x*.5+.5)*canvas.offsetWidth, y: (-v.y*.5+.5)*canvas.offsetHeight }
      }

      // ── SCROLL-DRIVEN EXPLODE ──
      let explodeT = 0, smoothT = 0

      const updateScroll = () => {
        // Re-query each call in case the wrap mounts after canvas init
        const wrapEl = document.querySelector('.hero-pin-wrap')
        if (!wrapEl) return
        const rect = wrapEl.getBoundingClientRect()
        const winH = window.innerHeight
        const scrolled = -rect.top
        const total = rect.height - winH
        if (total <= 0) return
        const start = winH * 0.1
        const raw = (scrolled - start) / Math.max(1, total - start)
        explodeT = Math.max(0, Math.min(1, raw))
      }
      window.addEventListener('scroll', updateScroll, { passive: true })
      window.addEventListener('resize', updateScroll, { passive: true })
      // Run a few times after mount in case layout settles
      updateScroll()
      setTimeout(updateScroll, 100)
      setTimeout(updateScroll, 500)
      setTimeout(updateScroll, 1500)

      const clock = new THREE.Clock()

      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!alive.current) return
        const dt = Math.min(clock.getDelta(), 0.05)

        smoothT += (explodeT - smoothT) * 0.1
        const exploded = smoothT > 0.5

        root.rotation.y += (exploded ? 0.04 : spin * 0.4) * dt

        PARTS.forEach((p, i) => {
          const pg = partGroups[p.id]
          if (!pg) return
          // Top parts lead the explode
          const orderFromTop = PARTS.length - 1 - i
          const stagger = orderFromTop * 0.05
          const localT = Math.max(0, Math.min(1, (smoothT - stagger) / Math.max(0.01, 1 - stagger)))
          const eased = easeInOut(localT)
          const target = p.explodeY * eased
          pg.position.y += (target - pg.position.y) * 0.16

          if (exploded) {
            pg.position.y += Math.sin(clock.elapsedTime * 0.5 + i * 1.2) * 0.0012
          }
        })

        // Labels
        PARTS.forEach(p => {
          const el = labelEls[p.id]
          const pg = partGroups[p.id]
          if (!el || !pg) return
          const opacity = Math.max(0, (smoothT - 0.4) * 1.8)
          el.style.opacity = Math.min(1, opacity).toFixed(2)
          if (smoothT < 0.4) return
          const box = new THREE.Box3().setFromObject(pg)
          if (box.isEmpty()) return
          const ctr = box.getCenter(new THREE.Vector3())
          const s = toScreen(ctr)
          el.style.left = '12px'
          el.style.top  = `${(s.y - 9).toFixed(0)}px`
        })

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', updateScroll)
        overlay.remove()
      }
    }

    let cleanup
    init().then(fn => { cleanup = fn })
    return () => {
      alive.current = false
      cancelAnimationFrame(raf)
      renderer?.dispose()
      cleanup?.()
    }
  }, [variant, bg, spin])

  return <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
}