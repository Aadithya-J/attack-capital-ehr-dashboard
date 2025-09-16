import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { PatientSearchResponse, PatientUpdateResponse, APIErrorResponse } from "@/types";
import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";

export async function GET(request: NextRequest) {
  const startTime = new Date().toISOString();
  logRequest('GET', '/api/patients', startTime);
  
  try {
    const search = request.nextUrl.searchParams.toString();
    const query = search ? `?${search}` : "";

    const token = await getModMedToken();

    const res = await modmedClient.get(`/ema/fhir/v2/Patient${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    const response = NextResponse.json(res.data as PatientSearchResponse);
    logResponse('GET', '/api/patients', 200, new Date().toISOString());
    return addSecurityHeaders(response);
  } catch (error: any) {
    const status = error.response?.status || 500;
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status }
    );
    logResponse('GET', '/api/patients', status, new Date().toISOString());
    return addSecurityHeaders(response);
  }
}
