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
  city: 'Kolkata',
}

export const highlights = [
  { icon: '🌅', title: 'Made fresh daily', text: 'Batter, sambar and chutneys prepared fresh every day. Nothing sits overnight.' },
  { icon: '🍃', title: 'Authentic taste', text: 'Classic South Indian recipes, from a simple plain dosa to our loaded specials.' },
  { icon: '🛵', title: 'Home delivery', text: `Delivered hot across north and east Kolkata on orders of ₹100 and above.` },
  { icon: '💬', title: 'Order on WhatsApp', text: 'Pick your dishes here and send the order to us in one tap.' },
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
  {
    id: 'add-ons',
    category: 'Add-ons',
    blurb: 'Make it extra.',
    image: null,
    items: [
      item('Amul Butter', 20),
      item('Amul Cheese', 25),
      item('Amul Paneer', 30),
      item('Schezwan', 20),
      item('Ghee', 20),
    ],
  },
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
