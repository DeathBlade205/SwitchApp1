import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Parts ordered bottom→top, matching GLB geometry names
const PARTS = [
  { name: 'bottom_case',     label: 'PA66 Bottom Case',              explodeY: -0.52, color: 0x8bb8d0, rough: 0.55, metal: 0.02 },
  { name: 'spring_contacts', label: 'Spring & Gold Reeds',           explodeY: -0.18, color: 0xc8b060, rough: 0.2,  metal: 0.7  },
  { name: 'upper_case',      label: 'PC Upper Case',                  explodeY:  0.2,  color: 0x8bb8d0, rough: 0.45, metal: 0.02 },
  { name: 'stem',            label: 'POK Stem',                       explodeY:  0.62, color: 0x6aa8c8, rough: 0.35, metal: 0.05 },
]

const ACCENT = {
  hero:    [0xb8985a, 0xb8985a, 0x8bb8d0, 0x6aa8c8],
  linear:  [0x2a4a6a, 0xc8b060, 0x2a4a6a, 0xc94040],
  tactile: [0x2a4a6a, 0xc8b060, 0x2a4a6a, 0x4a7ab8],
  clicky:  [0x2a4a6a, 0xc8b060, 0x2a4a6a, 0x4a9e6a],
}

let partsPromise = null
function loadParts() {
  if (!partsPromise) {
    partsPromise = new Promise((resolve, reject) =>
      new GLTFLoader().load('/switch_parts.glb', resolve, undefined, reject)
    )
  }
  return partsPromise
}

const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2
const easeOut   = t => 1 - Math.pow(1-t,3)

export default function SwitchCanvas({ variant = 'hero', bg = 0xede9e2, spin = 0.4 }) {
  const canvasRef = useRef(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    let raf, renderer

    const init = async () => {
      const w = canvas.offsetWidth || 400
      const h = canvas.offsetHeight || 400

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setSize(w, h, false)
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setClearColor(bg, 1)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 50)
      camera.position.set(0, 0.15, 4.2)
      camera.lookAt(0, 0, 0)

      // Studio lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 2.0)
      key.position.set(3, 6, 4); key.castShadow = true
      key.shadow.mapSize.set(1024, 1024); scene.add(key)
      const fill = new THREE.DirectionalLight(0xd4c090, 0.6)
      fill.position.set(-4, 1, 2); scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.9)
      rim.position.set(0, -2, -3); scene.add(rim)

      const accentColors = ACCENT[variant] || ACCENT.hero

      // Root group that rotates
      const root = new THREE.Group()
      scene.add(root)

      // Per-part groups (inside root)
      const partGroups = PARTS.map((p, i) => {
        const g = new THREE.Group()
        g.userData = { ...p, accentColor: accentColors[i] }
        root.add(g)
        return g
      })

      // Labels (HTML overlay)
      let labelEls = []
      const labelContainer = document.createElement('div')
      labelContainer.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;`
      canvas.parentElement.style.position = 'relative'
      canvas.parentElement.appendChild(labelContainer)

      PARTS.forEach((p, i) => {
        const wrap = document.createElement('div')
        wrap.style.cssText = `
          position:absolute;display:flex;align-items:center;gap:8px;
          opacity:0;transition:opacity 0.4s ease;pointer-events:none;
          left:0;top:0;transform:translate(0,0);
        `
        const line = document.createElement('div')
        line.style.cssText = `width:28px;height:1px;background:rgba(28,25,23,0.4);flex-shrink:0;`
        const text = document.createElement('span')
        text.style.cssText = `
          font-family:'DM Mono',monospace;font-size:.55rem;letter-spacing:.1em;
          text-transform:uppercase;color:rgba(28,25,23,0.55);white-space:nowrap;
        `
        text.textContent = p.label
        wrap.appendChild(line)
        wrap.appendChild(text)
        labelContainer.appendChild(wrap)
        labelEls.push(wrap)
      })

      try {
        const gltf = await loadParts()
        if (!alive.current) return

        // Collect all meshes, sort by Y centroid ascending
        const allMeshes = []
        gltf.scene.traverse(n => { if (n.isMesh) allMeshes.push(n.clone()) })
        allMeshes.sort((a, b) => {
          const ya = new THREE.Box3().setFromObject(a).getCenter(new THREE.Vector3()).y
          const yb = new THREE.Box3().setFromObject(b).getCenter(new THREE.Vector3()).y
          return ya - yb
        })

        // Distribute meshes into 4 part groups by Y quartile
        const n = allMeshes.length
        allMeshes.forEach((m, i) => {
          const gi = Math.min(Math.floor((i / n) * 4), 3)
          const pg = partGroups[gi]
          const { accentColor, rough, metal } = pg.userData
          m.castShadow = true; m.receiveShadow = true
          m.material = new THREE.MeshStandardMaterial({
            color: accentColor,
            roughness: rough,
            metalness: metal,
          })
          pg.add(m)
        })

        // Fit entire model: measure assembled bounding box
        const box = new THREE.Box3().setFromObject(root)
        const size = box.getSize(new THREE.Vector3())
        const maxD = Math.max(size.x, size.y, size.z)
        const sf = 2.0 / maxD
        root.scale.setScalar(sf)

        // Centre
        const box2 = new THREE.Box3().setFromObject(root)
        const ctr = box2.getCenter(new THREE.Vector3())
        root.position.sub(ctr)

      } catch(err) {
        console.warn('GLB load error:', err)
      }

      // Hover
      let hovered = false
      canvas.parentElement?.addEventListener('mouseenter', () => hovered = true)
      canvas.parentElement?.addEventListener('mouseleave', () => hovered = false)

      // Resize
      const onResize = () => {
        const w2 = canvas.offsetWidth, h2 = canvas.offsetHeight
        renderer.setSize(w2, h2, false)
        camera.aspect = w2/h2; camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // Animation phases: assembled → exploding → exploded → assembling → repeat
      const HOLD_ASM  = 1.8  // seconds assembled before explode
      const DUR_EXP   = 1.6  // explode duration
      const HOLD_EXP  = 3.0  // hold exploded
      const DUR_ASM   = 1.3  // assemble duration
      let phase = 'assembled', timer = 0

      const clock = new THREE.Clock()

      // Project 3D point to 2D canvas coords
      const project = (pos3) => {
        const v = pos3.clone().project(camera)
        const rect = canvas.getBoundingClientRect()
        return {
          x: (v.x * 0.5 + 0.5) * rect.width,
          y: (-v.y * 0.5 + 0.5) * rect.height,
        }
      }

      const animate = () => {
        raf = requestAnimationFrame(animate)
        if (!alive.current) return
        const dt = clock.getDelta()
        timer += dt

        // Phase FSM
        if      (phase === 'assembled'  && timer > HOLD_ASM) { phase='exploding'; timer=0 }
        else if (phase === 'exploding'  && timer > DUR_EXP)  { phase='exploded';  timer=0 }
        else if (phase === 'exploded'   && timer > HOLD_EXP) { phase='assembling';timer=0 }
        else if (phase === 'assembling' && timer > DUR_ASM)  { phase='assembled'; timer=0 }

        const isExploding = phase === 'exploding' || phase === 'exploded'
        const showLabels  = phase === 'exploded'

        // Spin — slow during explode
        root.rotation.y += (isExploding ? spin*0.08 : spin*0.5) * dt

        // Move each part
        partGroups.forEach((pg, i) => {
          const meta = pg.userData

          // Stagger index: stem first out, bottom first back
          const stagger = phase === 'exploding'
            ? (partGroups.length - 1 - i) * 0.12  // top goes first
            : i * 0.08                              // bottom comes back first

          let t = 0
          if (phase === 'exploding') {
            t = easeOut(Math.max(0, Math.min(1, (timer - stagger) / DUR_EXP)))
          } else if (phase === 'exploded') {
            t = 1
          } else if (phase === 'assembling') {
            t = 1 - easeInOut(Math.max(0, Math.min(1, (timer - stagger) / DUR_ASM)))
          }

          const targetY = meta.explodeY * t
          pg.position.y += (targetY - pg.position.y) * 0.18

          // Subtle float when exploded
          if (phase === 'exploded') {
            pg.position.y += Math.sin(clock.elapsedTime * 0.6 + i * 1.2) * 0.003
          }
        })

        // Update labels
        labelEls.forEach((el, i) => {
          const pg = partGroups[i]
          const worldPos = new THREE.Vector3()
          pg.getWorldPosition(worldPos)
          // Offset label to left side
          const screenPos = project(worldPos)
          const rect = canvas.getBoundingClientRect()
          const cx = rect.width * 0.5
          // Place on left side
          el.style.left = `${Math.max(4, screenPos.x - 120)}px`
          el.style.top  = `${screenPos.y - 8}px`
          el.style.opacity = showLabels ? '1' : '0'
          // Flip to right if part is on right half
          if (screenPos.x > cx) {
            el.style.flexDirection = 'row-reverse'
          } else {
            el.style.flexDirection = 'row'
          }
        })

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('resize', onResize)
        labelContainer.remove()
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