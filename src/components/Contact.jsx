import { brand } from '../data'
import { whatsappLink } from '../order'

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container contact__inner card">
        <img src="/images/logo.png" alt="Idliyala logo" className="contact__logo" />
        <div>
          <span className="eyebrow">Hungry?</span>
          <h2>Order now, eat fresh</h2>
          <p>Call or WhatsApp us to place your order. We&apos;ll confirm the total and delivery time right away.</p>
          <div className="hero__ctas">
            <a href={whatsappLink('Hi Idliyala! I would like to place an order.')} target="_blank" rel="noreferrer" className="btn btn--whatsapp">
              WhatsApp {brand.phoneDisplay}
            </a>
            <a href={`tel:${brand.phone}`} className="btn btn--ghost">Call us</a>
          </div>
        </div>
      </div>
    </section>
  )
}
