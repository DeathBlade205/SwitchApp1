import { ErrorBoundary } from 'nexus-commerce'

const card = {
  width: 280,
  padding: '1.5rem',
  background: '#f7f4ef',
  border: '1px solid #e7e0d5',
  fontFamily: 'sans-serif',
  fontSize: '.85rem',
  color: '#1c1917',
}

function Healthy3DContent() {
  return <div style={card}>3D switch viewer — loaded fine.</div>
}

function Crashing3DContent(): never {
  throw new Error('WebGL context lost')
}

const fallback = (
  <div style={{ ...card, color: '#9a8f80', fontStyle: 'italic' }}>
    3D preview unavailable — showing static illustration instead.
  </div>
)

export const Healthy = () => (
  <ErrorBoundary fallback={fallback}>
    <Healthy3DContent />
  </ErrorBoundary>
)

export const CaughtError = () => (
  <ErrorBoundary fallback={fallback}>
    <Crashing3DContent />
  </ErrorBoundary>
)
