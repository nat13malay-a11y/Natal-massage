'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { type BookingDay } from '@/lib/booking'
import { useI18n, type Lang } from '@/i18n'

type AvailabilityResponse = {
  ok: boolean
  configured?: boolean
  days?: BookingDay[]
}

type BookingResponse = {
  ok: boolean
  paymentRequired?: boolean
  invoiceId?: string
  pageUrl?: string
  amount?: number
  error?: string
}

type PaymentState = {
  invoiceId: string
  pageUrl: string
  amount: number
  confirmed: boolean
  failed: boolean
  failureReason?: string
}

type PaymentStatusResponse = {
  ok?: boolean
  bookingStatus?: string
  paymentStatus?: string
  failureReason?: string
  amount?: number
  invoiceId?: string
  pageUrl?: string
  reference?: string
}

const text: Record<Lang, {
  title: string
  intro: string
  kicker: string
  period: string
  date: string
  time: string
  city: string
  availableDates: string
  selected: string
  notSelected: string
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
  paymentTitle: string
  paymentIntro: string
  paymentQr: string
  paymentMobile: string
  paymentOpen: string
  paymentWaiting: string
  paymentConfirmed: string
  paymentFailed: string
  paymentClose: string
}> = {
  uk: {
    title: 'Записатися на прийом',
    intro: 'Оберіть вільний день і час. Після відправки я отримаю заявку в Telegram.',
    kicker: 'Онлайн-запис',
    period: '2 тижні',
    date: 'День',
    time: 'Час',
    city: 'Місто',
    availableDates: 'Доступні дати',
    selected: 'Ви обрали',
    notSelected: 'Дата і час не обрані',
    full: 'зайнято',
    closed: 'вихідний',
    free: 'вільно',
    name: 'Ім’я',
    phone: 'Номер телефону',
    comment: 'Коментар',
    optional: 'Опціонально',
    submit: 'Записатися',
    sending: 'Записую...',
    success: 'Задаток отримано. Запис підтверджено, я отримала повідомлення в Telegram.',
    error: 'Не вдалося записати. Перевірте дані або оберіть інший час.',
    unavailable: 'Онлайн-запис ще налаштовується. Поки можна залишити заявку нижче.',
    paymentTitle: 'Внесіть задаток',
    paymentIntro: 'Щоб підтвердити запис, внесіть фіксований задаток. Після зарахування оплати запис підтвердиться автоматично.',
    paymentQr: 'Відскануйте QR-код камерою або застосунком monobank',
    paymentMobile: 'На телефоні натисніть кнопку оплати',
    paymentOpen: 'Оплатити',
    paymentWaiting: 'Очікую підтвердження оплати...',
    paymentConfirmed: 'Оплату отримано. Запис підтверджено.',
    paymentFailed: 'Оплату не завершено. Спробуйте створити запис ще раз.',
    paymentClose: 'Закрити',
  },
  ru: {
    title: 'Записаться на прием',
    intro: 'Выберите свободный день и время. После отправки я получу заявку в Telegram.',
    kicker: 'Онлайн-запись',
    period: '2 недели',
    date: 'День',
    time: 'Время',
    city: 'Город',
    availableDates: 'Доступные даты',
    selected: 'Вы выбрали',
    notSelected: 'Дата и время не выбраны',
    full: 'занято',
    closed: 'выходной',
    free: 'свободно',
    name: 'Имя',
    phone: 'Номер телефона',
    comment: 'Комментарий',
    optional: 'Опционально',
    submit: 'Записаться',
    sending: 'Записываю...',
    success: 'Задаток получен. Запись подтверждена, я получила уведомление в Telegram.',
    error: 'Не удалось записать. Проверьте данные или выберите другое время.',
    unavailable: 'Онлайн-запись еще настраивается. Пока можно оставить заявку ниже.',
    paymentTitle: 'Внесите задаток',
    paymentIntro: 'Чтобы подтвердить запись, внесите фиксированный задаток. После зачисления оплаты запись подтвердится автоматически.',
    paymentQr: 'Отсканируйте QR-код камерой или приложением monobank',
    paymentMobile: 'На телефоне нажмите кнопку оплаты',
    paymentOpen: 'Оплатить',
    paymentWaiting: 'Ожидаю подтверждение оплаты...',
    paymentConfirmed: 'Оплата получена. Запись подтверждена.',
    paymentFailed: 'Оплата не завершена. Попробуйте создать запись еще раз.',
    paymentClose: 'Закрыть',
  },
  en: {
    title: 'Book an appointment',
    intro: 'Choose an available day and time. After sending, I will receive the request in Telegram.',
    kicker: 'Online booking',
    period: '2 weeks',
    date: 'Day',
    time: 'Time',
    city: 'City',
    availableDates: 'Available dates',
    selected: 'Selected',
    notSelected: 'Date and time not selected',
    full: 'full',
    closed: 'closed',
    free: 'free',
    name: 'Name',
    phone: 'Phone number',
    comment: 'Comment',
    optional: 'Optional',
    submit: 'Book',
    sending: 'Booking...',
    success: 'Deposit received. Your appointment is confirmed and I received a Telegram notification.',
    error: 'Could not book. Check the details or choose another time.',
    unavailable: 'Online booking is being configured. You can leave a request below for now.',
    paymentTitle: 'Pay the deposit',
    paymentIntro: 'To confirm the appointment, pay the fixed deposit. After the payment is received, the appointment is confirmed automatically.',
    paymentQr: 'Scan the QR code with your camera or monobank app',
    paymentMobile: 'On phone, tap the payment button',
    paymentOpen: 'Pay',
    paymentWaiting: 'Waiting for payment confirmation...',
    paymentConfirmed: 'Payment received. Appointment confirmed.',
    paymentFailed: 'Payment was not completed. Please create the appointment again.',
    paymentClose: 'Close',
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

function weekdayShort(day: BookingDay, lang: Lang) {
  const labels: Record<Lang, string[]> = {
    uk: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  }
  return labels[lang][day.weekday]
}

function weekdayLabels(lang: Lang) {
  return {
    uk: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  }[lang]
}

function monthLabel(date: string, lang: Lang) {
  if (!date) return ''
  const locale = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US'
  const value = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(value)
}

function calendarRangeLabel(days: BookingDay[], lang: Lang) {
  const first = days[0]?.date
  const last = days[days.length - 1]?.date
  if (!first || !last) return ''

  const firstMonth = monthLabel(first, lang)
  const lastMonth = monthLabel(last, lang)
  if (firstMonth === lastMonth) return firstMonth

  return `${firstMonth} - ${lastMonth}`
}

function compactDayStatus(day: BookingDay, lang: Lang) {
  if (day.closed) return lang === 'en' ? 'off' : lang === 'ru' ? 'вых' : 'вих'
  if (!day.available) return lang === 'en' ? 'busy' : lang === 'ru' ? 'зан' : 'зайн'
  return ''
}

function splitTime(time: string) {
  const [hours, minutes] = time.split(':')
  return { hours, minutes }
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
  const [openDate, setOpenDate] = useState('')
  const [payment, setPayment] = useState<PaymentState | null>(null)

  const weekRows = useMemo(() => {
    const rows: BookingDay[][] = []
    days.forEach((day) => {
      const current = rows[rows.length - 1]
      if (!current || current[0]?.weekStart !== day.weekStart) {
        rows.push([day])
        return
      }
      current.push(day)
    })
    return rows.slice(0, 2)
  }, [days])
  const calendarDays = useMemo(() => weekRows.flat(), [weekRows])
  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  )
  const selectedLabel = selectedDay && selectedTime
    ? `${weekdayShort(selectedDay, lang)}, ${shortDate(selectedDay.date)} · ${selectedTime}`
    : t.notSelected

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
    setOpenDate('')
  }

  useEffect(() => {
    loadAvailability()
  }, [])

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get('bookingPayment')
    if (!reference) return

    const cleanUrl = `${window.location.pathname}${window.location.hash}`
    window.history.replaceState({}, '', cleanUrl)

    fetch(`/api/booking/payment/status?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data: PaymentStatusResponse | null) => {
        if (!data?.ok || !data.invoiceId) return

        const failed = ['failure', 'expired', 'cancelled', 'reversed'].includes(data.paymentStatus || '') || data.bookingStatus === 'cancelled'
        const confirmed = data.bookingStatus === 'booked'

        setPayment({
          invoiceId: data.invoiceId,
          pageUrl: data.pageUrl || '',
          amount: data.amount || 30000,
          confirmed,
          failed,
          failureReason: data.failureReason,
        })

        if (confirmed) {
          setStatus('success')
          loadAvailability()
        } else if (failed) {
          setStatus('error')
          loadAvailability()
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!payment?.invoiceId || payment.confirmed || payment.failed) return

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/booking/payment/status?invoiceId=${encodeURIComponent(payment.invoiceId)}`, { cache: 'no-store' }).catch(() => null)
      if (!response?.ok) return

      const data = await response.json().catch(() => null) as PaymentStatusResponse | null
      if (!data) return

      if (data.bookingStatus === 'booked') {
        setPayment((current) => current?.invoiceId === payment.invoiceId ? { ...current, confirmed: true } : current)
        setName('')
        setPhone('+380')
        setComment('')
        setSelectedTime('')
        setStatus('success')
        loadAvailability()
        return
      }

      if (['failure', 'expired', 'cancelled', 'reversed'].includes(data.paymentStatus || '') || data.bookingStatus === 'cancelled') {
        setPayment((current) => current?.invoiceId === payment.invoiceId ? { ...current, failed: true, failureReason: data.failureReason } : current)
        setStatus('error')
        loadAvailability()
      }
    }, 3500)

    return () => window.clearInterval(interval)
  }, [payment?.invoiceId, payment?.confirmed, payment?.failed])

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

    const data = response ? await response.json().catch(() => null) as BookingResponse | null : null

    if (response?.ok && data?.paymentRequired && data.invoiceId && data.pageUrl && data.amount) {
      setPayment({
        invoiceId: data.invoiceId,
        pageUrl: data.pageUrl,
        amount: data.amount,
        confirmed: false,
        failed: false,
      })
      setStatus('idle')
      loadAvailability()
      return
    }

    setStatus('error')
  }

  return (
    <section className="contact-card mx-auto grid w-full max-w-6xl gap-4 rounded-[1.6rem] border border-white/75 bg-white/86 p-4 shadow-[0_22px_64px_rgba(15,23,42,0.09)] backdrop-blur-xl sm:p-5 lg:grid-cols-[minmax(0,1.18fr)_22rem] lg:gap-5">
      {payment && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/34 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.5rem] border border-white/80 bg-white/94 p-5 text-center shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">{Math.round(payment.amount / 100)} грн</p>
            <h3 className="heading-section mt-2 text-2xl leading-tight text-slate-800">{t.paymentTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.paymentIntro}</p>

            {!payment.confirmed && !payment.failed && (
              <>
                <div className="mt-5 hidden rounded-[1.25rem] border border-sky-100 bg-white p-4 shadow-inner sm:block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payment.pageUrl)}`}
                    alt="Monobank payment QR"
                    className="mx-auto h-52 w-52"
                  />
                  <p className="mt-3 text-xs font-semibold text-slate-500">{t.paymentQr}</p>
                </div>
                <p className="mt-5 text-sm font-semibold text-slate-600 sm:hidden">{t.paymentMobile}</p>
                <a
                  href={payment.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-primary mt-4 inline-flex w-full justify-center ${payment.pageUrl ? '' : 'pointer-events-none opacity-60'}`}
                >
                  {t.paymentOpen}
                </a>
                <p className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">{t.paymentWaiting}</p>
              </>
            )}

            {payment.confirmed && (
              <p className="mt-5 rounded-2xl bg-sage-50 px-4 py-3 text-sm font-semibold text-sage-600">{t.paymentConfirmed}</p>
            )}

            {payment.failed && (
              <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                {payment.failureReason || t.paymentFailed}
              </p>
            )}

            <button
              type="button"
              onClick={() => setPayment(null)}
              className="mt-4 min-h-11 w-full rounded-2xl border border-sky-100 bg-white/86 px-4 text-sm font-black text-slate-600 transition-colors hover:bg-sky-50"
            >
              {t.paymentClose}
            </button>
          </div>
        </div>
      )}

      <div className="relative overflow-visible rounded-[1.5rem] border border-white/70 bg-[radial-gradient(circle_at_18%_12%,rgba(125,211,252,0.26),transparent_34%),radial-gradient(circle_at_86%_78%,rgba(141,203,188,0.22),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.88),rgba(236,254,255,0.62))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">{t.kicker}</p>
            <h3 className="heading-section text-2xl leading-tight text-slate-800 sm:text-3xl">{t.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{t.intro}</p>
          </div>
          <span className="w-max rounded-full border border-white/80 bg-white/58 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-600 shadow-sm">
            {t.period}
          </span>
        </div>

        <div className="relative overflow-visible rounded-[1.65rem] border border-white/72 bg-slate-900/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.58),0_18px_54px_rgba(61,148,192,0.12)] sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="grid h-9 w-9 place-items-center rounded-[0.9rem] border border-white/70 bg-white/50 text-2xl leading-none text-slate-400 shadow-sm"
            >
              ‹
            </button>
            <div className="text-center">
              <strong className="block text-base font-black capitalize leading-tight text-slate-800">
                {calendarRangeLabel(calendarDays, lang)}
              </strong>
              <span className="mt-1 block text-xs font-semibold text-slate-500">{t.availableDates}</span>
            </div>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              className="grid h-9 w-9 place-items-center rounded-[0.9rem] border border-white/70 bg-white/50 text-2xl leading-none text-slate-400 shadow-sm"
            >
              ›
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekdayLabels(lang).map((label) => (
              <span key={label} className="text-center text-[10px] font-bold uppercase text-slate-400 sm:text-xs">
                {label}
              </span>
            ))}
          </div>

          <div className="space-y-8 sm:space-y-10">
            {loading && Array.from({ length: 2 }).map((_, rowIndex) => (
              <div key={rowIndex} className="rounded-[1.15rem] border border-white/58 bg-white/36 p-2">
                <div className="mb-2 h-3 w-24 animate-pulse rounded-full bg-white/80" />
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {Array.from({ length: 7 }).map((__, index) => (
                    <div key={index} className="min-h-[48px] animate-pulse rounded-[0.9rem] bg-white/80 sm:min-h-[58px] sm:rounded-[1.1rem]" />
                  ))}
                </div>
              </div>
            ))}

            {!loading && weekRows.map((week, weekIndex) => {
              const city = week.find((day) => day.city)?.city
              const weekOpen = week.some((day) => day.date === openDate)

              return (
                <div
                  key={week[0]?.weekStart || weekIndex}
                  className={`rounded-[1.15rem] border border-white/58 bg-white/36 p-2 transition-[background-color,border-color] duration-300 ${weekOpen ? 'border-sky-100/90 bg-white/54' : ''}`}
                >
                  <div className="mb-2 flex min-h-5 items-center justify-between gap-3 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {shortDate(week[0]?.date || '')} - {shortDate(week[week.length - 1]?.date || '')}
                    </span>
                    {city && (
                      <span className="max-w-[54%] truncate rounded-full border border-sky-100/80 bg-sky-50/86 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-700">
                        {t.city}: {city}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {week.map((day) => {
                      const selected = day.date === selectedDate
                      const open = day.date === openDate
                      const disabled = !day.available
                      const daySlots = day.slots.filter((slot) => slot.available)
                      const selectedTimeParts = selected && selectedTime ? splitTime(selectedTime) : null

                      return (
                        <div key={day.date} className={`relative aspect-square min-h-0 sm:min-h-[58px] ${open ? 'z-[70]' : selected ? 'z-40' : 'z-0'}`}>
                          <button
                            type="button"
                            onClick={() => {
                              if (disabled) return
                              const sameDate = selectedDate === day.date
                              setSelectedDate(day.date)
                              if (!sameDate) setSelectedTime('')
                              setOpenDate((current) => current === day.date ? '' : day.date)
                              setStatus('idle')
                            }}
                            disabled={disabled}
                            aria-expanded={open}
                            className={`relative z-20 flex h-full min-h-0 w-full cursor-pointer flex-col items-center justify-center rounded-[0.9rem] border px-0.5 py-0.5 text-center backdrop-blur-[18px] transition-all duration-300 disabled:cursor-not-allowed sm:min-h-[58px] sm:rounded-[1.1rem] sm:px-1 sm:py-1 ${
                              selected
                                ? 'scale-[1.04] border-sky-300 bg-gradient-to-br from-sky-100/95 via-white/88 to-sage-100/88 text-slate-800 shadow-[0_0_34px_rgba(61,148,192,0.24),0_16px_46px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.86)]'
                                : disabled
                                  ? 'border-white/62 bg-white/42 text-slate-300 opacity-70'
                                  : 'border-white/82 bg-gradient-to-br from-white/82 to-white/48 text-slate-700 shadow-[0_10px_28px_rgba(15,23,42,0.07),inset_0_1px_0_rgba(255,255,255,0.68)] hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-[0_18px_44px_rgba(61,148,192,0.16)]'
                            }`}
                          >
                            <span className="block text-[15px] font-black leading-none sm:text-xl">
                              {selectedTimeParts ? (
                                <>
                                  <span className="flex flex-col items-center leading-[0.86] sm:hidden">
                                    <span>{selectedTimeParts.hours}</span>
                                    <span>{selectedTimeParts.minutes}</span>
                                  </span>
                                  <span className="hidden sm:inline">{selectedTime}</span>
                                </>
                              ) : dayNumber(day.date)}
                            </span>
                            <span className="mt-0.5 block max-w-full truncate text-[7px] font-bold uppercase leading-tight text-slate-400 sm:mt-1 sm:text-[10px]">
                              {selected && selectedTime ? `${weekdayShort(day, lang)}, ${dayNumber(day.date)}` : day.available ? weekdayShort(day, lang) : compactDayStatus(day, lang)}
                            </span>
                          </button>

                          {daySlots.map((slot, index) => {
                            const total = daySlots.length
                            const angle = -90 + (360 / total) * index
                            const visible = open
                            const radius = 'clamp(3.35rem, 14vw, 5.5rem)'
                            const transform = visible
                              ? `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}) rotate(${-angle}deg) scale(1)`
                              : `translate(-50%, -50%) rotate(${angle}deg) translateX(0) rotate(${-angle}deg) scale(0.4)`

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(day.date)
                                  setSelectedTime(slot.time)
                                  setOpenDate('')
                                  setStatus('idle')
                                }}
                                className={`absolute left-1/2 top-1/2 z-[80] h-8 w-[3.4rem] rounded-xl border text-[10px] font-black backdrop-blur-[16px] transition-[opacity,transform,background-color,border-color,box-shadow] duration-500 sm:h-[38px] sm:w-16 sm:rounded-[0.9rem] sm:text-xs ${
                                  selectedDate === day.date && selectedTime === slot.time
                                    ? 'border-sky-300 bg-gradient-to-br from-sky-200/95 to-sage-200/90 text-slate-800 shadow-[0_18px_48px_rgba(61,148,192,0.32),0_0_30px_rgba(99,176,216,0.20),inset_0_1px_0_rgba(255,255,255,0.72)]'
                                    : 'border-white/92 bg-gradient-to-br from-white/98 to-white/74 text-slate-800 shadow-[0_20px_52px_rgba(15,23,42,0.24),0_0_22px_rgba(255,255,255,0.82),inset_0_1px_0_rgba(255,255,255,0.82)] hover:border-sky-300 hover:bg-white hover:shadow-[0_24px_62px_rgba(61,148,192,0.28),0_0_30px_rgba(99,176,216,0.18)]'
                                }`}
                                style={{
                                  opacity: visible ? 1 : 0,
                                  pointerEvents: visible ? 'auto' : 'none',
                                  transform,
                                  transitionDelay: visible ? `${index * 45}ms` : '0ms',
                                }}
                              >
                                {slot.time}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex justify-center rounded-[1.25rem] border border-white/68 bg-white/48 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">{t.selected}</span>
            <strong className="mt-1 block text-sm font-black text-slate-800 sm:text-base">{selectedLabel}</strong>
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
