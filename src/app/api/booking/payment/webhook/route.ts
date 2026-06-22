import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { sendBookingPaymentIssueTelegram, sendBookingTelegram } from '@/lib/bookingNotifications'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type MonoWebhookPayload = {
  invoiceId?: string
  status?: string
  amount?: number
  finalAmount?: number
  reference?: string
  modifiedDate?: string
  failureReason?: string
}

type AppointmentRow = {
  id: string
  date: string
  time: string
  name: string
  phone: string
  comment: string | null
  status: string
  client: {
    submittedAt?: string
    device?: {
      userAgent?: string
      platform?: string
      language?: string
      timezone?: string
      viewport?: string
    }
    city?: string | null
    mono?: Record<string, unknown>
  }
}

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

async function getMonoPubKey() {
  const configured = process.env.MONOBANK_MERCHANT_PUBKEY || process.env.monobank_merchant_pubkey
  if (configured) return configured

  const token = process.env.MONOBANK_MERCHANT_TOKEN || process.env.monobank_merchant_token
  if (!token) return ''

  const response = await fetch('https://api.monobank.ua/api/merchant/pubkey', {
    headers: { 'X-Token': token },
    cache: 'no-store',
  }).catch(() => null)
  const data = response ? await response.json().catch(() => ({})) : {}
  return typeof data.key === 'string' ? data.key : ''
}

async function verifyMonoSignature(body: string, xSign: string | null) {
  if (process.env.MONOBANK_SKIP_SIGNATURE === 'true') return true
  if (!xSign) return false

  const pubKey = await getMonoPubKey()
  if (!pubKey) return false

  try {
    const verifier = crypto.createVerify('SHA256')
    verifier.update(body)
    verifier.end()
    return verifier.verify(Buffer.from(pubKey, 'base64'), Buffer.from(xSign, 'base64'))
  } catch {
    return false
  }
}

function mergeClient(row: AppointmentRow, payload: MonoWebhookPayload) {
  const mono = row.client?.mono || {}
  return {
    ...(row.client || {}),
    mono: {
      ...mono,
      invoiceId: payload.invoiceId,
      reference: payload.reference || mono.reference,
      status: payload.status,
      amount: payload.amount || mono.amount,
      finalAmount: payload.finalAmount,
      modifiedDate: payload.modifiedDate,
      failureReason: payload.failureReason,
    },
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  const body = await request.text()
  const verified = await verifyMonoSignature(body, request.headers.get('x-sign'))
  if (!verified) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, noStore(403))
  }

  let payload: MonoWebhookPayload
  try {
    payload = JSON.parse(body) as MonoWebhookPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, noStore(400))
  }

  if (!payload.invoiceId) {
    return NextResponse.json({ ok: false, error: 'Missing invoiceId' }, noStore(400))
  }

  const rowResult = await supabase
    .from('booking_appointments')
    .select('id, date, time, name, phone, comment, status, client')
    .contains('client', { mono: { invoiceId: payload.invoiceId } })
    .maybeSingle()

  if (rowResult.error || !rowResult.data) {
    await sendBookingPaymentIssueTelegram([
      'Mono оплата пришла, но запись не найдена',
      `Invoice: ${payload.invoiceId}`,
      `Status: ${payload.status || 'unknown'}`,
      `Amount: ${payload.finalAmount || payload.amount || 0}`,
    ].join('\n'))

    return NextResponse.json({ ok: true, ignored: true }, noStore())
  }

  const row = rowResult.data as AppointmentRow
  const success = payload.status === 'success'
  const failed = ['failure', 'expired', 'cancelled', 'reversed'].includes(payload.status || '')

  if (success) {
    if (row.status === 'booked') {
      return NextResponse.json({ ok: true, alreadyBooked: true }, noStore())
    }

    const updateResult = await supabase
      .from('booking_appointments')
      .update({
        status: 'booked',
        client: mergeClient(row, payload),
      })
      .eq('id', row.id)
      .eq('status', 'pending_payment')

    if (updateResult.error) {
      await sendBookingPaymentIssueTelegram([
        'Mono задаток оплачен, но слот не удалось подтвердить',
        `Дата: ${row.date}`,
        `Время: ${row.time}`,
        `Имя: ${row.name}`,
        `Телефон: ${row.phone}`,
        `Invoice: ${payload.invoiceId}`,
        `Ошибка: ${updateResult.error.message}`,
      ].join('\n'))

      return NextResponse.json({ ok: false, error: updateResult.error.message }, noStore(500))
    }

    await sendBookingTelegram({
      date: row.date,
      time: row.time,
      city: row.client?.city || null,
      name: row.name,
      phone: row.phone,
      comment: row.comment || '',
      submittedAt: row.client?.submittedAt,
      device: row.client?.device || {},
      payment: {
        amount: payload.finalAmount || payload.amount || 0,
        invoiceId: payload.invoiceId,
      },
    }, row.phone)

    return NextResponse.json({ ok: true }, noStore())
  }

  await supabase
    .from('booking_appointments')
    .update({
      status: failed ? 'cancelled' : row.status,
      client: mergeClient(row, payload),
    })
    .eq('id', row.id)

  return NextResponse.json({ ok: true }, noStore())
}
