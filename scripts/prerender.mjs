// Post-build step: bakes the rendered page, structured data and crawler files
// into dist/ so search engines and AI assistants can read everything without
// running JavaScript. All content comes from src/data.js.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { addOns, areaSlug, brand, deliveryAreas, faqs, menu } from '../src/data.js'
import { render } from '../dist-ssr/entry-server.js'

const SITE = 'https://www.idliyala.com'
const dist = (f) => new URL(`../dist/${f}`, import.meta.url)
const today = new Date().toISOString().slice(0, 10)
const prices = menu.flatMap((m) => m.items.map((i) => i.price))

const restaurant = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': `${SITE}/#restaurant`,
  name: brand.name,
  alternateName: `${brand.name} - ${brand.tagline}`,
  description: brand.intro,
  url: `${SITE}/`,
  logo: `${SITE}/images/logo.png`,
  image: [`${SITE}/og-image.jpg`, `${SITE}/images/idli-plate.jpg`, `${SITE}/images/dosa-plate.jpg`],
  telephone: brand.phone,
  hasMap: brand.googleMaps,
  sameAs: [brand.googleMaps],
  servesCuisine: ['South Indian', 'Indian', 'Vegetarian'],
  priceRange: `₹${Math.min(...prices)}–₹${Math.max(...prices)}`,
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI',
  acceptsReservations: false,
  address: { '@type': 'PostalAddress', addressLocality: brand.city, addressRegion: 'West Bengal', addressCountry: 'IN' },
  areaServed: deliveryAreas.map((a) => ({ '@type': 'Place', name: `${a}, ${brand.city}` })),
  hasMenu: {
    '@type': 'Menu',
    name: `${brand.name} menu`,
    hasMenuSection: menu.map((m) => ({
      '@type': 'MenuSection',
      name: m.category,
      description: m.blurb,
      hasMenuItem: m.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        suitableForDiet: 'https://schema.org/VegetarianDiet',
        offers: { '@type': 'Offer', price: i.price, priceCurrency: 'INR' },
      })),
    })),
  },
  potentialAction: {
    '@type': 'OrderAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/#menu`, actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
    deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
  },
}

const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: brand.name, url: `${SITE}/` }

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

let html = readFileSync(dist('index.html'), 'utf8')
html = html
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
  .replace('</head>', `    ${[restaurant, faqPage, website].map(ld).join('\n    ')}\n  </head>`)
writeFileSync(dist('index.html'), html)

writeFileSync(dist('robots.txt'), `User-agent: *
Allow: /

# AI assistants and answer engines are welcome to read and cite this site.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`)

// One landing page per delivery area, so local searches like
// "south indian food salt lake" have a page that answers them directly.
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cssHref = readdirSync(new URL('../dist/assets', import.meta.url)).find((f) => f.endsWith('.css'))
const popular = menu.flatMap((m) => m.items.filter((i) => i.popular))
const areaUrl = (a) => `${SITE}/delivery/${areaSlug(a)}/`
const nearby = (i) => [-3, -2, -1, 1, 2, 3].map((d) => deliveryAreas[(i + d + deliveryAreas.length) % deliveryAreas.length])

function areaPage(area, i) {
  const title = `South Indian Food Delivery in ${area}, ${brand.city} | Idli, Dosa & Vada | ${brand.name}`
  const desc = `Order pure veg South Indian food in ${area}, ${brand.city}: soft idli, crispy vada, masala dosa and uttapam with sambar and chutney. Home delivery ₹${brand.deliveryCharge}, minimum order ₹${brand.minOrder}. Pay by UPI.`
  const areaFaqs = [
    { q: `Does Idliyala deliver South Indian food to ${area}?`, a: `Yes. Idliyala delivers fresh idli, vada, dosa and uttapam to ${area} and nearby areas like ${nearby(i).slice(2, 5).join(', ')}. Delivery is ₹${brand.deliveryCharge} on orders of ₹${brand.minOrder} or more.` },
    { q: `How do I order idli or dosa in ${area}?`, a: `Pick your dishes on ${SITE.replace('https://', '')}, enter your ${area} address, pay by UPI and your order reaches our kitchen on WhatsApp. You can also call or WhatsApp ${brand.phoneDisplay}.` },
    { q: `Is Idliyala pure vegetarian?`, a: `Yes. Everything is 100% pure vegetarian, with batter, sambar and chutneys made fresh every day.` },
  ]
  const ldArea = [
    { '@context': 'https://schema.org', '@type': 'Restaurant', '@id': `${SITE}/#restaurant`, name: brand.name, url: `${SITE}/`, telephone: brand.phone, servesCuisine: ['South Indian', 'Vegetarian'], image: `${SITE}/og-image.jpg`, address: restaurant.address, areaServed: { '@type': 'Place', name: `${area}, ${brand.city}` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: brand.name, item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Delivery areas', item: `${SITE}/#delivery` },
      { '@type': 'ListItem', position: 3, name: area, item: areaUrl(area) },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: areaFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ]
  const li = (it) => `<li class="menu-item"><div class="menu-item__info"><span class="veg-dot" aria-label="Vegetarian"></span><span class="menu-item__name">${esc(it.name)}</span></div><span class="price">₹${it.price}</span></li>`
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#2f6b3c" />
    <link rel="canonical" href="${areaUrl(area)}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${brand.name}" />
    <meta property="og:title" content="${esc(`South Indian food delivery in ${area} · ${brand.name}`)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${areaUrl(area)}" />
    <meta property="og:image" content="${SITE}/og-image.jpg" />
    <meta property="og:locale" content="en_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/${cssHref}" />
    ${ldArea.map(ld).join('\n    ')}
  </head>
  <body>
    <header class="nav"><div class="container nav__inner">
      <a href="/" class="nav__brand"><img src="/images/logo-mark.png" alt="Idliyala logo" width="72" height="65" /><span><strong>${brand.name}</strong><small>${brand.tagline}</small></span></a>
      <a href="/#menu" class="cart-btn"><span aria-hidden="true">🛒</span><span class="cart-btn__label">Order now</span></a>
    </div></header>
    <main>
      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › <a href="/#delivery">Delivery areas</a> › ${esc(area)}</nav>
        <span class="eyebrow">100% pure veg · Home delivery in ${esc(area)}</span>
        <h1>South Indian food delivery in ${esc(area)}, ${brand.city}</h1>
        <p class="lead">Craving soft idlis, crispy vadas or a golden masala dosa in ${esc(area)}? ${brand.name} cooks fresh South Indian food every day and delivers it hot to your door in ${esc(area)}, with sambar and coconut chutney on every plate.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a><a href="tel:${brand.phone}" class="btn btn--ghost">Call ${brand.phoneDisplay}</a></div>
        <ul class="hero__badges"><li><strong>₹${brand.deliveryCharge}</strong> delivery</li><li><strong>₹${brand.minOrder}</strong> minimum order</li><li><strong>UPI</strong> payment</li></ul>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>Popular in ${esc(area)}</h2>
        <div class="menu__panel"><ul class="menu__list">${popular.map(li).join('')}</ul></div>
        <h2 class="area-menu__full">Full menu</h2>
        ${menu.map((m) => `<div class="menu__panel"><div class="menu__panel-head"><h3>${esc(m.category)}</h3><p>${esc(m.blurb)}</p></div><ul class="menu__list">${m.items.map(li).join('')}</ul></div>`).join('\n        ')}
        <p class="menu__addons"><strong>Add-ons for any dish:</strong> ${addOns.map((a) => `${esc(a.name)} ₹${a.price}`).join(' · ')}</p>
        <p><a href="/#menu" class="btn btn--primary">Start your order</a></p>
      </div></section>
      <section class="faq"><div class="container">
        <h2>Ordering in ${esc(area)}</h2>
        <div class="faq__list">${areaFaqs.map((f) => `<details class="faq__item card" open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
      </div></section>
      <section class="area-nearby"><div class="container">
        <h2>We also deliver near ${esc(area)}</h2>
        <ul class="area-links">${nearby(i).map((a) => `<li><a href="/delivery/${areaSlug(a)}/">South Indian food in ${esc(a)}</a></li>`).join('')}</ul>
      </div></section>
    </main>
    <footer class="footer"><div class="container footer__inner">
      <div class="footer__brand"><img src="/images/logo-mark.png" alt="" width="36" height="32" /><span><strong>${brand.name}</strong>™ · ${brand.tagline}</span></div>
      <p>📞 <a href="tel:${brand.phone}">${brand.phoneDisplay}</a> · ${brand.city} · <a href="${brand.googleMaps}" target="_blank" rel="noreferrer">Find us on Google</a></p>
    </div></footer>
  </body>
</html>
`
}

deliveryAreas.forEach((area, i) => {
  const dir = new URL(`../dist/delivery/${areaSlug(area)}/`, import.meta.url)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), areaPage(area, i))
})

const urls = [`${SITE}/`, ...deliveryAreas.map(areaUrl)]
writeFileSync(dist('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u, i) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${i ? '0.8' : '1.0'}</priority></url>`).join('\n')}
</urlset>
`)

const menuText = menu
  .map((m) => `### ${m.category}\n${m.blurb}\n\n${m.items.map((i) => `- ${i.name}: ₹${i.price}`).join('\n')}`)
  .join('\n\n')

writeFileSync(dist('llms.txt'), `# ${brand.name}

> ${brand.name} (${brand.tagline}) is a South Indian food delivery kitchen in ${brand.city}, India, serving fresh idli, vada, dosa and uttapam with sambar and coconut chutney. All food is 100% pure vegetarian. Order online at ${SITE}/ or on WhatsApp/phone ${brand.phoneDisplay}.

## Ordering and delivery
- Website: ${SITE}/ (pick dishes and add-ons, enter address, pay by UPI; the order is sent on WhatsApp)
- Phone / WhatsApp: +91 ${brand.phoneDisplay}
- Google Maps: ${brand.googleMaps}
- Delivery charge: ₹${brand.deliveryCharge}. Minimum order: ₹${brand.minOrder}.
- Payment: UPI (PhonePe, Google Pay, Paytm or any UPI app)
- Delivery areas in ${brand.city}: ${deliveryAreas.join(', ')}
- Area pages: ${deliveryAreas.map(areaUrl).join(' ')}

## Menu (prices in INR)
${menuText}

### Add-ons (any dish, per portion)
${addOns.map((a) => `- ${a.name}: ₹${a.price}`).join('\n')}

## FAQ
${faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}
`)

rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true })
console.log(`prerendered index.html, ${deliveryAreas.length} area pages, robots.txt, sitemap.xml, llms.txt`)
