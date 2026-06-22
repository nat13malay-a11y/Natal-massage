import { NextResponse } from 'next/server'
import { defaultBookingSettings, normalizeSettings, type BookingOverride, type BookingSettings, type BookingWeekSetting } from '@/lib/booking'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SettingsPayload = {
  settings?: BookingSettings
  override?: BookingOverride
  week?: BookingWeekSetting
}

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

function cleanText(value: unknown, max = 400) {
  return String(value || '').trim().slice(0, max)
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { ok: true, configured: false, settings: defaultBookingSettings, overrides: [], weeks: [] },
      noStore(),
    )
  }

  const [settingsResult, overridesResult, weeksResult] = await Promise.all([
    supabase
      .from('booking_settings')
      .select('slot_minutes, working_hours')
      .eq('id', 'default')
      .maybeSingle(),
    supabase
      .from('booking_day_overrides')
      .select('date, closed, start_time, end_time, note')
      .order('date', { ascending: true })
      .limit(120),
    supabase
      .from('booking_week_settings')
      .select('week_start, city')
      .order('week_start', { ascending: true })
      .limit(120),
  ])

  if (settingsResult.error || overridesResult.error || weeksResult.error) {
    return NextResponse.json(
      {
        ok: true,
        configured: false,
        error: settingsResult.error?.message || overridesResult.error?.message || weeksResult.error?.message,
        settings: defaultBookingSettings,
        overrides: [],
        weeks: [],
      },
      noStore(),
    )
  }

  const settings = settingsResult.data
    ? normalizeSettings({
        slotMinutes: settingsResult.data.slot_minutes,
        workingHours: settingsResult.data.working_hours,
      })
    : defaultBookingSettings

  return NextResponse.json(
    {
      ok: true,
      configured: true,
      settings,
      overrides: (overridesResult.data || []).map((item) => ({
        date: item.date,
        closed: Boolean(item.closed),
        startTime: item.start_time,
        endTime: item.end_time,
        note: item.note,
      })),
      weeks: (weeksResult.data || []).map((item) => ({
        weekStart: item.week_start,
        city: item.city,
      })),
    },
    noStore(),
  )
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  let payload: SettingsPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, noStore(400))
  }

  if (payload.settings) {
    const settings = normalizeSettings(payload.settings)
    const { error } = await supabase
      .from('booking_settings')
      .upsert(
        {
          id: 'default',
          slot_minutes: settings.slotMinutes,
          working_hours: settings.workingHours,
        },
        { onConflict: 'id' },
      )

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, noStore(500))
    }
  }

  if (payload.override?.date) {
    const override = payload.override
    const { error } = await supabase
      .from('booking_day_overrides')
      .upsert(
        {
          date: override.date,
          closed: Boolean(override.closed),
          start_time: override.startTime || null,
          end_time: override.endTime || null,
          note: cleanText(override.note),
        },
        { onConflict: 'date' },
      )

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, noStore(500))
    }
  }

  if (payload.week?.weekStart) {
    const week = payload.week
    const { error } = await supabase
      .from('booking_week_settings')
      .upsert(
        {
          week_start: week.weekStart,
          city: cleanText(week.city, 120),
        },
        { onConflict: 'week_start' },
      )

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, noStore(500))
    }
  }

  return NextResponse.json({ ok: true }, noStore())
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const weekStart = url.searchParams.get('weekStart')

  if (weekStart) {
    const { error } = await supabase
      .from('booking_week_settings')
      .delete()
      .eq('week_start', weekStart)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, noStore(500))
    }

    return NextResponse.json({ ok: true }, noStore())
  }

  if (!date) {
    return NextResponse.json({ ok: false, error: 'Missing date' }, noStore(400))
  }

  const { error } = await supabase
    .from('booking_day_overrides')
    .delete()
    .eq('date', date)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, noStore(500))
  }

  return NextResponse.json({ ok: true }, noStore())
}
