import { HeroCanvas } from 'nexus-commerce'

// Decorative full-bleed WebGL background — absolutely positioned (inset:0)
// to fill its nearest positioned ancestor. height:'100%' resolves to 0
// unless every ancestor has a definite height, so this wrapper uses an
// explicit pixel height (matches the card's configured viewport) instead.
export const Default = () => (
  <div style={{ position: 'relative', width: '100%', height: 480, background: '#ede9e2' }}>
    <HeroCanvas />
  </div>
)
