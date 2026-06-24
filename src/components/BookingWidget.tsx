'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { daysBetweenInclusive, endOfCalendarMonthGrid, startOfCalendarMonthGrid, startOfMonth, todayKyiv, type BookingDay } from '@/lib/booking'
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
  availableDates: string
  selected: string
  notSelected: string
  chooseDate: string
  chooseTimeHint: string
  back: string
  choose: string
  full: string
  closed: string
  city: string
  name: string
  phone: string
  comment: string
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
    intro: 'Оберіть вільний день і час. Після вибору відкриється форма запису.',
    kicker: 'Онлайн-запис',
    availableDates: 'Доступні дати',
    selected: 'Ви обрали',
    notSelected: 'Дата не обрана',
    chooseDate: 'Оберіть дату запису',
    chooseTimeHint: 'Оберіть вільний час нижче',
    back: 'Змінити дату',
    choose: 'Обрати',
    full: 'Зайнято',
    closed: 'Вихідний',
    city: 'Місто',
    name: 'Ім’я',
    phone: 'Номер телефону',
    comment: 'Коментар',
    submit: 'Записатися',
    sending: 'Записую...',
    success: 'Задаток отримано. Запис підтверджено, я отримала повідомлення в Telegram.',
    error: 'Не вдалося записати. Перевірте дані або оберіть інший час.',
    unavailable: 'Онлайн-запис ще налаштовується.',
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
    intro: 'Выберите свободный день и время. После выбора откроется форма записи.',
    kicker: 'Онлайн-запись',
    availableDates: 'Доступные даты',
    selected: 'Вы выбрали',
    notSelected: 'Дата не выбрана',
    chooseDate: 'Выберите дату записи',
    chooseTimeHint: 'Выберите свободное время ниже',
    back: 'Изменить дату',
    choose: 'Выбрать',
    full: 'Занято',
    closed: 'Выходной',
    city: 'Город',
    name: 'Имя',
    phone: 'Номер телефона',
    comment: 'Комментарий',
    submit: 'Записаться',
    sending: 'Записываю...',
    success: 'Задаток получен. Запись подтверждена, я получила уведомление в Telegram.',
    error: 'Не удалось записать. Проверьте данные или выберите другое время.',
    unavailable: 'Онлайн-запись еще настраивается.',
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
    intro: 'Choose an available day and time. After choosing, the booking form opens.',
    kicker: 'Online booking',
    availableDates: 'Available dates',
    selected: 'Selected',
    notSelected: 'Date not selected',
    chooseDate: 'Choose appointment date',
    chooseTimeHint: 'Choose an available time below',
    back: 'Change date',
    choose: 'Choose',
    full: 'Booked',
    closed: 'Closed',
    city: 'City',
    name: 'Name',
    phone: 'Phone number',
    comment: 'Comment',
    submit: 'Book',
    sending: 'Booking...',
    success: 'Deposit received. Your appointment is confirmed and I received a Telegram notification.',
    error: 'Could not book. Check the details or choose another time.',
    unavailable: 'Online booking is being configured.',
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

function shortDate(date: string) {
  if (!date) return ''
  const [, month, day] = date.split('-')
  return `${day}.${month}`
}

function dayNumber(date: string) {
  return date.split('-')[2]?.replace(/^0/, '') || ''
}

function dateMonth(date: string) {
  return date.slice(0, 7)
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

function monthTitle(date: string, lang: Lang) {
  const locale = lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US'
  const value = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(value)
}

export default function BookingWidget() {
  const { lang } = useI18n()
  const t = text[lang]
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(todayKyiv()))
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
  const [errorMessage, setErrorMessage] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [payment, setPayment] = useState<PaymentState | null>(null)
  const [mounted, setMounted] = useState(false)
  const bookingRef = useRef<HTMLElement | null>(null)
  const scrollFlipToken = useRef(0)

  const monthStart = useMemo(() => startOfCalendarMonthGrid(monthAnchor), [monthAnchor])
  const monthEnd = useMemo(() => endOfCalendarMonthGrid(monthAnchor), [monthAnchor])
  const monthDays = useMemo(() => daysBetweenInclusive(monthStart, monthEnd), [monthStart, monthEnd])

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
    return rows
  }, [days])

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  )
  const selectedCity = selectedDay?.city || ''
  const selectedSummary = selectedDay
    ? `${weekdayShort(selectedDay, lang)}, ${shortDate(selectedDay.date)}${selectedTime ? ` · ${selectedTime}` : ''}${selectedCity ? ` · ${selectedCity}` : ''}`
    : t.notSelected
  const selectedSlots = selectedDay?.slots || []

  const loadAvailability = async () => {
    setLoading(true)
    const response = await fetch(`/api/booking/availability?from=${encodeURIComponent(monthStart)}&days=${monthDays}`, { cache: 'no-store' }).catch(() => null)
    setLoading(false)

    if (!response?.ok) {
      setConfigured(false)
      return
    }

    const data = (await response.json()) as AvailabilityResponse
    const nextDays = data.days || []
    setConfigured(Boolean(data.configured))
    setDays(nextDays)

    if (selectedDate && !nextDays.some((day) => day.date === selectedDate)) {
      setSelectedDate('')
      setSelectedTime('')
      setFlipped(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const currentMonth = startOfMonth(todayKyiv())
      setMonthAnchor((current) => current < currentMonth ? currentMonth : current)
    }, 15 * 60 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    loadAvailability()
  }, [monthStart, monthDays])

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
          setErrorMessage('')
          loadAvailability()
        } else if (failed) {
          setStatus('error')
          setErrorMessage(data.failureReason || t.paymentFailed)
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
        setFlipped(false)
        setStatus('success')
        setErrorMessage('')
        loadAvailability()
        return
      }

      if (['failure', 'expired', 'cancelled', 'reversed'].includes(data.paymentStatus || '') || data.bookingStatus === 'cancelled') {
        setPayment((current) => current?.invoiceId === payment.invoiceId ? { ...current, failed: true, failureReason: data.failureReason } : current)
        setStatus('error')
        setErrorMessage(data.failureReason || t.paymentFailed)
        loadAvailability()
      }
    }, 3500)

    return () => window.clearInterval(interval)
  }, [payment?.invoiceId, payment?.confirmed, payment?.failed])

  const scrollToBookingStart = () => new Promise<void>((resolve) => {
    const element = bookingRef.current
    if (!element) {
      resolve()
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = Math.max(0, window.scrollY + element.getBoundingClientRect().top - 88)

    if (reducedMotion) {
      window.scrollTo(0, target)
      resolve()
      return
    }

    let settled = false
    const startedAt = performance.now()
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    const checkPosition = () => {
      if (settled) return
      const closeEnough = Math.abs(window.scrollY - target) < 8
      const timedOut = performance.now() - startedAt > 950

      if (closeEnough || timedOut) {
        finish()
        return
      }

      window.requestAnimationFrame(checkPosition)
    }

    window.scrollTo({ top: target, behavior: 'smooth' })
    window.requestAnimationFrame(checkPosition)
  })

  const chooseDate = async (day: BookingDay) => {
    if (!day.available) return

    const token = scrollFlipToken.current + 1
    scrollFlipToken.current = token

    setSelectedDate(day.date)
    setSelectedTime('')
    setFlipped(false)
    setStatus('idle')

    await scrollToBookingStart()
    if (scrollFlipToken.current === token) setFlipped(true)
  }

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return

    if (!selectedDate || !selectedTime || !name.trim() || phone.replace(/\D/g, '').length !== 12) {
      setStatus('error')
      setErrorMessage(t.error)
      return
    }

    setSending(true)
    setStatus('idle')
    setErrorMessage('')

    const response = await fetch('/api/booking/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate,
        time: selectedTime,
        city: selectedCity,
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
      setErrorMessage('')
      loadAvailability()
      return
    }

    setStatus('error')
    setErrorMessage(data?.error || t.error)
  }

  const paymentModal = mounted && payment
    ? createPortal(
        <div className="fixed inset-0 z-[9999] flex min-h-[100svh] items-center justify-center overflow-y-auto overscroll-contain bg-black/80 px-4 py-6">
          <div role="dialog" aria-modal="true" className="max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-[1.5rem] border border-white bg-white p-5 text-center shadow-[0_28px_90px_rgba(15,23,42,0.34)] sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">{Math.round(payment.amount / 100)} грн</p>
            <h3 className="heading-section mt-2 text-2xl leading-tight text-slate-800">{t.paymentTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.paymentIntro}</p>

            {!payment.confirmed && !payment.failed && (
              <>
                <div className="mt-5 hidden rounded-[1.25rem] border border-sky-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_44px_rgba(15,23,42,0.10)] sm:block">
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
              className="mt-4 min-h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition-colors hover:bg-sky-50"
            >
              {t.paymentClose}
            </button>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      {paymentModal}
      <section id="booking" ref={bookingRef} className="booking-flip-booking contact-card">
        <div className={`booking-flip-scene ${flipped ? 'is-flipped' : ''}`}>
          <div className="booking-flip-inner">
            <section className="booking-face booking-face-front booking-card" aria-label={t.kicker}>
              <header className="booking-head">
                <div>
                  <p className="booking-kicker">{t.kicker}</p>
                  <h3 className="booking-title">{t.title}</h3>
                  <p className="booking-intro">{t.intro}</p>
                </div>
              </header>

              <div className="calendar-panel">
                <div className="calendar-top is-static">
                  <div className="calendar-month">
                    <strong>{monthTitle(monthAnchor, lang)}</strong>
                    <span>{t.chooseDate}</span>
                  </div>
                </div>

                <div className="weekday-row" aria-hidden="true">
                  {weekdayLabels(lang).map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div className="week-list">
                  {loading && Array.from({ length: 5 }).map((_, weekIndex) => (
                    <section className="week-card" key={weekIndex}>
                      <div className="week-card-head">
                        <p className="week-range">&nbsp;</p>
                      </div>
                      <div className="days-grid">
                        {Array.from({ length: 7 }).map((__, dayIndex) => (
                          <div className="day-wrap" key={dayIndex}>
                            <div className="day-cell is-skeleton" />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}

                  {!loading && weekRows.map((week) => {
                    const city = week.find((day) => day.city)?.city || ''

                    return (
                      <section className="week-card" key={week[0]?.weekStart}>
                        <div className="week-card-head">
                          <p className="week-range">{shortDate(week[0]?.date || '')} - {shortDate(week[week.length - 1]?.date || '')}</p>
                          {city && <span className="week-city">{city}</span>}
                        </div>
                        <div className="days-grid">
                          {week.map((day) => {
                            const selected = day.date === selectedDate
                            const outside = dateMonth(day.date) !== dateMonth(monthAnchor)
                            const disabled = !day.available

                            return (
                              <div className="day-wrap" key={day.date}>
                                <button
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => chooseDate(day)}
                                  className={[
                                    'day-cell',
                                    selected ? 'is-selected' : '',
                                    outside ? 'is-outside' : '',
                                    disabled ? 'is-disabled' : '',
                                  ].filter(Boolean).join(' ')}
                                >
                                  <span className="day-number">{dayNumber(day.date)}</span>
                                  <span className="day-label">{weekdayShort(day, lang)}</span>
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </div>
              </div>

              {!configured && (
                <p className="booking-status is-error">{t.unavailable}</p>
              )}
            </section>

            <section className="booking-face booking-face-back">
              <div className="booking-form time-booking-card">
                <button
                  className="back-to-calendar"
                  type="button"
                  onClick={() => {
                    setFlipped(false)
                    setSelectedTime('')
                    setStatus('idle')
                  }}
                >
                  ← {t.back}
                </button>

                <div className="selected-date-card">
                  <span className="summary-label">{t.selected}</span>
                  <strong className="summary-value">{selectedSummary}</strong>
                  <p className="selected-date-hint">{t.chooseTimeHint}</p>
                </div>

                <div className="time-list">
                  {selectedSlots.length === 0 && (
                    <p className="booking-status is-error">{t.closed}</p>
                  )}

                  {selectedSlots.map((slot) => {
                    const expanded = selectedTime === slot.time && slot.available

                    return (
                      <div
                        key={slot.time}
                        className={[
                          'time-row',
                          !slot.available ? 'is-booked' : '',
                          expanded ? 'is-expanded' : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <button
                          type="button"
                          className="time-row-head"
                          disabled={!slot.available}
                          onClick={() => {
                            if (!slot.available) return
                            setSelectedTime(slot.time)
                            setStatus('idle')
                          }}
                        >
                          <span className="time-value">{slot.time}</span>
                          <span className="time-status">{slot.available ? t.choose : t.full}</span>
                        </button>

                        {expanded && (
                          <form className="inline-booking-form" onSubmit={submitBooking}>
                            <input
                              className="inline-field"
                              name="name"
                              autoComplete="name"
                              placeholder={t.name}
                              value={name}
                              onChange={(event) => setName(event.target.value)}
                              required
                            />
                            <input
                              className="inline-field js-phone"
                              name="phone"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              pattern="\+380\d{9}"
                              value={phone}
                              onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                              onFocus={() => setPhone((current) => current || '+380')}
                              required
                            />
                            <textarea
                              className="inline-field inline-comment"
                              name="comment"
                              placeholder={t.comment}
                              value={comment}
                              onChange={(event) => setComment(event.target.value)}
                            />
                            <button className="inline-submit-btn" type="submit" disabled={sending}>
                              {sending ? t.sending : t.submit}
                            </button>
                            {status !== 'idle' && (
                              <p className={`booking-status ${status === 'success' ? 'is-success' : 'is-error'}`}>
                                {status === 'success' ? t.success : errorMessage || t.error}
                              </p>
                            )}
                          </form>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}
