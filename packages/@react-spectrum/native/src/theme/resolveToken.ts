import {defaultTheme} from './tokens';
import type {NativeTheme, SpectrumTokenPath} from './types';

export function resolveToken(path: SpectrumTokenPath, theme: NativeTheme = defaultTheme): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key];
    }

    return undefined;
  }, theme);
}
