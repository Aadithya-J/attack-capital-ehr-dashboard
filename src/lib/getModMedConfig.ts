import { cookies } from 'next/headers';
import { decrypt } from './crypto';
import type { ModMedCreds } from './runtimeConfig';

const COOKIE_NAME = 'modmed_creds';
const FALLBACK_SECRET = 'local-dev-key';

export async function getModMedConfig(): Promise<ModMedCreds> {
  try {
    const cookieStore = await cookies();
    const encoded = cookieStore.get(COOKIE_NAME)?.value;
    if (encoded) {
      const json = decrypt(encoded, process.env.CRED_SECRET || FALLBACK_SECRET);
      console.log("using cookies")
      return JSON.parse(json);
    }
  } catch (_) {
    // cookies() not available or decryption failed – fall through to env
  }
  console.log("using .env")
  return {
    baseUrl: process.env.MODMED_BASE_URL || '',
    firmUrlPrefix: process.env.MODMED_FIRM_URL_PREFIX || '',
    apiKey: process.env.MODMED_API_KEY || '',
    username: process.env.MODMED_USERNAME || '',
    password: process.env.MODMED_PASSWORD || '',
  };
}
