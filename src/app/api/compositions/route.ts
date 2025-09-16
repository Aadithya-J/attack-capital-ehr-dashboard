import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { getModMedConfig } from "@/lib/getModMedConfig";
import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { CompositionCreateResponse, APIErrorResponse } from "@/types";


export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patient");

    if (!patientId) {
      const response = NextResponse.json(
        { error: "Patient ID is required." } as APIErrorResponse,
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const client = await createModMedClient();
    const token = await getModMedToken();
    const res = await client.get(`/ema/fhir/v2/Composition?subject=Patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await createModMedClient();
    const token = await getModMedToken();

    if (!body.subject || !body.author || !body.title) {
        const response = NextResponse.json(
            { error: "Subject, author, and title are required fields for a Composition." } as APIErrorResponse,
            { status: 400 }
        );
        return addSecurityHeaders(response);
    }
    console.log("Creating composition with data:", JSON.stringify(body, null, 2));
    const res = await client.post(`/ema/fhir/v2/Composition`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data as CompositionCreateResponse, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
    console.log(error)
    return addSecurityHeaders(response);
  }
}