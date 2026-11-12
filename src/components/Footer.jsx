import { brand, dishPages } from '../data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/images/logo-mark.webp" alt="" width="36" height="32" />
          <span><strong>{brand.name}</strong>™ · {brand.tagline}</span>
        </div>
        <p><a href="/menu/">Menu & prices</a> · <a href="/delivery/">Delivery areas</a> · <a href="/about/">About</a> · <a href="/faq/">FAQ</a></p>
        <p className="footer__dishes">
          {dishPages.map((d, i) => <span key={d.slug}>{i > 0 && ' · '}<a href={`/dishes/${d.slug}/`}>{d.name} delivery</a></span>)}
        </p>
        <p>📞 <a href={`tel:${brand.phone}`}>{brand.phoneDisplay}</a> · {brand.city} · {brand.hours.label} · <a href={brand.googleMaps} target="_blank" rel="noreferrer">Find us on Google</a></p>
        <p><a href="/hi/" hrefLang="hi" lang="hi-IN">हिन्दी में पढ़ें</a> · <a href="/bn/" hrefLang="bn" lang="bn-IN">বাংলায় পড়ুন</a> · <a href="/ur/" hrefLang="ur" lang="ur-IN">اردو</a> · <a href="/ta/" hrefLang="ta" lang="ta-IN">தமிழ்</a> · <a href="/te/" hrefLang="te" lang="te-IN">తెలుగు</a> · <a href="/ml/" hrefLang="ml" lang="ml-IN">മലയാളം</a> · <a href="/hinglish/">Hinglish</a> · <a href="/banglish/">Banglish</a></p>
        <p className="footer__copy" suppressHydrationWarning>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
