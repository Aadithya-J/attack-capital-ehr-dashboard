import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    if (!searchParams.has("patient")) {
      const response = NextResponse.json(
        { error: "A 'patient' ID is required to search for encounters." },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const token = await getModMedToken();
    const res = await modmedClient.get(`/ema/fhir/v2/Encounter?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    const response = NextResponse.json(res.data);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
    return addSecurityHeaders(response);
  }
}