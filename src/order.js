import { brand } from './data'

export const whatsappLink = (text) =>
  `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(text)}`

// Opens WhatsApp with the order. A new tab on desktop; if the browser blocks
// the popup (common on phones), navigate in the same tab so the app opens.
export function openWhatsApp(text) {
  const url = whatsappLink(text)
  const win = window.open(url, '_blank')
  if (!win) window.location.href = url
}

export const formatAddress = (a) =>
  [a.house, a.street, a.landmark && `Near ${a.landmark}`, a.area, `Kolkata - ${a.pincode}`]
    .filter(Boolean)
    .join(', ')

export function buildOrderMessage(lines, form) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const total = subtotal + brand.deliveryCharge
  const rows = lines.map((l) => `• ${l.qty} x ${l.name} = ₹${l.price * l.qty}`)
  return [
    '*New order from idliyala.com*',
    '',
    ...rows,
    '',
    `Subtotal: ₹${subtotal}`,
    `Delivery: ₹${brand.deliveryCharge}`,
    `*Total: ₹${total}*`,
    '',
    `*Name:* ${form.name.trim()}`,
    `*Phone:* +91 ${form.phone}`,
    `*Address:* ${formatAddress(form)}`,
    form.note.trim() ? `*Note:* ${form.note.trim()}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

// Returns an object of field -> error message; empty when the form is valid.
export function validateOrderForm(f) {
  const e = {}
  if (f.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = 'Enter a valid 10-digit mobile number.'
  if (!f.house.trim()) e.house = 'Please enter your flat / house number.'
  if (!f.street.trim()) e.street = 'Please enter the building, street or block.'
  if (!f.area) e.area = 'Please choose your area.'
  if (!/^7\d{5}$/.test(f.pincode)) e.pincode = 'Enter a valid 6-digit Kolkata pincode.'
  return e
}
