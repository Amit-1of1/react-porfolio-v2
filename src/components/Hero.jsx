import { brand } from '../data'

export default function Hero({ onOrder }) {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="eyebrow">South Indian kitchen · {brand.city}</span>
          <h1 className="hero__title">
            {brand.heroTitle.map((line, i) => (
              <span key={line} className={`hero__line hero__line--${i + 1}`}>{line}</span>
            ))}
          </h1>
          <p className="lead">{brand.intro}</p>
          <div className="hero__ctas">
            <button type="button" className="btn btn--primary" onClick={onOrder}>
              <span aria-hidden="true">🛒</span> Order now
            </button>
            <a href="#menu" className="btn btn--ghost">See the full menu</a>
          </div>
          <ul className="hero__badges">
            <li><strong>₹{brand.deliveryCharge}</strong> delivery</li>
            <li><strong>₹{brand.minOrder}</strong> minimum order</li>
            <li><strong>22+</strong> areas served</li>
          </ul>
        </div>
        <div className="hero__art">
          <div className="hero__sun" aria-hidden="true" />
          <img className="hero__img hero__img--idli" src="/images/idli-plate.jpg" alt="Soft idlis and a crispy vada with sambar and coconut chutney" width="500" height="297" fetchpriority="high" />
          <img className="hero__img hero__img--dosa" src="/images/dosa-plate.jpg" alt="Golden masala dosa with sambar and chutney" width="480" height="300" loading="lazy" />
        </div>
      </div>
    </section>
  )
}
