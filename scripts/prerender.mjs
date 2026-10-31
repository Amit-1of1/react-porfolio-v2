// Post-build step: bakes the rendered page, structured data and crawler files
// into dist/ so search engines and AI assistants can read everything without
// running JavaScript. All content comes from src/data.js.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { addOns, addOnsLabel, areaSlug, brand, deliveryAreas, dishDescription, faqs, menu, sides } from '../src/data.js'
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

// Shared shell for the static pages: same look as the app, no JavaScript needed.
function layout({ path, title, desc, ogTitle, lds, main }) {
  const url = `${SITE}${path}`
  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#2f6b3c" />
    <link rel="canonical" href="${url}" />
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
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/${cssHref}" />
    ${lds.map(ld).join('\n    ')}
  </head>
  <body>
    <header class="nav"><div class="container nav__inner">
      <a href="/" class="nav__brand"><img src="/images/logo-mark.png" alt="Idliyala logo" width="72" height="65" /><span><strong>${brand.name}</strong><small>${brand.tagline}</small></span></a>
      <a href="/#menu" class="cart-btn"><span aria-hidden="true">🛒</span><span class="cart-btn__label">Order now</span></a>
    </div></header>
    <main>
${main}
    </main>
    <footer class="footer"><div class="container footer__inner">
      <div class="footer__brand"><img src="/images/logo-mark.png" alt="" width="36" height="32" /><span><strong>${brand.name}</strong>™ · ${brand.tagline}</span></div>
      <p><a href="/menu/">Menu</a> · <a href="/delivery/">Delivery areas</a> · 📞 <a href="tel:${brand.phone}">${brand.phoneDisplay}</a> · <a href="${brand.googleMaps}" target="_blank" rel="noreferrer">Find us on Google</a></p>
    </div></footer>
  </body>
</html>
`
}

function areaPage(area, i) {
  const areaFaqs = [
    { q: `Does Idliyala deliver South Indian food to ${area}?`, a: `Yes. Idliyala delivers fresh idli, vada, dosa and uttapam to ${area} and nearby areas like ${nearby(i).slice(2, 5).join(', ')}. Delivery is ₹${brand.deliveryCharge} on orders of ₹${brand.minOrder} or more.` },
    { q: `How do I order idli or dosa in ${area}?`, a: `Pick your dishes on ${SITE.replace('https://', '')}, enter your ${area} address and send the order to our kitchen on WhatsApp. You can also call or WhatsApp ${brand.phoneDisplay}.` },
    { q: `Is Idliyala pure vegetarian?`, a: `Yes. Everything is 100% pure vegetarian, with batter, sambar and chutneys made fresh every day.` },
  ]
  return layout({
    path: `/delivery/${areaSlug(area)}/`,
    title: `South Indian Food Delivery in ${area}, ${brand.city} | ${brand.name}`,
    desc: `Order pure veg South Indian food in ${area}, ${brand.city}: soft idli, crispy vada, masala dosa and uttapam with free sambar and two chutneys. Home delivery ₹${brand.deliveryCharge}, minimum order ₹${brand.minOrder}. Order on WhatsApp.`,
    ogTitle: `South Indian food delivery in ${area} · ${brand.name}`,
    lds: [
      restaurantRef({ areaServed: { '@type': 'Place', name: `${area}, ${brand.city}` } }),
      crumbs([[brand.name, `${SITE}/`], ['Delivery areas', `${SITE}/delivery/`], [area, areaUrl(area)]]),
      faqLd(areaFaqs),
    ],
    main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › <a href="/delivery/">Delivery areas</a> › ${esc(area)}</nav>
        <span class="eyebrow">100% pure veg · Home delivery in ${esc(area)}</span>
        <h1>South Indian food delivery in ${esc(area)}, ${brand.city}</h1>
        <p class="lead">Craving soft idlis, crispy vadas or a golden masala dosa in ${esc(area)}? ${brand.name} cooks fresh South Indian food every day and delivers it hot to your door in ${esc(area)}, with complimentary ${sides.full} on every plate.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a><a href="tel:${brand.phone}" class="btn btn--ghost">Call ${brand.phoneDisplay}</a></div>
        <ul class="hero__badges"><li><strong>₹${brand.deliveryCharge}</strong> delivery</li><li><strong>₹${brand.minOrder}</strong> minimum order</li><li><strong>WhatsApp</strong> ordering</li><li><strong>8 am–8 pm</strong> daily</li></ul>
      </div></section>
      <section class="area-menu"><div class="container">
        <h2>Popular in ${esc(area)}</h2>
        <div class="menu__panel"><ul class="menu__list">${popular.map(li).join('')}</ul></div>
        <h2 class="area-menu__full">Full menu</h2>
        ${fullMenu()}
        <p><a href="/#menu" class="btn btn--primary">Start your order</a></p>
      </div></section>
      <section class="faq"><div class="container">
        <h2>Ordering in ${esc(area)}</h2>
        <div class="faq__list">${areaFaqs.map((f) => `<details class="faq__item card" open><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
      </div></section>
      <section class="area-nearby"><div class="container">
        <h2>We also deliver near ${esc(area)}</h2>
        <ul class="area-links">${nearby(i).map((a) => `<li><a href="/delivery/${areaSlug(a)}/">South Indian food in ${esc(a)}</a></li>`).join('')}</ul>
      </div></section>`,
  })
}

const pages = {
  'menu/': layout({
    path: '/menu/',
    title: `${brand.name} Menu & Prices | Idli, Dosa, Vada, Uttapam | Pure Veg, ${brand.city}`,
    desc: `Full ${brand.name} menu with prices: idli from ₹50, plain dosa ₹60, masala dosa ₹70, uttapam from ₹60, plus Amul butter, cheese and paneer add-ons. 100% pure veg, delivered across ${brand.city}.`,
    ogTitle: `${brand.name} menu and prices`,
    lds: [
      { ...restaurantRef(), hasMenu: describedMenu },
      crumbs([[brand.name, `${SITE}/`], ['Menu', `${SITE}/menu/`]]),
    ],
    main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › Menu</nav>
        <span class="eyebrow">100% pure veg · ${brand.city}</span>
        <h1>${brand.name} menu and prices</h1>
        <p class="lead">Every dish comes with 3 complimentary sides: ${sides.full}. Delivery is ₹${brand.deliveryCharge} on orders of ₹${brand.minOrder} or more, anywhere in our ${deliveryAreas.length} ${brand.city} delivery areas.</p>
        <div class="hero__ctas"><a href="/#menu" class="btn btn--primary">🛒 Order now</a></div>
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
    lds: [restaurantRef({ areaServed: restaurant.areaServed }), crumbs([[brand.name, `${SITE}/`], ['Delivery areas', `${SITE}/delivery/`]])],
    main: `      <section class="hero"><div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">${brand.name}</a> › Delivery areas</nav>
        <span class="eyebrow">Home delivery · ${brand.city}</span>
        <h1>Where we deliver in ${brand.city}</h1>
        <p class="lead">Fresh South Indian food, delivered hot to ${deliveryAreas.length} neighbourhoods in north and east ${brand.city}. Delivery ₹${brand.deliveryCharge}, minimum order ₹${brand.minOrder}.</p>
        <ul class="area-links">${deliveryAreas.map((a) => `<li><a href="/delivery/${areaSlug(a)}/">South Indian food in ${esc(a)}</a></li>`).join('')}</ul>
      </div></section>`,
  }),
}

deliveryAreas.forEach((area, i) => { pages[`delivery/${areaSlug(area)}/`] = areaPage(area, i) })
for (const [path, html] of Object.entries(pages)) {
  const dir = new URL(`../dist/${path}`, import.meta.url)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), html)
}

const urls = [`${SITE}/`, ...Object.keys(pages).map((p) => `${SITE}/${p}`)]
const images = ['og-image.jpg', 'images/idli-plate.jpg', 'images/dosa-plate.jpg', 'images/logo.png']
writeFileSync(dist('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u, i) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod>${i ? '' : images.map((im) => `<image:image><image:loc>${SITE}/${im}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`)

const menuText = menu
  .map((m) => `### ${m.category}\n${m.blurb}\n\n${m.items.map((i) => `- ${i.name}: ₹${i.price}${dishDescription(i.name) ? ` (${dishDescription(i.name).replace(/\.$/, '')})` : ''}`).join('\n')}`)
  .join('\n\n')

writeFileSync(dist('llms.txt'), `# ${brand.name}

> ${brand.name} (${brand.tagline}) is a South Indian food delivery kitchen in ${brand.city}, India, serving fresh idli, vada, dosa and uttapam. Every dish comes with complimentary ${sides.full}. All food is 100% pure vegetarian. Order online at ${SITE}/ or on WhatsApp/phone ${brand.phoneDisplay}.

## Ordering and delivery
- Menu: ${SITE}/menu/
- Website: ${SITE}/ (pick dishes and add-ons, enter address; the order is sent on WhatsApp, no online payment)
- Phone / WhatsApp: +91 ${brand.phoneDisplay}
- Google Maps: ${brand.googleMaps}
- Delivery hours: ${brand.hours.label}
- Delivery charge: ₹${brand.deliveryCharge}. Minimum order: ₹${brand.minOrder}.
- Payment: not taken on the website; confirmed with the order on WhatsApp
- Delivery areas in ${brand.city}: ${deliveryAreas.join(', ')}
- Area pages: ${deliveryAreas.map(areaUrl).join(' ')}

## Menu (prices in INR)
${menuText}

### Add-ons (per portion; any dish except plain Idli, Vada and Upma)
${addOns.map((a) => `- ${a.name}: ₹${a.price}`).join('\n')}

## FAQ
${faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}
`)

rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true })
console.log(`prerendered index.html, ${Object.keys(pages).length} static pages, robots.txt, sitemap.xml, llms.txt`)
