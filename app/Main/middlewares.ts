import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = NextResponse.json({});
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};