import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import {readFileSync} from 'fs';

// Resolves the version from the nearest package.json above the CLI entry point.
// Both the npm-published layout (dist/<lib>/src/index.js) and the .mcpb bundle
// layout (server/<lib>/src/index.js) place package.json three levels up.
export function readPackageVersion(entryUrl: string): string {
  const entryDir = dirname(fileURLToPath(entryUrl));
  const pkgPath = join(entryDir, '..', '..', '..', 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (typeof pkg.version === 'string' && pkg.version.length > 0) {
      return pkg.version;
    }
  } catch {
    // fall through
  }
  return '0.0.0';
}

export function errorToString(err: unknown): string {
  if (err && typeof err === 'object' && 'stack' in err && typeof (err as any).stack === 'string') {
    return (err as any).stack as string;
  }
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as any).message === 'string'
  ) {
    return (err as any).message as string;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

// Default base URLs for each library
const DEFAULT_S2_BASE = 'https://react-spectrum.adobe.com';
const DEFAULT_REACT_ARIA_BASE = 'https://react-aria.adobe.com';

export function getLibraryBaseUrl(library: 's2' | 'react-aria'): string {
  if (process.env.DOCS_CDN_BASE) {
    return process.env.DOCS_CDN_BASE;
  }
  return library === 's2' ? DEFAULT_S2_BASE : DEFAULT_REACT_ARIA_BASE;
}

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
