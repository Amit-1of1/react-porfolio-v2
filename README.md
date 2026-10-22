# Idliyala website

Website for **Idliyala** (Daily Fresh Idli), a South Indian food delivery kitchen in Kolkata.

Built with React + Vite. Visitors can browse the full menu, add dishes to an order,
and send it straight to Idliyala on WhatsApp (with the ₹100 minimum and ₹50 delivery
charge applied).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Updating content

All business content (menu items and prices, phone/WhatsApp number, delivery areas,
delivery charge, minimum order, reviews) lives in `src/data.js`. Edit that file; no
layout code needs to change. Images are in `public/images/`.

Reviews are hidden until real ones are added to the `reviews` array.

## Deploy

Any static host works (Vercel, Netlify, GitHub Pages). Build command `npm run build`,
output directory `dist`.
