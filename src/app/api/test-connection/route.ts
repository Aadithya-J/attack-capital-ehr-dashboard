import { NextRequest, NextResponse } from "next/server";
import { getModMedToken } from "@/lib/modmedAuth";
import { createModMedClient } from "@/lib/modmedClient";
import { addSecurityHeaders } from "@/lib/securityHeaders";
import { saveCredsBrowser } from "@/lib/runtimeConfig";
import type { ModMedCreds } from "@/lib/runtimeConfig";

export async function POST(request: NextRequest) {
  try {
    const creds: ModMedCreds = await request.json();

    // Validate required fields
    if (!creds.baseUrl || !creds.apiKey || !creds.username || !creds.password) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: "Missing required credentials" },
          { status: 400 }
        )
      );
    }

    // Temporarily save credentials to test them
    const originalEnv = {
      MODMED_BASE_URL: process.env.MODMED_BASE_URL,
      MODMED_FIRM_URL_PREFIX: process.env.MODMED_FIRM_URL_PREFIX,
      MODMED_API_KEY: process.env.MODMED_API_KEY,
      MODMED_USERNAME: process.env.MODMED_USERNAME,
      MODMED_PASSWORD: process.env.MODMED_PASSWORD,
    };

    // Set env vars temporarily for testing
    process.env.MODMED_BASE_URL = creds.baseUrl;
    process.env.MODMED_FIRM_URL_PREFIX = creds.firmUrlPrefix;
    process.env.MODMED_API_KEY = creds.apiKey;
    process.env.MODMED_USERNAME = creds.username;
    process.env.MODMED_PASSWORD = creds.password;

    try {
      // Test authentication
      const token = await getModMedToken();
      
      // Test API call
      const client = await createModMedClient();
      await client.get("/ema/fhir/v2/Patient?_count=1", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If we get here, credentials work - save them as cookies
      const response = NextResponse.json({ success: true, message: "Connection successful!" });
      
      // Set cookie with credentials
      const encoded = btoa(JSON.stringify(creds));
      response.cookies.set('modmed_creds', encoded, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });

      return addSecurityHeaders(response);
    } finally {
      // Restore original env vars
      process.env.MODMED_BASE_URL = originalEnv.MODMED_BASE_URL;
      process.env.MODMED_FIRM_URL_PREFIX = originalEnv.MODMED_FIRM_URL_PREFIX;
      process.env.MODMED_API_KEY = originalEnv.MODMED_API_KEY;
      process.env.MODMED_USERNAME = originalEnv.MODMED_USERNAME;
      process.env.MODMED_PASSWORD = originalEnv.MODMED_PASSWORD;
    }
  } catch (error: any) {
    console.error("Connection test failed:", error);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.statusText || 
                        error.message || 
                        "Connection failed";

    return addSecurityHeaders(
      NextResponse.json(
        { error: errorMessage },
        { status: error.response?.status || 500 }
      )
    );
  }
}
