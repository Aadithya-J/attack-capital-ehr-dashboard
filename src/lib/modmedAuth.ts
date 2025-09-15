import axios from "axios";
import qs from "qs";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getModMedToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const data = qs.stringify({
    grant_type: "password",
    username: process.env.MODMED_USERNAME,
    password: process.env.MODMED_PASSWORD,
  });

  const res = await axios.post(
    `${process.env.MODMED_BASE_URL}/${process.env.MODMED_FIRM_URL_PREFIX}/ema/ws/oauth2/grant`,
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-api-key": process.env.MODMED_API_KEY,
      },
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = now + (res.data.expires_in - 60) * 1000;

  return cachedToken;
}
