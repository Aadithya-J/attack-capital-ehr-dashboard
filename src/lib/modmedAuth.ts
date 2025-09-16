import axios from "axios";
import qs from "qs";
import { getModMedConfig } from "./getModMedConfig";

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getModMedToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const cfg = await getModMedConfig();

  const data = qs.stringify({
    grant_type: "password",
    username: cfg.username,
    password: cfg.password,
  });

  const res = await axios.post(
    `${cfg.baseUrl}/${cfg.firmUrlPrefix}/ema/ws/oauth2/grant`,
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-api-key": cfg.apiKey,
      },
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = now + (res.data.expires_in - 60) * 1000;

  return cachedToken;
}
