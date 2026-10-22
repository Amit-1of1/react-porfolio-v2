// Post-build step: bakes the rendered page, structured data and crawler files
// into dist/ so search engines and AI assistants can read everything without
// running JavaScript. All content comes from src/data.js.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { addOns, brand, deliveryAreas, faqs, menu } from '../src/data.js'
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

writeFileSync(dist('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
</urlset>
`)

const menuText = menu
  .map((m) => `### ${m.category}\n${m.blurb}\n\n${m.items.map((i) => `- ${i.name}: ₹${i.price}`).join('\n')}`)
  .join('\n\n')

writeFileSync(dist('llms.txt'), `# ${brand.name}

> ${brand.name} (${brand.tagline}) is a South Indian food delivery kitchen in ${brand.city}, India, serving fresh idli, vada, dosa and uttapam with sambar and coconut chutney. All food is vegetarian. Order online at ${SITE}/ or on WhatsApp/phone ${brand.phoneDisplay}.

## Ordering and delivery
- Website: ${SITE}/ (pick dishes and add-ons, enter address, pay by UPI; the order is sent on WhatsApp)
- Phone / WhatsApp: +91 ${brand.phoneDisplay}
- Delivery charge: ₹${brand.deliveryCharge}. Minimum order: ₹${brand.minOrder}.
- Payment: UPI (PhonePe, Google Pay, Paytm or any UPI app)
- Delivery areas in ${brand.city}: ${deliveryAreas.join(', ')}

## Menu (prices in INR)
${menuText}

### Add-ons (any dish, per portion)
${addOns.map((a) => `- ${a.name}: ₹${a.price}`).join('\n')}

## FAQ
${faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}
`)

rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true })
console.log('prerendered index.html, robots.txt, sitemap.xml, llms.txt')
