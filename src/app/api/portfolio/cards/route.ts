import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PortfolioRow = {
  id: string
  media: unknown
  text: unknown
  created_at: string
}

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  const { data, error } = await supabase
    .from('portfolio_cards')
    .select('id, media, text, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, noStore(500))
  }

  return NextResponse.json({ ok: true, cards: data || [] }, noStore())
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  let row: PortfolioRow
  try {
    row = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, noStore(400))
  }

  if (!row.id || !row.text) {
    return NextResponse.json({ ok: false, error: 'Missing card data' }, noStore(400))
  }

  const { error } = await supabase
    .from('portfolio_cards')
    .upsert(
      {
        id: row.id,
        media: row.media || { kind: 'none', src: '', source: 'none' },
        text: row.text,
        created_at: row.created_at || new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, noStore(500))
  }

  return NextResponse.json({ ok: true }, noStore())
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing card id' }, noStore(400))
  }

  const { error } = await supabase
    .from('portfolio_cards')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, noStore(500))
  }

  return NextResponse.json({ ok: true }, noStore())
}
