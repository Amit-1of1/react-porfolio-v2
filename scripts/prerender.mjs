// Post-build step: bakes the rendered page, structured data and crawler files
// into dist/ so search engines and AI assistants can read everything without
// running JavaScript. All content comes from src/data.js.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { addOns, addOnsLabel, areaSlug, brand, deliveryAreas, dishDescription, dishPages, faqs, menu, showcaseSlides, sides } from '../src/data.js'
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
  slogan: brand.tagline,
  description: brand.intro,
  url: `${SITE}/`,
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
  areaServed: [{ '@type': 'City', name: brand.city }, ...deliveryAreas.map((a) => ({ '@type': 'Place', name: `${a}, ${brand.city}` }))],
  keywords: 'south indian food delivery kolkata, idli, dosa, vada, uttapam, pure veg, salt lake, lake town',
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

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

let html = readFileSync(dist('index.html'), 'utf8')
const homePage = {
  '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${SITE}/#webpage`, url: `${SITE}/`, name: `${brand.name} | South Indian Food Delivery in ${brand.city}`,
  inLanguage: 'en-IN', dateModified: brand.updated, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#restaurant` },
}
html = html
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
  .replace('</head>', `    ${[restaurant, homePage, faqPage, website].map(ld).join('\n    ')}\n  </head>`)
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

Sitemap: ${SITE}/sitemap.xml
`)

// One landing page per delivery area, so local searches like
// "south indian food salt lake" have a page that answers them directly.
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
function layout({ path, title, desc, ogTitle, lds, main, robots = 'index, follow, max-image-preview:large', canonical = true }) {
  const url = `${SITE}${path}`
  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="${robots}" />
    <meta name="theme-color" content="#2f6b3c" />
    ${canonical ? `<link rel="canonical" href="${url}" />` : ''}
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${brand.name}" />
    <meta property="og:title" content="${esc(ogTitle)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og-image.jpg" />
    <meta property="og:locale" content="en_IN" />
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
      <a href="/#menu" class="cart-btn"><span aria-hidden="true">🛒</span><span class="cart-btn__label">Order now</span></a>
    </div></header>
    <main>
${main}
    </main>
    <footer class="footer"><div class="container footer__inner">
      <div class="footer__brand"><img src="/images/logo-mark.webp" alt="" width="36" height="32" /><span><strong>${brand.name}</strong>™ · ${brand.tagline}</span></div>
      <p><a href="/menu/">Menu</a> · <a href="/delivery/">Delivery areas</a> · ${dishPages.map((d) => `<a href="/dishes/${d.slug}/">${esc(d.name)} delivery</a>`).join(' · ')}</p>
      <p>📞 <a href="tel:${brand.phone}">${brand.phoneDisplay}</a> · <a href="${brand.googleMaps}" target="_blank" rel="noreferrer">Find us on Google</a></p>
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
  { q: 'My area is not on the list. Can you still deliver?', a: `Message us on WhatsApp at ${brand.phoneDisplay} with your area and we will tell you if we can reach you.` },
  { q: 'How do I place an order?', a: `Pick your dishes on ${SITE.replace('https://', '')}, enter your address and send the order to our kitchen on WhatsApp. You can also call or WhatsApp ${brand.phoneDisplay}. No payment is taken on the website.` },
]

const pages = {
  'menu/': layout({
    path: '/menu/',
    title: `${brand.name} Menu & Prices | Idli, Dosa, Vada, Uttapam | Pure Veg, ${brand.city}`,
    desc: `Full ${brand.name} menu with prices: idli from ₹50, plain dosa ₹60, masala dosa ₹70, uttapam from ₹60, plus Amul butter, cheese and paneer add-ons. 100% pure veg, delivered across ${brand.city}.`,
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
    title: `South Indian Food Delivery Areas in ${brand.city} | ${brand.name}`,
    desc: `${brand.name} delivers pure veg idli, dosa, vada and uttapam to ${deliveryAreas.length} areas in ${brand.city}, including ${deliveryAreas.slice(0, 6).join(', ')} and more.`,
    ogTitle: `${brand.name} delivery areas in ${brand.city}`,
    lds: [restaurantRef({ areaServed: restaurant.areaServed }), crumbs([[brand.name, `${SITE}/`], ['Delivery areas', `${SITE}/delivery/`]]), faqLd(deliveryFaqs)],
    main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › Delivery areas</nav>
        <span class="eyebrow">Home delivery · ${brand.city}</span>
        <h1>South Indian food delivery areas in ${brand.city}</h1>
        <p class="lead">${brand.name} delivers fresh, 100% pure veg idli, vada, dosa and uttapam to ${deliveryAreas.length} neighbourhoods in north and east ${brand.city}, ${brand.hours.label}. Delivery ₹${brand.deliveryCharge}, minimum order ₹${brand.minOrder}. Every dish comes with complimentary ${sides.full}.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a><a href="tel:${brand.phone}" class="btn btn--ghost">Call ${brand.phoneDisplay}</a></div>
      </div></section>
      <section class="area-nearby"><div class="container">
        <h2>Areas we deliver to</h2>
        <ul class="area-links area-links--plain">${deliveryAreas.map((a) => `<li id="${areaSlug(a)}"><span>${esc(a)}</span></li>`).join('')}</ul>
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

dishPages.forEach((d) => { pages[`dishes/${d.slug}/`] = dishPage(d) })
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
${urls.map((p) => `  <url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod>${(pageImages[p] || []).map((im) => `<image:image><image:loc>${SITE}${im}</image:loc></image:image>`).join('')}</url>`).join('\n')}
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
- Delivery areas in ${brand.city}: ${deliveryAreas.join(', ')}
- Delivery areas page: ${SITE}/delivery/
- Dish pages: ${dishPages.map((d) => `${d.name}: ${dishUrl(d)}`).join(' · ')}

## Menu (prices in INR)
${menuText}

### Add-ons (per portion; any dish except plain Idli, Vada and Upma)
${addOns.map((a) => `- ${a.name}: ₹${a.price}`).join('\n')}

## FAQ
${faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}
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
