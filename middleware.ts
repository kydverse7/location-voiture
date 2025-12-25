import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PATHS = [
  '/dashboard',
  '/vehicles',
  '/clients',
  '/reservations',
  '/locations',
  '/planning',
  '/payments',
  '/expenses',
  '/finances',
  '/maintenance'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pages publiques - pas de protection
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') || 
    pathname.startsWith('/public-site') || 
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const needsAuth = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('session-token')?.value;
  if (!token) {
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret');
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next|static|public-site).*)']
};
