import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const CONFIGS = {
  actuator: {
    bg: 0xddc8be,
    build: (scene) => {
      const group = new THREE.Group()
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.42, 1.6, 16),
        new THREE.MeshPhongMaterial({ color: 0x2a1a10, specular: 0xc9a99a, shininess: 90 })
      )
      group.add(body)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.055, 10, 40),
        new THREE.MeshPhongMaterial({ color: 0xb08878, specular: 0xffffff, shininess: 120 })
      )
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0.3
      group.add(ring)
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 12),
        new THREE.MeshPhongMaterial({ color: 0x3d2010, shininess: 60 })
      )
      cap.position.y = 0.9
      group.add(cap)
      scene.add(group)
      return group
    }
  },
  module: {
    bg: 0xcfccc0,
    build: (scene) => {
      const group = new THREE.Group()
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.75, 0.28),
        new THREE.MeshPhongMaterial({ color: 0x1a1810, specular: 0x888866, shininess: 110 })
      )
      group.add(body)
      // LED dots
      for (let i = 0; i < 5; i++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xc9a99a : 0x888855 })
        )
        led.position.set(-0.36 + i * 0.18, 0.18, 0.15)
        group.add(led)
      }
      // Port ridge
      const port = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.18, 0.08),
        new THREE.MeshPhongMaterial({ color: 0x333320, shininess: 40 })
      )
      port.position.set(0.52, -0.1, 0.15)
      group.add(port)
      scene.add(group)
      return group
    }
  },
  regulator: {
    bg: 0xbecccc,
    build: (scene) => {
      const group = new THREE.Group()
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 22, 22),
        new THREE.MeshPhongMaterial({ color: 0x102020, specular: 0x558888, shininess: 80 })
      )
      group.add(sphere)
      const wire = new THREE.Mesh(
        new THREE.SphereGeometry(0.73, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0x2a6666, wireframe: true, transparent: true, opacity: 0.12 })
      )
      group.add(wire)
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.04, 8, 50),
        new THREE.MeshPhongMaterial({ color: 0x558888, shininess: 100 })
      )
      band.rotation.x = Math.PI / 2
      group.add(band)
      scene.add(group)
      return group
    }
  }
}

export default function ProductCanvas({ type }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cfg = CONFIGS[type] || CONFIGS.actuator

    const w = canvas.offsetWidth || 300
    const h = canvas.offsetHeight || 400

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(cfg.bg, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 50)
    camera.position.z = 3

    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const key = new THREE.DirectionalLight(0xffffff, 1.8)
    key.position.set(2, 3, 3)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xc9a99a, 0.8)
    fill.position.set(-3, -1, 2)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.6)
    rim.position.set(0, -3, -2)
    scene.add(rim)

    const mesh = cfg.build(scene)

    let hovered = false
    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mouseenter', () => { hovered = true })
      parent.addEventListener('mouseleave', () => { hovered = false })
    }

    let raf
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      mesh.rotation.y = t * (hovered ? 0.9 : 0.35)
      mesh.rotation.x = Math.sin(t * 0.5) * 0.12
      mesh.position.y = Math.sin(t * 0.7) * 0.08
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
    }
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
