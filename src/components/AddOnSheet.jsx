import { useEffect, useState } from 'react'
import { addOns } from '../data'

// Bottom sheet shown when a dish is added: pick add-ons and quantity.
export default function AddOnSheet({ item, onClose, onConfirm }) {
  const [selected, setSelected] = useState([])
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setSelected([])
    setQty(1)
    if (!item) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item) return null
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const unit = item.price + addOns.filter((a) => selected.includes(a.id)).reduce((s, a) => s + a.price, 0)

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={`Add ${item.name}`}>
      <div className="sheet__backdrop" onClick={onClose} />
      <div className="sheet__panel">
        <div className="sheet__head">
          <div>
            <h3>{item.name}</h3>
            <p>₹{item.price} · with sambar and chutney</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="sheet__label">Add-ons <span>(optional, per plate)</span></p>
        <ul className="addon-list">
          {addOns.map((a) => (
            <li key={a.id}>
              <label className={`addon ${selected.includes(a.id) ? 'is-on' : ''}`}>
                <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} />
                <span className="addon__box" aria-hidden="true" />
                <span className="addon__name">{a.name}</span>
                <span className="addon__price">+₹{a.price}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="sheet__foot">
          <div className="stepper stepper--lg">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One less">−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="One more">+</button>
          </div>
          <button className="btn btn--primary sheet__add" onClick={() => onConfirm(item, selected, qty)}>
            Add to order · ₹{unit * qty}
          </button>
        </div>
      </div>
    </div>
  )
}
