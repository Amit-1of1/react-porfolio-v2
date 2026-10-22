import { useState } from 'react'
import { menu } from '../data'

export default function Menu({ cart, onAdd, onRemove }) {
  const [active, setActive] = useState(menu[0].id)
  const section = menu.find((m) => m.id === active)

  return (
    <section className="menu" id="menu">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Our menu</span>
          <h2>Pick your favourites</h2>
          <p>Every dish comes hot with sambar and coconut chutney. Tap + to add it to your order.</p>
        </div>

        <div className="menu__tabs" role="tablist">
          {menu.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={active === m.id}
              className={`tab ${active === m.id ? 'is-active' : ''}`}
              onClick={() => setActive(m.id)}
            >
              {m.category}
            </button>
          ))}
        </div>

        <div className="menu__panel" role="tabpanel">
          <div className="menu__panel-head">
            <h3>{section.category}</h3>
            <p>{section.blurb}</p>
          </div>
          <ul className="menu__list">
            {section.items.map((it) => {
              const qty = cart[it.name]?.qty || 0
              return (
                <li key={it.name} className="menu-item">
                  <div className="menu-item__info">
                    <span className="veg-dot" title="Vegetarian" aria-label="Vegetarian" />
                    <span className="menu-item__name">{it.name}</span>
                    {it.popular && <span className="tag">Popular</span>}
                  </div>
                  <div className="menu-item__right">
                    <span className="price">₹{it.price}</span>
                    {qty === 0 ? (
                      <button className="add-btn" onClick={() => onAdd(it)} aria-label={`Add ${it.name}`}>Add +</button>
                    ) : (
                      <div className="stepper">
                        <button onClick={() => onRemove(it)} aria-label={`Remove one ${it.name}`}>−</button>
                        <span>{qty}</span>
                        <button onClick={() => onAdd(it)} aria-label={`Add one ${it.name}`}>+</button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
