import { NextRequest, NextResponse } from "next/server";
import { createModMedClient } from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";
import { PatientGetResponse, PatientUpdateRequest, PatientUpdateResponse, APIErrorResponse } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await createModMedClient();
    const token = await getModMedToken();

    const res = await client.get(`/ema/fhir/v2/Patient/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(res.data as PatientGetResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: PatientUpdateRequest = await request.json();
    const client = await createModMedClient();
    const token = await getModMedToken();

    if (body.id !== id) {
        return NextResponse.json(
            { error: "Patient ID in the request body must match the URL." } as APIErrorResponse,
            { status: 400 }
        );
    }

    const res = await client.put(`/ema/fhir/v2/Patient/${id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });    
    if (res.status >= 200 && res.status < 300) {
      // Return a success message instead of the empty body.
      return NextResponse.json({ success: true, message: `Patient ${id} updated successfully.` } as PatientUpdateResponse);
    }

    return NextResponse.json(
        { error: "Update was not successful.", details: res.data } as APIErrorResponse,
      { status: res.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message } as APIErrorResponse,
      { status: error.response?.status || 500 }
    );
  }
}