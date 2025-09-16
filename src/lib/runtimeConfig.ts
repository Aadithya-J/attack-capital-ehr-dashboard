import { encrypt, decrypt } from './crypto';

export interface ModMedCreds {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

const COOKIE_NAME = 'modmed_creds';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// ------ Browser helpers (client-side) ------
export function saveCredsBrowser(creds: ModMedCreds) {
  const encoded = encrypt(JSON.stringify(creds), getSecret());
  document.cookie = `${COOKIE_NAME}=${encoded}; Path=/; Max-Age=${MAX_AGE}; SameSite=Strict; Secure`;
}

export function clearCredsBrowser() {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict; Secure`;
}

export function loadCredsBrowser(): ModMedCreds | null {
  const cookie = document.cookie.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return null;
  try {
    const encoded = cookie.split('=')[1];
    const json = decrypt(encoded, getSecret());
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getSecret() {
  // Simple constant for dev encryption; replace with secure mechanism in production
  return 'local-dev-key';
}

