import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { AccountSearchResponse, APIErrorResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patient");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required." } as APIErrorResponse, { status: 400 });
    }

    const token = await getModMedToken();
    const res = await modmedClient.get(`/ema/fhir/v2/Account?patient=${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    return NextResponse.json(res.data as AccountSearchResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.response?.data || error.message } as APIErrorResponse, { status: error.response?.status || 500 });
  }
}