import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Reusable 3D mechanical switch renderer
// variant: 'hero' | 'linear' | 'tactile' | 'clicky'
export default function SwitchCanvas({ variant = 'hero', bg = 0xede9e2, spin = 0.4 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.offsetWidth || 400
    const h = canvas.offsetHeight || 400

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setClearColor(bg, 1)
    renderer.shadowMap.enabled = true

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50)
    camera.position.set(0, 1.2, 4.5)
    camera.lookAt(0, 0, 0)

    // Lighting — studio quality
    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3, 5, 4); key.castShadow = true
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xd4b87a, 0.5)
    fill.position.set(-4, 2, 2)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.8)
    rim.position.set(0, -3, -3)
    scene.add(rim)

    const COLORS = {
      hero:    { housing: 0x1c1917, stem: 0xb8985a, spring: 0xd4cfc8 },
      linear:  { housing: 0x1c1917, stem: 0xc94040, spring: 0xd4cfc8 },
      tactile: { housing: 0x1c1917, stem: 0x4a7ab8, spring: 0xd4cfc8 },
      clicky:  { housing: 0x1c1917, stem: 0x4a9e6a, spring: 0xd4cfc8 },
    }
    const c = COLORS[variant] || COLORS.hero

    const group = new THREE.Group()

    // Bottom housing
    const hMat = new THREE.MeshPhongMaterial({ color: c.housing, specular: 0x555555, shininess: 60 })
    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), hMat)
    housing.position.y = -0.7
    group.add(housing)

    // Housing top plate with hole
    const topPlate = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.12, 1.4),
      new THREE.MeshPhongMaterial({ color: 0x2c2420, specular: 0x444444, shininess: 80 })
    )
    topPlate.position.y = -0.34
    group.add(topPlate)

    // Rails on housing
    ;[-0.5, 0.5].forEach(x => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.5, 0.06),
        new THREE.MeshPhongMaterial({ color: 0x3c3230 })
      )
      rail.position.set(x, -0.55, 0)
      group.add(rail)
    })

    // Stem
    const stemMat = new THREE.MeshPhongMaterial({ color: c.stem, specular: 0xffffff, shininess: 100 })
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.55), stemMat)
    stem.position.y = 0.05
    group.add(stem)

    // Stem cross (keycap mount)
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.12), stemMat)
    crossH.position.y = 0.52
    group.add(crossH)
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.5), stemMat)
    crossV.position.y = 0.52
    group.add(crossV)

    // Spring (coil approximation with cylinder)
    const springMat = new THREE.MeshPhongMaterial({ color: c.spring, specular: 0xaaaaaa, shininess: 40, wireframe: false })
    for (let i = 0; i < 8; i++) {
      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.025, 6, 20),
        springMat
      )
      coil.position.y = -0.88 + i * 0.065
      coil.rotation.x = Math.PI / 2
      group.add(coil)
    }

    // Keycap
    const keycapMat = new THREE.MeshPhongMaterial({
      color: variant === 'hero' ? 0x1c1917 : 0xf0ece5,
      specular: variant === 'hero' ? 0x666666 : 0xbbbbbb,
      shininess: variant === 'hero' ? 90 : 60,
    })
    const keycap = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.38, 1.55),
      keycapMat
    )
    keycap.position.y = 1.05
    group.add(keycap)

    // Keycap dish (top concave feel)
    const dish = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.08, 1.3),
      new THREE.MeshPhongMaterial({
        color: variant === 'hero' ? 0x2c2420 : 0xddd8d0,
        shininess: 30
      })
    )
    dish.position.y = 1.22
    group.add(dish)

    // Legend text plane (fake shine)
    if (variant !== 'hero') {
      const legend = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.3),
        new THREE.MeshBasicMaterial({ color: c.stem, transparent: true, opacity: 0.8 })
      )
      legend.position.set(0, 1.27, 0)
      legend.rotation.x = -Math.PI / 2
      group.add(legend)
    }

    scene.add(group)

    // Shadow plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.06 })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = -1.05
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)

    let hovered = false
    const parent = canvas.parentElement
    parent?.addEventListener('mouseenter', () => hovered = true)
    parent?.addEventListener('mouseleave', () => hovered = false)

    const resize = () => {
      const w2 = canvas.offsetWidth, h2 = canvas.offsetHeight
      renderer.setSize(w2, h2, false)
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', resize)

    let raf
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      group.rotation.y = t * (hovered ? spin * 2 : spin * 0.6)
      group.rotation.x = Math.sin(t * 0.4) * 0.08
      group.position.y = Math.sin(t * 0.6) * 0.06
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      renderer.dispose()
    }
  }, [variant, bg, spin])

  return <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
}
