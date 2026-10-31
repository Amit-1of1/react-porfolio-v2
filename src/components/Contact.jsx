import { brand } from '../data'
import { whatsappLink } from '../order'

export default function Contact({ onOrder }) {
  return (
    <section className="contact" id="contact">
      <div className="container contact__inner card">
        <img src="/images/logo.png" alt="Idliyala logo" className="contact__logo" width="400" height="397" loading="lazy" />
        <div>
          <span className="eyebrow">Hungry?</span>
          <h2>Order now, eat fresh</h2>
          <p>Pick your dishes and send your order straight to our kitchen on WhatsApp. Questions first? Call or message us any time.</p>
          <div className="hero__ctas">
            <button type="button" className="btn btn--primary" onClick={onOrder}>
              <span aria-hidden="true">🛒</span> Order now
            </button>
            <a href={`tel:${brand.phone}`} className="btn btn--ghost">Call {brand.phoneDisplay}</a>
          </div>
          <a className="contact__chat" href={whatsappLink('Hi Idliyala! I have a question.')} target="_blank" rel="noreferrer">
            Or chat with us on WhatsApp
          </a>
          <a className="contact__chat" href={brand.googleMaps} target="_blank" rel="noreferrer">
            Loved your meal? Review us on Google
          </a>
        </div>
      </div>
    </section>
  )
}
