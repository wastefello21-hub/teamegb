import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { renderReceiptImage } from '@/lib/renderReceiptSafe'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { format } from 'date-fns'

// Wireweb webhook receiver for Next.js App Router
// - Accepts POST JSON payloads from Wireweb
// - If `WIREWEB_SECRET` is set, verifies HMAC-SHA256 using header `x-wireweb-signature`

export async function GET() {
  return new Response('OK', { status: 200 })
}

export async function POST(req: Request) {
  const secret = process.env.WIREWEB_SECRET
  const sigHeaderRaw = req.headers.get('x-wireweb-signature') || req.headers.get('x-signature') || req.headers.get('x-hub-signature') || ''

  const bodyText = await req.text()

  // Test bypass: set WIREWEB_ALLOW_TEST=true in your host and send header `x-wireweb-skip-verification: 1`
  const allowTestBypass = process.env.WIREWEB_ALLOW_TEST === 'true'
  const skipVerificationHeader = req.headers.get('x-wireweb-skip-verification') === '1'
  if (allowTestBypass && skipVerificationHeader) {
    console.warn('[Wireweb webhook] TEST MODE: skipping signature verification due to WIREWEB_ALLOW_TEST + x-wireweb-skip-verification header')
  } else if (secret) {
    // Normalize incoming signature and accept common formats:
    // - Optional prefix like "sha256=..."
    // - Hex (`hex`) or Base64 (`base64`) encodings
    const sigHeader = (sigHeaderRaw || '').trim()
    console.info('[Wireweb webhook] signature header:', sigHeader)

    if (!sigHeader) {
      return new Response('Missing signature', { status: 401 })
    }

    let incoming = sigHeader
    if (incoming.startsWith('sha256=')) incoming = incoming.slice('sha256='.length)
    if (incoming.startsWith('sha1=')) incoming = incoming.slice('sha1='.length)

    try {
      const hmacHex = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
      const hmacBase64 = crypto.createHmac('sha256', secret).update(bodyText).digest('base64')

      const incomingBufHex = (() => {
        try { return Buffer.from(incoming, 'hex') } catch { return null }
      })()
      const incomingBufBase64 = (() => {
        try { return Buffer.from(incoming, 'base64') } catch { return null }
      })()

      const expectedBufHex = Buffer.from(hmacHex, 'hex')
      const expectedBufBase64 = Buffer.from(hmacBase64, 'base64')

      let ok = false
      if (incomingBufHex && incomingBufHex.length === expectedBufHex.length) {
        ok = crypto.timingSafeEqual(incomingBufHex, expectedBufHex)
      }
      if (!ok && incomingBufBase64 && incomingBufBase64.length === expectedBufBase64.length) {
        ok = crypto.timingSafeEqual(incomingBufBase64, expectedBufBase64)
      }

      if (!ok) {
        console.warn('[Wireweb webhook] signature mismatch (expected hex/base64)')
        return new Response('Invalid signature', { status: 401 })
      }
    } catch (e) {
      console.error('[Wireweb webhook] signature verification error', e)
      return new Response('Signature verification error', { status: 400 })
    }
  }

  let payload: any
  try {
    payload = JSON.parse(bodyText)
  } catch (e) {
    return new Response('Bad JSON', { status: 400 })
  }

  // TODO: adapt this handler to your app's message processing (enqueue job, notify team, persist to DB)
  // Example: payload might contain message details in payload.message or payload.messages
  console.log('[Wireweb webhook] payload:', JSON.stringify(payload))

  // Try to extract common fields: phone, name, amount
  const phone =
    payload.phone ||
    payload.from ||
    payload.sender ||
    (payload.message && (payload.message.from || payload.message.sender)) ||
    null

  const name = payload.name || payload.senderName || (payload.contact && payload.contact.name) || null

  let amount: number | null = null
  if (payload.amount) amount = Number(payload.amount)
  // Try to parse an amount from a message text like "donation 500" or "₹500"
  if (!amount && payload.message && typeof payload.message.text === 'string') {
    const m = payload.message.text.match(/\d{2,7}(?:\.\d{1,2})?/) // basic number matcher
    if (m) amount = Number(m[0])
  }

  if (phone && name && amount && Number.isFinite(amount) && amount > 0) {
    // Persist as a contribution and generate receipt (reuses app logic)
    const RECEIPT_BUCKET = 'e-receipts'

    const dbClient = supabaseAdmin ?? supabase

    async function generateReceiptNumber() {
      const maxAttempts = 20
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const candidate = String(Math.floor(100000 + Math.random() * 900000))
        const { data, error } = await dbClient
          .from('contributions')
          .select('id')
          .eq('receipt_number', candidate)
          .maybeSingle()

        if (error) throw error
        if (!data) return candidate
      }
      throw new Error('Unable to generate unique receipt number')
    }

    const entryDate = new Date()
    const receiptNumber = await generateReceiptNumber()

    try {
      const receiptBuffer = await renderReceiptImage({
        receiptNumber,
        entryDate,
        name: String(name),
        phone: String(phone),
        amount: Number(amount),
        mode: 'Wireweb',
        collector: 'wireweb',
      })

      const fileName = `receipt-${receiptNumber}.png`

      const storageClient = supabaseAdmin ?? supabase

      const { error: uploadError } = await storageClient.storage
        .from(RECEIPT_BUCKET)
        .upload(fileName, receiptBuffer, {
          upsert: true,
          contentType: 'image/png',
          cacheControl: '31536000',
        })

      if (uploadError) {
        console.error('[Wireweb webhook] upload error:', uploadError)
        return new Response('Failed to upload receipt', { status: 500 })
      }

      const { data: publicData } = storageClient.storage.from(RECEIPT_BUCKET).getPublicUrl(fileName)
      const receiptUrl = publicData?.publicUrl || null

      const contributionRecord = {
        name: String(name),
        house: 'N/A',
        phone: String(phone),
        amount: Number(amount),
        mode: 'Wireweb',
        date: format(entryDate, 'dd MMM yyyy, hh:mm a'),
        collector: 'wireweb',
        receipt_number: receiptNumber,
        receipt_url: receiptUrl,
        receipt_created_at: entryDate.toISOString(),
      }

      const { data: insertedContribution, error: insertError } = await dbClient
        .from('contributions')
        .insert([contributionRecord])
        .select('*')
        .single()

      if (insertError) {
        console.error('[Wireweb webhook] DB insert error:', insertError)
        // attempt cleanup
        await storageClient.storage.from(RECEIPT_BUCKET).remove([fileName])
        return new Response('Failed to save contribution', { status: 500 })
      }

      return NextResponse.json({ success: true, contribution: insertedContribution, receiptUrl }, { status: 200 })
    } catch (err) {
      console.error('[Wireweb webhook] processing error:', err)
      return new Response('Failed to process', { status: 500 })
    }
  }

  // Default: acknowledge receipt and log for manual handling
  return NextResponse.json({ success: true, received: true }, { status: 200 })
}
