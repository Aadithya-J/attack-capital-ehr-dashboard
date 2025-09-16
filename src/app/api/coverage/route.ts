import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { CoverageSearchResponse, APIErrorResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patient");

    if (!patientId) {
      const response = NextResponse.json(
        { error: "A 'patient' ID is required to search for coverage." } as APIErrorResponse,
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const client = await createModMedClient();
    const token = await getModMedToken();
    const res = await client.get(`/ema/fhir/v2/Coverage?patient=${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data as CoverageSearchResponse);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
    return addSecurityHeaders(response);
  }
}