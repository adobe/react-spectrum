import {color} from '@react-spectrum/s2/style';
import tokens from './tokens.merged.json';

// Colors below this OKLCH chroma are treated as neutral (white/black/gray) and
// left untouched — rotating their hue would tint a surface that's meant to be gray.
const NEUTRAL_CHROMA = 0.015;

function srgbToLinear(c: number) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  let lr = srgbToLinear(r),
    lg = srgbToLinear(g),
    lb = srgbToLinear(b);
  let l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  let m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  let s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  let l_ = Math.cbrt(l),
    m_ = Math.cbrt(m),
    s_ = Math.cbrt(s);
  let L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  let A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  let B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  let C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) {
    H += 360;
  }
  return [L, C, H];
}

function parseRgb(value: string): [number, number, number] {
  let match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Expected an rgb color, got: ${value}`);
  }
  let [r, g, b] = match[1].split(',').map(x => parseFloat(x.trim()));
  return [r, g, b];
}

// The brand anchor: the fuchsia primary that the rest of the palette fans out
// from, taken from the most saturated brand-colored token (the outer border hue).
// Every hue-bearing token stores its hue as an offset from this anchor, so the
// whole palette can be rotated to a new brand color by overriding the --brand
// custom property.
const BRAND_REF = rgbToOklch(
  ...parseRgb(tokens['outer-border'].gradient['ob-hue']['stop-1'].light)
);
const BRAND_REF_HUE = BRAND_REF[2];

// The default --brand color, derived from the same anchor token so the default
// theme renders identically to the source design tokens.
export function defaultBrand() {
  let [L, C, H] = BRAND_REF;
  return `oklch(${Math.round(L * 1e4) / 1e4} ${Math.round(C * 1e4) / 1e4} ${Math.round(H * 10) / 10})`;
}

// Builds a CSS relative color derived from --brand: it keeps the given lightness
// and chroma but takes the hue from the brand color (offset by hueOffset degrees).
// This preserves each token's role while letting the brand drive the overall hue.
export function brand(l: number, c: number, hueOffset: number, alpha = 1) {
  let hue = hueOffset === 0 ? 'h' : `calc(h + ${hueOffset})`;
  let a = alpha < 1 ? ` / ${alpha}` : '';
  return `oklch(from var(--brand) ${l} ${c} ${hue}${a})`;
}

// Converts a single token color value to a brand-relative color, unless it's a
// neutral (kept as-is) or not a color at all (e.g. an opacity number, kept as-is).
function convertColor(value: any) {
  if (typeof value !== 'string') {
    return value;
  }
  let match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) {
    return value;
  }
  let parts = match[1].split(',').map(x => parseFloat(x.trim()));
  let [r, g, b] = parts;
  let alpha = parts[3] ?? 1;
  let [L, C, H] = rgbToOklch(r, g, b);
  if (C < NEUTRAL_CHROMA) {
    return value;
  }
  let offset = Math.round((H - BRAND_REF_HUE) * 10) / 10;
  return brand(Math.round(L * 1e4) / 1e4, Math.round(C * 1e4) / 1e4, offset, alpha);
}

// Wraps a color value in a `var(--_t-<name>, <value>)` marker so the token name
// survives in the authored CSS for tooling (e.g. the exploded-layer story). The
// custom property is never defined, so the fallback (the real value) is always
// used and rendering is unchanged. Only applied to actual colors — numeric tokens
// (opacities) are returned untouched so arithmetic on them still works.
const COLOR_FN = /(?:oklch|oklab|rgba?|hsla?|hwb|lab|lch|color)\(/;
function markColor(name: string, value: any) {
  if (typeof value !== 'string' || !COLOR_FN.test(value)) {
    return value;
  }
  return `var(--_t-${name.replace(/\./g, '__')}, ${value})`;
}

export function token(name: string) {
  let token = name.split('.').reduce((acc, curr) => {
    let res = acc[curr];
    if (res == null) {
      throw new Error(`Token ${name} not found`);
    }
    return res;
  }, tokens) as any;
  if (token?.light && token.dark) {
    return markColor(name, `light-dark(${convertColor(token.light)}, ${convertColor(token.dark)})`);
  } else if (token?.light) {
    return markColor(name, convertColor(token.light));
  } else if (token?.dark) {
    return markColor(name, convertColor(token.dark));
  } else {
    return markColor(name, convertColor(token.value ?? token));
  }
}

export function spectrumToken(name: any) {
  let [tokenName, opacity] = name.split('/');
  let value = color(tokenName);
  if (value.startsWith('light-dark(')) {
    let parts = value.slice(11, -1).replace(/rgb\(.+?\)/g, m => convertColor(m));
    value = `light-dark(${parts})`;
  } else {
    value = convertColor(value);
  }
  if (opacity != null) {
    value = `rgb(from ${value} r g b / ${opacity}%)`;
  }
  return markColor(tokenName, value);
}

export function mix(gray: string, stop: string, opacity: string) {
  let stopColor = token(stop);
  let stopOpacity = token(opacity);
  return `color-mix(in srgb, ${gray}, ${stopColor} ${stopOpacity}%)`;
}

export function stop(gray: string, stop: string, opacity: string) {
  return `light-dark(${mix('white', stop + '.light', opacity + '.light')}, ${mix(color('gray-75'), stop + '.dark', opacity + '.dark')})`;
}

export function defineProperties(this: any, css: string) {
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: css
    });
  }
}

export function stops(generating: string, state: string, variant: string) {
  return `
    --con-hue-opacity: ${token(`container.opacity.con-hue.${generating}.${state}-${variant}`)}%;
    --bg-stop-1: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-1`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
    --bg-stop-2: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-2`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
    --bg-stop-3: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-3`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
    --bg-stop-4: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-4`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
  `;
}

export function outerBorderStops(variant: string) {
  let border = token('outer-border.gradient.ob-border.stop-1');
  return `
    --outer-border-hue: light-dark(
      ${outerBorderStop(2, variant, 'light', 1)},
      ${outerBorderStop(2, variant, 'dark', 1)}
    );
    --bg-stop-1: light-dark(
      ${outerBorderStop(1, variant, 'light')},
      ${variant === 'prominent' ? outerBorderStop(1, variant, 'dark') : border}
    );
    --bg-stop-2: light-dark(
      ${outerBorderStop(2, variant, 'light')},
      ${variant === 'prominent' ? outerBorderStop(2, variant, 'dark') : border}
    );
    --bg-stop-3: light-dark(
      ${outerBorderStop(3, variant, 'light')},
      ${variant === 'prominent' ? outerBorderStop(3, variant, 'dark') : border}
    );
  `;
}

function outerBorderStop(stop: number, variant: string, colorScheme: string, div = 10) {
  let opacity = token(
    `outer-border.opacity.ob-hue-${variant}.${variant === 'prominent' ? 'value' : colorScheme}`
  );
  if (colorScheme === 'light') {
    opacity = opacity / div;
  }
  return `rgb(from ${token(`outer-border.gradient.ob-hue.stop-${stop}.${colorScheme}`)} r g b / ${opacity}%)`;
}
