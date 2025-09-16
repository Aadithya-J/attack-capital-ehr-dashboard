function toBase64(str: string) {  if (typeof window !== 'undefined' && window.btoa) return window.btoa(str);
  return Buffer.from(str, 'utf8').toString('base64');
}

function fromBase64(str: string) {
  if (typeof window !== 'undefined' && window.atob) return window.atob(str);
  return Buffer.from(str, 'base64').toString('utf8');
}

export function encrypt(plain: string, _secret: string): string {
  return toBase64(plain);
}

export function decrypt(encoded: string, _secret: string): string {
  return fromBase64(encoded);
}
