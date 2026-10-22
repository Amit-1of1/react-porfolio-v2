import { brand } from '../data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/images/logo-mark.png" alt="" width="36" height="32" />
          <span><strong>{brand.name}</strong>™ · {brand.tagline}</span>
        </div>
        <p>📞 <a href={`tel:${brand.phone}`}>{brand.phoneDisplay}</a> · {brand.city}</p>
        <p className="footer__copy">© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
