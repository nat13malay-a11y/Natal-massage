import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

type AnalyticsPayload = {
  id: string
  visitorId: string
  source?: string
  entryPath?: string
  lastPath?: string
  referrer?: string
  userAgent?: string
  startedAt?: string
  durationSeconds?: number
  pageViews?: number
  maxScrollDepth?: number
  isReturning?: boolean
  client?: Record<string, unknown>
  notify?: boolean
}

function withTimeout<T>(promise: Promise<T>, ms = 2500) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase timeout')), ms)
    }),
  ])
}

function score(payload: AnalyticsPayload) {
  let value = 0
  if ((payload.durationSeconds || 0) >= 30) value += 40
  if ((payload.durationSeconds || 0) >= 90) value += 20
  if ((payload.maxScrollDepth || 0) >= 45) value += 25
  if ((payload.pageViews || 0) > 1) value += 15
  return Math.min(100, value)
}

async function notifyTelegram(payload: AnalyticsPayload, readScore: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId || !payload.notify) return

  const text = [
    'New site visit',
    `Source: ${payload.source || 'site'}`,
    `Path: ${payload.lastPath || payload.entryPath || '/'}`,
    `Returning: ${payload.isReturning ? 'yes' : 'no'}`,
    `Time: ${payload.durationSeconds || 0}s`,
    `Scroll: ${payload.maxScrollDepth || 0}%`,
    `Read score: ${readScore}%`,
  ].join('\n')

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => undefined)
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, mode: 'local' }, { status: 503 })
  }

  const rawBody = await request.text()
  if (!rawBody) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 202 })
  }

  let payload: AnalyticsPayload
  try {
    payload = JSON.parse(rawBody) as AnalyticsPayload
  } catch {
    return NextResponse.json({ ok: false, skipped: true }, { status: 202 })
  }

  if (!payload.id || !payload.visitorId) {
    return NextResponse.json({ ok: false, error: 'Missing session id or visitor id' }, { status: 400 })
  }

  const readScore = score(payload)
  const accidental = (payload.durationSeconds || 0) < 10 && (payload.maxScrollDepth || 0) < 20 && (payload.pageViews || 1) <= 1

  let error: { message: string } | null = null

  try {
    const result = await withTimeout(Promise.resolve(
      supabase
        .from('site_analytics_sessions')
        .upsert(
          {
            id: payload.id,
            visitor_id: payload.visitorId,
            source: payload.source || 'site',
            entry_path: payload.entryPath || '/',
            last_path: payload.lastPath || payload.entryPath || '/',
            referrer: payload.referrer || null,
            user_agent: payload.userAgent || null,
            started_at: payload.startedAt || new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            duration_seconds: Math.max(0, Math.round(payload.durationSeconds || 0)),
            page_views: Math.max(1, Math.round(payload.pageViews || 1)),
            max_scroll_depth: Math.max(0, Math.min(100, Math.round(payload.maxScrollDepth || 0))),
            is_returning: Boolean(payload.isReturning),
            read_score: readScore,
            accidental,
            client: payload.client || {},
        },
        { onConflict: 'id' },
      ),
    ))
    error = result.error
  } catch (caught) {
    error = { message: caught instanceof Error ? caught.message : 'Supabase unavailable' }
  }

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  await notifyTelegram(payload, readScore)

  return NextResponse.json({ ok: true, readScore, accidental })
}
