import { HeroKeycaps } from 'nexus-commerce'

// .keycap and .keycaps-prompt enter via a CSS @keyframes animation that
// starts at opacity:0 and only reaches opacity:1 after a ~1.1s+ delay (the
// real hero's entrance choreography). A static capture taken immediately on
// mount lands inside that delay window and renders blank — this override
// neutralizes the entrance animation for the preview card only, the same
// way the site's own `prefers-reduced-motion` rule does.
const noEntranceAnim = `
  .keycap, .keycaps-prompt { animation: none !important; opacity: 1 !important; transform: none !important; }
`

export const Default = () => (
  <div style={{ padding: '3rem 2rem', background: '#f7f4ef' }}>
    <style>{noEntranceAnim}</style>
    <HeroKeycaps onPick={() => {}} />
  </div>
)
