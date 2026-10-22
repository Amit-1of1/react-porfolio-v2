import { useEffect, useRef, useState } from 'react'
import { addOns, brand, deliveryAreas, menu } from '../data'
import { addOnNames, cartSubtotal, lineLabels, lineTotal, maxOf, unitPrice } from '../cart'
import { buildOrderMessage, makeOrderCode, openWhatsApp, orderRecord, validateOrderForm, whatsappLink } from '../order'
import { recordOrder, recordPayment } from '../api'
import PaymentStep from './PaymentStep'

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

const popular = menu.flatMap((m) => m.items.filter((i) => i.popular))

export default function CartDrawer({ open, onClose, lines, onQty, onSetAddOn, onSplit, onClear, onPick }) {
  const [form, setForm] = useState(loadSaved)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState('details') // details → pay → done
  const [orderCode, setOrderCode] = useState('')
  const formRef = useRef(null)
  const panelRef = useRef(null)

  const subtotal = cartSubtotal(lines)
  const labels = lineLabels(lines)
  const belowMin = subtotal < brand.minOrder

  useEffect(() => {
    if (!open) return
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

  const toTop = () => panelRef.current?.scrollTo({ top: 0 })
  const [lastMessage, setLastMessage] = useState('')

  const handlePaid = async (utr) => {
    await recordPayment(orderCode, utr)
    const text = buildOrderMessage(lines, form, { orderCode, utr })
    setLastMessage(whatsappLink(text))
    openWhatsApp(text)
    setStep('done')
    toTop()
  }

  const finish = () => {
    onClear()
    setStep('details')
    onClose()
  }

  const handleSubmit = async (e) => {
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
    const code = makeOrderCode()
    setOrderCode(code)
    recordOrder(orderRecord(lines, form, code))
    setStep('pay')
    toTop()
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
      <aside ref={panelRef} className="drawer__panel" role="dialog" aria-modal="true" aria-label="Your order">
        <div className="drawer__head">
          <h3>{step === 'pay' ? 'Payment' : step === 'done' ? 'Order sent' : 'Your order'}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'pay' ? (
          <PaymentStep
            total={subtotal + brand.deliveryCharge}
            orderCode={orderCode}
            onBack={() => { setStep('details'); toTop() }}
            onPaid={handlePaid}
          />
        ) : step === 'done' ? (
          <div className="done">
            <div className="done__tick" aria-hidden="true">✓</div>
            <h4>Thank you, {form.name.split(' ')[0]}!</h4>
            <p>Your order <strong>{orderCode}</strong> and payment details are ready in WhatsApp. Press <strong>send</strong> there and we&apos;ll confirm your delivery time.</p>
            <a className="btn btn--ghost btn--block" href={lastMessage}>WhatsApp didn&apos;t open? Tap here</a>
            <button type="button" className="btn btn--primary btn--block" onClick={finish}>Done</button>
          </div>
        ) : lines.length === 0 ? (
          <div className="drawer__empty">
            <p>Your order is empty. Start with a favourite:</p>
            <ul className="drawer__picks">
              {popular.map((it) => (
                <li key={it.name}>
                  <span>{it.name}</span>
                  <span className="price">₹{it.price}</span>
                  <button type="button" className="add-btn" onClick={() => onPick(it)} aria-label={`Add ${it.name}`}>Add +</button>
                </li>
              ))}
            </ul>
            <a href="#menu" className="btn btn--ghost btn--block" onClick={onClose}>See the full menu</a>
            <p className="drawer__hint">Minimum order ₹{brand.minOrder} · Delivery ₹{brand.deliveryCharge} · Pay by UPI</p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate>
            <ul className="drawer__lines">
              {lines.map((l) => (
                <li key={l.key}>
                  <div className="drawer__row">
                    <div className="drawer__item">
                      <span className="drawer__name">{labels[l.key]}</span>
                      {addOnNames(l).length > 0 && (
                        <span className="drawer__extras">
                          {l.qty > 1 ? `On each of the ${l.qty} plates: ` : '+ '}{addOnNames(l).join(', ')}
                        </span>
                      )}
                      {l.qty > 1 && <span className="drawer__each">₹{unitPrice(l)} per plate</span>}
                    </div>
                    <div className="stepper stepper--sm">
                      <button type="button" onClick={() => onQty(l.key, -1)} aria-label={`Remove one ${l.name}`}>−</button>
                      <span>{l.qty}</span>
                      <button type="button" onClick={() => onQty(l.key, 1)} aria-label={`Add one ${l.name}`}>+</button>
                    </div>
                    <span className="drawer__amt">₹{lineTotal(l)}</span>
                  </div>
                  {l.qty > 1 && (
                    <button type="button" className="split-btn" onClick={() => onSplit(l.key)}>
                      Want different add-ons on each plate? Split into {l.qty} separate plates
                    </button>
                  )}
                  <p className="chips__label">
                    {l.qty > 1 ? `Add-ons for each ${l.name} plate` : `Add-ons for this ${l.name}`}
                  </p>
                  <div className="chips" role="group" aria-label={`Add-ons for ${labels[l.key]}`}>
                    {addOns.map((a) => {
                      const n = l.addOns[a.id] || 0
                      const short = a.name.replace('Amul ', '')
                      if (n > 0) {
                        return (
                          <span key={a.id} className="chip chip--stepper is-on">
                            <button type="button" onClick={() => onSetAddOn(l.key, a.id, n - 1)} aria-label={n === 1 ? `Remove ${short}` : `Less ${short}`}>{n === 1 ? '✕' : '−'}</button>
                            {n}X {short} ₹{a.price * n}
                            <button type="button" onClick={() => onSetAddOn(l.key, a.id, n + 1)} disabled={n >= maxOf(a.id)} aria-label={`More ${short}`}>+</button>
                          </span>
                        )
                      }
                      return (
                        <button
                          type="button"
                          key={a.id}
                          className="chip"
                          onClick={() => onSetAddOn(l.key, a.id, 1)}
                        >
                          + {short} ₹{a.price}
                        </button>
                      )
                    })}
                  </div>
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
              Continue to payment · ₹{subtotal + brand.deliveryCharge}
            </button>
            <p className="drawer__hint">All fields marked * are required. Next: pay by UPI, then your order goes to us on WhatsApp.</p>
          </form>
        )}
      </aside>
    </div>
  )
}
