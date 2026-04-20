export interface WisdomPayload {
  q: string;
  t?: number;
}

function toBase64Url(str: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  const utf8 = new TextEncoder().encode(str);
  let bin = '';
  utf8.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  if (typeof window === 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeWisdomId(quote: string): string {
  const payload: WisdomPayload = { q: quote.slice(0, 480), t: Date.now() };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeWisdomId(id: string): WisdomPayload | null {
  try {
    const json = fromBase64Url(id);
    const payload = JSON.parse(json) as WisdomPayload;
    if (typeof payload?.q !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

export function extractFirstQuote(text: string): string | null {
  const match = text.match(/[""']([^""']{20,240})[""']/) || text.match(/"([^"]{20,240})"/);
  return match ? match[1].trim() : null;
}
