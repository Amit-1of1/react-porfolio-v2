import { useCallback, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Highlights from './components/Highlights'
import Menu from './components/Menu'
import Delivery from './components/Delivery'
import Reviews from './components/Reviews'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import AddOnSheet from './components/AddOnSheet'
import { addItem, cartCount, cartSubtotal, changeQty, removeOneOf, setAddOn } from './cart'

export default function App() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [picking, setPicking] = useState(null)

  const confirmPick = useCallback((item, ids, qty) => {
    setCart((c) => addItem(c, item, ids, qty))
    setPicking(null)
  }, [])
  const closePick = useCallback(() => setPicking(null), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const count = cartCount(cart)
  const subtotal = cartSubtotal(cart)

  return (
    <>
      <Navbar cartCount={count} onCartClick={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Highlights />
        <Menu cart={cart} onPick={setPicking} onRemoveOne={(name) => setCart((c) => removeOneOf(c, name))} />
        <Delivery />
        <Reviews />
        <Contact />
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
        onClear={() => setCart([])}
      />
    </>
  )
}
