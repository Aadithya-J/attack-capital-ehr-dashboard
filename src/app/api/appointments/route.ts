import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { AppointmentSearchResponse, AppointmentCreateRequest, SuccessResponse, APIErrorResponse } from "@/types";

/**
 * GET handler to search for appointments by date, provider, or patient.
 *
 * Query Parameters based on ModMed Docs:
 * - `patient`: The patient ID (e.g., '12345')
 * - `practitioner`: The practitioner ID (e.g., '67890')
 * - `date`: A date range for the search (e.g., 'ge2023-10-26')
 * - `status`: e.g., 'booked,arrived,pending'
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const client = await createModMedClient();
    const token = await getModMedToken();

    const res = await client.get(`/ema/fhir/v2/Appointment?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data as AppointmentSearchResponse);
    return addSecurityHeaders(response);
  } catch (error: any)    {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AppointmentCreateRequest = await request.json();
    const client = await createModMedClient();
    const token = await getModMedToken();

    if (!body.status || !body.appointmentType || !body.participant || !body.start || !body.end) {
        const response = NextResponse.json(
            { error: "Missing required fields for creating an appointment." } as APIErrorResponse,
            { status: 400 }
        );
        return addSecurityHeaders(response);
    }

    const res = await client.post("/ema/fhir/v2/Appointment", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle empty response from ModMed API
    if (res.status >= 200 && res.status < 300) {
      const response = NextResponse.json(
        { success: true, message: "Appointment created successfully." } as SuccessResponse,
        { status: 201 }
      );
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