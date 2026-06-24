import { NextResponse } from 'next/server'
import { daysBetweenInclusive, displayWeekStart, endOfCalendarMonthGrid, generateAvailability, startOfMonth, todayKyiv, type BookingAppointment, type BookingOverride, type BookingWeekSetting } from '@/lib/booking'
import { sendBookingTelegram } from '@/lib/bookingNotifications'
import { depositAmountKopiykas, getJarPaymentConfig, missingJarPaymentConfig } from '@/lib/monobankJar'
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

function pendingCutoffIso() {
  return new Date(Date.now() - 35 * 60 * 1000).toISOString()
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
  const amount = depositAmountKopiykas()
  const jarConfig = getJarPaymentConfig()

  if (!name || !isFullUkrainianPhone(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return NextResponse.json({ ok: false, error: 'Name, phone, date and time are required' }, noStore(400))
  }

  if (!jarConfig.token || !jarConfig.jarId || !jarConfig.jarUrl) {
    return NextResponse.json({
      ok: false,
      error: `Monobank jar payment is not configured. Missing: ${missingJarPaymentConfig().join(', ')}`,
    }, noStore(503))
  }

  const start = todayKyiv()
  const end = endOfCalendarMonthGrid(startOfMonth(start))
  if (date < start || date > end) {
    return NextResponse.json({ ok: false, error: 'Date is outside the booking window' }, noStore(400))
  }

  await supabase
    .from('booking_appointments')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_payment')
    .lt('created_at', pendingCutoffIso())

  const weekStart = displayWeekStart(date)
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
      .select('date, time, status, created_at')
      .gte('date', start)
      .lte('date', end)
      .in('status', ['booked', 'pending_payment']),
    supabase
      .from('booking_week_settings')
      .select('week_start, city')
      .gte('week_start', displayWeekStart(start))
      .lte('week_start', displayWeekStart(end)),
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
  const pendingSince = Date.now() - 35 * 60 * 1000
  const appointments = (appointmentsResult.data || [])
    .filter((item: BookingAppointment & { created_at?: string }) => {
      if (item.status === 'booked') return true
      const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0
      return item.status === 'pending_payment' && createdAt > pendingSince
    }) as BookingAppointment[]
  const weeks = (weeksResult.data || []).map<BookingWeekSetting>((item) => ({
    weekStart: item.week_start,
    city: item.city,
  }))
  const day = generateAvailability(settings, overrides, appointments, weeks, daysBetweenInclusive(start, end), start).find((item) => item.date === date)
  const slot = day?.slots.find((item) => item.time === time)

  if (!slot?.available) {
    return NextResponse.json({ ok: false, error: 'This time is already booked or unavailable' }, noStore(409))
  }

  const city = day?.city || weeks.find((item) => item.weekStart === weekStart)?.city || null
  const reference = crypto.randomUUID()
  const submittedAt = payload.submittedAt || new Date().toISOString()
  const client = {
    submittedAt,
    device: payload.device || {},
    mono: {
      reference,
      amount,
      method: 'jar',
      jarId: jarConfig.jarId,
      status: 'waiting',
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
    const duplicate = pendingInsert.error.code === '23505'
    return NextResponse.json(
      { ok: false, error: duplicate ? 'This time is waiting for payment or already booked. Choose another time.' : pendingInsert.error.message },
      noStore(duplicate ? 409 : 500),
    )
  }

  const paymentUrl = `${jarConfig.jarUrl}${jarConfig.jarUrl.includes('?') ? '&' : '?'}booking=${encodeURIComponent(reference)}&amount=${Math.round(amount / 100)}`
  const pendingNotification = await sendBookingTelegram({
    date,
    time,
    city,
    name,
    phone,
    comment,
    submittedAt,
    device: payload.device || {},
    payment: {
      amount,
      invoiceId: reference,
    },
  }, phone, { status: 'pending' })
  const telegramMessageIds = typeof pendingNotification === 'object' ? pendingNotification.messageIds : {}

  await supabase
    .from('booking_appointments')
    .update({
      client: {
        ...client,
        mono: {
          ...client.mono,
          invoiceId: reference,
          pageUrl: paymentUrl,
          status: 'waiting',
          telegramMessageIds,
        },
        city,
      },
    })
    .eq('id', pendingInsert.data.id)

  return NextResponse.json({
    ok: true,
    paymentRequired: true,
    invoiceId: reference,
    pageUrl: paymentUrl,
    amount,
    reference,
  }, noStore())
}
