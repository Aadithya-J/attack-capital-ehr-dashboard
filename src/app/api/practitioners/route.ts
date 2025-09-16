import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

export async function GET(request: NextRequest) {
  const startTime = new Date().toISOString();
  logRequest('GET', '/api/practitioners', startTime);
  
  try {
    const token = await getModMedToken();

    const res = await modmedClient.get(`/ema/fhir/v2/Practitioner?active=true`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    const response = NextResponse.json(res.data);
    logResponse('GET', '/api/practitioners', 200, new Date().toISOString());
    return addSecurityHeaders(response);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const response = NextResponse.json(
      { error: error.response?.data || error.message },
      { status }
    );
    logResponse('GET', '/api/practitioners', status, new Date().toISOString());
    return addSecurityHeaders(response);
  }
}
