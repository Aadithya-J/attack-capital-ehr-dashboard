import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";


export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        if (!searchParams.has("patient") && !searchParams.has("context")) {
            const response = NextResponse.json(
                { error: "A 'patient' or 'context' (encounter) ID is required to search for charges." },
                { status: 400 }
            );
        }

        const token = await getModMedToken();
        const res = await modmedClient.get(`/ema/fhir/v2/ChargeItem?${searchParams.toString()}`, {
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
    }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = await getModMedToken();

    if (!body.subject || !body.status) {
        const response = NextResponse.json(
            { error: "Subject (patient) and status are required for a ChargeItem." },
            { status: 400 }
        );
    }

    const res = await modmedClient.post("/ema/fhir/v2/ChargeItem", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const response = NextResponse.json(res.data, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}