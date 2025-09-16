import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { CompositionCreateResponse, APIErrorResponse } from "@/types";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = await getModMedToken();

    if (!body.subject || !body.author || !body.title) {
        const response = NextResponse.json(
            { error: "Subject, author, and title are required fields for a Composition." } as APIErrorResponse,
            { status: 400 }
        );
    }

    const res = await modmedClient.post("/ema/fhir/v2/Composition", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const response = NextResponse.json(res.data as CompositionCreateResponse, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
  }
}