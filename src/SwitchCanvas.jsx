import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Bottom→top assembly order
const PARTS = [
  { id: 'lower',   label: 'PA66 Lower Cover',                   explodeY: -2.20, source: 'cad' },
  { id: 'spring',  label: 'Spring',                              explodeY: -0.80, source: 'synthetic' },
  { id: 'contact', label: 'Alloy Copper & Palladium Gold Reeds', explodeY: -0.30, source: 'synthetic' },
  { id: 'upper',   label: 'PC Upper Cover',                      explodeY:  1.20, source: 'cad' },
  { id: 'stem',    label: 'POK Stem',                            explodeY:  2.80, source: 'cad' },
]

const COLORS = {
  lower:   0x1a2638,
  spring:  0xc8b878,
  contact: 0xd4a64a,
  upper:   0xb8d4dc,
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

function makeSpring() {
  const g = new THREE.Group()
  const radius = 0.16, height = 0.95, coils = 8
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
  const tube = new THREE.TubeGeometry(curve, segs, 0.022, 10, false)
  const mat = new THREE.MeshStandardMaterial({ color: COLORS.spring, roughness: 0.22, metalness: 0.9 })
  const mesh = new THREE.Mesh(tube, mat)
  mesh.castShadow = true; mesh.receiveShadow = true
  g.add(mesh)
  return g
}

function makeContact() {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: COLORS.contact, roughness: 0.18, metalness: 0.9 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.04), mat)
  g.add(body)
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.04), mat)
  tab.position.set(0.05, 0.3, 0.06); tab.rotation.x = -0.5
  g.add(tab)
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.04), mat)
  foot.position.set(-0.06, -0.2, 0.04); foot.rotation.z = 0.3
  g.add(foot)
  const pin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), mat)
  pin.position.set(0, -0.34, 0)
  g.add(pin)
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), mat)
  pin2.position.set(-0.12, -0.32, 0)
  g.add(pin2)
  g.children.forEach(m => { m.castShadow = true; m.receiveShadow = true })
  return g
}

export default function SwitchCanvas({ variant = 'hero', bg = 0xf0ece6, spin = 0.3, explodeProgress = 0, showLabels = true }) {
  const progressRef = useRef(0)
  const labelsRef   = useRef(true)
  progressRef.current = explodeProgress
  labelsRef.current   = showLabels
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
      const isMobile = window.matchMedia('(pointer: coarse)').matches || w < 640

      renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile })
      renderer.setSize(w, h, false)
      renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))
      renderer.setClearColor(bg, 1)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.VSMShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2

      const scene = new THREE.Scene()
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

      const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 50)
      camera.position.set(1.6, 1.1, 7.8)
      camera.lookAt(0, 0.05, 0)

      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 2.2)
      key.position.set(2, 6, 4)
      key.castShadow = true
      key.shadow.mapSize.set(isMobile ? 512 : 2048, isMobile ? 512 : 2048)
      key.shadow.camera.left   = -3
      key.shadow.camera.right  =  3
      key.shadow.camera.top    =  3
      key.shadow.camera.bottom = -3
      key.shadow.camera.near   = 0.1
      key.shadow.camera.far    = 20
      key.shadow.radius = 8
      if (!isMobile) key.shadow.blurSamples = 16
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

        const allMeshes = []
        gltf.scene.traverse(n => { if (n.isMesh) allMeshes.push(n.clone()) })
        allMeshes.sort((a, b) => {
          const ba = new THREE.Box3().setFromObject(a)
          const bb = new THREE.Box3().setFromObject(b)
          return ba.getCenter(new THREE.Vector3()).y - bb.getCenter(new THREE.Vector3()).y
        })

        const cadIds = ['lower', 'upper', 'stem']
        allMeshes.forEach((m, i) => {
          const id = cadIds[i] || cadIds[cadIds.length - 1]
          m.castShadow = true; m.receiveShadow = true
          const color = id === 'stem' ? stemColor : COLORS[id]
          let mat
          if (id === 'upper') {
            // Transmission is expensive on mobile — use a simple transparent material instead
            mat = isMobile
              ? new THREE.MeshStandardMaterial({
                  color: 0xd4e8f0, roughness: 0.3, metalness: 0.05,
                  transparent: true, opacity: 0.78,
                })
              : new THREE.MeshPhysicalMaterial({
                  color: 0xffffff, roughness: 0.35, metalness: 0.0,
                  transmission: 0.85, thickness: 0.4, ior: 1.45,
                  attenuationColor: 0xb8d4dc, attenuationDistance: 1.5,
                  clearcoat: 0.5, clearcoatRoughness: 0.2,
                  transparent: true, opacity: 0.92,
                })
          } else if (id === 'stem') {
            mat = new THREE.MeshStandardMaterial({
              color, roughness: 0.35, metalness: 0.05, envMapIntensity: 0.8,
            })
          } else {
            mat = new THREE.MeshStandardMaterial({ color, roughness: 0.65, metalness: 0.02 })
          }
          m.material = mat
          if (id === 'upper') m.renderOrder = 2
          partGroups[id].add(m)
        })

        const spring = makeSpring()
        partGroups.spring.add(spring)
        partGroups.spring.position.set(0, 0.0, 0)

        const contact = makeContact()
        contact.scale.setScalar(1.2)
        partGroups.contact.add(contact)
        partGroups.contact.position.set(0.85, 0.05, 0.05)

        Object.values(partGroups).forEach(g => { g.userData.baseY = g.position.y })

        const box = new THREE.Box3().setFromObject(root)
        const size = box.getSize(new THREE.Vector3())
        root.scale.setScalar(1.05 / Math.max(size.x, size.y, size.z))

        const box2 = new THREE.Box3().setFromObject(root)
        root.position.sub(box2.getCenter(new THREE.Vector3()))

        root.rotation.y = Math.PI / 12
      } catch (e) { console.warn('GLB failed:', e) }

      const onResize = () => {
        const w2 = canvas.offsetWidth, h2 = canvas.offsetHeight
        renderer.setSize(w2, h2, false)
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // Reusable objects — avoids allocations inside the render loop
      const _proj   = new THREE.Vector3()
      const _box    = new THREE.Box3()
      const _center = new THREE.Vector3()

      const toScreen = pos3 => {
        _proj.copy(pos3).project(camera)
        return { x: (_proj.x*.5+.5)*canvas.offsetWidth, y: (-_proj.y*.5+.5)*canvas.offsetHeight }
      }

      let smoothT = 0
      const clock = new THREE.Clock()

      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!alive.current || document.hidden) return
        const dt = Math.min(clock.getDelta(), 0.05)

        const explodeT = progressRef.current
        smoothT += (explodeT - smoothT) * 0.1
        const exploded = smoothT > 0.5

        root.rotation.y += (exploded ? 0.04 : spin * 0.4) * dt

        PARTS.forEach((p, i) => {
          const pg = partGroups[p.id]
          if (!pg) return
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

        PARTS.forEach(p => {
          const el = labelEls[p.id]
          const pg = partGroups[p.id]
          if (!el || !pg) return
          if (!labelsRef.current) { el.style.opacity = '0'; return }
          const opacity = Math.max(0, (smoothT - 0.3) * 2.0)
          el.style.opacity = Math.min(1, opacity).toFixed(2)
          if (smoothT < 0.3) return
          _box.setFromObject(pg)
          if (_box.isEmpty()) return
          _box.getCenter(_center)
          const s = toScreen(_center)
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
