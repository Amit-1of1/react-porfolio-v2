import { useCallback, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Highlights from './components/Highlights'
import Menu from './components/Menu'
import Delivery from './components/Delivery'
import Reviews from './components/Reviews'
import Contact from './components/Contact'
import Faq from './components/Faq'
import Footer from './components/Footer'
import CartDrawer, { LAST_ORDER_KEY } from './components/CartDrawer'
import { menu } from './data'
import AddOnSheet from './components/AddOnSheet'
import { addItem, cartCount, cartSubtotal, changeQty, removeOneOf, setAddOn, splitLine } from './cart'

export default function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [picking, setPicking] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)

  // Read after mount so the pre-rendered HTML and the first client render match.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null')
      // Re-price from today's menu and drop dishes that are no longer on it.
      const prices = new Map(menu.flatMap((m) => m.items.map((i) => [i.name, i.price])))
      const lines = Array.isArray(saved) ? saved.filter((l) => prices.has(l.name)).map((l) => ({ ...l, basePrice: prices.get(l.name) })) : []
      if (lines.length) setLastOrder(lines)
    } catch { /* storage unavailable or bad data: no reorder */ }
  }, [])

  const confirmPick = useCallback((item, ids, qty) => {
    setCart((c) => addItem(c, item, ids, qty))
    setPicking(null)
  }, [])
  const closePick = useCallback(() => setPicking(null), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const openCart = useCallback(() => setCartOpen(true), [])

  const count = cartCount(cart)
  const subtotal = cartSubtotal(cart)

  return (
    <>
      <Navbar cartCount={count} onCartClick={openCart} />
      <main>
        <Hero onOrder={openCart} />
        <Highlights />
        <Menu cart={cart} onPick={setPicking} onRemoveOne={(name) => setCart((c) => removeOneOf(c, name))} />
        <Delivery />
        <Reviews />
        <Faq />
        <Contact onOrder={openCart} />
      </main>
      <Footer />

      {count > 0 && !cartOpen && !picking && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span>{count} item{count > 1 ? 's' : ''} · ₹{subtotal}</span>
          <strong>View order →</strong>
        </button>
      )}

      <AddOnSheet item={picking} onClose={closePick} onConfirm={confirmPick} />

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        lines={cart}
        onQty={(key, d) => setCart((c) => changeQty(c, key, d))}
        onSetAddOn={(key, id, n) => setCart((c) => setAddOn(c, key, id, n))}
        onSplit={(key) => setCart((c) => splitLine(c, key))}
        onClear={() => setCart([])}
        onPick={setPicking}
        lastOrder={lastOrder}
        onReorder={() => setCart(lastOrder)}
      />
      <Analytics />
    </>
  )
}
