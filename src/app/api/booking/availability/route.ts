import { NextResponse } from 'next/server'
import { addDays, defaultBookingSettings, displayWeekStart, generateAvailability, todayKyiv, type BookingAppointment, type BookingOverride, type BookingWeekSetting } from '@/lib/booking'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

function parseDays(request: Request) {
  const url = new URL(request.url)
  const value = Number(url.searchParams.get('days') || 35)
  return Number.isFinite(value) ? Math.min(Math.max(value, 14), 90) : 35
}

export async function GET(request: Request) {
  const days = parseDays(request)

  if (!supabase) {
    return NextResponse.json(
      {
        ok: true,
        configured: false,
        settings: defaultBookingSettings,
        overrides: [],
        weeks: [],
        days: generateAvailability(defaultBookingSettings, [], [], [], days),
      },
      noStore(),
    )
  }

  const start = todayKyiv()
  const end = addDays(start, days - 1)

  const weekStart = displayWeekStart(start, start)
  const weekEnd = displayWeekStart(end, start)

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
      .lte('date', end)
      .order('date', { ascending: true }),
    supabase
      .from('booking_appointments')
      .select('date, time, status')
      .gte('date', start)
      .lte('date', end)
      .eq('status', 'booked'),
    supabase
      .from('booking_week_settings')
      .select('week_start, city')
      .gte('week_start', weekStart)
      .lte('week_start', weekEnd)
      .order('week_start', { ascending: true }),
  ])

  if (settingsResult.error || overridesResult.error || appointmentsResult.error || weeksResult.error) {
    return NextResponse.json(
      {
        ok: true,
        configured: false,
        error: settingsResult.error?.message || overridesResult.error?.message || appointmentsResult.error?.message || weeksResult.error?.message,
        settings: defaultBookingSettings,
        overrides: [],
        weeks: [],
        days: generateAvailability(defaultBookingSettings, [], [], [], days),
      },
      noStore(),
    )
  }

  const settings = settingsResult.data
    ? {
        slotMinutes: settingsResult.data.slot_minutes,
        workingHours: settingsResult.data.working_hours,
      }
    : defaultBookingSettings
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

  return NextResponse.json(
    {
      ok: true,
      configured: true,
      settings,
      overrides,
      weeks,
      days: generateAvailability(settings, overrides, appointments, weeks, days),
    },
    noStore(),
  )
}
