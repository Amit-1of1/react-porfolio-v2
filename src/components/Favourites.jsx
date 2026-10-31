import { dishAlt, dishPhoto, favourites, menu } from '../data'
import { itemCount } from '../cart'

const allItems = menu.flatMap((m) => m.items)
const picks = favourites.map((name) => allItems.find((i) => i.name === name)).filter(Boolean)

export default function Favourites({ cart, onPick, onRemoveOne }) {
  return (
    <section className="favs" id="favourites">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Quick order</span>
          <h2>Our favourites</h2>
          <p>The dishes Kolkata orders most. Tap Add and you are one step from WhatsApp.</p>
        </div>
        <ul className="favs__grid">
          {picks.map((it) => {
            const qty = itemCount(cart, it.name)
            return (
              <li key={it.name} className="card fav">
                <img className="fav__img" src={dishPhoto(it.name)} alt={dishAlt(it.name)} width="400" height="400" loading="lazy" decoding="async" />
                <div className="fav__body">
                  <span className="fav__name"><span className="veg-dot" aria-label="Vegetarian" />{it.name}</span>
                  <div className="fav__row">
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
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
