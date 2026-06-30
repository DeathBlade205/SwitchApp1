import { useProducts } from './hooks/useProducts'

// Per-variant accent (matches the switch colours used elsewhere in the app)
const ACCENT = {
  linear:  '#c94040',
  tactile: '#4a7ab8',
  clicky:  '#4a9e6a',
}

export default function HeroKeycaps({ onPick }) {
  const { products } = useProducts()
  return (
    <div className="keycaps">
      <p className="keycaps-prompt">Pick your sound</p>
      <div className="keycaps-row">
        {products.map((sw, i) => (
          <button
            key={sw.id}
            type="button"
            className="keycap"
            style={{ '--accent': ACCENT[sw.variant], '--i': i }}
            onClick={() => onPick?.(sw.id)}
            aria-label={`${sw.name} — shop the collection`}
          >
            <span className="keycap-cap">
              <span className="keycap-legend">{sw.sound}</span>
            </span>
            <span className="keycap-meta">
              <span className="keycap-name">{sw.name.replace('Nexus ', '')}</span>
              <span className="keycap-price">{sw.setPrice}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
