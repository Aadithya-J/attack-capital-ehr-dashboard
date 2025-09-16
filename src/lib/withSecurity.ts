// Utility to quickly add security to API routes

import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders, logRequest, logResponse } from './securityHeaders';

export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  routeName: string
) {
  return async (request: NextRequest) => {
    const startTime = new Date().toISOString();
    const method = request.method;
    logRequest(method, routeName, startTime);

    try {
      const response = await handler(request);
      logResponse(method, routeName, response.status, new Date().toISOString());
      return addSecurityHeaders(response);
    } catch (error: any) {
      const status = error.response?.status || 500;
      logResponse(method, routeName, status, new Date().toISOString());
      throw error;
    }
  };
}
