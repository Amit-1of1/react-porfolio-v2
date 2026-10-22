import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { brand } from '../data'
import { isValidUtr, upiLink } from '../order'

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

// Second checkout step: pay the exact total by UPI, then enter the UTR.
export default function PaymentStep({ total, orderCode, onBack, onPaid }) {
  const [utr, setUtr] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const canvasRef = useRef(null)
  const link = upiLink(total, orderCode)

  useEffect(() => {
    if (canvasRef.current) QRCode.toCanvas(canvasRef.current, link, { width: 220, margin: 1, color: { dark: '#1f4a29' } })
  }, [link])

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(brand.upi.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked: the ID is visible to copy by hand */ }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!isValidUtr(utr)) {
      setError('Enter the 12-digit UTR / transaction ID from your UPI app.')
      return
    }
    setBusy(true)
    await onPaid(utr)
    setBusy(false)
  }

  return (
    <form className="pay" onSubmit={submit} noValidate>
      <button type="button" className="link-btn pay__back" onClick={onBack}>← Edit order or address</button>

      <div className="pay__amount">
        <span>Amount to pay</span>
        <strong>₹{total}</strong>
        <small>Order ID {orderCode}</small>
      </div>

      <ol className="pay__steps">
        <li>
          <h4>1. Pay ₹{total} by UPI</h4>
          <a className="btn btn--upi btn--block" href={link}>
            Pay ₹{total} with any UPI app
          </a>
          <p className="pay__hint">
            {isMobile()
              ? 'Opens PhonePe, Google Pay, Paytm or your bank app with the amount filled in.'
              : 'On a computer? Scan the QR below with your phone.'}
          </p>
          <div className="pay__qr">
            <canvas ref={canvasRef} aria-label={`UPI QR code for ₹${total}`} />
            <div className="pay__id">
              <span>UPI ID</span>
              <code>{brand.upi.id}</code>
              <button type="button" className="chip" onClick={copyId}>{copied ? '✓ Copied' : 'Copy'}</button>
              <small>{brand.upi.payee}</small>
            </div>
          </div>
        </li>
        <li>
          <h4>2. Enter your UTR / transaction ID</h4>
          <p className="pay__hint">After paying, your UPI app shows a 12-digit UTR (also called UPI Ref No. or Transaction ID).</p>
          <div className={`field ${error ? 'has-error' : ''}`}>
            <label htmlFor="f-utr">UTR / transaction ID<span className="field__req" aria-hidden="true"> *</span></label>
            <input
              id="f-utr"
              name="utr"
              value={utr}
              onChange={(e) => { setUtr(e.target.value.replace(/\D/g, '').slice(0, 12)); setError('') }}
              inputMode="numeric"
              placeholder="e.g. 429812345678"
              aria-invalid={!!error}
            />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>
        </li>
      </ol>

      <button type="submit" className="btn btn--whatsapp btn--block" disabled={busy}>
        {busy ? 'Saving…' : "I've paid · Send order on WhatsApp"}
      </button>
      <p className="drawer__hint">We&apos;ll check the payment and confirm your order on WhatsApp.</p>
    </form>
  )
}
