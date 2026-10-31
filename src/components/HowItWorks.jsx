import { brand } from '../data'

const steps = [
  { icon: '🍽️', title: 'Pick your dishes', text: 'Browse the menu or tap a favourite. Every dish comes with sambar and two chutneys.' },
  { icon: '🧈', title: 'Make it yours', text: 'Add butter, cheese, paneer, ghee or Schezwan to any dish you like.' },
  { icon: '💬', title: 'Send on WhatsApp', text: `Check your order and send it to us on WhatsApp in one tap. Minimum order ₹${brand.minOrder}.` },
  { icon: '🛵', title: 'We deliver it hot', text: `We confirm on WhatsApp and bring it fresh to your door. Delivery is ₹${brand.deliveryCharge}.` },
]

export default function HowItWorks({ onOrder }) {
  return (
    <section className="how" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Hot idlis in four easy steps</h2>
        </div>
        <ol className="how__steps">
          {steps.map((s, i) => (
            <li key={s.title} className="how__step">
              <span className="how__num" aria-hidden="true">{i + 1}</span>
              <span className="how__icon" aria-hidden="true">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="how__cta">
          <button type="button" className="btn btn--primary" onClick={onOrder}>Start my order</button>
        </div>
      </div>
    </section>
  )
}
