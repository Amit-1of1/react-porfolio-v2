import { brand } from './data'
import { cartSubtotal, lineLabels, lineTotal, priceBreakdown, unitPrice } from './cart'

// Short, readable order reference, e.g. IDL-M4K2Q7.
export const makeOrderCode = () =>
  'IDL-' + (Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 4)).toUpperCase()

export const orderTotal = (lines) => cartSubtotal(lines) + brand.deliveryCharge

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

export function buildOrderMessage(lines, form, orderCode) {
  const subtotal = cartSubtotal(lines)
  const total = subtotal + brand.deliveryCharge
  const labels = lineLabels(lines)
  const rows = lines.flatMap((l) => {
    const head = `• ${l.qty} x ${labels[l.key]} = ₹${lineTotal(l)}`
    const parts = priceBreakdown(l)
    if (parts.length < 2) return [head]
    return [
      head,
      ...parts.map((p) => `   ${p.addOn ? '+ ' : ''}${p.label}: ${p.detail ? `${p.detail} = ` : ''}₹${p.amount}`),
      l.qty > 1 ? `   = ₹${unitPrice(l)} per plate × ${l.qty} plates` : null,
    ].filter(Boolean)
  })
  return [
    '*New order from idliyala.com*',
    orderCode ? `Order ID: ${orderCode}` : null,
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

// Row saved to the orders table when the customer sends the order.
export function orderRecord(lines, form, orderCode) {
  const subtotal = cartSubtotal(lines)
  return {
    order_code: orderCode,
    customer_name: form.name.trim(),
    phone: form.phone,
    address: formatAddress(form),
    area: form.area,
    pincode: form.pincode,
    note: form.note.trim() || null,
    items: lines.map((l) => ({ name: l.name, qty: l.qty, add_ons: l.addOns, unit_price: unitPrice(l), line_total: lineTotal(l) })),
    subtotal,
    delivery_charge: brand.deliveryCharge,
    total: subtotal + brand.deliveryCharge,
  }
}
