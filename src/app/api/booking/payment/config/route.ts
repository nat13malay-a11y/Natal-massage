import { NextResponse } from 'next/server'
import { getJarPaymentConfig, missingJarPaymentConfig } from '@/lib/monobankJar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const config = getJarPaymentConfig()
  const missing = missingJarPaymentConfig()

  return NextResponse.json(
    {
      ok: missing.length === 0,
      hasToken: Boolean(config.token),
      hasJarId: Boolean(config.jarId),
      hasJarUrl: Boolean(config.jarUrl),
      hasJarSendId: Boolean(config.jarSendId),
      missing,
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  )
}
