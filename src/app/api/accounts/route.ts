import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { AccountSearchResponse, APIErrorResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patient");

    if (!patientId) {
      const response = NextResponse.json({ error: "Patient ID is required." } as APIErrorResponse, { status: 400 });
    return addSecurityHeaders(response);
    }

    const token = await getModMedToken();
    const res = await modmedClient.get(`/ema/fhir/v2/Account?patient=${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    const response = NextResponse.json(res.data as AccountSearchResponse);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json({ error: error.response?.data || error.message } as APIErrorResponse, { status: error.response?.status || 500 });
    return addSecurityHeaders(response);
  }
}