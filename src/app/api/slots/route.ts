import { NextRequest, NextResponse } from "next/server";
import modmedClient from "@/lib/modmedClient";
import { getModMedToken } from "@/lib/modmedAuth";

/**
 * Query Parameters based on ModMed Docs:
 * - `appointment-type` (Required): The ID of the type of appointment.
 * - `identifier` (Required): At least one practitioner and location are highly recommended.
 *   - Practitioner: http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-PRN|[practitionerId]
 *   - Location: http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-FI|[locationId]
 * - `date` (Required): A date or date range. The API is limited to 5-day increments.
 *   - e.g., date=ge2023-10-26T00:00:00Z&date=le2023-10-30T23:59:59Z
 *
 * Example Frontend Fetch:
 *   fetch('/api/slots?appointment-type=123&identifier=...&date=...')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();

    if (!request.nextUrl.searchParams.has("appointment-type")) {
        return NextResponse.json(
            { error: "An 'appointment-type' query parameter is required." },
            { status: 400 }
        );
    }

    const token = await getModMedToken();

    const res = await modmedClient.get(`/ema/fhir/v2/Slot?${searchParams}`, {
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