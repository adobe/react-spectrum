/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {clamp} from '@react-aria/utils';
import {ColorChannel, ColorFormat, Color as IColor} from '@react-types/color';

interface ColorChannelRange {
  minValue: number,
  maxValue: number,
  step: number
}

export function parseColor(value: string): IColor {
  let res = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value);
  if (res) {
    return res;
  }

  throw new Error('Invalid color value: ' + value);
}

export function getColorChannelRange(channel: ColorChannel): ColorChannelRange {
  switch (channel) {
    case 'hue':
      return {minValue: 0, maxValue: 360, step: 1};
    case 'saturation':
    case 'lightness':
    case 'brightness':
      return {minValue: 0, maxValue: 100, step: 1};
    case 'red':
    case 'green':
    case 'blue':
      return {minValue: 0, maxValue: 255, step: 1};
    case 'alpha':
      return {minValue: 0, maxValue: 1, step: 0.01};
    default:
      throw new Error('Unknown color channel: ' + channel);
  }
}

abstract class Color implements IColor {
  abstract toFormat(format: ColorFormat): IColor;
  abstract toString(format: ColorFormat | 'css'): string;
  abstract clone(): Color;

  toHexInt(): number {
    return this.toFormat('rgb').toHexInt();
  }

  getChannelValue(channel: ColorChannel): number {
    if (channel in this) {
      return this[channel];
    }

    throw new Error('Unsupported color channel: ' + channel);
  }

  withChannelValue(channel: ColorChannel, value: number): IColor {
    if (channel in this) {
      let x = this.clone();
      x[channel] = value;
      return x;
    }

    throw new Error('Unsupported color channel: ' + channel);
  }
}

const HEX_REGEX = /^#(?:([0-9a-f]{3})|([0-9a-f]{6}))$/i;

// X = <negative/positive number with/without decimal places>
// before/after a comma, 0 or more whitespaces are allowed
// - rgb(X, X, X)
// - rgba(X, X, X, X)
const RGB_REGEX = /rgb\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?)\)|rgba\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d(.\d+)?)\)/;

class RGBColor extends Color {
  constructor(private red: number, private green: number, private blue: number, private alpha: number) {
    super();
  }

  static parse(value: string): RGBColor | void {
    let m;
    if ((m = value.match(HEX_REGEX))) {
      if (m[1]) {
        let r = parseInt(m[1][0] + m[1][0], 16);
        let g = parseInt(m[1][1] + m[1][1], 16);
        let b = parseInt(m[1][2] + m[1][2], 16);
        return new RGBColor(r, g, b, 1);
      } else if (m[2]) {
        let r = parseInt(m[2][0] + m[2][1], 16);
        let g = parseInt(m[2][2] + m[2][3], 16);
        let b = parseInt(m[2][4] + m[2][5], 16);
        return new RGBColor(r, g, b, 1);
      }
    } if ((m = value.match(RGB_REGEX))) {
      const [r, g, b, a] = (m[1] ?? m[2]).split(',').map(n => Number(n.trim()));
      return new RGBColor(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), clamp(a ?? 1, 0, 1));
    }
  }

  toString(format: ColorFormat | 'css') {
    switch (format) {
      case 'hex':
        return '#' + (this.red.toString(16).padStart(2, '0') + this.green.toString(16).padStart(2, '0') + this.blue.toString(16).padStart(2, '0')).toUpperCase();
      case 'hexa':
        return '#' + (this.red.toString(16).padStart(2, '0') + this.green.toString(16).padStart(2, '0') + this.blue.toString(16).padStart(2, '0') + Math.round(this.alpha * 255).toString(16).padStart(2, '0')).toUpperCase();
      case 'rgb':
        return `rgb(${this.red}, ${this.green}, ${this.blue})`;
      case 'css':
      case 'rgba':
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case 'hex':
      case 'hexa':
      case 'rgb':
      case 'rgba':
        return this;
      default:
        throw new Error('Unsupported color conversion: rgb -> ' + format);
    }
  }

  toHexInt(): number {
    return this.red << 16 | this.green << 8 | this.blue;
  }

  clone(): Color {
    return new RGBColor(this.red, this.green, this.blue, this.alpha);
  }
}

// X = <negative/positive number with/without decimal places>
// before/after a comma, 0 or more whitespaces are allowed
// - hsb(X, X%, X%)
// - hsba(X, X%, X%, X)
const HSB_REGEX = /hsb\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsba\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;

class HSBColor extends Color {
  constructor(private hue: number, private saturation: number, private brightness: number, private alpha: number) {
    super();
  }

  static parse(value: string): HSBColor | void {
    let m: RegExpMatchArray | void;
    if ((m = value.match(HSB_REGEX))) {
      const [h, s, b, a] = (m[1] ?? m[2]).split(',').map(n => Number(n.trim().replace('%', '')));
      return new HSBColor(mod(h, 360), clamp(s, 0, 100), clamp(b, 0, 100), clamp(a ?? 1, 0, 1));
    }
  }

  toString(format: ColorFormat | 'css') {
    switch (format) {
      case 'css':
        return this.toHSL().toString('css');
      case 'hsb':
        return `hsb(${this.hue}, ${this.saturation}%, ${this.brightness}%)`;
      case 'hsba':
        return `hsba(${this.hue}, ${this.saturation}%, ${this.brightness}%, ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case 'hsb':
      case 'hsba':
        return this;
      case 'hsl':
      case 'hsla':
        return this.toHSL();
      default:
        throw new Error('Unsupported color conversion: hsb -> ' + format);
    }
  }

  private toHSL(): Color {
    // determine the lightness in the range [0,100]
    var l = (2 - this.saturation / 100) * this.brightness / 2;

    // store the HSL components
    let hue = this.hue;
    let saturation = this.saturation * this.brightness / (l < 50 ? l * 2 : 200 - l * 2);
    let lightness = l;

    // correct a division-by-zero error
    if (isNaN(saturation)) {
      saturation = 0;
    }

    return new HSLColor(hue, saturation, lightness, this.alpha);
  }

  clone(): Color {
    return new HSBColor(this.hue, this.saturation, this.brightness, this.alpha);
  }
}

// X = <negative/positive number with/without decimal places>
// before/after a comma, 0 or more whitespaces are allowed
// - hsl(X, X%, X%)
// - hsla(X, X%, X%, X)
const HSL_REGEX = /hsl\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsla\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;

function mod(n, m) {
  return ((n % m) + m) % m;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HSLColor extends Color {
  constructor(private hue: number, private saturation: number, private lightness: number, private alpha: number) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parse(value: string): HSLColor | void {
    let m: RegExpMatchArray | void;
    if ((m = value.match(HSL_REGEX))) {
      const [h, s, l, a] = (m[1] ?? m[2]).split(',').map(n => Number(n.trim().replace('%', '')));
      return new HSLColor(mod(h, 360), clamp(s, 0, 100), clamp(l, 0, 100), clamp(a ?? 1, 0, 1));
    }
  }

  toString(format: ColorFormat | 'css') {
    switch (format) {
      case 'hsl':
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
      case 'css':
      case 'hsla':
        return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case 'hsl':
      case 'hsla':
        return this;
      default:
        throw new Error('Unsupported color conversion: hsl -> ' + format);
    }
  }

  clone(): Color {
    return new HSLColor(this.hue, this.saturation, this.lightness, this.alpha);
  }
}
