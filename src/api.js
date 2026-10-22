import { SUPABASE_KEY, SUPABASE_URL } from './config'

const headers = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
})

// Both calls resolve to true/false and never throw: a recording hiccup must
// not stop a customer from sending their order on WhatsApp.
async function post(path, body) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
    return res.ok
  } catch {
    return false
  }
}

export const recordOrder = (order) => post('orders', order)

export const recordPayment = (orderCode, utr) =>
  post('rpc/submit_payment', { p_order_code: orderCode, p_utr: utr })
