import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AnalyticsRow = {
  visitor_id: string
  source: string
  duration_seconds: number
  page_views: number
  max_scroll_depth: number
  is_returning: boolean
  read_score: number
  accidental: boolean
  started_at: string
}

function withTimeout<T>(promise: Promise<T>, ms = 2500) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase timeout')), ms)
    }),
  ])
}

function percent(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Supabase is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  let data: unknown[] | null = null
  let error: { message: string } | null = null

  try {
    const result = await withTimeout(Promise.resolve(
      supabase
        .from('site_analytics_sessions')
        .select('visitor_id, source, duration_seconds, page_views, max_scroll_depth, is_returning, read_score, accidental, started_at')
        .not('id', 'like', 'debug-%')
        .order('started_at', { ascending: false })
        .limit(2000),
    ))
    data = result.data
    error = result.error
  } catch (caught) {
    error = { message: caught instanceof Error ? caught.message : 'Supabase unavailable' }
  }

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }

  const rows = (data || []) as AnalyticsRow[]
  const total = rows.length
  const readers = rows.filter((row) => row.read_score >= 50 || row.duration_seconds >= 30 || row.max_scroll_depth >= 45).length
  const accidental = rows.filter((row) => row.accidental).length
  const returning = rows.filter((row) => row.is_returning).length
  const site = rows.filter((row) => row.source === 'site').length
  const miniapp = rows.filter((row) => row.source === 'miniapp').length
  const avgDuration = total ? Math.round(rows.reduce((sum, row) => sum + (row.duration_seconds || 0), 0) / total) : 0
  const avgReadScore = total ? Math.round(rows.reduce((sum, row) => sum + (row.read_score || 0), 0) / total) : 0
  const uniqueVisitors = new Set(rows.map((row) => row.visitor_id)).size

  return NextResponse.json(
    {
      ok: true,
      total,
      uniqueVisitors,
      returning,
      returningPercent: percent(returning, total),
      readers,
      readersPercent: percent(readers, total),
      accidental,
      accidentalPercent: percent(accidental, total),
      site,
      miniapp,
      avgDuration,
      avgReadScore,
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
