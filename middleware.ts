import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value
  const path = request.nextUrl.pathname

  // Публичные маршруты (не требуют авторизации)
  const isPublic =
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/api') ||
    path.startsWith('/oauth/consent')

  console.log(`[Middleware] Path: ${path}, userId: ${userId}, isPublic: ${isPublic}`)

  if (!userId && !isPublic) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}