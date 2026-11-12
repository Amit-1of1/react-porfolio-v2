/* global __SAMPLE_REVIEWS__ */
import { brand, reviews, sampleReviews } from '../data'

// One happy cartoon per card, in turn: idli, dosa, vada.
const characters = [
  { id: 'idli', tag: 'Idli fan' },
  { id: 'dosa', tag: 'Dosa lover' },
  { id: 'vada', tag: 'Vada crunch' },
]

export default function Reviews() {
  const sample = !reviews.length && __SAMPLE_REVIEWS__
  const list = reviews.length ? reviews : sample ? sampleReviews : []
  if (!list.length) return null
  return (
    <section className="reviews" id="reviews">
      <div className="container">
        {sample && <p className="reviews__sample">Preview only: these cards are placeholders. Real Google reviews replace them before this goes live.</p>}
        <div className="section-head">
          <span className="eyebrow">Reviews</span>
          <h2>Happy plates, happy people</h2>
        </div>
        <div className="reviews__grid">
          {list.map((r, i) => {
            const c = characters[i % characters.length]
            return (
              <figure key={i} className="card review">
                <span className="review__tag">{c.tag}</span>
                <div className="review__who">
                  <img src={`/images/characters/${c.id}.svg`} alt="" width="84" height="84" loading="lazy" />
                  <div>
                    <strong>{r.name}</strong>
                    {r.area && <small>{r.area}, {brand.city}</small>}
                  </div>
                </div>
                <div className="review__stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</div>
                <blockquote>{r.text}</blockquote>
                <figcaption>{r.source || 'Google'} review{r.date && ` · ${r.date}`}</figcaption>
              </figure>
            )
          })}
        </div>
        <div className="reviews__ctas">
          <a className="btn btn--primary" href={brand.reviewLink || brand.googleMaps} target="_blank" rel="noreferrer">⭐ Write a review on Google</a>
          <a className="btn btn--ghost" href={brand.googleMaps} target="_blank" rel="noreferrer">Read all reviews</a>
        </div>
      </div>
    </section>
  )
}
