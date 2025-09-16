import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { PatientSearchResponse, APIErrorResponse } from "@/types";

export async function GET(request: NextRequest) {
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

    return NextResponse.json(res.data as PatientSearchResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
  }
}
