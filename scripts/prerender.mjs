// Post-build step: bakes the rendered page, structured data and crawler files
// into dist/ so search engines and AI assistants can read everything without
// running JavaScript. All content comes from src/data.js.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { addOns, addOnsLabel, areaFaqs, areaGroups, areaSlug, brand, deliveryAreas, dishDescription, dishPages, faqs, menu, showcaseSlides, sides } from '../src/data.js'
import { render } from '../dist-ssr/entry-server.js'
import { localNames, locales } from './i18n.mjs'

const SITE = 'https://www.idliyala.com'
const dist = (f) => new URL(`../dist/${f}`, import.meta.url)
const prices = menu.flatMap((m) => m.items.map((i) => i.price))

// Every delivery area must sit in exactly one group in src/data.js.
const grouped = areaGroups.flatMap((g) => g.areas)
for (const a of deliveryAreas) if (grouped.filter((x) => x === a).length !== 1) throw new Error(`Delivery area "${a}" must be in exactly one of areaGroups`)
if (grouped.length !== deliveryAreas.length) throw new Error('areaGroups lists an area that is not in deliveryAreas')

// Kolkata, tied to its Wikipedia and Wikidata entries so search engines and AI
// assistants know exactly which city is meant, and each delivery area as a place in it.
const cityLd = { '@type': 'City', name: brand.city, sameAs: ['https://en.wikipedia.org/wiki/Kolkata', 'https://www.wikidata.org/wiki/Q1348'] }
const areaPlaces = areaGroups.flatMap((g) => g.areas.map((a) => ({
  '@type': 'Place',
  name: `${a}, ${brand.city}`,
  ...(g.aka?.[a] && { alternateName: g.aka[a].map((n) => `${n}, ${brand.city}`) }),
  containedInPlace: { '@type': 'City', name: brand.city },
})))

const restaurant = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  '@id': `${SITE}/#restaurant`,
  name: brand.name,
  alternateName: `${brand.name} - ${brand.tagline}`,
  slogan: brand.tagline,
  description: brand.intro,
  url: `${SITE}/`,
  alternateName: ['Idliyala Daily Fresh Idli', ...Object.values(locales).filter((l) => l.brandName !== brand.name).map((l) => l.brandName)],
  logo: `${SITE}/images/logo.png`,
  image: [`${SITE}/og-image.jpg`, `${SITE}/images/idli-plate.jpg`, `${SITE}/images/dosa-plate.jpg`],
  telephone: brand.phone,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: brand.phone,
    contactType: 'customer service',
    contactOption: 'Orders on phone and WhatsApp',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Bengali'],
  },
  menu: `${SITE}/menu/`,
  hasMap: brand.googleMaps,
  sameAs: [brand.googleMaps],
  servesCuisine: ['South Indian', 'Indian', 'Vegetarian'],
  priceRange: `₹${Math.min(...prices)}–₹${Math.max(...prices)}`,
  currenciesAccepted: 'INR',
  acceptsReservations: false,
  ...(brand.hours && {
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: brand.hours.opens,
      closes: brand.hours.closes,
    },
  }),
  address: { '@type': 'PostalAddress', addressLocality: brand.city, addressRegion: 'West Bengal', addressCountry: 'IN' },
  areaServed: [cityLd, ...areaPlaces],
  keywords: 'south indian food delivery kolkata, idli, dosa, vada, uttapam, pure veg, salt lake, bidhannagar, lake town, dum dum, vip road, kestopur, baguiati, chinar park',
  knowsAbout: ['Idli', 'Medu vada', 'Dosa', 'Masala dosa', 'Uttapam', 'Upma', 'Sambar', 'Coconut chutney', 'South Indian breakfast', 'Vegetarian food'],
  // Delivery terms (₹50 delivery, ₹100 minimum order) in a form answer engines can quote.
  makesOffer: {
    '@type': 'Offer',
    name: 'Home delivery',
    itemOffered: { '@type': 'Service', name: `South Indian food home delivery in ${brand.city}`, serviceType: 'Food delivery' },
    areaServed: cityLd,
    priceSpecification: {
      '@type': 'DeliveryChargeSpecification',
      price: brand.deliveryCharge,
      priceCurrency: 'INR',
      appliesToDeliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
      eligibleTransactionVolume: { '@type': 'PriceSpecification', minPrice: brand.minOrder, priceCurrency: 'INR' },
    },
  },
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

// The /menu/ page shows dish descriptions, so its menu data carries them too.
const describedMenu = {
  ...restaurant.hasMenu,
  hasMenuSection: restaurant.hasMenu.hasMenuSection.map((sec) => ({
    ...sec,
    hasMenuItem: sec.hasMenuItem.map((it) => (dishDescription(it.name) ? { ...it, description: dishDescription(it.name) } : it)),
  })),
}

const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

const website = {
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, name: brand.name,
  alternateName: `${brand.name} ${brand.tagline}`, url: `${SITE}/`, inLanguage: 'en-IN', publisher: { '@id': `${SITE}/#restaurant` },
}

// The home page and its Hindi and Bengali versions point at each other, so Google
// shows searchers the version in their language.
const hreflangs = [['en-IN', '/'], ...Object.values(locales).filter((l) => l.hreflang !== false).map((l) => [l.lang, l.path]), ['x-default', '/']]
  .map(([h, p]) => `<link rel="alternate" hreflang="${h}" href="${SITE}${p}" />`).join('\n    ')
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

let html = readFileSync(dist('index.html'), 'utf8')
const homePage = {
  '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${SITE}/#webpage`, url: `${SITE}/`, name: `${brand.name} | South Indian Food Delivery in ${brand.city}`,
  inLanguage: 'en-IN', dateModified: brand.updated, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#restaurant` },
}
html = html
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
  .replace('</head>', `    ${hreflangs}\n    ${[restaurant, homePage, faqPage, website].map(ld).join('\n    ')}\n  </head>`)
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
User-agent: Perplexity-User
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: DuckAssistBot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: CCBot
Allow: /
User-agent: GoogleOther
Allow: /
User-agent: MistralAI-User
Allow: /
User-agent: YouBot
Allow: /

Sitemap: ${SITE}/sitemap.xml
`)

// One landing page per delivery area, so local searches like
// "south indian food salt lake" have a page that answers them directly.
const listAnd = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : xs[0])
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cssHref = readdirSync(new URL('../dist/assets', import.meta.url)).find((f) => f.endsWith('.css'))
const popular = menu.flatMap((m) => m.items.filter((i) => i.popular))

const li = (it) => `<li class="menu-item"><div class="menu-item__info"><span class="veg-dot" aria-label="Vegetarian"></span><span class="menu-item__name">${esc(it.name)}</span><span class="menu-item__sides">${sides.short}</span></div><span class="price">₹${it.price}</span></li>`
const liDesc = (it) => `<li class="menu-item"><div class="menu-item__info"><span class="veg-dot" aria-label="Vegetarian"></span><span class="menu-item__name">${esc(it.name)}</span>${dishDescription(it.name) ? `<span class="menu-item__desc">${esc(dishDescription(it.name))}</span>` : ''}<span class="menu-item__sides">${sides.short}</span></div><span class="price">₹${it.price}</span></li>`
const fullMenu = (row = li) => `${menu.map((m) => `<div class="menu__panel" id="${m.id}"><div class="menu__panel-head"><h3>${esc(m.category)}</h3><p>${esc(m.blurb)}</p></div><ul class="menu__list">${m.items.map(row).join('')}</ul></div>`).join('\n        ')}
        <p class="menu__addons"><strong>${addOnsLabel}:</strong> ${addOns.map((a) => `${esc(a.name)} ₹${a.price}`).join(' · ')}</p>`
const crumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], n) => ({ '@type': 'ListItem', position: n + 1, name, item })),
})
const restaurantRef = (extra = {}) => ({
  '@context': 'https://schema.org', '@type': 'Restaurant', '@id': `${SITE}/#restaurant`, name: brand.name, url: `${SITE}/`,
  telephone: brand.phone, servesCuisine: restaurant.servesCuisine, image: `${SITE}/og-image.jpg`, address: restaurant.address,
  menu: `${SITE}/menu/`, hasMap: brand.googleMaps, openingHoursSpecification: restaurant.openingHoursSpecification, ...extra,
})
const faqLd = (list) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })

const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600&display=swap'

// Shared shell for the static pages: same look as the app, no JavaScript needed.
function layout({ path, title, desc, ogTitle, lds, main, robots = 'index, follow, max-image-preview:large, max-snippet:-1', canonical = true, lang = 'en-IN', dir = 'ltr', ogLocale = 'en_IN', orderLabel = 'Order now', alternates = false }) {
  const url = `${SITE}${path}`
  return `<!doctype html>
<html lang="${lang}"${dir === 'rtl' ? ' dir="rtl"' : ''}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="${robots}" />
    <meta name="theme-color" content="#2f6b3c" />
    ${canonical ? `<link rel="canonical" href="${url}" />` : ''}
    ${alternates ? hreflangs : ''}
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${brand.name}" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og-image.jpg" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${FONTS}" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript><link href="${FONTS}" rel="stylesheet" /></noscript>
    <link rel="stylesheet" href="/assets/${cssHref}" />
    ${lds.map(ld).join('\n    ')}
  </head>
  <body>
    <header class="nav"><div class="container nav__inner">
      <a href="/" class="nav__brand"><img src="/images/logo-mark.webp" alt="Idliyala logo" width="72" height="65" /><span><strong>${brand.name}</strong><small>${brand.tagline}</small></span></a>
      <a href="/#menu" class="cart-btn"><span aria-hidden="true">🛒</span><span class="cart-btn__label">${esc(orderLabel)}</span></a>
    </div></header>
    <main>
${main}
    </main>
    <footer class="footer"><div class="container footer__inner">
      <div class="footer__brand"><img src="/images/logo-mark.webp" alt="" width="36" height="32" /><span><strong>${brand.name}</strong>™ · ${brand.tagline}</span></div>
      <p><a href="/menu/">Menu</a> · <a href="/delivery/">Delivery areas</a> · <a href="/about/">About</a> · <a href="/faq/">FAQ</a> · ${dishPages.map((d) => `<a href="/dishes/${d.slug}/">${esc(d.name)} delivery</a>`).join(' · ')}</p>
      <p>📞 <a href="tel:${brand.phone}">${brand.phoneDisplay}</a> · <a href="${brand.googleMaps}" target="_blank" rel="noreferrer">Find us on Google</a></p>
      <p><a href="/" hreflang="en">English</a> · ${Object.values(locales).map((l) => `<a href="${l.path}" ${l.hreflang === false ? "" : `hreflang="${l.lang.slice(0, 2)}" `}lang="${l.lang}">${l.label}</a>`).join(' · ')}</p>
    </div></footer>
  </body>
</html>
`
}

// One page per dish people search for by name ("masala dosa delivery kolkata").
const dishUrl = (d) => `${SITE}/dishes/${d.slug}/`
const dishItems = (d) => menu.flatMap((m) => m.items.filter((i) => d.match.test(i.name)))
function dishPage(d) {
  const items = dishItems(d)
  const from = Math.min(...items.map((i) => i.price))
  const lower = d.name.toLowerCase()
  const dishFaqs = [
    { q: `Where can I order ${lower} in ${brand.city}?`, a: `Order ${lower} from ${brand.name} on ${SITE.replace('https://', '')} or on WhatsApp ${brand.phoneDisplay}. We deliver across north and east ${brand.city}, including ${deliveryAreas.slice(0, 8).join(', ')} and more.` },
    { q: `How much does ${lower} cost at ${brand.name}?`, a: `${d.name} starts at ₹${from}. Every plate comes with complimentary ${sides.full}. Delivery is ₹${brand.deliveryCharge} on orders of ₹${brand.minOrder} or more.` },
    { q: `Is ${brand.name}'s ${lower} pure vegetarian?`, a: `Yes. ${brand.name} is a 100% pure vegetarian kitchen, and the batter, sambar and chutneys are made fresh every day.` },
    { q: `When can I get ${lower} delivered?`, a: `We deliver ${brand.hours.label}, so ${lower} can reach you hot for breakfast, lunch or an evening snack.` },
  ]
  return layout({
    path: `/dishes/${d.slug}/`,
    title: `${d.name} Delivery in ${brand.city} from ₹${from} | Pure Veg | ${brand.name}`,
    desc: `Order fresh ${lower} in ${brand.city} from ₹${from} with complimentary sambar and chutneys. 100% pure veg, delivered 8 am to 8 pm daily in Salt Lake, Lake Town, Dum Dum and more.`,
    ogTitle: `${d.name} delivery in ${brand.city} · ${brand.name}`,
    lds: [
      {
        '@context': 'https://schema.org', '@type': 'MenuSection', name: `${d.name} at ${brand.name}`, url: dishUrl(d),
        hasMenuItem: items.map((i) => ({
          '@type': 'MenuItem', name: i.name, suitableForDiet: 'https://schema.org/VegetarianDiet',
          ...(dishDescription(i.name) && { description: dishDescription(i.name) }),
            offers: { '@type': 'Offer', price: i.price, priceCurrency: 'INR' },
        })),
        isPartOf: { '@id': `${SITE}/#restaurant` },
      },
      restaurantRef(),
      { '@context': 'https://schema.org', '@type': 'WebPage', url: dishUrl(d), name: `${d.name} delivery in ${brand.city}`, inLanguage: 'en-IN', dateModified: brand.updated, about: { '@id': `${SITE}/#restaurant` } },
      crumbs([[brand.name, `${SITE}/`], ['Menu', `${SITE}/menu/`], [d.name, dishUrl(d)]]),
      faqLd(dishFaqs),
    ],
    main: `      <section class="hero"><div class="container">
        <div class="hero__copy">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › <a href="/menu/">Menu</a> › ${esc(d.name)}</nav>
          <span class="eyebrow">100% pure veg · From ₹${from}</span>
          <h1>${esc(d.name)} delivery in ${brand.city}</h1>
          <p class="lead">${esc(d.intro)} Every plate comes with complimentary ${sides.full}.</p>
          <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order ${esc(lower)}</a><a href="tel:${brand.phone}" class="btn btn--ghost">Call ${brand.phoneDisplay}</a></div>
          <ul class="hero__badges"><li><strong>₹${brand.deliveryCharge}</strong> delivery</li><li><strong>₹${brand.minOrder}</strong> minimum order</li><li><strong>WhatsApp</strong> ordering</li><li><strong>8 am–8 pm</strong> daily</li></ul>
        </div>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>${esc(d.name)} menu and prices</h2>
        <p class="menu__updated">Prices updated <time datetime="${brand.updated}">${brand.updatedLabel}</time></p>
        <div class="menu__panel"><ul class="menu__list">${items.map(liDesc).join('')}</ul></div>
        <p class="menu__addons"><strong>${addOnsLabel}:</strong> ${addOns.map((a) => `${esc(a.name)} ₹${a.price}`).join(' · ')}</p>
        <p><a href="/#menu" class="btn btn--primary">Start your order</a> <a href="/menu/" class="btn btn--ghost">See the full menu</a></p>
      </div></section>
      <section class="faq"><div class="container">
        <h2>${esc(d.name)} questions</h2>
        <div class="faq__list">${dishFaqs.map((f) => `<details class="faq__item card" open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
      </div></section>
      <section class="area-nearby"><div class="container">
        <h2>${esc(d.name)} delivered to</h2>
        <ul class="area-links area-links--plain">${deliveryAreas.map((a) => `<li><span>${esc(a)}</span></li>`).join('')}</ul>
        <p><a href="/delivery/">See all delivery areas and charges</a></p>
        <h2>More from our kitchen</h2>
        <ul class="area-links">${dishPages.filter((o) => o !== d).map((o) => `<li><a href="/dishes/${o.slug}/">${esc(o.name)} delivery in ${brand.city}</a></li>`).join('')}</ul>
      </div></section>`,
  })
}

// The one delivery page: every area name, plus the questions people ask about delivery.
const deliveryFaqs = [
  { q: `Which areas of ${brand.city} does ${brand.name} deliver to?`, a: `${brand.name} delivers to ${deliveryAreas.slice(0, -1).join(', ')} and ${deliveryAreas.at(-1)}.` },
  { q: 'What is the delivery charge and minimum order?', a: `Delivery is ₹${brand.deliveryCharge} per order and the minimum order is ₹${brand.minOrder}.` },
  { q: 'What are the delivery hours?', a: `We deliver ${brand.hours.label}.` },
  ...areaFaqs,
  { q: 'My area is not on the list. Can you still deliver?', a: `Message us on WhatsApp at ${brand.phoneDisplay} with your area and we will tell you if we can reach you.` },
  { q: 'How do I place an order?', a: `Pick your dishes on ${SITE.replace('https://', '')}, enter your address and send the order to our kitchen on WhatsApp. You can also call or WhatsApp ${brand.phoneDisplay}. No payment is taken on the website.` },
]

const pages = {
  'menu/': layout({
    path: '/menu/',
    title: `${brand.name} Menu & Prices | Idli, Dosa, Vada, Uttapam | Pure Veg, ${brand.city}`,
    desc: `Full ${brand.name} menu with prices: idli from ₹50, plain dosa ₹60, masala dosa ₹70, uttapam from ₹60, plus Amul butter, cheese, paneer and extra sambar and chutney add-ons. 100% pure veg, delivered across ${brand.city}.`,
    ogTitle: `${brand.name} menu and prices`,
    lds: [
      { ...restaurantRef(), hasMenu: describedMenu },
      { '@context': 'https://schema.org', '@type': 'WebPage', url: `${SITE}/menu/`, name: `${brand.name} menu and prices`, dateModified: brand.updated, about: { '@id': `${SITE}/#restaurant` } },
      crumbs([[brand.name, `${SITE}/`], ['Menu', `${SITE}/menu/`]]),
    ],
    main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › Menu</nav>
        <span class="eyebrow">100% pure veg · ${brand.city}</span>
        <h1>${brand.name} menu and prices</h1>
        <p class="lead">Every dish comes with 3 complimentary sides: ${sides.full}. Delivery is ₹${brand.deliveryCharge} on orders of ₹${brand.minOrder} or more, anywhere in our ${deliveryAreas.length} ${brand.city} delivery areas.</p>
        <p class="menu__updated">Prices updated <time datetime="${brand.updated}">${brand.updatedLabel}</time></p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a></div>
        <ul class="area-links">${dishPages.map((d) => `<li><a href="/dishes/${d.slug}/">${esc(d.name)}</a></li>`).join('')}</ul>
      </div></section>
      <section class="area-menu"><div class="container">
        ${fullMenu(liDesc)}
        <p><a href="/#menu" class="btn btn--primary">Start your order</a></p>
      </div></section>`,
  }),
  'delivery/': layout({
    path: '/delivery/',
    title: `South Indian Food Delivery in Salt Lake, Lake Town & VIP Road | ${brand.name}`,
    desc: `${brand.name} delivers pure veg idli, dosa, vada and uttapam to ${deliveryAreas.length} areas of north and east ${brand.city}: Salt Lake, Ultadanga, Lake Town, Bangur, Dum Dum, Nagerbazar, Kestopur, Baguiati, VIP Road and Chinar Park. ₹${brand.deliveryCharge} delivery, ${brand.hours.label}.`,
    ogTitle: `${brand.name} delivery areas in ${brand.city}`,
    lds: [
      restaurantRef({ areaServed: restaurant.areaServed, makesOffer: restaurant.makesOffer }),
      { '@context': 'https://schema.org', '@type': 'WebPage', url: `${SITE}/delivery/`, name: `South Indian food delivery areas in ${brand.city}`, inLanguage: 'en-IN', dateModified: brand.updated, about: { '@id': `${SITE}/#restaurant` }, mentions: areaPlaces },
      crumbs([[brand.name, `${SITE}/`], ['Delivery areas', `${SITE}/delivery/`]]),
      faqLd(deliveryFaqs),
    ],
    main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › Delivery areas</nav>
        <span class="eyebrow">Home delivery · ${brand.city}</span>
        <h1>South Indian food delivery areas in ${brand.city}</h1>
        <p class="lead">${brand.name} delivers fresh, 100% pure veg idli, vada, dosa and uttapam to ${deliveryAreas.length} neighbourhoods in north and east ${brand.city}, ${brand.hours.label}. Delivery ₹${brand.deliveryCharge}, minimum order ₹${brand.minOrder}. Every dish comes with complimentary ${sides.full}.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a><a href="tel:${brand.phone}" class="btn btn--ghost">Call ${brand.phoneDisplay}</a><a href="${brand.googleMaps}" class="btn btn--ghost" target="_blank" rel="noreferrer">📍 ${brand.name} on Google Maps</a></div>
      </div></section>
      <section class="area-nearby"><div class="container">
        <h2>Areas we deliver to</h2>
        <p>All ${deliveryAreas.length} areas get the same terms: ₹${brand.deliveryCharge} delivery, ₹${brand.minOrder} minimum order, ${brand.hours.label}.</p>
${areaGroups.map((g) => `        <div class="area-group" id="${g.id}">
          <h3>${esc(g.name)}</h3>
          <p>${brand.name} delivers across ${esc(g.where)}: ${esc(listAnd(g.areas))}.${g.aka ? ` Also searched as ${esc(listAnd(Object.values(g.aka).flat()))}.` : ''}</p>
          <ul class="area-links area-links--plain">${g.areas.map((a) => `<li id="${areaSlug(a)}"><span>${esc(a)}</span></li>`).join('')}</ul>
        </div>`).join('\n')}
        <p>Near one of these but not sure we reach your street? WhatsApp us on <a href="tel:${brand.phone}">${brand.phoneDisplay}</a> and we will tell you.</p>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>Popular dishes</h2>
        <div class="menu__panel"><ul class="menu__list">${popular.map(li).join('')}</ul></div>
        <p><a href="/#menu" class="btn btn--primary">Start your order</a> <a href="/menu/" class="btn btn--ghost">See the full menu</a></p>
      </div></section>
      <section class="faq"><div class="container">
        <h2>Delivery questions</h2>
        <div class="faq__list">${deliveryFaqs.map((f) => `<details class="faq__item card" open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
      </div></section>`,
  }),
}

// About page: one place that states plainly who Idliyala is, for people and for
// AI assistants that need a clear, quotable description of the business.
const facts = [
  ['What', 'South Indian food delivery kitchen (idli, vada, dosa, uttapam, upma)'],
  ['Where', `${brand.city}, West Bengal, India. Delivery only, across north and east ${brand.city}`],
  ['Food', '100% pure vegetarian. Batter, sambar and chutneys made fresh every day'],
  ['Hours', brand.hours.label],
  ['Prices', `₹${Math.min(...prices)} to ₹${Math.max(...prices)} per dish`],
  ['Delivery', `₹${brand.deliveryCharge} per order, minimum order ₹${brand.minOrder}`],
  ['Free with every dish', sides.full],
  ['How to order', `On ${SITE.replace('https://', '')} (the order is sent on WhatsApp) or call/WhatsApp ${brand.phoneDisplay}`],
  ['Payment', 'Not taken on the website. Confirmed with your order on WhatsApp'],
]
const orderSteps = [
  'Pick your dishes and any add-ons on the website.',
  'Enter your name, phone number and delivery address.',
  'Tap Send order: it opens in WhatsApp, ready to send to our kitchen.',
  'We confirm the order, delivery time and payment on WhatsApp, then deliver it hot.',
]
pages['about/'] = layout({
  path: '/about/',
  title: `About ${brand.name} | Pure Veg South Indian Kitchen in ${brand.city}`,
  desc: `${brand.name} is a 100% pure veg South Indian food delivery kitchen in ${brand.city}: fresh idli, vada, dosa and uttapam, delivered ${brand.hours.label}. ₹${brand.deliveryCharge} delivery, ₹${brand.minOrder} minimum order.`,
  ogTitle: `About ${brand.name}`,
  lds: [
    { '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE}/about/`, name: `About ${brand.name}`, inLanguage: 'en-IN', dateModified: brand.updated, about: { '@id': `${SITE}/#restaurant` }, mainEntity: { '@id': `${SITE}/#restaurant` } },
    restaurantRef({ description: brand.intro, slogan: brand.tagline, priceRange: restaurant.priceRange, knowsAbout: restaurant.knowsAbout, makesOffer: restaurant.makesOffer }),
    crumbs([[brand.name, `${SITE}/`], ['About', `${SITE}/about/`]]),
  ],
  main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › About</nav>
        <span class="eyebrow">${brand.tagline} · ${brand.city}</span>
        <h1>About ${brand.name}</h1>
        <p class="lead">${esc(brand.intro)}</p>
        <p class="lead">Everything on our menu is 100% pure vegetarian. Our batter, sambar and chutneys are made fresh every day, and every dish comes with complimentary ${sides.full}.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a><a href="tel:${brand.phone}" class="btn btn--ghost">Call ${brand.phoneDisplay}</a></div>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>${brand.name} at a glance</h2>
        <dl class="facts-list">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <p class="menu__updated">Details checked <time datetime="${brand.updated}">${brand.updatedLabel}</time></p>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>How ordering works</h2>
        <ol class="steps-list">${orderSteps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
        <h2>What we cook</h2>
        <ul class="area-links">${dishPages.map((d) => `<li><a href="/dishes/${d.slug}/">${esc(d.name)}</a></li>`).join('')}<li><a href="/menu/">Full menu and prices</a></li></ul>
        <h2>Where we deliver</h2>
        <dl class="facts-list">${areaGroups.map((g) => `<div><dt>${esc(g.name)}</dt><dd>${esc(listAnd(g.areas))}</dd></div>`).join('')}</dl>
        <p><a href="/delivery/">Delivery areas and charges</a>.</p>
        <h2>Contact</h2>
        <p>Phone and WhatsApp: <a href="tel:${brand.phone}">${brand.phoneDisplay}</a> · <a href="${brand.googleMaps}" target="_blank" rel="noreferrer">${brand.name} on Google Maps</a></p>
      </div></section>`,
})

// Every question in one place, grouped, so answer engines have a single page to cite.
const faqGroups = [
  ['About Idliyala and the food', faqs],
  // The rest of the delivery questions repeat ones already in faqs.
  ['Delivery areas in Kolkata', [...areaFaqs, ...deliveryFaqs.filter((f) => f.q.startsWith('My area'))]],
]
const allFaqs = faqGroups.flatMap(([, list]) => list)
pages['faq/'] = layout({
  path: '/faq/',
  title: `${brand.name} FAQ | Delivery, Prices, Hours & Ordering | ${brand.city}`,
  desc: `Answers about ${brand.name}: delivery areas in ${brand.city}, ₹${brand.deliveryCharge} delivery and ₹${brand.minOrder} minimum order, hours (${brand.hours.label}), prices, what comes free with every dish, and how to order on WhatsApp.`,
  ogTitle: `${brand.name} questions and answers`,
  lds: [
    { ...faqLd(allFaqs), url: `${SITE}/faq/`, name: `${brand.name} FAQ`, inLanguage: 'en-IN', dateModified: brand.updated, about: { '@id': `${SITE}/#restaurant` } },
    restaurantRef(),
    crumbs([[brand.name, `${SITE}/`], ['FAQ', `${SITE}/faq/`]]),
  ],
  main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › FAQ</nav>
        <span class="eyebrow">Questions and answers</span>
        <h1>${brand.name} FAQ</h1>
        <p class="lead">Quick answers about our food, prices, delivery and ordering. Anything else? WhatsApp us on <a href="tel:${brand.phone}">${brand.phoneDisplay}</a>.</p>
        <p class="menu__updated">Answers checked <time datetime="${brand.updated}">${brand.updatedLabel}</time></p>
      </div></section>
${faqGroups.map(([title, list]) => `      <section class="faq"><div class="container">
        <h2>${esc(title)}</h2>
        <div class="faq__list">${list.map((f) => `<details class="faq__item card" open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
      </div></section>`).join('\n')}
      <section class="area-menu"><div class="container">
        <p><a href="/#menu" class="btn btn--primary">🛒 Start your order</a> <a href="/menu/" class="btn btn--ghost">See the full menu</a></p>
      </div></section>`,
})

dishPages.forEach((d) => { pages[`dishes/${d.slug}/`] = dishPage(d) })

// Hindi and Bengali home pages: the same facts, prices and areas in the reader's language.
const menuItem = (name) => menu.flatMap((m) => m.items).find((i) => i.name === name)
for (const [code, t] of Object.entries(locales)) {
  const url = `${SITE}${t.path}`
  const dishNames = localNames.dishNames[code] || Object.fromEntries(Object.keys(localNames.dishNames.hi).map((en) => [en, en]))
  const dishes = Object.entries(dishNames).map(([en, local]) => ({ en, local, price: menuItem(en).price }))
  pages[t.path.slice(1)] = layout({
    path: t.path, title: t.title, desc: t.desc, ogTitle: t.ogTitle, lang: t.lang, dir: t.dir, ogLocale: t.ogLocale, orderLabel: t.orderNow, alternates: t.hreflang !== false,
    lds: [
      restaurantRef({ ...(t.brandName !== brand.name && { alternateName: t.brandName }), areaServed: restaurant.areaServed, makesOffer: restaurant.makesOffer }),
      { '@context': 'https://schema.org', '@type': 'WebPage', url, name: t.ogTitle, description: t.desc, inLanguage: t.lang, dateModified: brand.updated, about: { '@id': `${SITE}/#restaurant` } },
      { ...faqLd(t.faqs), url, inLanguage: t.lang },
    ],
    main: `      <section class="hero"><div class="container">
        <span class="eyebrow">${esc(t.eyebrow)}</span>
        <h1>${esc(t.h1)}</h1>
        <p class="lead">${esc(t.lead)}</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 ${esc(t.orderNow)}</a><a href="tel:${brand.phone}" class="btn btn--ghost">${esc(t.call)} ${brand.phoneDisplay}</a><a href="${brand.googleMaps}" class="btn btn--ghost" target="_blank" rel="noreferrer">📍 Google Maps</a></div>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>${esc(t.factsTitle)}</h2>
        <dl class="facts-list">${t.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <p class="menu__updated">${esc(t.checked)}: <time datetime="${brand.updated}">${brand.updated}</time></p>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>${esc(t.dishesTitle)}</h2>
        <div class="menu__panel"><ul class="menu__list">${dishes.map((d) => `<li class="menu-item"><div class="menu-item__info"><span class="veg-dot" aria-label="Veg"></span><span class="menu-item__name">${esc(d.local)}</span>${d.local !== d.en ? `<span class="menu-item__desc" lang="en">${esc(d.en)}</span>` : ''}</div><span class="price">₹${d.price}</span></li>`).join('')}</ul></div>
        <p>${esc(t.dishesNote)} <a href="/menu/">${esc(t.fullMenu)}</a></p>
      </div></section>
      <section class="area-nearby"><div class="container">
        <h2>${esc(t.areasTitle)}</h2>
        <p>${esc(t.areasLead)}</p>
${areaGroups.map((g) => `        <div class="area-group">
          <h3>${esc(localNames.groupNames[code]?.[g.id] || g.name)}</h3>
          <ul class="area-links area-links--plain">${g.areas.map((a) => `<li><span>${esc(localNames.areaNames[code]?.[a] || a)}</span></li>`).join('')}</ul>
        </div>`).join('\n')}
        <p>${esc(t.areasAsk)}</p>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>${esc(t.stepsTitle)}</h2>
        <ol class="steps-list">${t.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
        <p><a href="/#menu" class="btn btn--primary">🛒 ${esc(t.orderNow)}</a></p>
      </div></section>
      <section class="faq"><div class="container">
        <h2>${esc(t.faqTitle)}</h2>
        <div class="faq__list">${t.faqs.map((f) => `<details class="faq__item card" open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
      </div></section>`,
  })
}
for (const [path, html] of Object.entries(pages)) {
  const dir = new URL(`../dist/${path}`, import.meta.url)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), html)
}

// Static 404 page, served by Vercel for any unknown URL (with a real 404 status).
writeFileSync(dist('404.html'), layout({
  path: '/404', title: `Page not found | ${brand.name}`, desc: `This page does not exist. See the ${brand.name} menu or order South Indian food in ${brand.city}.`,
  ogTitle: brand.name, lds: [], robots: 'noindex', canonical: false,
  main: `      <section class="hero"><div class="container">
        <h1>Sorry, this page is not on the menu</h1>
        <p class="lead">The page you were looking for has moved or never existed.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a><a href="/menu/" class="btn btn--ghost">See the full menu</a></div>
      </div></section>`,
}))

// Sitemap, with the photos the home page shows so they can appear in Google Images.
const pageImages = {
  '': ['/og-image.jpg', '/images/idli-plate.webp', '/images/dosa-plate.webp', ...showcaseSlides.map((s) => `/images/showcase/${s.id}-wide.webp`)],
}
const urls = ['', ...Object.keys(pages)]
writeFileSync(dist('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((p) => `  <url><loc>${SITE}/${p}</loc><lastmod>${brand.updated}</lastmod>${(pageImages[p] || []).map((im) => `<image:image><image:loc>${SITE}${im}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`)

const menuText = menu
  .map((m) => `### ${m.category}\n${m.blurb}\n\n${m.items.map((i) => `- ${i.name}: ₹${i.price}${dishDescription(i.name) ? ` (${dishDescription(i.name).replace(/\.$/, '')})` : ''}`).join('\n')}`)
  .join('\n\n')

writeFileSync(dist('llms.txt'), `# ${brand.name}

> ${brand.name} (${brand.tagline}) is a South Indian food delivery kitchen in ${brand.city}, India, serving fresh idli, vada, dosa and uttapam. Every dish comes with complimentary ${sides.full}. All food is 100% pure vegetarian. Order online at ${SITE}/ or on WhatsApp/phone ${brand.phoneDisplay}.

Last updated: ${brand.updated}

## Quick facts
- What: South Indian food delivery kitchen (idli, vada, dosa, uttapam, upma)
- Where: ${brand.city}, West Bengal, India (delivery only, north and east ${brand.city})
- Diet: 100% pure vegetarian
- Hours: ${brand.hours.label}
- Prices: ₹${Math.min(...prices)} to ₹${Math.max(...prices)} per dish; ₹${brand.minOrder} minimum order; ₹${brand.deliveryCharge} delivery charge
- Free with every dish: ${sides.full}
- How to order: on the website (order is sent on WhatsApp) or call/WhatsApp +91 ${brand.phoneDisplay}
- Payment: arranged on WhatsApp when the order is confirmed; no online payment on the website

## Ordering and delivery
- Menu: ${SITE}/menu/
- Website: ${SITE}/ (pick dishes and add-ons, enter address; the order is sent on WhatsApp, no online payment)
- Phone / WhatsApp: +91 ${brand.phoneDisplay}
- Google Maps: ${brand.googleMaps}
- Delivery hours: ${brand.hours.label}
- Delivery charge: ₹${brand.deliveryCharge}. Minimum order: ₹${brand.minOrder}.
- Payment: not taken on the website; confirmed with the order on WhatsApp
- Delivery areas page: ${SITE}/delivery/
- About ${brand.name}: ${SITE}/about/
- All questions and answers: ${SITE}/faq/
- Other languages: ${Object.values(locales).map((l) => `${l.label}: ${SITE}${l.path}`).join(' · ')}
- Name in other scripts: ${Object.values(locales).filter((l) => l.brandName !== brand.name).map((l) => l.brandName).join(', ')}
- Dish pages: ${dishPages.map((d) => `${d.name}: ${dishUrl(d)}`).join(' · ')}

## Delivery areas in ${brand.city}
${brand.name} delivers to ${deliveryAreas.length} neighbourhoods in north and east ${brand.city}, all on the same terms (₹${brand.deliveryCharge} delivery, ₹${brand.minOrder} minimum order, ${brand.hours.label}). It does not deliver outside these areas unless confirmed on WhatsApp.

${areaGroups.map((g) => `### ${g.name}\n${g.areas.map((a) => `- ${a}${g.aka?.[a] ? ` (also written ${g.aka[a].join(', ')})` : ''}`).join('\n')}`).join('\n\n')}

## Menu (prices in INR)
${menuText}

### Add-ons (per portion; any dish except plain Idli, Vada and Upma)
${addOns.map((a) => `- ${a.name}: ₹${a.price}`).join('\n')}

## FAQ
${[...faqs, ...areaFaqs].map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}
`)

// Tell Bing (and through it ChatGPT search and Copilot) about every page after a
// production deploy, via IndexNow. Skipped for previews and local builds.
if (process.env.VERCEL_ENV === 'production' && brand.indexNowKey) {
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE).host, key: brand.indexNowKey, keyLocation: `${SITE}/${brand.indexNowKey}.txt`, urlList: urls.map((p) => `${SITE}/${p}`) }),
      signal: AbortSignal.timeout(10000),
    })
    console.log(`IndexNow: submitted ${urls.length} URLs (HTTP ${res.status})`)
  } catch (e) {
    console.log(`IndexNow: skipped (${e.message})`)
  }
}

rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true })
console.log(`prerendered index.html, ${Object.keys(pages).length} static pages, robots.txt, sitemap.xml, llms.txt`)
