import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

export async function GET(request: NextRequest) {
  const startTime = new Date().toISOString();
  logRequest('GET', '/api/appointment-types', startTime);
  
  try {
    const client = await createModMedClient();
    const token = await getModMedToken();

    const res = await client.get(`/ema/fhir/v2/ValueSet/appointment-type`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data);
    logResponse('GET', '/api/appointment-types', 200, new Date().toISOString());
    return addSecurityHeaders(response);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const response = NextResponse.json(
      { error: error.response?.data || error.message },
      { status }
    );
    logResponse('GET', '/api/appointment-types', status, new Date().toISOString());
    return addSecurityHeaders(response);
  }
}
