import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const decodedPathname = decodeURIComponent(request.nextUrl.pathname)

  if (decodedPathname === '/партфолио') {
    return NextResponse.redirect(new URL('/portfolio', request.url))
  }

  return NextResponse.next()
}
