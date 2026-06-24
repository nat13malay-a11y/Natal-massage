import { NextResponse } from 'next/server'
import { sendBookingTelegram } from '@/lib/bookingNotifications'
import { fetchJarStatement, isMatchingDeposit, type MonoStatementItem } from '@/lib/monobankJar'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AppointmentRow = {
  id: string
  date: string
  time: string
  name: string
  phone: string
  comment: string | null
  status: string
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
      invoiceId?: string
      pageUrl?: string
      reference?: string
      status?: string
      statementId?: string
      lastCheckedAt?: string
      failureReason?: string
      telegramMessageIds?: Record<string, number>
      paidTelegramMessageIds?: Record<string, number>
    }
  }
}

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

function fromUnixFor(row: AppointmentRow) {
  const createdAt = new Date(row.created_at).getTime()
  const safeCreatedAt = Number.isFinite(createdAt) ? createdAt : Date.now()
  return Math.max(0, Math.floor((safeCreatedAt - 5 * 60 * 1000) / 1000))
}

async function usedStatementIds() {
  if (!supabase) return new Set<string>()

  const result = await supabase
    .from('booking_appointments')
    .select('client')
    .not('client', 'is', null)

  const ids = new Set<string>()
  ;(result.data || []).forEach((row: { client?: { mono?: { statementId?: string } } }) => {
    if (row.client?.mono?.statementId) ids.add(row.client.mono.statementId)
  })
  return ids
}

function findPayment(items: MonoStatementItem[], row: AppointmentRow, usedIds: Set<string>) {
  const amount = row.client?.mono?.amount || 40000
  const fromUnix = fromUnixFor(row)
  const reference = row.client?.mono?.reference || ''
  const byReference = items.find((item) => {
    const text = `${item.comment || ''} ${item.description || ''}`
    return isMatchingDeposit(item, amount, fromUnix) && !usedIds.has(item.id) && reference && text.includes(reference)
  })
  if (byReference) return byReference

  return items
    .filter((item) => isMatchingDeposit(item, amount, fromUnix) && !usedIds.has(item.id))
    .sort((a, b) => a.time - b.time)[0]
}

async function confirmIfPaid(row: AppointmentRow) {
  const now = new Date()
  const lastCheckedAt = row.client?.mono?.lastCheckedAt ? new Date(row.client.mono.lastCheckedAt).getTime() : 0
  if (lastCheckedAt && now.getTime() - lastCheckedAt < 60_000) {
    return { row, checked: false, error: '' }
  }

  const statement = await fetchJarStatement(fromUnixFor(row))
  const nextClient = {
    ...(row.client || {}),
    mono: {
      ...(row.client?.mono || {}),
      lastCheckedAt: now.toISOString(),
    },
  }

  if (!statement.ok) {
    await supabase!
      .from('booking_appointments')
      .update({ client: { ...nextClient, mono: { ...nextClient.mono, lastError: statement.error } } })
      .eq('id', row.id)
    return { row, checked: true, error: statement.error }
  }

  const payment = findPayment(statement.items, row, await usedStatementIds())
  if (!payment) {
    await supabase!
      .from('booking_appointments')
      .update({ client: nextClient })
      .eq('id', row.id)
    return { row, checked: true, error: '' }
  }

  let paidClient = {
    ...nextClient,
    mono: {
      ...nextClient.mono,
      status: 'success',
      statementId: payment.id,
      finalAmount: payment.amount,
      paidAt: new Date(payment.time * 1000).toISOString(),
      description: payment.description || '',
      comment: payment.comment || '',
    },
  }

  const updateResult = await supabase!
    .from('booking_appointments')
    .update({
      status: 'booked',
      client: paidClient,
    })
    .eq('id', row.id)
    .eq('status', 'pending_payment')
    .select('id')
    .maybeSingle()

  if (updateResult.error) {
    return { row, checked: true, error: updateResult.error.message }
  }

  if (!updateResult.data) {
    const currentResult = await supabase!
      .from('booking_appointments')
      .select('id, date, time, name, phone, comment, status, created_at, client')
      .eq('id', row.id)
      .maybeSingle()

    return {
      row: (currentResult.data as AppointmentRow | null) || row,
      checked: true,
      error: currentResult.error?.message || '',
    }
  }

  const paidNotification = await sendBookingTelegram({
    date: row.date,
    time: row.time,
    city: row.client?.city || null,
    name: row.name,
    phone: row.phone,
    comment: row.comment || '',
    submittedAt: row.client?.submittedAt,
    device: row.client?.device || {},
    payment: {
      amount: payment.amount,
      invoiceId: payment.id,
    },
  }, row.phone, {
    status: 'paid',
    replyToMessageIds: row.client?.mono?.telegramMessageIds || {},
  })
  const paidTelegramMessageIds = typeof paidNotification === 'object' ? paidNotification.messageIds : {}
  paidClient = {
    ...paidClient,
    mono: {
      ...paidClient.mono,
      paidTelegramMessageIds,
    },
  }

  await supabase!
    .from('booking_appointments')
    .update({ client: paidClient })
    .eq('id', row.id)

  return {
    row: {
      ...row,
      status: 'booked',
      client: paidClient,
    },
    checked: true,
    error: '',
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  const url = new URL(request.url)
  const invoiceId = url.searchParams.get('invoiceId') || ''
  const reference = url.searchParams.get('reference') || invoiceId
  if (!reference) {
    return NextResponse.json({ ok: false, error: 'Missing payment reference' }, noStore(400))
  }

  const byReference = await supabase
    .from('booking_appointments')
    .select('id, date, time, name, phone, comment, status, created_at, client')
    .contains('client', { mono: { reference } })
    .maybeSingle()

  const result = byReference.data || byReference.error
    ? byReference
    : await supabase
        .from('booking_appointments')
        .select('id, date, time, name, phone, comment, status, created_at, client')
        .contains('client', { mono: { invoiceId } })
        .maybeSingle()

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error.message }, noStore(500))
  }

  if (!result.data) {
    return NextResponse.json({ ok: true, bookingStatus: 'unknown', paymentStatus: 'unknown' }, noStore())
  }

  const initialRow = result.data as AppointmentRow
  const { row, error } = initialRow.status === 'pending_payment'
    ? await confirmIfPaid(initialRow)
    : { row: initialRow, error: '' }

  return NextResponse.json({
    ok: true,
    bookingStatus: row.status,
    paymentStatus: row.client?.mono?.status || (row.status === 'booked' ? 'success' : 'waiting'),
    failureReason: row.client?.mono?.failureReason || error,
    amount: row.client?.mono?.amount || 40000,
    invoiceId: row.client?.mono?.invoiceId || row.client?.mono?.reference || reference,
    pageUrl: row.client?.mono?.pageUrl || '',
    reference: row.client?.mono?.reference || reference,
  }, noStore())
}
