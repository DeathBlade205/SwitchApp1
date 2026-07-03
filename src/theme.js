// Per-switch-type accent color, shared by every surface that visualizes a
// switch (hero keycaps, product illustrations, product/shop card canvases,
// product detail pages). One source of truth so "linear = red" etc. stays
// consistent everywhere instead of drifting per-component.
export const ACCENT = {
  linear: '#c94040',
  tactile: '#4a7ab8',
  clicky: '#4a9e6a',
  hero: '#b8985a',
}

export const accentFor = (variant) => ACCENT[variant] || ACCENT.hero

// A muted/darkened version of the accent for canvas/illustration
// backgrounds — keeps enough contrast for the gold-stroke illustration
// while still reading as "this switch's color."
export const ACCENT_BG = {
  linear: '#3a2020',
  tactile: '#1f2c3a',
  clicky: '#1f3327',
  hero: '#2e3d45',
}

export const accentBgFor = (variant) => ACCENT_BG[variant] || ACCENT_BG.hero
