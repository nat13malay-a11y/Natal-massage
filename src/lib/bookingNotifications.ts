import { isTelegramConfigured, sendTelegramMessage, sendTelegramMessageDetailed } from '@/lib/telegramNotify'

type BookingNotificationPayload = {
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
  payment?: {
    amount?: number
    invoiceId?: string
  }
}

type BookingNotificationOptions = {
  status?: 'pending' | 'paid'
  replyToMessageIds?: Record<string, number>
}

function clean(value: unknown, max = 800) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max)
}

function multiline(value: unknown, max = 1200) {
  return String(value || '').trim().slice(0, max)
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

export async function sendBookingTelegram(
  payload: BookingNotificationPayload,
  phone: string,
  options: BookingNotificationOptions = {},
) {
  if (!isTelegramConfigured()) return false

  const submittedDate = payload.submittedAt ? new Date(payload.submittedAt) : new Date()
  const safeSubmittedDate = Number.isNaN(submittedDate.getTime()) ? new Date() : submittedDate
  const device = payload.device || {}
  const userAgent = clean(device.userAgent, 500)
  const paymentAmount = payload.payment?.amount ? Math.round(payload.payment.amount / 100) : 0
  const paid = options.status === 'paid'

  const message = [
    paid ? 'ОПЛАЧЕНО' : 'Новая запись на массаж',
    paid ? 'Запись подтверждена после поступления задатка' : 'Статус: ожидает предоплату',
    '',
    `Дата приема: ${payload.date ? humanDate(payload.date) : 'не выбрана'}`,
    `Время приема: ${payload.time || 'не выбрано'}`,
    `Город: ${clean(payload.city, 120) || 'не указан'}`,
    '',
    `Имя: ${clean(payload.name, 120)}`,
    `Телефон: ${phone}`,
    `Комментарий: ${multiline(payload.comment, 1200) || 'не указан'}`,
    '',
    payload.payment ? `Задаток: ${paymentAmount} грн ${paid ? 'оплачен' : 'ожидается'}` : '',
    payload.payment?.invoiceId ? `Mono invoice: ${payload.payment.invoiceId}` : '',
    '',
    `Отправлено: ${kyivTime(safeSubmittedDate)} (Kyiv time)`,
    `Устройство: ${userAgent || clean(device.platform, 120) || 'не определено'}`,
    `Язык: ${clean(device.language, 80) || 'не определено'}`,
  ].filter(Boolean).join('\n')

  const results = await sendTelegramMessageDetailed(message, {
    disableWebPagePreview: true,
    replyToMessageIds: options.replyToMessageIds,
  })

  return {
    ok: results.some((result) => result.ok),
    messageIds: Object.fromEntries(
      results
        .filter((result) => result.ok && result.messageId)
        .map((result) => [result.chatId, result.messageId!]),
    ),
  }
}

export async function sendBookingPaymentIssueTelegram(message: string) {
  return sendTelegramMessage(message, { disableWebPagePreview: true })
}
