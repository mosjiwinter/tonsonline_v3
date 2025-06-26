import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value;
  const url = req.nextUrl.clone();

  if (url.pathname.startsWith('/admin')) {
    if (!token || role !== 'admin') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  if (url.pathname.startsWith('/staff')) {
    if (!token || role !== 'staff') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*'],
};