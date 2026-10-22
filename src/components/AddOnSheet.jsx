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

        <p className="sheet__label">Add-ons <span>(optional, per plate)</span></p>
        <ul className="addon-list">
          {addOns.map((a) => {
            const n = counts[a.id] || 0
            const max = maxOf(a.id)
            return (
              <li key={a.id}>
                <label className={`addon ${n > 0 ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={n > 0} onChange={() => set(a.id, n > 0 ? 0 : 1)} />
                  <span className="addon__box" aria-hidden="true" />
                  <span className="addon__name">{a.name}</span>
                  <span className="addon__price">+₹{a.price * Math.max(n, 1)}</span>
                </label>
                {max > 1 && n > 0 && (
                  <div className="portions" role="radiogroup" aria-label={`${a.name} portions`}>
                    {Array.from({ length: max }, (_, i) => i + 1).map((p) => (
                      <button
                        type="button"
                        key={p}
                        role="radio"
                        aria-checked={n === p}
                        className={`portion ${n === p ? 'is-on' : ''}`}
                        onClick={() => set(a.id, p)}
                      >
                        {p}X <small>₹{a.price * p}</small>
                      </button>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

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
