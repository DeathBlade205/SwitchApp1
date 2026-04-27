import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// 5-part anatomy matching reference: lower cover holds spring+contact, upper cover snaps on top
// Bottom→top
const PARTS = [
  { id: 'lower',   label: 'PA66 Lower Cover',                    explodeY: -2.20, source: 'cad' },
  { id: 'spring',  label: 'Spring',                               explodeY: -0.80, source: 'synthetic' },
  { id: 'contact', label: 'Alloy Copper & Palladium Gold Reeds',  explodeY: -0.30, source: 'synthetic' },
  { id: 'upper',   label: 'PC Upper Cover',                       explodeY:  1.20, source: 'cad' },
  { id: 'stem',    label: 'POK Stem',                             explodeY:  2.80, source: 'cad' },
]

const COLORS = {
  lower:   0x1a2638,   // PA66 — dark navy nylon
  spring:  0xc8b878,
  contact: 0xd4a64a,
  upper:   0xb8d4dc,   // PC — frosted light blue polycarbonate
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

export default function SwitchCanvas({ variant = 'hero', bg = 0xf0ece6, spin = 0.3, explodeProgress = 0, showLabels = true }) {
  const progressRef = useRef(0)
  const labelsRef = useRef(true)
  progressRef.current = explodeProgress
  labelsRef.current = showLabels
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
      renderer.shadowMap.type = THREE.VSMShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2

      const scene = new THREE.Scene()

      // Environment map for realistic transmission/reflection on the upper cover
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

      const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 50)
      camera.position.set(1.6, 1.1, 7.8)
      camera.lookAt(0, 0.05, 0)

      // Studio lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 2.2)
      key.position.set(2, 6, 4)
      key.castShadow = true
      key.shadow.mapSize.set(2048, 2048)
      // Wide frustum for soft contact shadow
      key.shadow.camera.left = -3
      key.shadow.camera.right = 3
      key.shadow.camera.top = 3
      key.shadow.camera.bottom = -3
      key.shadow.camera.near = 0.1
      key.shadow.camera.far = 20
      key.shadow.radius = 8
      key.shadow.blurSamples = 16
      key.shadow.bias = -0.0005
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xdde8f0, 1.0)
      fill.position.set(-5, 1, 3); scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.7)
      rim.position.set(0, -3, -4); scene.add(rim)

      const sp = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.12 })
      )
      sp.rotation.x = -Math.PI / 2
      sp.position.y = -1.5
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
        el.style.cssText = `position:absolute;display:flex;align-items:center;gap:10px;
          opacity:0;transition:opacity 0.5s ease;`
        const line = document.createElement('div')
        line.style.cssText = 'width:48px;height:1px;background:#b8985a;flex-shrink:0;'
        const txt = document.createElement('span')
        txt.style.cssText = `font-family:'DM Mono',monospace;font-size:.62rem;
          letter-spacing:.18em;text-transform:uppercase;color:rgba(28,25,23,0.78);
          white-space:nowrap;font-weight:500;`
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
        // 3 CAD parts now: lower cover, upper cover, stem (sorted bottom→top)
        const cadIds = ['lower', 'upper', 'stem']
        allMeshes.forEach((m, i) => {
          const id = cadIds[i] || cadIds[cadIds.length - 1]
          m.castShadow = true; m.receiveShadow = true
          const color = id === 'stem' ? stemColor : COLORS[id]
          // Upper cover: transparent frosted PC like the references.
          // Lower cover: matte nylon. Stem: smooth polished POM.
          let mat
          if (id === 'upper') {
            mat = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              roughness: 0.35,
              metalness: 0.0,
              transmission: 0.85,         // glass-like transparency
              thickness: 0.4,
              ior: 1.45,                   // polycarbonate IOR
              attenuationColor: 0xb8d4dc,  // tints the light passing through
              attenuationDistance: 1.5,
              clearcoat: 0.5,
              clearcoatRoughness: 0.2,
              transparent: true,
              opacity: 0.92,
            })
          } else if (id === 'stem') {
            mat = new THREE.MeshStandardMaterial({
              color, roughness: 0.45, metalness: 0.04,
            })
          } else {
            mat = new THREE.MeshStandardMaterial({
              color, roughness: 0.65, metalness: 0.02,
            })
          }
          m.material = mat
          if (id === 'upper') m.renderOrder = 2
          partGroups[id].add(m)
        })

        // ── Synthetic parts ──
        // Lower cover CAD runs Y -1.15 → +0.32, has cavity in the upper portion
        // Upper cover CAD runs Y +0.32 → +0.78
        // Spring + contact sit INSIDE the lower cover cavity around Y +0.0 in assembled state
        const spring = makeSpring()
        partGroups.spring.add(spring)
        partGroups.spring.position.set(0, 0.0, 0)

        const contact = makeContact()
        contact.scale.setScalar(1.2)
        partGroups.contact.add(contact)
        partGroups.contact.position.set(0.85, 0.05, 0.05)

        // Store each group's assembled-state Y so explode is a delta from there
        Object.values(partGroups).forEach(g => { g.userData.baseY = g.position.y })

        // Scale entire assembly to fit — smaller so explode has viewport room
        const box = new THREE.Box3().setFromObject(root)
        const size = box.getSize(new THREE.Vector3())
        root.scale.setScalar(1.05 / Math.max(size.x, size.y, size.z))

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

      // Explode driven by external `explodeProgress` prop (read each frame from ref)
      let smoothT = 0

      const clock = new THREE.Clock()

      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!alive.current) return
        const dt = Math.min(clock.getDelta(), 0.05)

        const explodeT = progressRef.current
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
          const baseY = pg.userData.baseY ?? 0
          const target = baseY + p.explodeY * eased
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
          if (!labelsRef.current) { el.style.opacity = '0'; return }
          const opacity = Math.max(0, (smoothT - 0.3) * 2.0)
          el.style.opacity = Math.min(1, opacity).toFixed(2)
          if (smoothT < 0.3) return
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