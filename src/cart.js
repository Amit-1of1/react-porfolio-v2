import { addOns as ADD_ONS, allowsAddOns } from './data'

// A cart is an array of lines. Each line is one dish with one set of add-ons:
// { key, name, basePrice, addOns: { [addOnId]: portions }, qty }. The same
// dish with different add-ons lives on separate lines.

const byId = Object.fromEntries(ADD_ONS.map((a) => [a.id, a]))
export const maxOf = (id) => byId[id].max || Infinity

// Drops zero counts, clamps to each add-on's max and keeps the menu order.
// Dishes served plain never keep add-ons.
function normalize(counts, name) {
  const out = {}
  if (!allowsAddOns(name)) return out
  for (const a of ADD_ONS) {
    const n = Math.min(counts[a.id] || 0, maxOf(a.id))
    if (n > 0) out[a.id] = n
  }
  return out
}
const lineKey = (name, counts) => [name, ...Object.entries(counts).map(([id, n]) => `${id}:${n}`)].join('|')

export const addOnLabel = (id, n) => (n > 1 ? `${n}X ${byId[id].name}` : byId[id].name)
export const addOnNames = (line) => Object.entries(line.addOns).map(([id, n]) => addOnLabel(id, n))
export const addOnsPrice = (counts) => Object.entries(counts).reduce((s, [id, n]) => s + byId[id].price * n, 0)
// How a cart line's price is built, for every plate on the line: the dish at
// its menu price, then each add-on with its own price.
export const priceBreakdown = (line) => [
  { label: line.name, qty: line.qty, each: line.basePrice, amount: line.basePrice * line.qty },
  ...Object.entries(line.addOns).map(([id, n]) => ({
    label: byId[id].name,
    addOn: true,
    qty: n * line.qty,
    each: byId[id].price,
    amount: byId[id].price * n * line.qty,
    note: n > 1 && line.qty > 1 ? `${n} on each plate` : null,
  })),
]
export const unitPrice = (line) => line.basePrice + addOnsPrice(line.addOns)
export const lineTotal = (line) => unitPrice(line) * line.qty
export const cartCount = (cart) => cart.reduce((s, l) => s + l.qty, 0)
export const cartSubtotal = (cart) => cart.reduce((s, l) => s + lineTotal(l), 0)
export const itemCount = (cart, name) => cart.filter((l) => l.name === name).reduce((s, l) => s + l.qty, 0)

export function addItem(cart, item, counts = {}, qty = 1) {
  const addOns = normalize(counts, item.name)
  const key = lineKey(item.name, addOns)
  const existing = cart.find((l) => l.key === key)
  if (existing) return cart.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
  return [...cart, { key, name: item.name, basePrice: item.price, addOns, qty }]
}

export function changeQty(cart, key, delta) {
  return cart
    .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
    .filter((l) => l.qty > 0)
}

// Removes one plate of a dish from the most recently added line for it.
export function removeOneOf(cart, name) {
  const last = [...cart].reverse().find((l) => l.name === name)
  return last ? changeQty(cart, last.key, -1) : cart
}

// Sets how many portions of an add-on a whole line has (0 removes it),
// merging with an identical line if one exists.
export function setAddOn(cart, key, addOnId, portions) {
  const line = cart.find((l) => l.key === key)
  if (!line) return cart
  const addOns = normalize({ ...line.addOns, [addOnId]: portions }, line.name)
  const rest = cart.filter((l) => l.key !== key)
  const newKey = lineKey(line.name, addOns)
  const twin = rest.find((l) => l.key === newKey)
  if (twin) return rest.map((l) => (l.key === newKey ? { ...l, qty: l.qty + line.qty } : l))
  return cart.map((l) => (l.key === key ? { ...line, key: newKey, addOns } : l))
}

// Breaks a line of several plates into one line per plate, so each plate can
// get its own add-ons.
let splitSeq = 0
export function splitLine(cart, key) {
  const i = cart.findIndex((l) => l.key === key)
  if (i < 0 || cart[i].qty < 2) return cart
  const line = cart[i]
  const plates = Array.from({ length: line.qty }, () => ({ ...line, key: `${line.key}#${++splitSeq}`, qty: 1 }))
  return [...cart.slice(0, i), ...plates, ...cart.slice(i + 1)]
}

// Display names that tell apart several lines of the same dish:
// "Masala Dosa (1)", "Masala Dosa (2)". Single lines keep the plain name.
export function lineLabels(cart) {
  const totals = {}
  cart.forEach((l) => { totals[l.name] = (totals[l.name] || 0) + 1 })
  const seen = {}
  return Object.fromEntries(cart.map((l) => {
    if (totals[l.name] < 2) return [l.key, l.name]
    seen[l.name] = (seen[l.name] || 0) + 1
    return [l.key, `${l.name} (${seen[l.name]})`]
  }))
}
