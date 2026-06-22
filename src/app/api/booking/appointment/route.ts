import { NextResponse } from 'next/server'
import { addDays, displayWeekStart, generateAvailability, todayKyiv, type BookingAppointment, type BookingOverride, type BookingWeekSetting } from '@/lib/booking'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AppointmentPayload = {
  date?: string
  time?: string
  city?: string | null
  name?: string
  phone?: string
  comment?: string
  submittedAt?: string
  device?: {
    userAgent?: string
    platform?: string
    language?: string
    timezone?: string
    viewport?: string
  }
}

type MonoInvoiceResponse = {
  invoiceId?: string
  pageUrl?: string
  errorDescription?: string
  errText?: string
}

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

function clean(value: unknown, max = 800) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max)
}

function multiline(value: unknown, max = 1200) {
  return String(value || '').trim().slice(0, max)
}

function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  let localPart = digits

  if (localPart.startsWith('380')) {
    localPart = localPart.slice(3)
  } else if (localPart.startsWith('38')) {
    localPart = localPart.slice(2)
  } else if (localPart.startsWith('3')) {
    localPart = localPart.slice(1)
  }

  return `+380${localPart.slice(0, 9)}`
}

function isFullUkrainianPhone(phone: string) {
  return /^\+380\d{9}$/.test(phone)
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  let payload: AppointmentPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, noStore(400))
  }

  const name = clean(payload.name, 120)
  const phone = cleanPhone(clean(payload.phone, 80))
  const date = clean(payload.date, 20)
  const time = clean(payload.time, 20)
  const comment = multiline(payload.comment, 1200)
  const depositAmount = Number(process.env.BOOKING_DEPOSIT_AMOUNT || process.env.booking_deposit_amount || 300)
  const amount = Math.round((Number.isFinite(depositAmount) ? depositAmount : 300) * 100)
  const monoToken = process.env.MONOBANK_MERCHANT_TOKEN || process.env.monobank_merchant_token

  if (!name || !isFullUkrainianPhone(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return NextResponse.json({ ok: false, error: 'Name, phone, date and time are required' }, noStore(400))
  }

  if (!monoToken) {
    return NextResponse.json({ ok: false, error: 'Monobank payment is not configured' }, noStore(503))
  }

  const start = todayKyiv()
  const end = addDays(start, 89)
  if (date < start || date > end) {
    return NextResponse.json({ ok: false, error: 'Date is outside the booking window' }, noStore(400))
  }

  const weekStart = displayWeekStart(date, start)
  const [settingsResult, overridesResult, appointmentsResult, weeksResult] = await Promise.all([
    supabase
      .from('booking_settings')
      .select('slot_minutes, working_hours')
      .eq('id', 'default')
      .maybeSingle(),
    supabase
      .from('booking_day_overrides')
      .select('date, closed, start_time, end_time, note')
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('booking_appointments')
      .select('date, time, status')
      .gte('date', start)
      .lte('date', end)
      .eq('status', 'booked'),
    supabase
      .from('booking_week_settings')
      .select('week_start, city')
      .gte('week_start', displayWeekStart(start, start))
      .lte('week_start', displayWeekStart(end, start)),
  ])

  if (settingsResult.error || overridesResult.error || appointmentsResult.error || weeksResult.error) {
    return NextResponse.json(
      { ok: false, error: settingsResult.error?.message || overridesResult.error?.message || appointmentsResult.error?.message || weeksResult.error?.message },
      noStore(500),
    )
  }

  const settings = settingsResult.data
    ? {
        slotMinutes: settingsResult.data.slot_minutes,
        workingHours: settingsResult.data.working_hours,
      }
    : null
  const overrides = (overridesResult.data || []).map<BookingOverride>((item) => ({
    date: item.date,
    closed: Boolean(item.closed),
    startTime: item.start_time,
    endTime: item.end_time,
    note: item.note,
  }))
  const appointments = (appointmentsResult.data || []) as BookingAppointment[]
  const weeks = (weeksResult.data || []).map<BookingWeekSetting>((item) => ({
    weekStart: item.week_start,
    city: item.city,
  }))
  const day = generateAvailability(settings, overrides, appointments, weeks, 90).find((item) => item.date === date)
  const slot = day?.slots.find((item) => item.time === time)

  if (!slot?.available) {
    return NextResponse.json({ ok: false, error: 'This time is already booked or unavailable' }, noStore(409))
  }

  const city = day?.city || weeks.find((item) => item.weekStart === weekStart)?.city || null
  const origin = new URL(request.url).origin
  const reference = crypto.randomUUID()
  const submittedAt = payload.submittedAt || new Date().toISOString()
  const client = {
    submittedAt,
    device: payload.device || {},
    mono: {
      reference,
      amount,
      status: 'creating',
    },
  }

  const pendingInsert = await supabase
    .from('booking_appointments')
    .insert({
      date,
      time,
      name,
      phone,
      comment,
      status: 'pending_payment',
      client,
    })
    .select('id')
    .single()

  if (pendingInsert.error) {
    return NextResponse.json({ ok: false, error: pendingInsert.error.message }, noStore(pendingInsert.error.code === '23505' ? 409 : 500))
  }

  const invoiceResponse = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Token': monoToken,
      'X-Cms': 'Natalya Massage',
      'X-Cms-Version': '1.0.0',
    },
    body: JSON.stringify({
      amount,
      ccy: 980,
      merchantPaymInfo: {
        reference,
        destination: `Задаток за запис ${date} ${time}`,
        comment: `Задаток за запис ${date} ${time}`,
        basketOrder: [
          {
            name: 'Задаток за прийом',
            qty: 1,
            sum: amount,
            total: amount,
            unit: 'послуга',
            code: 'booking-deposit',
          },
        ],
      },
      redirectUrl: `${origin}/?bookingPayment=${encodeURIComponent(reference)}`,
      webHookUrl: `${origin}/api/booking/payment/webhook`,
      validity: 1800,
      paymentType: 'debit',
    }),
  }).catch(() => null)

  const invoiceData = invoiceResponse ? (await invoiceResponse.json().catch(() => ({}))) as MonoInvoiceResponse : {}

  if (!invoiceResponse?.ok || !invoiceData.invoiceId || !invoiceData.pageUrl) {
    await supabase
      .from('booking_appointments')
      .update({
        status: 'cancelled',
        client: {
          ...client,
          mono: {
            ...client.mono,
            status: 'invoice_error',
            error: invoiceData.errorDescription || invoiceData.errText || 'Could not create invoice',
          },
        },
      })
      .eq('id', pendingInsert.data.id)

    return NextResponse.json({ ok: false, error: invoiceData.errorDescription || invoiceData.errText || 'Could not create payment invoice' }, noStore(502))
  }

  await supabase
    .from('booking_appointments')
    .update({
      client: {
        ...client,
        mono: {
          ...client.mono,
          invoiceId: invoiceData.invoiceId,
          pageUrl: invoiceData.pageUrl,
          status: 'created',
        },
        city,
      },
    })
    .eq('id', pendingInsert.data.id)

  return NextResponse.json({
    ok: true,
    paymentRequired: true,
    invoiceId: invoiceData.invoiceId,
    pageUrl: invoiceData.pageUrl,
    amount,
    reference,
  }, noStore())
}
