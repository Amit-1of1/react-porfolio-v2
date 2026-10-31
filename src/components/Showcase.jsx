import { useEffect, useRef, useState } from 'react'
import { brand, deliveryAreas, showcaseSlides } from '../data'

const stats = [
  { icon: '🌱', big: '100%', small: 'pure veg' },
  { icon: '₹', small: 'Orders from', big: `₹${brand.minOrder}`, flip: true, note: `+ ₹${brand.deliveryCharge} delivery` },
  { icon: '🕗', big: '8 am – 8 pm', small: 'daily' },
  { icon: '📍', big: `${deliveryAreas.length}`, small: 'areas' },
]

const AUTOPLAY_MS = 4500

export default function Showcase() {
  const track = useRef(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const go = (i) => {
    const el = track.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  // Keep the dots in step with swipes and scrolls.
  const onScroll = () => {
    const el = track.current
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  useEffect(() => {
    if (paused || showcaseSlides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => go((active + 1) % showcaseSlides.length), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [active, paused])

  return (
    <section className="showcase" aria-label={`${brand.name} at a glance`}>
      <div className="container">
        <div
          className="showcase__carousel"
          aria-roledescription="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onFocus={() => setPaused(true)}
        >
          <div className="showcase__track" ref={track} onScroll={onScroll}>
            {showcaseSlides.map((s, i) => (
              <figure key={s.id} className="showcase__slide" aria-roledescription="slide" aria-label={`${i + 1} of ${showcaseSlides.length}: ${s.name}`}>
                <picture>
                  <source media="(max-width: 560px)" srcSet={`/images/showcase/${s.id}-phone.webp`} />
                  <img
                    className="showcase__img"
                    src={`/images/showcase/${s.id}-wide.webp`}
                    alt={s.alt}
                    width="1600"
                    height="563"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </picture>
                <figcaption className="showcase__caption">{s.name}</figcaption>
              </figure>
            ))}
          </div>
          {showcaseSlides.length > 1 && (
            <>
              <button type="button" className="showcase__arrow showcase__arrow--prev" aria-label="Previous photo"
                onClick={() => go((active - 1 + showcaseSlides.length) % showcaseSlides.length)}>‹</button>
              <button type="button" className="showcase__arrow showcase__arrow--next" aria-label="Next photo"
                onClick={() => go((active + 1) % showcaseSlides.length)}>›</button>
              <div className="showcase__dots">
                {showcaseSlides.map((s, i) => (
                  <button key={s.id} type="button" aria-label={`Show ${s.name}`} aria-current={i === active}
                    className={i === active ? 'is-active' : ''} onClick={() => go(i)} />
                ))}
              </div>
            </>
          )}
        </div>
        <ul className="showcase__stats">
          {stats.map((s) => (
            <li key={s.small}>
              <span className="showcase__icon" aria-hidden="true">{s.icon}</span>
              <span className="showcase__text">
                {s.flip ? <><small>{s.small}</small><strong>{s.big}</strong>{s.note && <small>{s.note}</small>}</> : <><strong>{s.big}</strong><small>{s.small}</small></>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
