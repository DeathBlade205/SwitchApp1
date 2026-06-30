import { AnatomySection } from 'nexus-commerce'

// .reveal elements (heading, description) start at opacity:0 and only reach
// opacity:1 via a `.visible` class toggled by a site-wide GSAP ScrollTrigger
// in ScrollAnimations.js — a separate module the real app wires up globally,
// never imported by AnatomySection itself. Outside that wiring (as here,
// scoped standalone) the text never reveals; this override shows the text's
// true rendered state for the card, the same way the site's own
// `prefers-reduced-motion` rule does.
const noRevealAnim = `.reveal { opacity: 1 !important; transform: none !important; }`

// Self-contained page section (mounts its own SwitchCanvas once an
// IntersectionObserver reports it's near-viewport, which it is by default
// inside the card). No props to vary — one canonical story.
export const Default = () => (
  <>
    <style>{noRevealAnim}</style>
    <AnatomySection />
  </>
)
