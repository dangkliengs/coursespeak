import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './lib/admin-auth';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin');
  const isApiRoute = path.startsWith('/api');
  
  // Skip proxy for non-admin and non-api routes
  if (!isAdminRoute && !isApiRoute) {
    return NextResponse.next();
  }

  // Check for API routes
  if (isApiRoute) {
    const token = request.headers.get('x-admin-token') || 
                 request.cookies.get('admin-token')?.value ||
                 (request.headers.get('authorization') || '').replace('Bearer', '').trim();

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or missing admin token',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }
  }

  // For admin pages
  if (isAdminRoute) {
    const token = request.cookies.get('admin-token')?.value ||
                 request.headers.get('x-admin-token') ||
                 (request.headers.get('authorization') || '').replace('Bearer', '').trim();

    if (!verifyAdminToken(token)) {
      if (request.nextUrl.pathname !== '/admin') {
        const loginUrl = new URL('/admin', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
