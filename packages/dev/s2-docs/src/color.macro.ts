import {colorScale} from '../../../@react-spectrum/s2/style/tokens';
import type {MacroContext} from '@parcel/macros';
import {style} from '@react-spectrum/s2/style';
// eslint-disable-next-line rulesdir/imports
import * as tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

export function getColorScale(this: MacroContext | void, name: string, size: any = 20): [string, string][] {
  return Object.keys(colorScale(name)).map((k) => [k, colorSwatch.call(this, k, 'backgroundColor', size)]);
}

export function colorSwatch(this: MacroContext | void, color: string, type = 'backgroundColor', size: any = 20): string {
  // @ts-ignore
  return style.call(this, {'--v': {type, value: color}, backgroundColor: '--v', width: size, aspectRatio: 'square', borderRadius: 'sm', borderWidth: 1, borderColor: 'gray-1000/15', borderStyle: 'solid'});
}

/**
 * Gets the RGB values for a color token.
 * @param tokenName - The token name to look up.
 * @param mode - 'light' or 'dark' mode.
 * @returns [r, g, b] or null if not found.
 */
function getColorRgb(tokenName: string, mode: 'light' | 'dark' = 'light'): [number, number, number] | null {
  const token = (tokens as any)[tokenName];
  if (!token) {return null;}
  
  let value: string | undefined;
  if (token.sets?.[mode]?.value) {
    value = token.sets[mode].value;
  } else if (token.sets?.light?.value) {
    // Fallback to light
    value = token.sets.light.value;
  } else if (token.value) {
    value = token.value;
  }
  
  if (!value) {return null;}
  
  // Parse rgb(r, g, b) or rgba(r, g, b, a)
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  return null;
}

// Background color token mappings
const backgroundColorTokens: Record<string, string> = {
  'base': 'background-base-color',
  'layer-1': 'background-layer-1-color',
  'layer-2': 'background-layer-2-color',
  'pasteboard': 'gray-100',
  'elevated': 'background-base-color',
  'accent': 'accent-background-color-default',
  'accent-subtle': 'informative-background-color-default',
  'neutral': 'neutral-background-color-default',
  'neutral-subdued': 'neutral-subdued-background-color-default',
  'neutral-subtle': 'neutral-subtle-background-color-default',
  'negative': 'negative-background-color-default',
  'negative-subtle': 'negative-subtle-background-color-default',
  'informative': 'informative-background-color-default',
  'informative-subtle': 'informative-subtle-background-color-default',
  'positive': 'positive-background-color-default',
  'positive-subtle': 'positive-subtle-background-color-default',
  'notice': 'notice-background-color-default',
  'notice-subtle': 'notice-subtle-background-color-default',
  'gray': 'gray-subtle-background-color-default',
  'gray-subtle': 'gray-subtle-background-color-default',
  'disabled': 'disabled-background-color'
};

// Semantic and global color scale definitions
const semanticScales = ['accent-color', 'informative-color', 'negative-color', 'notice-color', 'positive-color'];
const scaleValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
const globalScales = ['gray', 'blue', 'red', 'orange', 'yellow', 'chartreuse', 'celery', 'green', 'seafoam', 'cyan', 'indigo', 'purple', 'fuchsia', 'magenta', 'pink', 'turquoise', 'brown', 'silver', 'cinnamon'];
const grayValues = [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const standardValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600];
const coloredBgScales = ['red', 'orange', 'yellow', 'chartreuse', 'celery', 'green', 'seafoam', 'cyan', 'blue', 'indigo', 'purple', 'fuchsia', 'magenta', 'pink', 'turquoise', 'cinnamon', 'brown', 'silver'];

/**
 * Generates a color map for a specific mode (light or dark).
 */
function buildColorMapForMode(mode: 'light' | 'dark'): Record<string, [number, number, number]> {
  const colorMap: Record<string, [number, number, number]> = {};
  
  // Add background colors
  for (const [name, tokenName] of Object.entries(backgroundColorTokens)) {
    const rgb = getColorRgb(tokenName, mode);
    if (rgb) {
      colorMap[name] = rgb;
    }
  }
  
  // Add semantic color scales
  for (const scale of semanticScales) {
    for (const value of scaleValues) {
      const tokenName = `${scale}-${value}`;
      const displayName = `${scale.replace('-color', '')}-${value}`;
      const rgb = getColorRgb(tokenName, mode);
      if (rgb) {
        colorMap[displayName] = rgb;
      }
    }
  }
  
  // Add global color scales
  for (const scale of globalScales) {
    const values = scale === 'gray' ? grayValues : standardValues;
    for (const value of values) {
      const tokenName = `${scale}-${value}`;
      const rgb = getColorRgb(tokenName, mode);
      if (rgb) {
        colorMap[tokenName] = rgb;
      }
    }
  }
  
  // Add colored background colors (with -subtle variants)
  for (const scale of coloredBgScales) {
    // Main color - use a middle value from the scale
    const mainRgb = getColorRgb(`${scale}-800`, mode);
    if (mainRgb) {
      colorMap[scale] = mainRgb;
    }
    // Subtle variant - use a lighter value
    const subtleRgb = getColorRgb(`${scale}-200`, mode);
    if (subtleRgb) {
      colorMap[`${scale}-subtle`] = subtleRgb;
    }
  }
  
  return colorMap;
}

export interface ColorHexMaps {
  light: Record<string, [number, number, number]>,
  dark: Record<string, [number, number, number]>
}

/**
 * Generates mappings of color names to their RGB values for hex code matching.
 * Returns both light and dark mode maps for runtime selection.
 */
export function getColorHexMap(): ColorHexMaps {
  return {
    light: buildColorMapForMode('light'),
    dark: buildColorMapForMode('dark')
  };
}
