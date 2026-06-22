import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function noStore(status = 200) {
  return { status, headers: { 'Cache-Control': 'no-store, max-age=0' } }
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase is not configured' }, noStore(503))
  }

  const url = new URL(request.url)
  const invoiceId = url.searchParams.get('invoiceId') || ''
  if (!invoiceId) {
    return NextResponse.json({ ok: false, error: 'Missing invoiceId' }, noStore(400))
  }

  const result = await supabase
    .from('booking_appointments')
    .select('status, client')
    .contains('client', { mono: { invoiceId } })
    .maybeSingle()

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error.message }, noStore(500))
  }

  const client = (result.data?.client || {}) as { mono?: { status?: string; failureReason?: string } }

  return NextResponse.json({
    ok: true,
    bookingStatus: result.data?.status || 'unknown',
    paymentStatus: client.mono?.status || 'unknown',
    failureReason: client.mono?.failureReason || '',
  }, noStore())
}
