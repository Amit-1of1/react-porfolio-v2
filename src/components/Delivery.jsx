import { areaSlug, brand, deliveryAreas } from '../data'
import { whatsappLink } from '../order'

export default function Delivery() {
  return (
    <section className="delivery" id="delivery">
      <div className="container delivery__inner">
        <div className="delivery__copy">
          <span className="eyebrow eyebrow--light">Home delivery</span>
          <h2>Idli and dosa delivery across {brand.city}</h2>
          <div className="delivery__stats">
            <div><strong>₹{brand.minOrder}</strong><span>minimum order</span></div>
            <div><strong>₹{brand.deliveryCharge}</strong><span>delivery charge</span></div>
            <div><strong>8–8</strong><span>8 am–8 pm, daily</span></div>
          </div>
          <p>
            We deliver hot to {deliveryAreas.length} neighbourhoods in north and east {brand.city}. Don&apos;t see yours?{' '}
            <a href={whatsappLink('Hi Idliyala! Do you deliver to my area?')} target="_blank" rel="noreferrer">Ask us on WhatsApp</a>.
          </p>
        </div>
        <ul className="delivery__areas">
          {deliveryAreas.map((a) => <li key={a}><a href={`/delivery/${areaSlug(a)}/`}>📍 {a}</a></li>)}
        </ul>
      </div>
    </section>
  )
}
