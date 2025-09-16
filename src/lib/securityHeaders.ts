// Security Headers for HIPAA Compliance

import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // HIPAA Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Cache control for sensitive data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://stage.ema-api.com;"
  );

  return response;
}

export function logRequest(method: string, url: string, timestamp: string = new Date().toISOString()) {
  console.log(`[${timestamp}] ${method} ${url}`);
}

export function logResponse(method: string, url: string, status: number, timestamp: string = new Date().toISOString()) {
  console.log(`[${timestamp}] ${method} ${url} - ${status}`);
}
