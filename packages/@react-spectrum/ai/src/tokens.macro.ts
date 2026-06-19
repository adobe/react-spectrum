import {color} from '@react-spectrum/s2/style';
import tokens from './tokens.merged.json';

export function token(name: string) {
  let token = name.split('.').reduce((acc, curr) => {
    let res = acc[curr];
    if (res == null) {
      throw new Error(`Token ${name} not found`);
    }
    return res;
  }, tokens) as any;
  if (token?.light && token.dark) {
    return `light-dark(${token.light}, ${token.dark})`;
  } else if (token?.light) {
    return token.light;
  } else if (token?.dark) {
    return token.dark;
  } else {
    return token.value ?? token;
  }
}

export function alphaToGrayscale(name: string) {
  let token = name.split('.').reduce((acc, curr) => acc[curr], tokens) as any;
  let match = token.match(/^rgba\((.+?),\s*(.+?),\s*(.+?),\s*(.+?)\)$/);
  if (match && match[1] === match[2] && match[2] === match[3]) {
    return [`rgb(${match[1]}, ${match[2]}, ${match[3]})`, Number(match[4]) * 100];
  } else {
    return token;
  }
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
    --con-bg-stop-1: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-1`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
    --con-bg-stop-2: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-2`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
    --con-bg-stop-3: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-3`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
    --con-bg-stop-4: ${stop('container.bg.default', `container.gradient.con-bg.${generating}.stop-4`, `container.opacity.con-bg.${generating}.${state}-${variant}`)};
  `;
}
