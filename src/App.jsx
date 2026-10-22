import { useCallback, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Highlights from './components/Highlights'
import Menu from './components/Menu'
import Delivery from './components/Delivery'
import Reviews from './components/Reviews'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'

export default function App() {
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)

  const add = useCallback((it) => {
    setCart((c) => ({ ...c, [it.name]: { name: it.name, price: it.price, qty: (c[it.name]?.qty || 0) + 1 } }))
  }, [])

  const remove = useCallback((it) => {
    setCart((c) => {
      const qty = (c[it.name]?.qty || 0) - 1
      const next = { ...c }
      if (qty <= 0) delete next[it.name]
      else next[it.name] = { ...c[it.name], qty }
      return next
    })
  }, [])

  const lines = useMemo(() => Object.values(cart), [cart])
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0)
  const closeCart = useCallback(() => setCartOpen(false), [])

  return (
    <>
      <Navbar cartCount={count} onCartClick={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Highlights />
        <Menu cart={cart} onAdd={add} onRemove={remove} />
        <Delivery />
        <Reviews />
        <Contact />
      </main>
      <Footer />

      {count > 0 && !cartOpen && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span>{count} item{count > 1 ? 's' : ''} · ₹{subtotal}</span>
          <strong>View order →</strong>
        </button>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        lines={lines}
        onAdd={add}
        onRemove={remove}
        onClear={() => setCart({})}
      />
    </>
  )
}
