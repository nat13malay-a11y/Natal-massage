'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { formatDateHuman, type BookingDay } from '@/lib/booking'
import { useI18n, type Lang } from '@/i18n'

type AvailabilityResponse = {
  ok: boolean
  configured?: boolean
  days?: BookingDay[]
}

const text: Record<Lang, {
  title: string
  intro: string
  date: string
  time: string
  city: string
  full: string
  closed: string
  free: string
  name: string
  phone: string
  comment: string
  optional: string
  submit: string
  sending: string
  success: string
  error: string
  unavailable: string
}> = {
  uk: {
    title: 'Записатися на прийом',
    intro: 'Оберіть вільний день і час. Після відправки я отримаю заявку в Telegram.',
    date: 'День',
    time: 'Час',
    city: 'Місто',
    full: 'зайнято',
    closed: 'вихідний',
    free: 'вільно',
    name: 'Ім’я',
    phone: 'Номер телефону',
    comment: 'Коментар',
    optional: 'Опціонально',
    submit: 'Записатися',
    sending: 'Записую...',
    success: 'Запис відправлено. Я зв’яжуся з вами для підтвердження.',
    error: 'Не вдалося записати. Перевірте дані або оберіть інший час.',
    unavailable: 'Онлайн-запис ще налаштовується. Поки можна залишити заявку нижче.',
  },
  ru: {
    title: 'Записаться на прием',
    intro: 'Выберите свободный день и время. После отправки я получу заявку в Telegram.',
    date: 'День',
    time: 'Время',
    city: 'Город',
    full: 'занято',
    closed: 'выходной',
    free: 'свободно',
    name: 'Имя',
    phone: 'Номер телефона',
    comment: 'Комментарий',
    optional: 'Опционально',
    submit: 'Записаться',
    sending: 'Записываю...',
    success: 'Запись отправлена. Я свяжусь с вами для подтверждения.',
    error: 'Не удалось записать. Проверьте данные или выберите другое время.',
    unavailable: 'Онлайн-запись еще настраивается. Пока можно оставить заявку ниже.',
  },
  en: {
    title: 'Book an appointment',
    intro: 'Choose an available day and time. After sending, I will receive the request in Telegram.',
    date: 'Day',
    time: 'Time',
    city: 'City',
    full: 'full',
    closed: 'closed',
    free: 'free',
    name: 'Name',
    phone: 'Phone number',
    comment: 'Comment',
    optional: 'Optional',
    submit: 'Book',
    sending: 'Booking...',
    success: 'Your request has been sent. I will contact you to confirm.',
    error: 'Could not book. Check the details or choose another time.',
    unavailable: 'Online booking is being configured. You can leave a request below for now.',
  },
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  let localPart = digits

  if (localPart.startsWith('380')) {
    localPart = localPart.substring(3)
  } else if (localPart.startsWith('38')) {
    localPart = localPart.substring(2)
  } else if (localPart.startsWith('3')) {
    localPart = localPart.substring(1)
  }

  return `+380${localPart.substring(0, 9)}`
}

function dayNumber(date: string) {
  return date.split('-')[2]
}

function shortDate(date: string) {
  if (!date) return ''
  const [, month, day] = date.split('-')
  return `${day}.${month}`
}

export default function BookingWidget() {
  const { lang } = useI18n()
  const t = text[lang]
  const [days, setDays] = useState<BookingDay[]>([])
  const [configured, setConfigured] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+380')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) || null,
    [days, selectedDate],
  )
  const weekRows = useMemo(() => {
    const rows: BookingDay[][] = []
    days.slice(0, 28).forEach((day) => {
      const current = rows[rows.length - 1]
      if (!current || current[0]?.weekStart !== day.weekStart) {
        rows.push([day])
        return
      }
      current.push(day)
    })
    return rows
  }, [days])
  const availableSlots = selectedDay?.slots.filter((slot) => slot.available) || []

  const loadAvailability = async () => {
    setLoading(true)
    const response = await fetch('/api/booking/availability?days=35', { cache: 'no-store' }).catch(() => null)
    setLoading(false)

    if (!response?.ok) {
      setConfigured(false)
      return
    }

    const data = (await response.json()) as AvailabilityResponse
    const nextDays = data.days || []
    setConfigured(Boolean(data.configured))
    setDays(nextDays)

    const firstAvailable = nextDays.find((day) => day.available)
    setSelectedDate((current) => current || firstAvailable?.date || nextDays[0]?.date || '')
    setSelectedTime('')
  }

  useEffect(() => {
    loadAvailability()
  }, [])

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return

    if (!selectedDate || !selectedTime || phone.replace(/\D/g, '').length !== 12) {
      setStatus('error')
      return
    }

    setSending(true)
    setStatus('idle')

    const response = await fetch('/api/booking/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        time: selectedTime,
        name,
        phone,
        comment,
        submittedAt: new Date().toISOString(),
        device: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        },
      }),
    }).catch(() => null)

    setSending(false)

    if (response?.ok) {
      setName('')
      setPhone('+380')
      setComment('')
      setSelectedTime('')
      setStatus('success')
      loadAvailability()
      return
    }

    setStatus('error')
  }

  return (
    <section className="contact-card mx-auto grid w-full max-w-5xl gap-4 rounded-[1.35rem] border border-white/75 bg-white/86 p-4 shadow-[0_22px_64px_rgba(15,23,42,0.09)] backdrop-blur-xl sm:p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-5">
      <div className="space-y-4 rounded-[1.1rem] bg-gradient-to-br from-sky-50/70 via-white/70 to-sage-50/60 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="heading-section text-2xl leading-tight text-slate-800 sm:text-3xl">{t.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{t.intro}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{t.date}</div>
          <div className="space-y-2">
            {loading && Array.from({ length: 2 }).map((_, rowIndex) => (
              <div key={rowIndex} className="rounded-[1rem] bg-white/45 p-2">
                <div className="mb-2 h-3 w-24 animate-pulse rounded-full bg-white/80" />
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 7 }).map((__, index) => (
                    <div key={index} className="aspect-square animate-pulse rounded-xl bg-white/80" />
                  ))}
                </div>
              </div>
            ))}
            {!loading && weekRows.map((week, weekIndex) => {
              const city = week.find((day) => day.city)?.city

              return (
                <div key={week[0]?.weekStart || weekIndex} className={`rounded-[1rem] border border-white/65 bg-white/42 p-2 ${weekIndex >= 2 ? 'hidden' : ''}`}>
                  <div className="mb-2 flex min-h-4 items-center justify-between gap-3 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {shortDate(week[0]?.date || '')} - {shortDate(week[week.length - 1]?.date || '')}
                    </span>
                    {city && (
                      <span className="max-w-[48%] truncate rounded-full bg-sky-100/80 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-700">
                        {t.city}: {city}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {week.map((day) => {
                      const active = day.date === selectedDate
                      const disabled = !day.available
                      const freeSlots = day.slots.filter((slot) => slot.available).length

                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day.date)
                            setSelectedTime('')
                            setStatus('idle')
                          }}
                          disabled={disabled}
                          className={`aspect-square cursor-pointer rounded-xl border px-1 py-1.5 text-center backdrop-blur-md transition-all duration-300 disabled:cursor-not-allowed sm:rounded-2xl sm:px-1.5 sm:py-2 ${
                            active
                              ? 'scale-[1.04] border-sky-300 bg-gradient-to-br from-white/96 to-sky-50/86 text-slate-800 shadow-[0_16px_34px_rgba(61,148,192,0.18),inset_0_1px_0_rgba(255,255,255,0.85)]'
                              : disabled
                                ? 'border-white/60 bg-white/45 text-slate-300'
                                : 'border-white/85 bg-gradient-to-br from-white/86 to-white/54 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_10px_24px_rgba(61,148,192,0.12)]'
                          }`}
                        >
                          <span className="block text-base font-black leading-none sm:text-xl">{dayNumber(day.date)}</span>
                          <span className="mt-1 block text-[7.5px] font-bold uppercase leading-tight text-slate-400 sm:text-[9px]">
                            {day.closed ? t.closed : day.available ? `${freeSlots} ${t.free}` : t.full}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>{t.time}</span>
            {selectedDay && <span className="normal-case tracking-normal text-slate-400">{formatDateHuman(selectedDay.date, lang === 'en' ? 'en-GB' : lang === 'ru' ? 'ru-RU' : 'uk-UA')}</span>}
          </div>
          <div className="rounded-[1.1rem] border border-white/70 bg-white/42 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {availableSlots.length ? (
              <div>
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 to-sky-50/58 p-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-sky-100 bg-white text-center shadow-[0_8px_18px_rgba(61,148,192,0.12)]">
                    <span className="block text-xl font-black leading-none text-slate-800">{dayNumber(selectedDay?.date || '')}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-slate-700">
                      {selectedTime || t.time}
                    </div>
                    <div className="mt-0.5 truncate text-xs font-bold text-slate-400">
                      {selectedDay ? formatDateHuman(selectedDay.date, lang === 'en' ? 'en-GB' : lang === 'ru' ? 'ru-RU' : 'uk-UA') : ''}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => {
                        setSelectedTime(slot.time)
                        setStatus('idle')
                      }}
                      className={`min-h-10 cursor-pointer rounded-2xl border px-3 text-sm font-black backdrop-blur-md transition-all duration-300 ${
                        selectedTime === slot.time
                          ? 'scale-[1.03] border-sky-300 bg-gradient-to-br from-sky-200/90 to-sage-200/80 text-slate-800 shadow-[0_12px_30px_rgba(61,148,192,0.20)]'
                          : 'border-white/75 bg-gradient-to-br from-white/88 to-white/50 text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.75)] hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white'
                      }`}
                      style={{ transitionDelay: `${index * 25}ms` }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-center text-sm font-semibold text-slate-400">
                {loading ? '...' : t.full}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={submitBooking} className="grid content-start gap-3 rounded-[1.1rem] border border-sky-100/80 bg-white/90 p-4 shadow-sm sm:p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">{t.name}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className="min-h-12 w-full rounded-2xl border border-sky-100 bg-white/90 px-4 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">{t.phone}</span>
          <input
            value={phone}
            onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
            onFocus={() => setPhone((current) => current || '+380')}
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            pattern="\+380\d{9}"
            placeholder="+380XXXXXXXXX"
            className="min-h-12 w-full rounded-2xl border border-sky-100 bg-white/90 px-4 text-base text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
          />
        </label>
        <label className="block">
          <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
            {t.comment}
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.optional}</span>
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            className="w-full resize-y rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 text-base leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300"
          />
        </label>
        <button
          type="submit"
          disabled={sending || !selectedTime}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? t.sending : t.submit}
        </button>
        {status !== 'idle' && (
          <p className={`rounded-2xl px-4 py-3 text-center text-sm font-semibold ${status === 'success' ? 'bg-sage-50 text-sage-500' : 'bg-rose-50 text-rose-600'}`}>
            {status === 'success' ? t.success : t.error}
          </p>
        )}
      </form>
    </section>
  )
}
