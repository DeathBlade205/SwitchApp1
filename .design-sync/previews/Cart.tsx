import { useEffect } from 'react'
import { Cart, useCart } from 'nexus-commerce'

// Cart reads `open`/`lines` from CartContext (wrapped automatically via
// cfg.provider) rather than props — open=false by default, so the drawer
// sits off-canvas. Seed real cart state through the same useCart() API the
// app itself uses, then render the real Cart.
function Seeded({ items, open }: { items: [string, number][]; open: boolean }) {
  const cart = useCart()
  useEffect(() => {
    cart.clear()
    for (const [id, qty] of items) cart.add(id, qty)
    cart.setOpen(open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // minHeight gives the document real flow height — .cart-drawer is fixed
  // and otherwise contributes nothing to scroll height, which crops fullPage
  // screenshots to a sliver.
  return (
    <div style={{ minHeight: '100vh' }}>
      <Cart />
    </div>
  )
}

export const WithItems = () => (
  <Seeded items={[['tactile', 1], ['linear', 2]]} open />
)

export const Empty = () => <Seeded items={[]} open />
