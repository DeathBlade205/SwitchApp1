import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isMobile = window.matchMedia('(pointer: coarse)').matches
    const LINES = isMobile ? 8 : 20
    const PTS   = isMobile ? 60 : 120
    const N     = isMobile ? 120 : 400

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true })
    renderer.setClearColor(0xede9e2, 1)
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.z = 5

    const resize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const lineMat = (opacity) => new THREE.LineBasicMaterial({
      color: 0x44403c, transparent: true, opacity
    })

    // Float32Array-backed BufferAttributes avoid per-frame allocations
    const lines = Array.from({ length: LINES }, (_, l) => {
      const posArr = new Float32Array(PTS * 3)
      const geo = new THREE.BufferGeometry()
      const posAttr = new THREE.BufferAttribute(posArr, 3)
      geo.setAttribute('position', posAttr)
      const line = new THREE.Line(geo, lineMat(0.04 + Math.random() * 0.07))
      scene.add(line)
      return {
        posArr, posAttr,
        yBase:  -3.5 + (l / LINES) * 7,
        offset: Math.random() * Math.PI * 2,
        freq:   0.3 + Math.random() * 0.5,
        amp:    0.15 + Math.random() * 0.5,
        speed:  0.1 + Math.random() * 0.2,
      }
    })

    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      pos[i*3]   = (Math.random()-.5)*16
      pos[i*3+1] = (Math.random()-.5)*10
      pos[i*3+2] = (Math.random()-.5)*4
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    scene.add(new THREE.Points(dustGeo,
      new THREE.PointsMaterial({ color: 0xb8985a, size: 0.022, transparent: true, opacity: 0.4 })
    ))

    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / innerWidth - .5) * 2
      my = (e.clientY / innerHeight - .5) * 2
    }
    if (!isMobile) window.addEventListener('mousemove', onMouse)

    let raf
    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      if (document.hidden) return
      const t = clock.getElapsedTime()
      lines.forEach(({ posArr, posAttr, yBase, offset, freq, amp, speed }) => {
        for (let i = 0; i < PTS; i++) {
          const x = -7 + (i / PTS) * 14
          posArr[i*3]   = x
          posArr[i*3+1] = yBase + Math.sin(x * freq + t * speed + offset) * amp
          posArr[i*3+2] = 0
        }
        posAttr.needsUpdate = true
      })
      if (!isMobile) {
        scene.rotation.x += (-my * 0.04 - scene.rotation.x) * 0.05
        scene.rotation.y += ( mx * 0.04 - scene.rotation.y) * 0.05
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (!isMobile) window.removeEventListener('mousemove', onMouse)
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
}
