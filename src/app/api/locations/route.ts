import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

export async function GET(request: NextRequest) {
  const startTime = new Date().toISOString();
  logRequest('GET', '/api/locations', startTime);
  
  try {
    const client = await createModMedClient();
    const token = await getModMedToken();

    const res = await client.get(`/ema/fhir/v2/Location?status=active`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data);
    logResponse('GET', '/api/locations', 200, new Date().toISOString());
    return addSecurityHeaders(response);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const response = NextResponse.json(
      { error: error.response?.data || error.message },
      { status }
    );
    logResponse('GET', '/api/locations', status, new Date().toISOString());
    return addSecurityHeaders(response);
  }
}
