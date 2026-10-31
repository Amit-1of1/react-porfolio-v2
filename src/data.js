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
  minOrder: 100,
  // Delivery hours, every day, e.g. { opens: '07:30', closes: '22:00' }. Left out of search data until set.
  hours: { opens: '08:00', closes: '20:00', label: '8 am to 8 pm, all 7 days' },
  // Google Business Profile (Maps listing).
  googleMaps: 'https://maps.google.com/?cid=14104414144031816428',
  city: 'Kolkata',
}

export const highlights = [
  { icon: '🌅', title: 'Made fresh daily', text: 'Batter, sambar and chutneys prepared fresh every day. Nothing sits overnight.' },
  { icon: '🍃', title: 'Authentic taste', text: 'Classic South Indian recipes, from a simple plain dosa to our loaded specials.' },
  { icon: '🛵', title: 'Home delivery', text: `Delivered hot across north and east Kolkata on orders of ₹100 and above.` },
  { icon: '📱', title: 'Easy online ordering', text: 'Pick your dishes and send your order to us on WhatsApp in one tap.' },
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
    q: 'What are your delivery hours?',
    a: 'We deliver from 8 am to 8 pm, all 7 days of the week.',
  },
  {
    q: 'Can I order South Indian breakfast for home delivery?',
    a: 'Yes. Orders start at 8 am every day, so idli, vada, upma and dosa can reach you hot for breakfast, and we keep cooking through lunch and evening snacks until 8 pm.',
  },
  {
    q: 'What should I order at Idliyala?',
    a: "Popular picks are Idli (3 pcs) for ₹50, Plain Dosa for ₹60, Masala Dosa for ₹70, Onion Tomato Uttapam for ₹75 and Idliyala's Special Dosa for ₹250. Add Amul butter, cheese or paneer to any dish.",
  },
  {
    q: 'How do I order?',
    a: 'Add dishes and any add-ons on this website, enter your address and tap Send order: your order opens in WhatsApp, ready to send to our kitchen. You can also call or WhatsApp us on 99033 22982.',
  },
  {
    q: 'How can I pay?',
    a: 'No payment is taken on this website. Send your order on WhatsApp and we will confirm how to pay along with your delivery time.',
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

// Short plain descriptions of the classic dishes, used on the /menu/ page and in
// search data so search engines and AI assistants know what each dish is.
// "Butter ..." and "Ghee ..." variants reuse the base dish with a note.
const dishInfo = {
  'Idli (3 pcs)': 'Three soft steamed rice-and-lentil cakes with sambar and coconut chutney.',
  'Vada (3 pcs)': 'Three crispy fried urad dal vadas (medu vada) with sambar and coconut chutney.',
  'Masala Idli': 'Idli pieces tossed with onion, tomato and South Indian spices.',
  'Fried Idli': 'Idli pieces pan-fried until crisp outside and soft inside.',
  Upma: 'Savoury semolina (rava) cooked with mustard seeds, curry leaves and vegetables.',
  'Plain Dosa': 'Thin, crisp rice-and-lentil crepe with sambar and coconut chutney.',
  'Onion Plain Dosa': 'Crisp dosa topped with chopped onions.',
  'Rava Plain Dosa': 'Lacy, extra-crisp dosa made with semolina batter.',
  'Paneer Plain Dosa': 'Crisp dosa topped with grated paneer.',
  'Garlic Plain Dosa': 'Crisp dosa spread with a spicy garlic chutney.',
  'Chilli Plain Dosa': 'Crisp dosa topped with green chillies.',
  'Mysore Plain Dosa': 'Crisp dosa spread with spicy red Mysore chutney.',
  'Schezwan Plain Dosa': 'Crisp dosa spread with spicy schezwan sauce.',
  'Masala Dosa': 'Crisp dosa filled with spiced potato masala, served with sambar and coconut chutney.',
  'Rava Masala Dosa': 'Lacy semolina dosa filled with spiced potato masala.',
  'Mysore Masala Dosa': 'Dosa spread with spicy red Mysore chutney and filled with potato masala.',
  'Garlic Masala Dosa': 'Masala dosa spread with a spicy garlic chutney.',
  'Dhaniya Masala Dosa': 'Masala dosa with fresh coriander (dhaniya).',
  'Schezwan Masala Dosa': 'Masala dosa spread with spicy schezwan sauce.',
  'Paneer Masala Dosa': 'Masala dosa with paneer added to the filling.',
  'Plain Uttapam': 'Thick, fluffy rice-and-lentil pancake with sambar and coconut chutney.',
  'Masala Uttapam': 'Thick uttapam with spiced potato masala.',
  'Onion Uttapam': 'Thick uttapam topped with onions.',
  'Onion Tomato Uttapam': 'Thick uttapam topped with onions and tomatoes.',
  'Onion Chilli Uttapam': 'Thick uttapam topped with onions and green chillies.',
  'Mix Veg Uttapam': 'Thick uttapam topped with mixed vegetables.',
  'Cheese Masala Uttapam': 'Masala uttapam topped with cheese.',
  'Paneer Cheese Uttapam': 'Thick uttapam topped with paneer and cheese.',
  'Mysore Masala Uttapam': 'Uttapam with spicy red Mysore chutney and potato masala.',
  'Coconut Uttapam': 'Thick uttapam topped with grated coconut.',
  'Tomato Uttapam': 'Thick uttapam topped with tomatoes.',
}

export function dishDescription(name) {
  if (dishInfo[name]) return dishInfo[name]
  for (const fat of ['Butter', 'Ghee']) {
    const base = name.replace(`${fat} `, '')
    if (base !== name && dishInfo[base]) return `${dishInfo[base].replace(/\.$/, '')}, finished with ${fat.toLowerCase()}.`
  }
  return ''
}
