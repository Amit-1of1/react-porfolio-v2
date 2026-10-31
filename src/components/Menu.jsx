import { useState } from 'react'
import { addOns, addOnsLabel, brand, menu, sides } from '../data'
import { itemCount } from '../cart'

export default function Menu({ cart, onPick, onRemoveOne }) {
  const [active, setActive] = useState(menu[0].id)

  return (
    <section className="menu" id="menu">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Our menu</span>
          <h2>The full menu</h2>
          <p>Every dish comes with 3 complimentary sides: {sides.full}. Tap Add to put it in your order.</p>
        </div>

        <div className="menu__tabs" role="tablist">
          {menu.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={active === m.id}
              aria-controls={`menu-${m.id}`}
              className={`tab ${active === m.id ? 'is-active' : ''}`}
              onClick={() => setActive(m.id)}
            >
              {m.category}
            </button>
          ))}
        </div>

        {/* Every category is in the HTML (inactive ones hidden) so search engines see the whole menu. */}
        {menu.map((section) => (
          <div key={section.id} id={`menu-${section.id}`} className="menu__panel" role="tabpanel" hidden={section.id !== active}>
            <div className="menu__panel-head">
              <h3>{section.category}</h3>
              <p>{section.blurb}</p>
            </div>
            <ul className="menu__list">
              {section.items.map((it) => {
                const qty = itemCount(cart, it.name)
                return (
                  <li key={it.name} className="menu-item">
                    <div className="menu-item__info">
                      <span className="veg-dot" title="Vegetarian" aria-label="Vegetarian" />
                      <span className="menu-item__name">{it.name}</span>
                      {it.popular && <span className="tag">Popular</span>}
                      <span className="menu-item__sides">{sides.short}</span>
                    </div>
                    <div className="menu-item__right">
                      <span className="price">₹{it.price}</span>
                      {qty === 0 ? (
                        <button className="add-btn" onClick={() => onPick(it)} aria-label={`Add ${it.name}`}>Add +</button>
                      ) : (
                        <div className="stepper">
                          <button onClick={() => onRemoveOne(it.name)} aria-label={`Remove one ${it.name}`}>−</button>
                          <span>{qty}</span>
                          <button onClick={() => onPick(it)} aria-label={`Add one more ${it.name}`}>+</button>
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="menu__addons">
              <strong>{addOnsLabel}:</strong>{' '}
              {addOns.map((a) => `${a.name} ₹${a.price}`).join(' · ')}
          </p>
        </div>
        ))}
        <p className="menu__updated">Prices updated <time dateTime={brand.updated}>{brand.updatedLabel}</time></p>
        <p className="menu__more"><a href="/menu/">See the full menu with dish descriptions →</a></p>
      </div>
    </section>
  )
}
