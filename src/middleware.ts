// @ts-ignore
import { NextResponse } from 'next/server';
// @ts-ignore
import helmet from 'helmet';

// @ts-ignore
import { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // @ts-ignore
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  // @ts-ignore
  })(req as any, res as any, () => {
    // Continue to the next middleware/route handler
  });

  return res;
}

export const config = {
  matcher: '/api/:path*',
};