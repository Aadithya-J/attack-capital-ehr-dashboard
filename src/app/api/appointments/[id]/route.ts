import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { Appointment, AppointmentUpdateRequest, SuccessResponse, APIErrorResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createModMedClient();
    const token = await getModMedToken();

    const res = await client.get(`/ema/fhir/v2/Appointment/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = NextResponse.json(res.data as Appointment);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
    return addSecurityHeaders(response);
  }
}

/**
 * PUT handler to update (reschedule or cancel) an appointment.
 *
 * To Reschedule: Send new `start` and `end` times in the request body.
 * To Cancel: Send `status: "cancelled"` and optionally a `cancelationReason`.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: AppointmentUpdateRequest = await request.json();
    const client = await createModMedClient();
    const token = await getModMedToken();

    // Add the ID to the body to match ModMed API requirements
    const updateData = {
      ...body,
      id: id,
      resourceType: "Appointment"
    };

    const res = await client.put(`/ema/fhir/v2/Appointment/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    // Handle empty response from ModMed API
    if (res.status >= 200 && res.status < 300) {
      const response = NextResponse.json(
        { success: true, message: `Appointment ${id} updated successfully.` } as SuccessResponse
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