import { brand } from './data'

export const whatsappLink = (text) =>
  `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(text)}`

export function buildOrderMessage(lines, { name, address, note }) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const total = subtotal + brand.deliveryCharge
  const rows = lines.map((l) => `• ${l.qty} x ${l.name} = ₹${l.price * l.qty}`)
  return [
    'Hi Idliyala! I would like to order:',
    '',
    ...rows,
    '',
    `Subtotal: ₹${subtotal}`,
    `Delivery: ₹${brand.deliveryCharge}`,
    `Total: ₹${total}`,
    '',
    `Name: ${name || '-'}`,
    `Address: ${address || '-'}`,
    note ? `Note: ${note}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}
