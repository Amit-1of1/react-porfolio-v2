import { highlights } from '../data'

export default function Highlights() {
  return (
    <section className="highlights" id="about">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Why Idliyala</span>
          <h2>Comfort food, done right</h2>
        </div>
        <div className="highlights__grid">
          {highlights.map((h) => (
            <article key={h.title} className="card highlight">
              <span className="highlight__icon" aria-hidden="true">{h.icon}</span>
              <h3>{h.title}</h3>
              <p>{h.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
