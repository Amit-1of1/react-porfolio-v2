import { useEffect, useRef, useState } from 'react'
import { brand, deliveryAreas } from '../data'
import { buildOrderMessage, openWhatsApp, validateOrderForm } from '../order'

const STORAGE_KEY = 'idliyala-customer'
const emptyForm = { name: '', phone: '', house: '', street: '', landmark: '', area: '', pincode: '', note: '' }

// Remember returning customers' details on this device (never the note).
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...emptyForm, ...saved, note: '' }
  } catch {
    return emptyForm
  }
}

function Field({ id, label, error, optional, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional ? <span className="field__opt"> (optional)</span> : <span className="field__req" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p className="field__error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  )
}

export default function CartDrawer({ open, onClose, lines, onAdd, onRemove, onClear }) {
  const [form, setForm] = useState(loadSaved)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [sent, setSent] = useState(false)
  const formRef = useRef(null)

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const belowMin = subtotal < brand.minOrder

  useEffect(() => {
    if (!open) return
    setSent(false)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const update = (k, clean = (v) => v) => (e) => {
    const next = { ...form, [k]: clean(e.target.value) }
    setForm(next)
    if (submitted) setErrors(validateOrderForm(next))
  }
  const digits = (max) => (v) => v.replace(/\D/g, '').slice(0, max)
  const phoneClean = (v) => digits(10)(v.replace(/^\s*\+?91[\s-]*/, ''))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (belowMin) return
    const errs = validateOrderForm(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`)
      first?.focus()
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    try {
      const { note, ...keep } = form
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keep))
    } catch { /* storage unavailable: fine */ }
    openWhatsApp(buildOrderMessage(lines, form))
    setSent(true)
  }

  const inputProps = (name) => ({
    id: `f-${name}`,
    name,
    value: form[name],
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `f-${name}-error` : undefined,
  })

  return (
    <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your order">
        <div className="drawer__head">
          <h3>Your order</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <p>Your order is empty. Add some idlis or dosas from the menu.</p>
            <a href="#menu" className="btn btn--primary" onClick={onClose}>Browse the menu</a>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <li key={l.name}>
                  <span className="drawer__name">{l.name}</span>
                  <div className="stepper stepper--sm">
                    <button type="button" onClick={() => onRemove(l)} aria-label={`Remove one ${l.name}`}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" onClick={() => onAdd(l)} aria-label={`Add one ${l.name}`}>+</button>
                  </div>
                  <span className="drawer__amt">₹{l.price * l.qty}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="link-btn" onClick={onClear}>Clear order</button>

            <dl className="drawer__totals">
              <div><dt>Subtotal</dt><dd>₹{subtotal}</dd></div>
              <div><dt>Delivery</dt><dd>₹{brand.deliveryCharge}</dd></div>
              <div className="drawer__total"><dt>Total</dt><dd>₹{subtotal + brand.deliveryCharge}</dd></div>
            </dl>
            {belowMin && (
              <p className="drawer__warn">Add ₹{brand.minOrder - subtotal} more to reach the ₹{brand.minOrder} minimum order.</p>
            )}

            <fieldset className="drawer__form">
              <legend>Your details</legend>
              <Field id="f-name" label="Full name" error={errors.name}>
                <input {...inputProps('name')} onChange={update('name')} autoComplete="name" placeholder="e.g. Priya Sen" />
              </Field>
              <Field id="f-phone" label="Mobile number" error={errors.phone}>
                <div className="input-prefix">
                  <span>+91</span>
                  <input {...inputProps('phone')} onChange={update('phone', phoneClean)} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" />
                </div>
              </Field>
            </fieldset>

            <fieldset className="drawer__form">
              <legend>Delivery address</legend>
              <Field id="f-house" label="Flat / house no. and floor" error={errors.house}>
                <input {...inputProps('house')} onChange={update('house')} autoComplete="address-line1" placeholder="e.g. Flat 3B, 2nd floor" />
              </Field>
              <Field id="f-street" label="Building, street or block" error={errors.street}>
                <input {...inputProps('street')} onChange={update('street')} autoComplete="address-line2" placeholder="e.g. AE-112, Sector 1" />
              </Field>
              <Field id="f-landmark" label="Landmark" optional>
                <input {...inputProps('landmark')} onChange={update('landmark')} placeholder="e.g. near City Centre" />
              </Field>
              <div className="field-row">
                <Field id="f-area" label="Area" error={errors.area}>
                  <select {...inputProps('area')} onChange={update('area')}>
                    <option value="">Choose area</option>
                    {deliveryAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </Field>
                <Field id="f-pincode" label="Pincode" error={errors.pincode}>
                  <input {...inputProps('pincode')} onChange={update('pincode', digits(6))} inputMode="numeric" autoComplete="postal-code" placeholder="700091" />
                </Field>
              </div>
              <Field id="f-note" label="Cooking note" optional>
                <input {...inputProps('note')} onChange={update('note')} placeholder="Less spicy, extra chutney…" />
              </Field>
            </fieldset>

            <button type="submit" className="btn btn--whatsapp btn--block" disabled={belowMin}>
              Send order on WhatsApp · ₹{subtotal + brand.deliveryCharge}
            </button>
            {sent ? (
              <p className="drawer__hint drawer__hint--ok">WhatsApp should open with your order filled in. Just press send there. We&apos;ll confirm on WhatsApp.</p>
            ) : (
              <p className="drawer__hint">All fields marked * are required. We&apos;ll confirm your order and delivery time on WhatsApp.</p>
            )}
          </form>
        )}
      </aside>
    </div>
  )
}
