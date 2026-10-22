import { brand } from '../data'
import { whatsappLink } from '../order'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="eyebrow">South Indian kitchen · {brand.city}</span>
          <h1>{brand.heroTitle}</h1>
          <p className="lead">{brand.intro}</p>
          <div className="hero__ctas">
            <a href="#menu" className="btn btn--primary">See the menu</a>
            <a href={whatsappLink('Hi Idliyala! I would like to place an order.')} target="_blank" rel="noreferrer" className="btn btn--whatsapp">
              Order on WhatsApp
            </a>
          </div>
          <ul className="hero__badges">
            <li><strong>₹{brand.deliveryCharge}</strong> delivery</li>
            <li><strong>₹{brand.minOrder}</strong> minimum order</li>
            <li><strong>22+</strong> areas served</li>
          </ul>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__sun" />
          <img className="hero__img hero__img--idli" src="/images/idli-plate.jpg" alt="" />
          <img className="hero__img hero__img--dosa" src="/images/dosa-plate.jpg" alt="" />
        </div>
      </div>
    </section>
  )
}
