import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

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

    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
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
    const body = await request.json();
    const token = await getModMedToken();

    if (body.id !== id) {
      return NextResponse.json(
        { error: "Appointment ID in the request body must match the URL." },
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
    return NextResponse.json(res.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}