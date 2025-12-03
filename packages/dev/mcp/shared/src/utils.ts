export function errorToString(err: unknown): string {
  if (err && typeof err === 'object' && 'stack' in err && typeof (err as any).stack === 'string') {
    return (err as any).stack as string;
  }
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message as string;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// CDN base for docs. Can be overridden via env variable.
export const DEFAULT_CDN_BASE = process.env.DOCS_CDN_BASE ?? 'https://react-spectrum.adobe.com/beta';

export async function fetchText(url: string, timeoutMs = 15000): Promise<string> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs).unref?.();
  try {
    const res = await fetch(url, {signal: ctrl.signal, cache: 'no-store'} as any);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(id as any);
  }
}
