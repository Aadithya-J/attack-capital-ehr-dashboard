interface ModMedCreds {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

// store in global to persist across hot reload
const g = globalThis as any;
if (!g.__runtimeCreds) {
  g.__runtimeCreds = null as ModMedCreds | null;
}

export function setRuntimeCreds(creds: ModMedCreds) {
  g.__runtimeCreds = creds;
}

export function getRuntimeCreds(): ModMedCreds | null {
  return g.__runtimeCreds;
}
