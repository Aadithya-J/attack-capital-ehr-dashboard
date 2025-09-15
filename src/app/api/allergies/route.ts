import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

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
    const res = await modmedClient.get(`/ema/fhir/v2/AllergyIntolerance?patient=${patientId}`, {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = await getModMedToken();

    const res = await modmedClient.post("/ema/fhir/v2/AllergyIntolerance", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-api-key": process.env.MODMED_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(res.data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

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

        const token = await getModMedToken();
        const res = await modmedClient.put(`/ema/fhir/v2/AllergyIntolerance/${allergyId}`, body, {
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