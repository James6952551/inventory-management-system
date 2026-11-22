import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'
import { getCurrentUserWithProfile } from './lib/auth-utils'

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    //check if user is authenticated
    const session = await auth.api.getSession({
        headers: request.headers,
    })

    const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

    //redirect to sign-in if user is not authenticated and trying to access protected routes
    if (!session && !isAuthRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    //redirect to dashboard if user is authenticated and trying to access sign-in or sign-up pages
    if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (session && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // redirect to dashboard if manager and staff are trying to access user page
    if (pathname === '/user') {
    // Validate the current user role
    const currentUser = await getCurrentUserWithProfile()
    const role = currentUser?.profile?.role

    if (!currentUser || !role || !["ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

  return NextResponse.next()
}}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}