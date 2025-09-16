import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { ConditionSearchResponse, SuccessResponse, APIErrorResponse } from "@/types";

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

    const token = await getModMedToken();
    const res = await modmedClient.get(`/ema/fhir/v2/Condition?patient=${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    const response = NextResponse.json(res.data as ConditionSearchResponse);
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
    const token = await getModMedToken();

    const res = await modmedClient.post("/ema/fhir/v2/Condition", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
        "Content-Type": "application/json",
      },
    });

    // Handle empty response from ModMed API
    if (res.status >= 200 && res.status < 300) {
      const response = NextResponse.json(
        { success: true, message: "Condition created successfully." } as SuccessResponse,
        { status: 201 }
      );
      return addSecurityHeaders(response);
    }
    
    const response = NextResponse.json(res.data, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const conditionId = body.id;

        if (!conditionId) {
            const response = NextResponse.json(
                { error: "Condition ID is required in the request body for updates." } as APIErrorResponse,
                { status: 400 }
            );
            return addSecurityHeaders(response);
        }

        const token = await getModMedToken();
        const res = await modmedClient.put(`/ema/fhir/v2/Condition/${conditionId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "x-api-key": process.env.MODMED_API_KEY,
                "Content-Type": "application/json",
            },
        });

        // Handle empty response from ModMed API
        if (res.status >= 200 && res.status < 300) {
            const response = NextResponse.json(
                { success: true, message: `Condition ${conditionId} updated successfully.` } as SuccessResponse
            );
            return addSecurityHeaders(response);
        }
        
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