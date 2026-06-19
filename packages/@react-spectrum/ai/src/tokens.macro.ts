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
