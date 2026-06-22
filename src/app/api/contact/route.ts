import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ContactPayload = {
  name?: string
  phone?: string
  comment?: string
  page?: string
  submittedAt?: string
  device?: {
    userAgent?: string
    platform?: string
    language?: string
    timezone?: string
    viewport?: string
  }
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

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.telegram_bot_token
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.telegram_chat_id

  if (!token || !chatId) {
    return NextResponse.json(
      { ok: false, error: 'Telegram is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  let payload: ContactPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request' },
      { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  const name = clean(payload.name, 120)
  const phone = clean(payload.phone, 80)
  const comment = multiline(payload.comment, 1200)
  const userAgent = clean(payload.device?.userAgent || request.headers.get('user-agent'), 500)

  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: 'Name and phone are required' },
      { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  const submittedDate = payload.submittedAt ? new Date(payload.submittedAt) : new Date()
  const safeSubmittedDate = Number.isNaN(submittedDate.getTime()) ? new Date() : submittedDate
  const device = payload.device || {}

  const message = [
    'Новая заявка с сайта',
    '',
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Комментарий: ${comment || 'не указан'}`,
    '',
    `Дата и время: ${kyivTime(safeSubmittedDate)} Киев`,
    `Страница: ${clean(payload.page || '/', 180)}`,
    `Устройство: ${userAgent || 'не определено'}`,
    `Платформа: ${clean(device.platform, 120) || 'не определено'}`,
    `Язык: ${clean(device.language, 80) || 'не определено'}`,
    `Часовой пояс: ${clean(device.timezone, 120) || 'не определено'}`,
    `Экран: ${clean(device.viewport, 80) || 'не определено'}`,
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

  if (!response?.ok) {
    const details = await response?.json().catch(() => null)
    return NextResponse.json(
      { ok: false, error: details?.description || 'Could not send Telegram message' },
      { status: 502, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
