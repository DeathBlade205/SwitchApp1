import { useProducts } from './hooks/useProducts'
import { accentFor } from './theme'

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
            style={{ '--accent': accentFor(sw.variant), '--i': i }}
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
