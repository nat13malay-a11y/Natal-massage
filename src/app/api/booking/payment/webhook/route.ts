import { NextResponse } from 'next/server'
import { sendBookingPaymentIssueTelegram, sendBookingTelegram } from '@/lib/bookingNotifications'
import { depositAmountKopiykas, getJarPaymentConfig, isMatchingDeposit, type MonoStatementItem } from '@/lib/monobankJar'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type MonoPersonalWebhookPayload = {
  type?: string
  data?: {
    account?: string
    statementItem?: MonoStatementItem
  }
}

type PendingAppointment = {
  id: string
  date: string
  time: string
  name: string
  phone: string
  comment: string | null
  created_at: string
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
    mono?: {
      amount?: number
      reference?: string
      statementId?: string
    }
  }
}

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

function webhookSecretMatches(request: Request) {
  const secret = process.env.MONOBANK_WEBHOOK_SECRET || process.env.monobank_webhook_secret || ''
  if (!secret) return true
  return new URL(request.url).searchParams.get('secret') === secret
}

function appointmentFromUnix(row: PendingAppointment) {
  const createdAt = new Date(row.created_at).getTime()
  const safeCreatedAt = Number.isFinite(createdAt) ? createdAt : Date.now()
  return Math.max(0, Math.floor((safeCreatedAt - 5 * 60 * 1000) / 1000))
}

function itemText(item: MonoStatementItem) {
  return `${item.comment || ''} ${item.description || ''}`
}

function pickAppointment(rows: PendingAppointment[], item: MonoStatementItem) {
  const amount = depositAmountKopiykas()
  const withReference = rows.find((row) => {
    const reference = row.client?.mono?.reference || ''
    return reference && itemText(item).includes(reference) && isMatchingDeposit(item, row.client?.mono?.amount || amount, appointmentFromUnix(row))
  })
  if (withReference) return withReference

  return rows
    .filter((row) => isMatchingDeposit(item, row.client?.mono?.amount || amount, appointmentFromUnix(row)))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
}

export async function GET(request: Request) {
  if (!webhookSecretMatches(request)) {
    return NextResponse.json({ ok: false }, noStore(403))
  }

  return NextResponse.json({ ok: true }, noStore())
}

export async function POST(request: Request) {
  if (!webhookSecretMatches(request)) {
    return NextResponse.json({ ok: false }, noStore(403))
  }

  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  let payload: MonoPersonalWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, noStore(400))
  }

  if (payload.type !== 'StatementItem' || !payload.data?.statementItem) {
    return NextResponse.json({ ok: true, ignored: true }, noStore())
  }

  const { jarId } = getJarPaymentConfig()
  if (jarId && payload.data.account && payload.data.account !== jarId) {
    return NextResponse.json({ ok: true, ignored: true }, noStore())
  }

  const item = payload.data.statementItem
  if (!isMatchingDeposit(item, depositAmountKopiykas(), 0)) {
    return NextResponse.json({ ok: true, ignored: true }, noStore())
  }

  const usedResult = await supabase
    .from('booking_appointments')
    .select('client')
    .contains('client', { mono: { statementId: item.id } })
    .maybeSingle()

  if (usedResult.data) {
    return NextResponse.json({ ok: true, duplicate: true }, noStore())
  }

  const pendingResult = await supabase
    .from('booking_appointments')
    .select('id, date, time, name, phone, comment, created_at, client')
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: true })

  if (pendingResult.error) {
    return NextResponse.json({ ok: false, error: pendingResult.error.message }, noStore(500))
  }

  const appointment = pickAppointment((pendingResult.data || []) as PendingAppointment[], item)
  if (!appointment) {
    await sendBookingPaymentIssueTelegram([
      'На банку пришел задаток, но pending-запись не найдена',
      `Сумма: ${Math.round(item.amount / 100)} грн`,
      `Операция: ${item.id}`,
      `Описание: ${item.description || 'нет'}`,
      `Комментарий: ${item.comment || 'нет'}`,
    ].join('\n'))

    return NextResponse.json({ ok: true, noAppointment: true }, noStore())
  }

  const client = {
    ...(appointment.client || {}),
    mono: {
      ...(appointment.client?.mono || {}),
      status: 'success',
      statementId: item.id,
      finalAmount: item.amount,
      paidAt: new Date(item.time * 1000).toISOString(),
      description: item.description || '',
      comment: item.comment || '',
    },
  }

  const updateResult = await supabase
    .from('booking_appointments')
    .update({ status: 'booked', client })
    .eq('id', appointment.id)
    .eq('status', 'pending_payment')

  if (updateResult.error) {
    return NextResponse.json({ ok: false, error: updateResult.error.message }, noStore(500))
  }

  await sendBookingTelegram({
    date: appointment.date,
    time: appointment.time,
    city: appointment.client?.city || null,
    name: appointment.name,
    phone: appointment.phone,
    comment: appointment.comment || '',
    submittedAt: appointment.client?.submittedAt,
    device: appointment.client?.device || {},
    payment: {
      amount: item.amount,
      invoiceId: item.id,
    },
  }, appointment.phone)

  return NextResponse.json({ ok: true }, noStore())
}
