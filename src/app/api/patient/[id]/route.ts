import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.MODMED_BASE_URL;
const firmUrl = process.env.MODMED_FIRM_URL_PREFIx;
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } 
){
    const {id} = params;

    try {
        const res = await fetch(`${baseUrl}/${firmUrl}/patients/${id}`, {
            method: "GET",
    }
}