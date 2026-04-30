export const SWITCHES = [
  {
    variant: 'linear',
    name: 'Nexus Linear',
    tagline: 'Smooth from the first keystroke.',
    type: 'Linear',
    force: '45g',
    travel: '4.0mm',
    sound: 'Thock',
    price: '$0.95 / switch',
    setPrice: '$62',
  },
  {
    variant: 'tactile',
    flagship: true,
    name: 'Nexus Tactile',
    tagline: 'Satisfying bump. Total control.',
    type: 'Tactile',
    force: '55g',
    travel: '4.0mm',
    sound: 'Muted',
    price: '$1.10 / switch',
    setPrice: '$72',
  },
  {
    variant: 'clicky',
    name: 'Nexus Clicky',
    tagline: 'Unmistakable. Unapologetic.',
    type: 'Clicky',
    force: '60g',
    travel: '4.0mm',
    sound: 'Click',
    price: '$1.05 / switch',
    setPrice: '$68',
  },
]

export const SPECS_HERO = [
  { num: '100',  unit: 'million', label: 'Rated keystrokes per switch' },
  { num: '4.0',  unit: 'mm',      label: 'Total travel, zero pre-travel' },
  { num: '500',  unit: 'units',   label: 'Per variant, per drop' },
  { num: '48',   unit: 'hours',   label: 'Hand-lube time per batch' },
]

export const SPECS = [
  { key: 'Switch type',        value: 'MX-compatible, 3-pin' },
  { key: 'Housing material',   value: 'Polycarbonate (top) / Nylon (bottom)' },
  { key: 'Stem material',      value: 'POM (Polyoxymethylene)' },
  { key: 'Spring',             value: 'Gold-plated stainless, single-stage' },
  { key: 'Actuation force',    value: '45g (Linear) / 55g (Tactile) / 60g (Clicky)' },
  { key: 'Actuation point',    value: '2.0mm' },
  { key: 'Total travel',       value: '4.0mm' },
  { key: 'Pre-travel',         value: '0mm' },
  { key: 'Lube',               value: 'Krytox 205g0, hand applied' },
  { key: 'Filming',            value: '0.3mm PTFE' },
  { key: 'Rated lifespan',     value: '100 million keystrokes' },
  { key: 'Compatibility',      value: 'MX footprint, universal' },
]

export const PROCESS = [
  { title: 'Sourced',        body: 'Premium POM stems and polycarbonate housings from a single verified manufacturer. Every batch hand-inspected on arrival.' },
  { title: 'Disassembled',   body: 'Each switch is opened. Springs sorted by weight variance, outliers discarded.' },
  { title: 'Lubed & Filmed', body: 'Stems hand-lubed with Krytox 205g0. PTFE 0.3mm films eliminate housing wobble.' },
  { title: 'Certified',      body: 'Reassembled, tested for actuation consistency, packed in bespoke boxes.' },
]
