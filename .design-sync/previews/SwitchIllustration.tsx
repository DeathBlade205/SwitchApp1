import { SwitchIllustration } from 'nexus-commerce'

// The stroke colour is presently uniform across variants (ACCENT maps every
// key to the same gold) and `darkBg` isn't read inside the component — the
// real visual difference call sites rely on is the surrounding background,
// which these two cells supply directly rather than implying a fake variant
// sweep.
const frame = (dark: boolean) => ({
  width: 220,
  height: 220,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: dark ? '#1c1917' : '#f7f4ef',
})

export const OnDarkBackground = () => (
  <div style={frame(true)}><SwitchIllustration variant="tactile" darkBg /></div>
)

export const OnLightBackground = () => (
  <div style={frame(false)}><SwitchIllustration variant="hero" darkBg={false} /></div>
)
