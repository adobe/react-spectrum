import {baseColors, resolveColorToken, fontSize, fontWeight, themeProperties} from './spectrum-theme';
import {getToken, colorToken} from './tokens';

// Types
export type ThemeMode = 'light' | 'dark';
export type DeviceKind = 'desktop' | 'mobile';
export type ThemeDeviceKey = `${ThemeMode}-${DeviceKind}`;

// Convert rgb/rgba or select named colors to hex. Returns lowercase hex or null if unsupported.
export function toHex(css: string): string | null {
  const rgb = css.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  const rgba = css.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-1](?:\.\d+)?)\s*\)$/i);
  const named = css.trim().toLowerCase();

  function to2(n: number) {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  }

  function compress(hex: string): string {
    if (hex.length === 7) {
      const r = hex[1] === hex[2];
      const g = hex[3] === hex[4];
      const b = hex[5] === hex[6];
      if (r && g && b) {
        return '#' + hex[1] + hex[3] + hex[5];
      }
    } else if (hex.length === 9) {
      const r = hex[1] === hex[2];
      const g = hex[3] === hex[4];
      const b = hex[5] === hex[6];
      const a = hex[7] === hex[8];
      if (r && g && b && a) {
        return '#' + hex[1] + hex[3] + hex[5] + hex[7];
      }
    }
    return hex;
  }

  if (rgb) {
    const [r, g, b] = [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)];
    return compress(('#' + to2(r) + to2(g) + to2(b)).toLowerCase());
  }

  if (rgba) {
    const [r, g, b, aStr] = [parseInt(rgba[1], 10), parseInt(rgba[2], 10), parseInt(rgba[3], 10), parseFloat(rgba[4])];
    const a = Math.max(0, Math.min(255, Math.round(aStr * 255)));
    return compress(('#' + to2(r) + to2(g) + to2(b) + to2(a)).toLowerCase());
  }

  if (named === 'black') return '#000';
  if (named === 'white') return '#fff';
  if (named === 'transparent') return '#0000';

  return null;
}

export function resolveContainerBg(theme: ThemeMode): string {
  const t = colorToken('background-base-color');
  return theme === 'light' ? t.light : t.dark;
}

export function replaceContainerBgRefs(input: string, theme: ThemeMode): string {
  let output = input.replace(/var\(\s*--s2-container-bg\s*\)/g, resolveContainerBg(theme));
  output = output.replace(/self\(\s*backgroundColor\s*,\s*([^\)]+)\)/g, (_m, inner) => String(inner).trim());
  return output;
}

export function computeColorMap(theme: ThemeMode): Record<string, string | [string, string]> {
  let out: Record<string, string | [string, string]> = {};
  for (let [name, token] of Object.entries(baseColors)) {
    if (typeof token === 'string') {
      const value = replaceContainerBgRefs(token, theme);
      const hex = toHex(value);
      out[name] = hex ? [value, hex] as [string, string] : value;
      continue;
    }
    let resolved = resolveColorToken(token as any);
    const value = replaceContainerBgRefs(theme === 'light' ? resolved.light : resolved.dark, theme);
    const hex = toHex(value);
    out[name] = hex ? [value, hex] as [string, string] : value;
  }
  return out;
}

export function computeTypographyMap(baseFontSize: number): Record<string, string> {
  let out: Record<string, string> = {};
  for (let [name, index] of Object.entries(fontSize)) {
    let px = Math.round(baseFontSize * Math.pow(1.125, index as number));
    out[name] = `${px}px`;
  }
  return out;
}

const stripVars = (s: string) => s.replace(/var\(\s*--[a-zA-Z0-9_-]+\s*,\s*([^\)]+)\)/g, (_m, fb) => String(fb).trim());

export function mapStringValues(input: unknown, transform: (v: string) => string = v => v): Record<string, string> | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0 || !entries.every(([, v]) => typeof v === 'string')) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of entries) out[String(k)] = transform(String(v));
  return out;
}

export function cloneArrayIfAny(input: unknown): unknown[] | undefined {
  return Array.isArray(input) ? input.slice() : undefined;
}

export function computeCommonTokens() {
  const props = (themeProperties as any).properties as Record<string, unknown>;
  const {transitionProperty, timingFunction, boxShadow, filter, ...rest} = props as Record<string, unknown>;

  // Special handling
  const transitionPropertyValues = mapStringValues(transitionProperty, stripVars) ?? {};
  const timingFunctionValues = mapStringValues(timingFunction) ?? {};
  const boxShadowValues = mapStringValues(boxShadow) ?? {};
  const filterValues = mapStringValues(filter) ?? {};

  // Remaining properties
  const processedRest: Record<string, any> = {};
  for (const [name, def] of Object.entries(rest)) {
    const arr = cloneArrayIfAny(def);
    if (arr) { processedRest[name] = arr; continue; }
    const map = mapStringValues(def, stripVars);
    if (map) { processedRest[name] = map; }
  }

  return {
    transitionProperty: transitionPropertyValues,
    timingFunction: timingFunctionValues,
    boxShadow: boxShadowValues,
    filter: filterValues,
    ...processedRest
  };
}

export function computeFontFamilyMap(): Record<string, string> {
  const families = (themeProperties as any).properties.fontFamily as Record<string, unknown>;
  const out: Record<string, string> = {};
  const resolveVars = (input: string): string => {
    return input.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^\)]+))?\)/g, (_m, varName, fb) => {
      let tokenKey = (varName as string).replace(/^--s2-/, '');
      try {
        const tokenValue = getToken(tokenKey as any) as unknown as string;
        if (typeof tokenValue === 'string' && tokenValue.trim()) {
          return tokenValue;
        }
      } catch {}
      return fb ? String(fb).trim() : '';
    });
  };
  for (const [name, value] of Object.entries(families)) {
    if (typeof value === 'string') {
      out[name] = resolveVars(value);
      continue;
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (typeof obj.default === 'string') {
        out[name] = resolveVars(obj.default as string);
        continue;
      }
      const fallback = Object.values(obj).find(v => typeof v === 'string') as string | undefined;
      if (fallback) {
        out[name] = resolveVars(fallback);
      }
    }
  }
  return out;
}

export function computeFontWeightMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(fontWeight as Record<string, unknown>)) {
    if (typeof value === 'string') {
      out[name] = value as string;
    } else if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (typeof obj.default === 'string') {
        out[name] = obj.default as string;
      }
    }
  }
  return out;
}

export function parseMinWidthRem(query: string): string | null {
  const m = query.match(/min-width:\s*([^\)]+)\)/);
  return m ? m[1].trim() : null;
}

export function remStringToPx(rem: string): string | null {
  const mm = rem.match(/^(-?\d*\.?\d+)rem$/i);
  if (!mm) return null;
  const val = parseFloat(mm[1]);
  if (Number.isNaN(val)) return null;
  return `${Math.round(val * 16)}px`;
}

export function computeBreakpoints(): Record<string, [string, string] | string> {
  const out: Record<string, [string, string] | string> = {};
  const conditions = (themeProperties as any).conditions as Record<string, string>;
  for (const [name, cond] of Object.entries(conditions)) {
    if (!cond.startsWith('@media')) continue;
    const rem = parseMinWidthRem(cond);
    if (!rem) continue;
    const px = remStringToPx(rem);
    out[name] = px ? [rem, px] as [string, string] : rem;
  }
  return out;
}

export function computeTextDecorationMetrics(): Record<string, string> {
  return {
    underlineThickness: getToken('text-underline-thickness' as any),
    underlineGap: getToken('text-underline-gap' as any)
  };
}

export function generateTokenValueMap(theme: ThemeMode, device: DeviceKind): any {
  const desktopBase = 14;
  const mobileBase = 17;
  const common = computeCommonTokens();
  return {
    colors: computeColorMap(theme),
    typography: computeTypographyMap(device === 'desktop' ? desktopBase : mobileBase),
    fontFamily: computeFontFamilyMap(),
    fontWeight: computeFontWeightMap(),
    breakpoints: computeBreakpoints(),
    textDecoration: computeTextDecorationMetrics(),
    ...common
  };
}

export function remToPx(rem: string): string | null {
  if (typeof rem !== 'string') return null;
  const m = rem.trim().match(/^(-?\d*\.?\d+)rem$/i);
  if (!m) return null;
  const val = parseFloat(m[1]);
  if (Number.isNaN(val)) return null;
  const px = Math.round(val * 16);
  return `${px}px`;
}

export type TokenPayload = Record<string, any>;

/**
 * Merge spacing values with their px counterparts so each entry is an array of [rem, px].
 * Also applies to negativeSpacing.
 * Keeps existing spacingPx and negativeSpacingPx properties for backward compatibility.
 */
export function addPxToSpacing(payload: TokenPayload): TokenPayload {
  const enhanced: TokenPayload = {...payload};

  if (payload?.spacing) {
    const mergedSpacing: Record<string, [string, string] | string> = {};
    for (const key of Object.keys(payload.spacing)) {
      const remVal = payload.spacing[key];
      const pxVal = remToPx(remVal);
      mergedSpacing[key] = pxVal ? [remVal, pxVal] as [string, string] : remVal;
    }
    enhanced.spacing = mergedSpacing;
  }

  if (payload?.negativeSpacing) {
    const mergedNegativeSpacing: Record<string, [string, string] | string> = {};
    for (const key of Object.keys(payload.negativeSpacing)) {
      const remVal = payload.negativeSpacing[key];
      const pxVal = remToPx(remVal);
      mergedNegativeSpacing[key] = pxVal ? [remVal, pxVal] as [string, string] : remVal;
    }
    enhanced.negativeSpacing = mergedNegativeSpacing;
  }

  return enhanced;
}
