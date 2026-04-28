import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const PARTS = [
  { id: 'lower',   label: 'PA66 Lower Cover',                   explodeY: -2.20 },
  { id: 'spring',  label: 'Spring',                              explodeY: -0.80 },
  { id: 'contact', label: 'Alloy Copper & Palladium Gold Reeds', explodeY: -0.30 },
  { id: 'upper',   label: 'PC Upper Cover',                      explodeY:  1.20 },
  { id: 'stem',    label: 'POK Stem',                            explodeY:  2.80 },
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
  const radius = 0.16, height = 0.95, coils = 8, segs = coils * 28
  const points = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, a = t * coils * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(a)*radius, -height/2 + t*height, Math.sin(a)*radius))
  }
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segs, 0.022, 10, false),
    new THREE.MeshStandardMaterial({ color: COLORS.spring, roughness: 0.22, metalness: 0.9 })
  )
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
  tab.position.set(0.05, 0.3, 0.06); tab.rotation.x = -0.5; g.add(tab)
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.04), mat)
  foot.position.set(-0.06, -0.2, 0.04); foot.rotation.z = 0.3; g.add(foot)
  const pin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), mat)
  pin.position.set(0, -0.34, 0); g.add(pin)
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), mat)
  pin2.position.set(-0.12, -0.32, 0); g.add(pin2)
  g.children.forEach(m => { m.castShadow = true; m.receiveShadow = true })
  return g
}

export default function SwitchCanvas({ variant = 'hero', bg = 0xf0ece6, spin = 0.3, explodeProgress = 0, showLabels = true }) {
  const progressRef  = useRef(0)
  const labelsRef    = useRef(true)
  const stemMatRef   = useRef(null)   // for live variant swaps without scene rebuild
  const spinRef      = useRef(spin)
  progressRef.current = explodeProgress
  labelsRef.current   = showLabels
  spinRef.current     = spin

  const canvasRef = useRef(null)
  const alive     = useRef(true)

  // Swap stem colour without rebuilding the scene
  useEffect(() => {
    if (stemMatRef.current) {
      stemMatRef.current.color.setHex(STEM_OVERRIDE[variant] ?? STEM_OVERRIDE.hero)
    }
  }, [variant])

  useEffect(() => {
    alive.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    let raf, renderer, pmrem, envTexture

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
      pmrem = new THREE.PMREMGenerator(renderer)
      envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = envTexture

      const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 50)
      camera.position.set(1.6, 1.1, 7.8)
      camera.lookAt(0, 0.05, 0)

      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 2.2)
      key.position.set(2, 6, 4)
      key.castShadow = true
      key.shadow.mapSize.set(isMobile ? 512 : 2048, isMobile ? 512 : 2048)
      key.shadow.camera.left = -3; key.shadow.camera.right  =  3
      key.shadow.camera.top  =  3; key.shadow.camera.bottom = -3
      key.shadow.camera.near = 0.1; key.shadow.camera.far   = 20
      key.shadow.radius = 8
      if (!isMobile) key.shadow.blurSamples = 16
      key.shadow.bias = -0.0005
      scene.add(key)
      scene.add(Object.assign(new THREE.DirectionalLight(0xdde8f0, 1.0), { position: new THREE.Vector3(-5, 1, 3) }))
      scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.7), { position: new THREE.Vector3(0, -3, -4) }))

      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.12 })
      )
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -1.5
      shadowPlane.receiveShadow = true
      scene.add(shadowPlane)

      const root = new THREE.Group()
      scene.add(root)
      const partGroups = {}
      PARTS.forEach(p => {
        const g = new THREE.Group(); g.name = p.id
        root.add(g); partGroups[p.id] = g
      })

      const overlay = document.createElement('div')
      overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;'
      const wrap = canvas.parentElement
      if (wrap) { wrap.style.position = 'relative'; wrap.appendChild(overlay) }

      const labelEls = {}
      PARTS.forEach(p => {
        const el   = document.createElement('div')
        el.style.cssText = `position:absolute;display:flex;align-items:center;gap:10px;opacity:0;transition:opacity 0.5s ease;`
        const line = document.createElement('div')
        line.style.cssText = 'width:48px;height:1px;background:#b8985a;flex-shrink:0;'
        const txt  = document.createElement('span')
        txt.style.cssText = `font-family:'DM Mono',monospace;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,25,23,0.78);white-space:nowrap;font-weight:500;`
        txt.textContent = p.label
        el.appendChild(line); el.appendChild(txt)
        overlay.appendChild(el)
        labelEls[p.id] = el
      })

      try {
        const gltf = await loadParts()
        if (!alive.current) return

        const allMeshes = []
        gltf.scene.traverse(n => { if (n.isMesh) allMeshes.push(n.clone()) })
        allMeshes.sort((a, b) => {
          const ca = new THREE.Box3().setFromObject(a).getCenter(new THREE.Vector3())
          const cb = new THREE.Box3().setFromObject(b).getCenter(new THREE.Vector3())
          return ca.y - cb.y
        })

        const cadIds = ['lower', 'upper', 'stem']
        const stemColor = STEM_OVERRIDE[variant] ?? STEM_OVERRIDE.hero

        allMeshes.forEach((m, i) => {
          const id = cadIds[i] ?? cadIds[cadIds.length - 1]
          m.castShadow = true; m.receiveShadow = true
          let mat
          if (id === 'upper') {
            mat = isMobile
              ? new THREE.MeshStandardMaterial({ color: 0xd4e8f0, roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0.78 })
              : new THREE.MeshPhysicalMaterial({
                  color: 0xffffff, roughness: 0.35, metalness: 0.0,
                  transmission: 0.85, thickness: 0.4, ior: 1.45,
                  attenuationColor: 0xb8d4dc, attenuationDistance: 1.5,
                  clearcoat: 0.5, clearcoatRoughness: 0.2,
                  transparent: true, opacity: 0.92,
                })
          } else if (id === 'stem') {
            mat = new THREE.MeshStandardMaterial({ color: stemColor, roughness: 0.35, metalness: 0.05, envMapIntensity: 0.8 })
            stemMatRef.current = mat
          } else {
            mat = new THREE.MeshStandardMaterial({ color: COLORS[id], roughness: 0.65, metalness: 0.02 })
          }
          m.material = mat
          if (id === 'upper') m.renderOrder = 2
          partGroups[id].add(m)
        })

        partGroups.spring.add(makeSpring())
        partGroups.spring.position.set(0, 0, 0)
        const contact = makeContact()
        contact.scale.setScalar(1.2)
        partGroups.contact.add(contact)
        partGroups.contact.position.set(0.85, 0.05, 0.05)

        Object.values(partGroups).forEach(g => { g.userData.baseY = g.position.y })

        const box  = new THREE.Box3().setFromObject(root)
        root.scale.setScalar(1.05 / Math.max(...box.getSize(new THREE.Vector3()).toArray()))
        const box2 = new THREE.Box3().setFromObject(root)
        root.position.sub(box2.getCenter(new THREE.Vector3()))
        root.rotation.y = Math.PI / 12
      } catch (e) { console.warn('GLB load failed:', e) }

      const onResize = () => {
        const w2 = canvas.offsetWidth, h2 = canvas.offsetHeight
        renderer.setSize(w2, h2, false)
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // Reusable objects — prevents per-frame GC pressure
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

        smoothT += (progressRef.current - smoothT) * Math.min(1, dt * 6)
        const exploded = smoothT > 0.5

        root.rotation.y += (exploded ? 0.04 : spinRef.current * 0.4) * dt

        PARTS.forEach((p, i) => {
          const pg = partGroups[p.id]
          if (!pg) return
          const stagger = (PARTS.length - 1 - i) * 0.05
          const localT  = Math.max(0, Math.min(1, (smoothT - stagger) / Math.max(0.01, 1 - stagger)))
          const target  = (pg.userData.baseY ?? 0) + p.explodeY * easeInOut(localT)
          pg.position.y += (target - pg.position.y) * Math.min(1, dt * 9.6)
          if (exploded) pg.position.y += Math.sin(clock.elapsedTime * 0.5 + i * 1.2) * 0.0012
        })

        if (smoothT > 0.3) {
          PARTS.forEach(p => {
            const el = labelEls[p.id], pg = partGroups[p.id]
            if (!el || !pg) return
            if (!labelsRef.current) { el.style.opacity = '0'; return }
            el.style.opacity = Math.min(1, (smoothT - 0.3) * 2).toFixed(2)
            _box.setFromObject(pg)
            if (_box.isEmpty()) return
            const s = toScreen(_box.getCenter(_center))
            el.style.left = '12px'
            el.style.top  = `${(s.y - 9).toFixed(0)}px`
          })
        } else {
          PARTS.forEach(p => { if (labelEls[p.id]) labelEls[p.id].style.opacity = '0' })
        }

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('resize', onResize)
        overlay.remove()
        // Dispose all GPU resources
        scene.traverse(obj => {
          obj.geometry?.dispose()
          if (obj.material) [].concat(obj.material).forEach(m => m.dispose())
        })
        envTexture?.dispose()
        pmrem?.dispose()
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
  }, [bg])   // variant and spin read via refs — no scene rebuild needed

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
