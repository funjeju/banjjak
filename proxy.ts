import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/create', '/dashboard', '/billing'];
const AUTH_PATHS = ['/sign-in', '/sign-up'];

export async function proxy(req: NextRequest) {
  const session = req.cookies.get('__session')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
