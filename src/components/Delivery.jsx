import { brand, deliveryAreas } from '../data'

export default function Delivery() {
  return (
    <section className="delivery" id="delivery">
      <div className="container delivery__inner">
        <div className="delivery__copy">
          <span className="eyebrow eyebrow--light">Home delivery</span>
          <h2>We deliver across {brand.city}</h2>
          <div className="delivery__stats">
            <div><strong>₹{brand.minOrder}</strong><span>minimum order</span></div>
            <div><strong>₹{brand.deliveryCharge}</strong><span>delivery charge</span></div>
          </div>
          <p>Don&apos;t see your area? Message us on WhatsApp and we&apos;ll check if we can reach you.</p>
        </div>
        <ul className="delivery__areas">
          {deliveryAreas.map((a) => <li key={a}>📍 {a}</li>)}
        </ul>
      </div>
    </section>
  )
}
