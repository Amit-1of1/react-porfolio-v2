import { addOns as ADD_ONS } from './data'

// A cart is an array of lines. Each line is one dish with one set of add-ons:
// { key, name, basePrice, addOns: [addOnId], qty }. The same dish with
// different add-ons lives on separate lines.

const byId = Object.fromEntries(ADD_ONS.map((a) => [a.id, a]))
const ordered = (ids) => ADD_ONS.map((a) => a.id).filter((id) => ids.includes(id))
const lineKey = (name, ids) => [name, ...ordered(ids)].join('|')

export const addOnNames = (line) => line.addOns.map((id) => byId[id].name)
export const unitPrice = (line) => line.basePrice + line.addOns.reduce((s, id) => s + byId[id].price, 0)
export const lineTotal = (line) => unitPrice(line) * line.qty
export const cartCount = (cart) => cart.reduce((s, l) => s + l.qty, 0)
export const cartSubtotal = (cart) => cart.reduce((s, l) => s + lineTotal(l), 0)
export const itemCount = (cart, name) => cart.filter((l) => l.name === name).reduce((s, l) => s + l.qty, 0)

export function addItem(cart, item, ids = [], qty = 1) {
  const key = lineKey(item.name, ids)
  const existing = cart.find((l) => l.key === key)
  if (existing) return cart.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
  return [...cart, { key, name: item.name, basePrice: item.price, addOns: ordered(ids), qty }]
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

// Turns an add-on on or off for a whole line, merging with an identical line if one exists.
export function toggleAddOn(cart, key, addOnId) {
  const line = cart.find((l) => l.key === key)
  if (!line) return cart
  const ids = line.addOns.includes(addOnId) ? line.addOns.filter((id) => id !== addOnId) : [...line.addOns, addOnId]
  const rest = cart.filter((l) => l.key !== key)
  const newKey = lineKey(line.name, ids)
  const twin = rest.find((l) => l.key === newKey)
  if (twin) return rest.map((l) => (l.key === newKey ? { ...l, qty: l.qty + line.qty } : l))
  const updated = { ...line, key: newKey, addOns: ordered(ids) }
  return cart.map((l) => (l.key === key ? updated : l))
}
