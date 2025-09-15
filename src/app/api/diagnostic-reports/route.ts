import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    if (!searchParams.has("patient") && !searchParams.has("requisition")) {
      return NextResponse.json(
        { error: "A 'patient' ID or 'requisition' ID is required." },
        { status: 400 }
      );
    }

    const token = await getModMedToken();
    const res = await modmedClient.get(`/ema/fhir/v2/DiagnosticReport?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}