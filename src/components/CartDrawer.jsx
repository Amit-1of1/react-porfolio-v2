import { useEffect, useState } from 'react'
import { brand } from '../data'
import { buildOrderMessage, whatsappLink } from '../order'

export default function CartDrawer({ open, onClose, lines, onAdd, onRemove, onClear }) {
  const [form, setForm] = useState({ name: '', address: '', note: '' })
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const belowMin = subtotal < brand.minOrder
  const canSend = lines.length > 0 && !belowMin && form.name.trim() && form.address.trim()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-label="Your order">
        <div className="drawer__head">
          <h3>Your order</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {lines.length === 0 ? (
          <p className="drawer__empty">Your order is empty. Add some idlis or dosas from the menu.</p>
        ) : (
          <>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <li key={l.name}>
                  <span className="drawer__name">{l.name}</span>
                  <div className="stepper stepper--sm">
                    <button onClick={() => onRemove(l)} aria-label={`Remove one ${l.name}`}>−</button>
                    <span>{l.qty}</span>
                    <button onClick={() => onAdd(l)} aria-label={`Add one ${l.name}`}>+</button>
                  </div>
                  <span className="drawer__amt">₹{l.price * l.qty}</span>
                </li>
              ))}
            </ul>
            <button className="link-btn" onClick={onClear}>Clear order</button>

            <dl className="drawer__totals">
              <div><dt>Subtotal</dt><dd>₹{subtotal}</dd></div>
              <div><dt>Delivery</dt><dd>₹{brand.deliveryCharge}</dd></div>
              <div className="drawer__total"><dt>Total</dt><dd>₹{subtotal + brand.deliveryCharge}</dd></div>
            </dl>
            {belowMin && (
              <p className="drawer__warn">Add ₹{brand.minOrder - subtotal} more to reach the ₹{brand.minOrder} minimum order.</p>
            )}

            <div className="drawer__form">
              <label>Your name<input value={form.name} onChange={update('name')} autoComplete="name" /></label>
              <label>Delivery address<textarea rows="2" value={form.address} onChange={update('address')} autoComplete="street-address" /></label>
              <label>Note (optional)<input value={form.note} onChange={update('note')} placeholder="Less spicy, extra chutney…" /></label>
            </div>

            <a
              className={`btn btn--whatsapp btn--block ${canSend ? '' : 'is-disabled'}`}
              href={canSend ? whatsappLink(buildOrderMessage(lines, form)) : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!canSend}
            >
              Send order on WhatsApp
            </a>
            {!canSend && !belowMin && <p className="drawer__hint">Add your name and address to send the order.</p>}
          </>
        )}
      </aside>
    </div>
  )
}
