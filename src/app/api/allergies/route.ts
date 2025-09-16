import { addSecurityHeaders, logRequest, logResponse } from "@/lib/securityHeaders";
import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

// GET allergies by patient
export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get("patient");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required." },
        { status: 400 }
      );
    }

    const token = await getModMedToken();
    const res = await modmedClient.get(
      `/ema/fhir/v2/AllergyIntolerance?patient=${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": process.env.MODMED_API_KEY,
        },
      }
    );

    const response = NextResponse.json(res.data);
    return addSecurityHeaders(response);
  } catch (error: any) {
    return addSecurityHeaders(
      NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 }
      )
    );
  }
}

// POST create new allergy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating allergy with data:', JSON.stringify(body, null, 2));
    const token = await getModMedToken();

    const res = await modmedClient.post(
      "/ema/fhir/v2/AllergyIntolerance",
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": process.env.MODMED_API_KEY,
          "Content-Type": "application/json",
          // Add this header to get the created resource back in the response body
          "Prefer": "return=representation",
        },
      }
    );

    // The status code from the ModMed API will likely be 201, 
    // so we can forward that along with the data.
    return addSecurityHeaders(NextResponse.json(res.data, { status: res.status }));

  } catch (error: any) {
    console.error('Allergy creation failed:', error.response?.data || error.message);
    return addSecurityHeaders(
      NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 }
      )
    );
  }
}

// PUT update existing allergy (only updatable fields)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const allergyId = body.id;

    if (!allergyId) {
      return NextResponse.json(
        { error: "AllergyIntolerance ID is required in the request body for updates." },
        { status: 400 }
      );
    }

    // Only allow updatable fields
    const updatableBody: any = {
      clinicalStatus: body.clinicalStatus,
      reaction: body.reaction,
      onsetDateTime: body.onsetDateTime,
      recordedDate: body.recordedDate,
    };

    const token = await getModMedToken();
    const res = await modmedClient.put(
      `/ema/fhir/v2/AllergyIntolerance/${allergyId}`,
      updatableBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": process.env.MODMED_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return addSecurityHeaders(NextResponse.json(res.data));
  } catch (error: any) {
    return addSecurityHeaders(
      NextResponse.json(
        { error: error.response?.data || error.message },
        { status: error.response?.status || 500 }
      )
    );
  }
}
