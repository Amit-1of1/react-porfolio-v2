// All business content lives here so it can be updated without touching layout code.
// Source: Idliyala menu boards and delivery flyer.

export const brand = {
  name: 'Idliyala',
  tagline: 'Daily Fresh Idli',
  heroTitle: ['Soft idlis.', 'Crispy vadas.', 'Fresh every day.'],
  intro:
    'Idliyala is a South Indian kitchen in Kolkata built around the classics: pillowy idlis, golden dosas, loaded uttapams and crunchy vadas, served hot with sambar and coconut chutney and delivered to your door.',
  phoneDisplay: '99033 22982',
  phone: '+919903322982',
  whatsapp: '919903322982',
  deliveryCharge: 50,
  // UPI account that receives online payments (from the PhonePe QR).
  upi: { id: '9903284811@axl', payee: 'ANAND JHAWAR' },
  minOrder: 100,
  // Delivery hours, every day, e.g. { opens: '07:30', closes: '22:00' }. Left out of search data until set.
  hours: null,
  // Google Business Profile (Maps listing).
  googleMaps: 'https://maps.google.com/?cid=14104414144031816428',
  city: 'Kolkata',
}

export const highlights = [
  { icon: '🌅', title: 'Made fresh daily', text: 'Batter, sambar and chutneys prepared fresh every day. Nothing sits overnight.' },
  { icon: '🍃', title: 'Authentic taste', text: 'Classic South Indian recipes, from a simple plain dosa to our loaded specials.' },
  { icon: '🛵', title: 'Home delivery', text: `Delivered hot across north and east Kolkata on orders of ₹100 and above.` },
  { icon: '📱', title: 'Easy online ordering', text: 'Pick your dishes, pay by UPI and your order reaches us on WhatsApp.' },
]

const item = (name, price, extra = {}) => ({ name, price, ...extra })

export const menu = [
  {
    id: 'idli-vada',
    category: 'Idli & Vada',
    blurb: 'Steamed soft, served with sambar and chutney.',
    image: '/images/idli-plate.jpg',
    items: [
      item('Idli (3 pcs)', 50, { popular: true }),
      item('Vada (3 pcs)', 50),
      item('Masala Idli', 70),
      item('Butter Masala Idli', 90),
      item('Fried Idli', 80),
      item('Butter Fried Idli', 100),
      item('Ghee Fried Idli', 100),
      item('Upma', 60),
    ],
  },
  {
    id: 'plain-dosa',
    category: 'Plain Dosa',
    blurb: 'Thin, golden and crisp.',
    image: '/images/dosa-plate.jpg',
    items: [
      item('Plain Dosa', 60, { popular: true }),
      item('Butter Plain Dosa', 80),
      item('Onion Plain Dosa', 70),
      item('Onion Butter Plain Dosa', 90),
      item('Rava Plain Dosa', 80),
      item('Rava Butter Plain Dosa', 100),
      item('Paneer Plain Dosa', 90),
      item('Paneer Butter Plain Dosa', 110),
      item('Garlic Plain Dosa', 80),
      item('Chilli Plain Dosa', 65),
      item('Mysore Plain Dosa', 80),
      item('Mysore Butter Plain Dosa', 100),
      item('Schezwan Plain Dosa', 80),
    ],
  },
  {
    id: 'masala-dosa',
    category: 'Masala Dosa',
    blurb: 'Filled with spiced potato masala.',
    image: '/images/dosa-plate.jpg',
    items: [
      item('Masala Dosa', 70, { popular: true }),
      item('Butter Masala Dosa', 90),
      item('Rava Masala Dosa', 90),
      item('Butter Rava Masala Dosa', 110),
      item('Mysore Masala Dosa', 90),
      item('Garlic Masala Dosa', 100),
      item('Dhaniya Masala Dosa', 90),
      item('Ghee Masala Dosa', 90),
      item('Schezwan Masala Dosa', 90),
      item('Paneer Masala Dosa', 100),
      item('Special Masala Dosa', 150),
      item('Pizza Dosa', 200),
      item("Idliyala's Special Dosa", 250, { popular: true }),
    ],
  },
  {
    id: 'uttapam',
    category: 'Uttapam',
    blurb: 'Thick, fluffy and generously topped.',
    image: null,
    items: [
      item('Plain Uttapam', 60),
      item('Butter Plain Uttapam', 80),
      item('Masala Uttapam', 90),
      item('Butter Masala Uttapam', 110),
      item('Onion Uttapam', 70),
      item('Butter Onion Uttapam', 90),
      item('Onion Tomato Uttapam', 75, { popular: true }),
      item('Butter Onion Tomato Uttapam', 95),
      item('Onion Chilli Uttapam', 80),
      item('Butter Onion Chilli Uttapam', 100),
      item('Mix Veg Uttapam', 85),
      item('Butter Mix Veg Uttapam', 105),
      item('Cheese Masala Uttapam', 115),
      item('Butter Cheese Masala Uttapam', 135),
      item('Paneer Cheese Uttapam', 145),
      item('Mysore Masala Uttapam', 120),
      item('Mysore Butter Masala Uttapam', 140),
      item('Coconut Uttapam', 90),
      item('Tomato Uttapam', 70),
    ],
  },
]

// Extras a customer can add to any dish, priced per portion. Customers can add
// as many portions of each as they like; set `max` on one to cap it.
export const addOns = [
  { id: 'butter', name: 'Amul Butter', price: 20 },
  { id: 'cheese', name: 'Amul Cheese', price: 25 },
  { id: 'paneer', name: 'Amul Paneer', price: 30 },
  { id: 'schezwan', name: 'Schezwan', price: 20 },
  { id: 'ghee', name: 'Ghee', price: 20 },
]

export const deliveryAreas = [
  'Bidhannagar', 'Salt Lake', 'Ultadanga', 'Kankurgachi', 'Phool Bagan', 'Golaghata',
  'Lake Town', 'Bangur', 'Dum Dum Park', 'Kestopur', 'Baguiati', 'Raghunathpur',
  'Tegharia', "Haldiram's", 'Airport', 'Joda Mandir', 'Chinar Park', 'CC-2',
  'Kalindi', 'Shyamnagar', 'Jessore Road', 'Nagerbazar',
]

// Real customer reviews only. The section stays hidden while this is empty.
// Shape: { name: 'Customer name', rating: 5, text: 'Review text', source: 'Google' }
export const reviews = []

// Shown on the page and also published as FAQ structured data for search engines.
export const faqs = [
  {
    q: 'Where does Idliyala deliver in Kolkata?',
    a: `We deliver across north and east Kolkata, including ${deliveryAreas.slice(0, -1).join(', ')} and ${deliveryAreas.at(-1)}.`,
  },
  {
    q: 'What is the delivery charge and minimum order?',
    a: `Delivery is ₹${brand.deliveryCharge} per order and the minimum order is ₹${brand.minOrder}.`,
  },
  {
    q: 'How do I order?',
    a: 'Add dishes and any add-ons on this website, enter your address, pay by UPI and your order is sent to our kitchen on WhatsApp. You can also call or WhatsApp us on 99033 22982.',
  },
  {
    q: 'How can I pay?',
    a: 'Pay online with any UPI app such as PhonePe, Google Pay or Paytm. Scan the QR or tap Pay at checkout, then enter the 12-digit UTR from your payment.',
  },
  {
    q: 'What comes with the idli and dosa?',
    a: 'Every idli, vada, dosa and uttapam comes hot with sambar and coconut chutney. You can add Amul butter, cheese, paneer, schezwan or ghee to any dish.',
  },
  {
    q: 'Is the food vegetarian?',
    a: 'Yes. Idliyala is a 100% pure vegetarian kitchen, and the batter, sambar and chutneys are made fresh every day.',
  },
]

// URL slug for each delivery area's page, e.g. "Dum Dum Park" -> "dum-dum-park".
export const areaSlug = (area) => area.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
