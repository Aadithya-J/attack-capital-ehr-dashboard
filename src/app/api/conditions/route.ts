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
    const res = await modmedClient.get(`/ema/fhir/v2/Condition?patient=${patientId}`, {
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

    const res = await modmedClient.post("/ema/fhir/v2/Condition", body, {
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
        const conditionId = body.id;

        if (!conditionId) {
            return NextResponse.json(
                { error: "Condition ID is required in the request body for updates." },
                { status: 400 }
            );
        }

        const token = await getModMedToken();
        const res = await modmedClient.put(`/ema/fhir/v2/Condition/${conditionId}`, body, {
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