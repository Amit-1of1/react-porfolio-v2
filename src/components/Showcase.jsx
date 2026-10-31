import { brand, deliveryAreas, menu } from '../data'

const cheapest = Math.min(...menu.flatMap((m) => m.items.map((i) => i.price)))

const stats = [
  { icon: '🌱', big: '100%', small: 'pure veg' },
  { icon: '₹', small: 'From', big: `₹${cheapest}`, flip: true },
  { icon: '🕗', big: '8 am – 8 pm', small: 'daily' },
  { icon: '📍', big: `${deliveryAreas.length}`, small: 'areas' },
]

export default function Showcase() {
  return (
    <section className="showcase" aria-label={`${brand.name} at a glance`}>
      <div className="container">
        <picture>
          <source media="(max-width: 560px)" srcSet="/images/showcase-square.webp" />
          <img
            className="showcase__img"
            src="/images/showcase-wide.webp"
            alt="Three soft idlis on a banana leaf with sambar, coconut chutney and red chutney"
            width="1600"
            height="1000"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <ul className="showcase__stats">
          {stats.map((s) => (
            <li key={s.small}>
              <span className="showcase__icon" aria-hidden="true">{s.icon}</span>
              <span className="showcase__text">
                {s.flip ? <><small>{s.small}</small><strong>{s.big}</strong></> : <><strong>{s.big}</strong><small>{s.small}</small></>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
