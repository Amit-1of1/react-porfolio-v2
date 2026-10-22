import { faqs } from '../data'

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Good to know</span>
          <h2>Questions, answered</h2>
        </div>
        <div className="faq__list">
          {faqs.map((f) => (
            <details key={f.q} className="faq__item card">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
