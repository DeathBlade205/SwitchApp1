import { SwitchCanvas } from 'nexus-commerce'

// Sizes itself off the container's offsetWidth/offsetHeight, so every cell
// needs an explicit box.
const box = { width: '100%', height: 320, position: 'relative' as const }

export const Assembled = () => (
  <div style={box}>
    <SwitchCanvas variant="tactile" bg={0xf0ece6} spin={0.3} />
  </div>
)

export const Exploded = () => (
  <div style={box}>
    <SwitchCanvas variant="hero" bg={0xede9e2} spin={0.15} explodeProgress={1} showLabels />
  </div>
)
