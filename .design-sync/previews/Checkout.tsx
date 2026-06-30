import { useEffect } from 'react'
import { Checkout, useCart } from 'nexus-commerce'

// Checkout reads `lines`/`subtotal`/etc. from CartContext — seed it the same
// way the real Cart → "Checkout" button flow does before rendering.
function Seeded() {
  const cart = useCart()
  useEffect(() => {
    cart.clear()
    cart.add('tactile', 1)
    cart.add('linear', 2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // minHeight gives the document real flow height — .checkout-overlay is
  // fixed and otherwise contributes nothing to scroll height, which crops
  // fullPage screenshots to a sliver.
  return (
    <div style={{ minHeight: '100vh' }}>
      <Checkout onClose={() => {}} />
    </div>
  )
}

export const Default = () => <Seeded />
