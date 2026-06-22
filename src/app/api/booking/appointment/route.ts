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

function kyivTime(date = new Date()) {
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function humanDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('uk-UA', {
    timeZone: 'Europe/Kiev',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

async function sendTelegram(payload: AppointmentPayload, cleanedPhone: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.telegram_bot_token
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.telegram_chat_id

  if (!token || !chatId) return false

  const submittedDate = payload.submittedAt ? new Date(payload.submittedAt) : new Date()
  const safeSubmittedDate = Number.isNaN(submittedDate.getTime()) ? new Date() : submittedDate
  const device = payload.device || {}
  const userAgent = clean(device.userAgent, 500)

  const message = [
    'Новая запись на прием',
    '',
    `Дата приема: ${payload.date ? humanDate(payload.date) : 'не выбрана'}`,
    `Время приема: ${payload.time || 'не выбрано'}`,
    `Город: ${clean(payload.city, 120) || 'не указан'}`,
    '',
    `Имя: ${clean(payload.name, 120)}`,
    `Телефон: ${cleanedPhone}`,
    `Комментарий: ${multiline(payload.comment, 1200) || 'не указан'}`,
    '',
    `Отправлено: ${kyivTime(safeSubmittedDate)} (Kyiv time)`,
    `Устройство: ${userAgent || clean(device.platform, 120) || 'не определено'}`,
    `Язык: ${clean(device.language, 80) || 'не определено'}`,
  ].join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  }).catch(() => null)

  return Boolean(response?.ok)
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

  if (!name || !isFullUkrainianPhone(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return NextResponse.json({ ok: false, error: 'Name, phone, date and time are required' }, noStore(400))
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
    const delivered = await sendTelegram({ ...payload, name, phone, date, time, comment }, phone)

    return NextResponse.json(
      delivered
        ? { ok: true, fallback: true }
        : { ok: false, error: settingsResult.error?.message || overridesResult.error?.message || appointmentsResult.error?.message || weeksResult.error?.message },
      noStore(delivered ? 200 : 500),
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

  const { error } = await supabase
    .from('booking_appointments')
    .insert({
      date,
      time,
      name,
      phone,
      comment,
      status: 'booked',
      client: {
        submittedAt: payload.submittedAt || new Date().toISOString(),
        device: payload.device || {},
      },
    })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, noStore(error.code === '23505' ? 409 : 500))
  }

  const city = day?.city || weeks.find((item) => item.weekStart === weekStart)?.city || null
  await sendTelegram({ ...payload, name, phone, date, time, city, comment }, phone)

  return NextResponse.json({ ok: true }, noStore())
}
