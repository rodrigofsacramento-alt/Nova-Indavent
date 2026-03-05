import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get('auth_session');
  const { pathname } = request.nextUrl;

  // If user is not logged in and trying to access protected routes
  // Root (/) is now the login page, so it's public.
  if (!authSession && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is logged in and at the login page (root)
  if (authSession && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
