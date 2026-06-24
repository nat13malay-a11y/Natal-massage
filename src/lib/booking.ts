export type WeekdayKey = '0' | '1' | '2' | '3' | '4' | '5' | '6'

export type WorkingDay = {
  enabled: boolean
  start: string
  end: string
}

export type BookingSettings = {
  slotMinutes: number
  workingHours: Record<WeekdayKey, WorkingDay>
}

export type BookingOverride = {
  date: string
  closed: boolean
  startTime: string | null
  endTime: string | null
  note: string | null
}

export type BookingWeekSetting = {
  weekStart: string
  city: string | null
}

export type BookingAppointment = {
  date: string
  time: string
  status?: string | null
}

export type BookingSlot = {
  time: string
  available: boolean
}

export type BookingDay = {
  date: string
  weekStart: string
  city: string | null
  weekday: number
  enabled: boolean
  closed: boolean
  start: string
  end: string
  note: string | null
  available: boolean
  slots: BookingSlot[]
}

const defaultDay: WorkingDay = {
  enabled: true,
  start: '09:00',
  end: '18:00',
}

export const defaultBookingSettings: BookingSettings = {
  slotMinutes: 60,
  workingHours: {
    '0': { ...defaultDay, enabled: false },
    '1': { ...defaultDay },
    '2': { ...defaultDay },
    '3': { ...defaultDay },
    '4': { ...defaultDay },
    '5': { ...defaultDay },
    '6': { ...defaultDay, start: '10:00', end: '15:00' },
  },
}

export function isTime(value: string | null | undefined) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')
}

export function normalizeSettings(input: Partial<BookingSettings> | null | undefined): BookingSettings {
  const slotMinutes = Number(input?.slotMinutes)
  const next: BookingSettings = {
    slotMinutes: Number.isFinite(slotMinutes) && slotMinutes >= 15 && slotMinutes <= 240 ? slotMinutes : defaultBookingSettings.slotMinutes,
    workingHours: { ...defaultBookingSettings.workingHours },
  }

  ;(['0', '1', '2', '3', '4', '5', '6'] as WeekdayKey[]).forEach((key) => {
    const source = input?.workingHours?.[key]
    next.workingHours[key] = {
      enabled: typeof source?.enabled === 'boolean' ? source.enabled : defaultBookingSettings.workingHours[key].enabled,
      start: isTime(source?.start) ? source!.start : defaultBookingSettings.workingHours[key].start,
      end: isTime(source?.end) ? source!.end : defaultBookingSettings.workingHours[key].end,
    }
  })

  return next
}

export function todayKyiv() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day))
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().slice(0, 10)
}

function parseUtcDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatUtcDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function daysBetweenInclusive(from: string, to: string) {
  const start = parseUtcDate(from)
  const end = parseUtcDate(to)
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
}

export function startOfMonth(date = todayKyiv()) {
  const current = parseUtcDate(date)
  return formatUtcDate(new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1)))
}

export function endOfMonth(date = todayKyiv()) {
  const current = parseUtcDate(date)
  return formatUtcDate(new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0)))
}

export function displayWeekStart(date: string, _rangeStart = todayKyiv()) {
  const current = parseUtcDate(date)
  const mondayOffset = (current.getUTCDay() + 6) % 7
  current.setUTCDate(current.getUTCDate() - mondayOffset)
  return formatUtcDate(current)
}

export function startOfCalendarMonthGrid(date = todayKyiv()) {
  return displayWeekStart(startOfMonth(date))
}

export function endOfCalendarMonthGrid(date = todayKyiv()) {
  const monthEnd = endOfMonth(date)
  const sundayOffset = 6 - ((weekday(monthEnd) + 6) % 7)
  return addDays(monthEnd, sundayOffset)
}

export function weekday(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function minutesFromTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function timeFromMinutes(total: number) {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function nowMinutesKyiv() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kiev',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const hours = Number(parts.find((part) => part.type === 'hour')?.value || 0)
  const minutes = Number(parts.find((part) => part.type === 'minute')?.value || 0)
  return hours * 60 + minutes
}

export function getDateRange(days = 35, rangeStart = todayKyiv()) {
  const start = rangeStart
  return Array.from({ length: days }, (_, index) => addDays(start, index))
}

export function generateAvailability(
  settingsInput: Partial<BookingSettings> | null | undefined,
  overrides: BookingOverride[] = [],
  appointments: BookingAppointment[] = [],
  weekSettings: BookingWeekSetting[] = [],
  days = 35,
  rangeStart = todayKyiv(),
) {
  const settings = normalizeSettings(settingsInput)
  const overrideMap = new Map(overrides.map((item) => [item.date, item]))
  const weekMap = new Map(weekSettings.map((item) => [item.weekStart, item.city || null]))
  const booked = new Set(
    appointments
      .filter((item) => item.status !== 'cancelled')
      .map((item) => `${item.date}|${item.time}`),
  )
  const today = todayKyiv()
  const now = nowMinutesKyiv()
  return getDateRange(days, rangeStart).map<BookingDay>((date) => {
    const weekStart = displayWeekStart(date)
    const dayOfWeek = weekday(date)
    const weekly = settings.workingHours[String(dayOfWeek) as WeekdayKey]
    const override = overrideMap.get(date)
    const start = isTime(override?.startTime) ? override!.startTime! : weekly.start
    const end = isTime(override?.endTime) ? override!.endTime! : weekly.end
    const startMinutes = minutesFromTime(start)
    const endMinutes = minutesFromTime(end)
    const enabled = weekly.enabled
    const closed = Boolean(override?.closed) || !enabled || endMinutes <= startMinutes
    const slots: BookingSlot[] = []

    if (!closed) {
      for (let cursor = startMinutes; cursor + settings.slotMinutes <= endMinutes; cursor += settings.slotMinutes) {
        const time = timeFromMinutes(cursor)
        const inFuture = date > today || (date === today && cursor > now)
        slots.push({
          time,
          available: inFuture && !booked.has(`${date}|${time}`),
        })
      }
    }

    return {
      date,
      weekStart,
      city: weekMap.get(weekStart) || null,
      weekday: dayOfWeek,
      enabled,
      closed,
      start,
      end,
      note: override?.note || null,
      available: slots.some((slot) => slot.available),
      slots,
    }
  })
}

export function formatDateHuman(date: string, locale = 'uk-UA') {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    weekday: 'long',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}
