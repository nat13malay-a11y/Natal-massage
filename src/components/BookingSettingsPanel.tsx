'use client'

import { useEffect, useMemo, useState } from 'react'
import { addDays, defaultBookingSettings, todayKyiv, type BookingOverride, type BookingSettings, type BookingWeekSetting, type WeekdayKey } from '@/lib/booking'
import { useI18n, type Lang } from '@/i18n'

type SettingsResponse = {
  ok: boolean
  configured?: boolean
  settings?: BookingSettings
  overrides?: BookingOverride[]
  weeks?: BookingWeekSetting[]
  error?: string
}

const weekdays: WeekdayKey[] = ['1', '2', '3', '4', '5', '6', '0']

const text: Record<Lang, {
  title: string
  subtitle: string
  notReady: string
  slot: string
  saveWeek: string
  saving: string
  saved: string
  error: string
  active: string
  start: string
  end: string
  overrides: string
  date: string
  closed: string
  note: string
  saveOverride: string
  resetOverride: string
  currentOverrides: string
  noOverrides: string
  cityWeeks: string
  city: string
  week: string
  saveCity: string
  resetCity: string
  dayNames: Record<WeekdayKey, string>
}> = {
  uk: {
    title: 'Запис на прийом',
    subtitle: 'Налаштування робочих днів, тривалості слотів і ручних змін для окремих дат.',
    notReady: 'Таблиці запису ще не додані в Supabase. Після виконання SQL налаштування почнуть зберігатися.',
    slot: 'Тривалість прийому',
    saveWeek: 'Зберегти графік',
    saving: 'Зберігаю...',
    saved: 'Збережено',
    error: 'Не вдалося зберегти',
    active: 'Працює',
    start: 'Початок',
    end: 'Кінець',
    overrides: 'Окремий день',
    date: 'Дата',
    closed: 'Закрити день',
    note: 'Нотатка',
    saveOverride: 'Зберегти день',
    resetOverride: 'Скинути день',
    currentOverrides: 'Ручні зміни',
    noOverrides: 'Поки немає змін',
    cityWeeks: 'Міста по тижнях',
    city: 'Місто',
    week: 'Тиждень',
    saveCity: 'Зберегти місто',
    resetCity: 'Очистити',
    dayNames: { '1': 'Понеділок', '2': 'Вівторок', '3': 'Середа', '4': 'Четвер', '5': 'П’ятниця', '6': 'Субота', '0': 'Неділя' },
  },
  ru: {
    title: 'Запись на прием',
    subtitle: 'Настройка рабочих дней, длительности слотов и ручных изменений для отдельных дат.',
    notReady: 'Таблицы записи еще не добавлены в Supabase. После выполнения SQL настройки начнут сохраняться.',
    slot: 'Длительность приема',
    saveWeek: 'Сохранить график',
    saving: 'Сохраняю...',
    saved: 'Сохранено',
    error: 'Не удалось сохранить',
    active: 'Работает',
    start: 'Начало',
    end: 'Конец',
    overrides: 'Отдельный день',
    date: 'Дата',
    closed: 'Закрыть день',
    note: 'Заметка',
    saveOverride: 'Сохранить день',
    resetOverride: 'Сбросить день',
    currentOverrides: 'Ручные изменения',
    noOverrides: 'Пока нет изменений',
    cityWeeks: 'Города по неделям',
    city: 'Город',
    week: 'Неделя',
    saveCity: 'Сохранить город',
    resetCity: 'Очистить',
    dayNames: { '1': 'Понедельник', '2': 'Вторник', '3': 'Среда', '4': 'Четверг', '5': 'Пятница', '6': 'Суббота', '0': 'Воскресенье' },
  },
  en: {
    title: 'Appointments',
    subtitle: 'Configure work days, slot length, and manual changes for individual dates.',
    notReady: 'Booking tables are not added to Supabase yet. Settings will save after the SQL is applied.',
    slot: 'Appointment length',
    saveWeek: 'Save schedule',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Could not save',
    active: 'Active',
    start: 'Start',
    end: 'End',
    overrides: 'Specific day',
    date: 'Date',
    closed: 'Close day',
    note: 'Note',
    saveOverride: 'Save day',
    resetOverride: 'Reset day',
    currentOverrides: 'Manual changes',
    noOverrides: 'No changes yet',
    cityWeeks: 'Cities by week',
    city: 'City',
    week: 'Week',
    saveCity: 'Save city',
    resetCity: 'Clear',
    dayNames: { '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '0': 'Sunday' },
  },
}

export default function BookingSettingsPanel() {
  const { lang } = useI18n()
  const t = text[lang]
  const [settings, setSettings] = useState<BookingSettings>(defaultBookingSettings)
  const [overrides, setOverrides] = useState<BookingOverride[]>([])
  const [weekCities, setWeekCities] = useState<Record<string, string>>({})
  const [configured, setConfigured] = useState(true)
  const [overrideDate, setOverrideDate] = useState(todayKyiv())
  const [overrideClosed, setOverrideClosed] = useState(false)
  const [overrideStart, setOverrideStart] = useState('09:00')
  const [overrideEnd, setOverrideEnd] = useState('18:00')
  const [overrideNote, setOverrideNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const selectedOverride = useMemo(
    () => overrides.find((item) => item.date === overrideDate),
    [overrideDate, overrides],
  )
  const upcomingWeeks = useMemo(
    () => Array.from({ length: 8 }, (_, index) => addDays(todayKyiv(), index * 7)),
    [],
  )

  const load = async () => {
    const response = await fetch('/api/booking/settings', { cache: 'no-store' }).catch(() => null)
    if (!response?.ok) {
      setConfigured(false)
      return
    }

    const data = (await response.json()) as SettingsResponse
    setConfigured(Boolean(data.configured))
    setSettings(data.settings || defaultBookingSettings)
    setOverrides(data.overrides || [])
    setWeekCities(Object.fromEntries((data.weeks || []).map((item) => [item.weekStart, item.city || ''])))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!selectedOverride) return
    setOverrideClosed(selectedOverride.closed)
    setOverrideStart(selectedOverride.startTime || '09:00')
    setOverrideEnd(selectedOverride.endTime || '18:00')
    setOverrideNote(selectedOverride.note || '')
  }, [selectedOverride])

  const updateDay = (key: WeekdayKey, patch: Partial<BookingSettings['workingHours'][WeekdayKey]>) => {
    setSettings((current) => ({
      ...current,
      workingHours: {
        ...current.workingHours,
        [key]: {
          ...current.workingHours[key],
          ...patch,
        },
      },
    }))
  }

  const save = async (body: unknown) => {
    setSaving(true)
    setStatus('idle')
    const response = await fetch('/api/booking/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null)
    setSaving(false)

    if (response?.ok) {
      setStatus('saved')
      await load()
      return true
    }

    setStatus('error')
    return false
  }

  const saveSettings = () => save({ settings })

  const saveOverride = () => save({
    override: {
      date: overrideDate,
      closed: overrideClosed,
      startTime: overrideClosed ? null : overrideStart,
      endTime: overrideClosed ? null : overrideEnd,
      note: overrideNote,
    },
  })

  const saveWeekCity = (weekStart: string) => save({
    week: {
      weekStart,
      city: weekCities[weekStart] || '',
    },
  })

  const resetWeekCity = async (weekStart: string) => {
    setSaving(true)
    setStatus('idle')
    const response = await fetch(`/api/booking/settings?weekStart=${encodeURIComponent(weekStart)}`, {
      method: 'DELETE',
    }).catch(() => null)
    setSaving(false)

    if (response?.ok) {
      setWeekCities((current) => ({ ...current, [weekStart]: '' }))
      setStatus('saved')
      await load()
      return
    }

    setStatus('error')
  }

  const resetOverride = async () => {
    setSaving(true)
    setStatus('idle')
    const response = await fetch(`/api/booking/settings?date=${encodeURIComponent(overrideDate)}`, {
      method: 'DELETE',
    }).catch(() => null)
    setSaving(false)

    if (response?.ok) {
      setStatus('saved')
      setOverrideClosed(false)
      setOverrideStart('09:00')
      setOverrideEnd('18:00')
      setOverrideNote('')
      await load()
      return
    }

    setStatus('error')
  }

  return (
    <section className="mt-4 space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-slate-800">{t.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{t.subtitle}</p>
      </div>

      {!configured && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          {t.notReady}
        </div>
      )}

      <div className="grid gap-3 rounded-2xl bg-slate-50/80 p-3">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase text-slate-500">{t.slot}</span>
          <select
            value={settings.slotMinutes}
            onChange={(event) => setSettings((current) => ({ ...current, slotMinutes: Number(event.target.value) }))}
            className="h-11 w-full rounded-2xl border border-sky-100 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300"
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
            <option value={120}>120 min</option>
          </select>
        </label>

        <div className="space-y-2">
          {weekdays.map((key) => {
            const day = settings.workingHours[key]

            return (
              <div key={key} className="grid gap-2 rounded-2xl bg-white p-3 shadow-[0_1px_0_rgba(148,163,184,0.12)] sm:grid-cols-[1.05fr_0.8fr_0.8fr]">
                <label className="flex min-h-10 items-center gap-3 text-sm font-bold text-slate-700">
                  <input
                    checked={day.enabled}
                    onChange={(event) => updateDay(key, { enabled: event.target.checked })}
                    type="checkbox"
                    className="h-5 w-5 rounded border-sky-200 accent-sky-500"
                  />
                  <span>{t.dayNames[key]}</span>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.start}</span>
                  <input
                    value={day.start}
                    onChange={(event) => updateDay(key, { start: event.target.value })}
                    disabled={!day.enabled}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-2][0-9]:[0-5][0-9]"
                    placeholder="09:00"
                    className="h-10 w-full rounded-2xl border border-sky-100 bg-sky-50/35 px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300 disabled:opacity-40"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.end}</span>
                  <input
                    value={day.end}
                    onChange={(event) => updateDay(key, { end: event.target.value })}
                    disabled={!day.enabled}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-2][0-9]:[0-5][0-9]"
                    placeholder="18:00"
                    className="h-10 w-full rounded-2xl border border-sky-100 bg-sky-50/35 px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300 disabled:opacity-40"
                  />
                </label>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={saveSettings}
          disabled={!configured || saving}
          className="min-h-12 rounded-full bg-gradient-to-r from-sky-400 to-sage-400 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? t.saving : t.saveWeek}
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl bg-slate-50/80 p-3">
        <h3 className="text-sm font-black uppercase text-slate-500">{t.cityWeeks}</h3>
        <div className="space-y-2">
          {upcomingWeeks.map((weekStart) => (
            <div key={weekStart} className="grid gap-2 rounded-2xl bg-white p-3 shadow-[0_1px_0_rgba(148,163,184,0.12)] sm:grid-cols-[0.8fr_1.1fr_auto_auto] sm:items-end">
              <div>
                <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.week}</span>
                <div className="flex h-11 items-center rounded-2xl bg-sky-50/35 px-3 text-sm font-black text-slate-700">
                  {weekStart}
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.city}</span>
                <input
                  value={weekCities[weekStart] || ''}
                  onChange={(event) => setWeekCities((current) => ({ ...current, [weekStart]: event.target.value }))}
                  placeholder={t.city}
                  className="h-11 w-full rounded-2xl border border-sky-100 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300"
                />
              </label>
              <button
                type="button"
                onClick={() => saveWeekCity(weekStart)}
                disabled={!configured || saving}
                className="min-h-11 rounded-full bg-gradient-to-r from-sky-400 to-sage-400 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.saveCity}
              </button>
              <button
                type="button"
                onClick={() => resetWeekCity(weekStart)}
                disabled={!configured || saving}
                className="min-h-11 rounded-full border border-sky-100 bg-white px-4 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.resetCity}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-slate-50/80 p-3">
        <h3 className="text-sm font-black uppercase text-slate-500">{t.overrides}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.date}</span>
            <input
              value={overrideDate}
              onChange={(event) => {
                setOverrideDate(event.target.value)
                setStatus('idle')
              }}
              type="date"
              className="h-11 w-full rounded-2xl border border-sky-100 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300"
            />
          </label>
          <label className="flex min-h-11 items-end gap-3 pb-2 text-sm font-bold text-slate-700">
            <input
              checked={overrideClosed}
              onChange={(event) => setOverrideClosed(event.target.checked)}
              type="checkbox"
              className="h-5 w-5 rounded border-sky-200 accent-sky-500"
            />
            <span>{t.closed}</span>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.start}</span>
            <input
              value={overrideStart}
              onChange={(event) => setOverrideStart(event.target.value)}
              disabled={overrideClosed}
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="09:00"
              className="h-11 w-full rounded-2xl border border-sky-100 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300 disabled:opacity-40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.end}</span>
            <input
              value={overrideEnd}
              onChange={(event) => setOverrideEnd(event.target.value)}
              disabled={overrideClosed}
              type="text"
              inputMode="numeric"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="18:00"
              className="h-11 w-full rounded-2xl border border-sky-100 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300 disabled:opacity-40"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">{t.note}</span>
          <input
            value={overrideNote}
            onChange={(event) => setOverrideNote(event.target.value)}
            className="h-11 w-full rounded-2xl border border-sky-100 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-300"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={saveOverride}
            disabled={!configured || saving}
            className="min-h-12 rounded-full bg-gradient-to-r from-sky-400 to-sage-400 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t.saving : t.saveOverride}
          </button>
          <button
            type="button"
            onClick={resetOverride}
            disabled={!configured || saving}
            className="min-h-12 rounded-full border border-sky-100 bg-white px-4 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.resetOverride}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-3">
        <h3 className="mb-2 text-sm font-black uppercase text-slate-500">{t.currentOverrides}</h3>
        <div className="space-y-2">
          {overrides.length ? overrides.slice(0, 12).map((item) => (
            <button
              key={item.date}
              type="button"
              onClick={() => {
                setOverrideDate(item.date)
                setOverrideClosed(item.closed)
                setOverrideStart(item.startTime || '09:00')
                setOverrideEnd(item.endTime || '18:00')
                setOverrideNote(item.note || '')
              }}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-left text-sm font-bold text-slate-600"
            >
              <span>{item.date}</span>
              <span className="text-xs uppercase text-slate-400">
                {item.closed ? t.closed : `${item.startTime || '-'}-${item.endTime || '-'}`}
              </span>
            </button>
          )) : (
            <div className="rounded-2xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-400">
              {t.noOverrides}
            </div>
          )}
        </div>
      </div>

      {status !== 'idle' && (
        <div className={`rounded-2xl px-4 py-3 text-center text-sm font-black ${status === 'saved' ? 'bg-sage-50 text-sage-500' : 'bg-rose-50 text-rose-600'}`}>
          {status === 'saved' ? t.saved : t.error}
        </div>
      )}
    </section>
  )
}
