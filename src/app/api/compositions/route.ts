import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = await getModMedToken();

    if (!body.subject || !body.author || !body.title) {
        return NextResponse.json(
            { error: "Subject, author, and title are required fields for a Composition." },
            { status: 400 }
        );
    }

    const res = await modmedClient.post("/ema/fhir/v2/Composition", body, {
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