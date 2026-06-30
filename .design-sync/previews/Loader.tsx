import { Loader } from 'nexus-commerce'

// Pressed/rippling states are interaction-driven (mouse/keyboard event +
// internal timers) and can't be reached via props — only the idle state
// renders statically. See NOTES.md.
//
// #loader is `position: fixed; inset: 0`, which fills the viewport but
// contributes nothing to the document's own scroll height — a fullPage
// screenshot of an otherwise-empty body collapses to a sliver and crops the
// (correctly centered) content. The minHeight div below gives the document
// real flow height so the capture uses the full card viewport.
export const Idle = () => (
  <div style={{ minHeight: '100vh' }}>
    <Loader onComplete={() => {}} />
  </div>
)

