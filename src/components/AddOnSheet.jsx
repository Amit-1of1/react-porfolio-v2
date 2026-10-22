import { useEffect, useState } from 'react'
import { addOns } from '../data'
import { addOnsPrice, maxOf } from '../cart'

// Bottom sheet shown when a dish is added: pick add-ons and quantity.
export default function AddOnSheet({ item, onClose, onConfirm }) {
  const [counts, setCounts] = useState({})
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setCounts({})
    setQty(1)
    if (!item) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item) return null
  const set = (id, n) => setCounts((c) => ({ ...c, [id]: n }))
  const unit = item.price + addOnsPrice(Object.fromEntries(Object.entries(counts).filter(([, n]) => n > 0)))

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

        <p className="sheet__label">Add-ons <span>(optional, price per portion)</span></p>
        <ul className="addon-list">
          {addOns.map((a) => {
            const n = counts[a.id] || 0
            return (
              <li key={a.id} className={`addon ${n > 0 ? 'is-on' : ''}`}>
                <span className="addon__name">
                  {a.name}
                  <span className="addon__price">₹{a.price}{n > 1 && <small> × {n} = ₹{a.price * n}</small>}</span>
                </span>
                {n === 0 ? (
                  <button type="button" className="add-btn" onClick={() => set(a.id, 1)} aria-label={`Add ${a.name}`}>Add +</button>
                ) : (
                  <div className="stepper">
                    <button type="button" onClick={() => set(a.id, n - 1)} aria-label={`Less ${a.name}`}>−</button>
                    <span>{n}</span>
                    <button type="button" onClick={() => set(a.id, n + 1)} disabled={n >= maxOf(a.id)} aria-label={`More ${a.name}`}>+</button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {qty > 1 && Object.values(counts).some((n) => n > 0) && (
          <p className="sheet__note">These add-ons go on each of the {qty} plates. For different add-ons, add each plate separately or split it at checkout.</p>
        )}
        <div className="sheet__foot">
          <div className="stepper stepper--lg">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One less">−</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="One more">+</button>
          </div>
          <button className="btn btn--primary sheet__add" onClick={() => onConfirm(item, counts, qty)}>
            Add to order · ₹{unit * qty}
          </button>
        </div>
      </div>
    </div>
  )
}
