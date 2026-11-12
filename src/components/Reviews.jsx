import { reviews } from '../data'

export default function Reviews() {
  if (!reviews.length) return null
  return (
    <section className="reviews">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Reviews</span>
          <h2>What our customers say</h2>
        </div>
        <div className="reviews__grid">
          {reviews.map((r) => (
            <figure key={r.name + r.text} className="card review">
              <div className="review__stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</div>
              <blockquote>{r.text}</blockquote>
              <figcaption>{r.name}{r.source && <span> · {r.source}</span>}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
