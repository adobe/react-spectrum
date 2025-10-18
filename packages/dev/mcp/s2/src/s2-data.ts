import {fileURLToPath} from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let iconIdCache: string[] | null = null;
let illustrationIdCache: string[] | null = null;
let iconAliasesCache: Record<string, string[]> | null = null;
let illustrationAliasesCache: Record<string, string[]> | null = null;

function readBundledJson(filename: string): any | null {
  try {
    // Go up from s2/src/ to dist/, then to data/
    const p = path.resolve(__dirname, '..', '..', 'data', filename);
    if (!fs.existsSync(p)) {return null;}
    const txt = fs.readFileSync(p, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export function listIconNames(): string[] {
  if (iconIdCache) {return iconIdCache;}
  const bundled = readBundledJson('icons.json');
  return (iconIdCache = Array.isArray(bundled) ? bundled.slice().sort((a, b) => a.localeCompare(b)) : []);
}

export function listIllustrationNames(): string[] {
  if (illustrationIdCache) {return illustrationIdCache;}
  const bundled = readBundledJson('illustrations.json');
  return (illustrationIdCache = Array.isArray(bundled) ? bundled.slice().sort((a, b) => a.localeCompare(b)) : []);
}

export async function loadIconAliases(): Promise<Record<string, string[]>> {
  if (iconAliasesCache) {return iconAliasesCache;}
  const bundled = readBundledJson('iconAliases.json');
  return (iconAliasesCache = (bundled && typeof bundled === 'object') ? bundled : {});
}

export async function loadIllustrationAliases(): Promise<Record<string, string[]>> {
  if (illustrationAliasesCache) {return illustrationAliasesCache;}
  const bundled = readBundledJson('illustrationAliases.json');
  return (illustrationAliasesCache = (bundled && typeof bundled === 'object') ? bundled : {});
}
