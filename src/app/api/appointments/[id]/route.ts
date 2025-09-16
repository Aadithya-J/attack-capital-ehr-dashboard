import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { Appointment, AppointmentUpdateRequest, SuccessResponse, APIErrorResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const token = await getModMedToken();

    const res = await modmedClient.get(`/ema/fhir/v2/Appointment/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
      },
    });

    const response = NextResponse.json(res.data as Appointment);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body: AppointmentUpdateRequest = await request.json();
    const token = await getModMedToken();

    if (body.id !== id) {
      const response = NextResponse.json(
        { error: "Appointment ID in the request body must match the URL." } as APIErrorResponse,
        { status: 400 }
      );
    }

    const res = await modmedClient.put(`/ema/fhir/v2/Appointment/${id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
        "Content-Type": "application/json",
      },
    });
    
    // Handle empty response from ModMed API
    if (res.status >= 200 && res.status < 300) {
      const response = NextResponse.json(
        { success: true, message: `Appointment ${id} updated successfully.` } as SuccessResponse
      );
    }
    
    const response = NextResponse.json(res.data);
    return addSecurityHeaders(response);
  } catch (error: any) {
    const response = NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
  }
}