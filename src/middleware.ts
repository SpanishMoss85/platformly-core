import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Set security headers manually
  res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'");
  res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return res;
}

export const config = {
  matcher: '/api/:path*',
};