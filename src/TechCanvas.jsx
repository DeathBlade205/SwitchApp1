import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function TechCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const w = canvas.offsetWidth || 400
    const h = canvas.offsetHeight || 480

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(w, h, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 50)
    camera.position.z = 5

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const pl = new THREE.PointLight(0xc9a99a, 3, 12)
    pl.position.set(2, 2, 3)
    scene.add(pl)

    const nodePositions = [
      [0, 0, 0],
      [1.6, 1.1, 0.3], [-1.4, 0.9, 0.2],
      [0.9, -1.3, 0.4], [-0.6, -1.2, 0.5],
      [1.3, -0.2, -0.4], [-1.1, 0.2, -0.5],
    ]

    const nodes = nodePositions.map((pos, i) => {
      const r = i === 0 ? 0.28 : 0.14 + Math.random() * 0.08
      const geo = new THREE.IcosahedronGeometry(r, 1)
      const mat = new THREE.MeshPhongMaterial({
        color: i === 0 ? 0x1a1210 : 0x3d2e2a,
        emissive: i === 0 ? 0x1a0800 : 0x050200,
        specular: 0xc9a99a,
        shininess: 80,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...pos)
      scene.add(mesh)
      return mesh
    })

    // Connections
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1a1210, transparent: true, opacity: 0.15 })
    nodePositions.slice(1).forEach(pos => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...pos),
      ])
      scene.add(new THREE.Line(geo, lineMat))
    })

    // Outer ring
    const ringGeo = new THREE.RingGeometry(2.8, 2.82, 80)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1a1210, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    scene.add(new THREE.Mesh(ringGeo, ringMat))

    let raf
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      nodes.forEach((n, i) => {
        n.rotation.y += 0.008 + i * 0.001
        n.position.y = nodePositions[i][1] + Math.sin(t * 0.6 + i) * 0.06
      })
      scene.rotation.y = Math.sin(t * 0.2) * 0.3
      scene.rotation.x = Math.sin(t * 0.15) * 0.12
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
