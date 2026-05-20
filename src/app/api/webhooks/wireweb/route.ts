import crypto from 'crypto'
import { sendWhatsAppThankYou } from '@/lib/twilio'
import { NextResponse } from 'next/server'
import { renderReceiptImage } from '@/lib/renderReceiptSafe'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { format } from 'date-fns'
import path from 'node:path'
import fs from 'node:fs'

// Wireweb webhook receiver for Next.js App Router
// - Accepts POST JSON payloads from Wireweb
// - If `WIREWEB_SECRET` is set, verifies HMAC-SHA256 using header `x-wireweb-signature`

export async function GET() {
  return new Response('OK', { status: 200 })
}

export async function POST(req: Request) {
  const secret = process.env.WIREWEB_SECRET
  const sigHeader = req.headers.get('x-wireweb-signature') || req.headers.get('x-signature') || ''

  const bodyText = await req.text()

  if (secret && sigHeader) {
    try {
      const expected = crypto.createHmac('sha256', secret).update(bodyText).digest('hex')
      const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigHeader))
      if (!ok) return new Response('Invalid signature', { status: 401 })
    } catch (e) {
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
        house: 'N/A',
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

      // Send thank-you message (best-effort)
      try {
        const twRes = await sendWhatsAppThankYou(String(phone), String(name), Number(amount))
        console.log('[Wireweb webhook] thank-you sent result:', twRes)
      } catch (twErr) {
        console.warn('[Wireweb webhook] failed to send thank-you:', twErr)
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
