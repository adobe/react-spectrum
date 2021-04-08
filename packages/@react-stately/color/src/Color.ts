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
import {ColorChannel, ColorChannelRange, ColorFormat, Color as IColor} from '@react-types/color';
import deltaE from 'delta-e';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {MessageDictionary} from '@internationalized/message';
import {NumberFormatter} from '@internationalized/number';

const messages = new MessageDictionary(intlMessages);

/** Parses a color from a string value. Throws an error if the string could not be parsed. */
export function parseColor(value: string): IColor {
  let res = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value);
  if (res) {
    return res;
  }

  throw new Error('Invalid color value: ' + value);
}

function toXYZ(color:Color): {x: number, y: number, z: number} {
  let rgb = color.toFormat('rgb'),
    r = rgb.getChannelValue('red') / 255,
    g = rgb.getChannelValue('green')  / 255,
    b = rgb.getChannelValue('blue') / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) * 100 / 95.047,
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b,
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) * 100 / 108.883;
  return {x, y, z};
}

function toLAB(color:Color): {L: number, A: number, B: number} {
  let {x, y, z} = toXYZ(color);
  const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 0.1379,
    fy = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 0.1379,
    fz = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 0.1379,
    L = (116 * fy - 16) / 100.00,
    A = (500 * (fx - fy) + 0x80) / 0xFF,
    B = (200 * (fy - fz) + 0x80) / 0xFF;
  return {L, A, B};
}

abstract class Color implements IColor {
  abstract toFormat(format: ColorFormat): IColor;
  abstract toString(format: ColorFormat | 'css'): string;
  abstract clone(): Color;
  abstract getChannelRange(channel: ColorChannel): ColorChannelRange;
  abstract formatChannelValue(channel: ColorChannel, locale: string): string;

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

  getChannelName(channel: ColorChannel, locale: string) {
    return messages.getStringForLocale(channel, locale);
  }

  getColorSpace(): ColorFormat {
    return null;
  }

  getDeltaE(color:Color) {
    return deltaE.getDeltaE00(toLAB(this), toLAB(color));
  }

  getColorName(locale:string): string {
    let name = COLOR_NAMES_MAP[this.toFormat('rgb').toString('hex')];
    let deltaE = name ? 0 : Infinity;
    if (!name) {
      for (const [key, value] of Object.entries(COLOR_NAMES_MAP)) {
        const newDeltaE = this.getDeltaE(parseColor(key));
        if (newDeltaE < deltaE) {
          name = value;
          deltaE = newDeltaE;
        }
      }
    }
    return name && deltaE <= 0.1 ? messages.getStringForLocale(name, locale) : undefined;
  }

  getHueName(locale:string): string {
    let hue = this.toFormat('hsb').getChannelValue('hue');
    let name = HUE_NAMES_MAP[hue];
    if (!name) {
      for (const [key, value] of Object.entries(HUE_NAMES_MAP)) {
        if (Math.abs(Number(key) - hue) < 15 / 2) {
          name = value;
          break;
        }
      }
    }
    return name ? messages.getStringForLocale(name, locale) : undefined;
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
      case 'hsb':
      case 'hsba':
        return this.toHSB();
      case 'hsl':
      case 'hsla':
        return this.toHSL();
      default:
        throw new Error('Unsupported color conversion: rgb -> ' + format);
    }
  }

  toHexInt(): number {
    return this.red << 16 | this.green << 8 | this.blue;
  }

  private toHSB(): Color {
    let r = this.red / 255;
    let g = this.green / 255;
    let b = this.blue / 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h: number;
    let s: number;
    let d = max - min;

    s = max === 0 ? 0 : d / max;

    if (d === 0) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: 
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return new HSBColor(
      h * 360,
      s * 100,
      b * 100,
      this.alpha
    );
  }

  private toHSL(): Color {
    let r = this.red / 255;
    let g = this.green / 255;
    let b = this.blue / 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h: number;
    let s: number;
    let l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = d / (l < .5 ? max + min : 2 - max - min);

      switch (max) {
        case r: 
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return new HSLColor(
      h * 360,
      s * 100,
      l * 100,
      this.alpha);
  }

  clone(): Color {
    return new RGBColor(this.red, this.green, this.blue, this.alpha);
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
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

  formatChannelValue(channel: ColorChannel, locale: string) {
    let options: Intl.NumberFormatOptions;
    let value = this.getChannelValue(channel);
    switch (channel) {
      case 'red':
      case 'green':
      case 'blue':
        options = {style: 'decimal'};
        break;
      case 'alpha':
        options = {style: 'percent'};
        break;
      default:
        throw new Error('Unknown color channel: ' + channel);
    }
    return new NumberFormatter(locale, options).format(value);
  }

  getColorSpace(): ColorFormat {
    return 'rgb';
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
        return `hsb(${this.hue}, ${Math.round(this.saturation)}%, ${Math.round(this.brightness)}%)`;
      case 'hsba':
        return `hsba(${this.hue}, ${Math.round(this.saturation)}%, ${Math.round(this.brightness)}%, ${this.alpha})`;
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
      case 'rgb':
      case 'rgba':
        return this.toRGB();
      default:
        throw new Error('Unsupported color conversion: hsb -> ' + format);
    }
  }

  /**
   * Converts a HSB color to HSL.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL.
   * @returns An HSLColor object.
   */
  private toHSL(): Color {
    let s = this.saturation / 100;
    let v = this.brightness / 100;
    let l = v * (1 - s / 2);
    s = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l); 

    return new HSLColor(
      this.hue,
      s * 100,
      l * 100,
      this.alpha
    );
  }

  /**
   * Converts a HSV color value to RGB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative.
   * @returns An RGBColor object.
   */
  private toRGB(): Color {
    let h = this.hue;
    let s = this.saturation / 100;
    let v = this.brightness / 100;
    let fn = (n: number, k = (n + h / 60) % 6) => v - s * v * Math.max(Math.min(k, 4 - k, 1), 0);
    return new RGBColor(
      Math.round(fn(5) * 255),
      Math.round(fn(3) * 255),
      Math.round(fn(1) * 255),
      this.alpha
    );
  }

  clone(): Color {
    return new HSBColor(this.hue, this.saturation, this.brightness, this.alpha);
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case 'hue':
        return {minValue: 0, maxValue: 360, step: 1};
      case 'saturation':
      case 'brightness':
        return {minValue: 0, maxValue: 100, step: 1};
      case 'alpha':
        return {minValue: 0, maxValue: 1, step: 0.01};
      default:
        throw new Error('Unknown color channel: ' + channel);
    }
  }

  formatChannelValue(channel: ColorChannel, locale: string) {
    let options: Intl.NumberFormatOptions;
    let value = this.getChannelValue(channel);
    switch (channel) {
      case 'hue':
        options = {style: 'unit', unit: 'degree', unitDisplay: 'narrow'};
        break;
      case 'saturation':
      case 'brightness':
        options = {style: 'percent'};
        value /= 100;
        break;
      case 'alpha':
        options = {style: 'percent'};
        break;
      default:
        throw new Error('Unknown color channel: ' + channel);
    }
    return new NumberFormatter(locale, options).format(value);
  }

  getColorSpace(): ColorFormat {
    return 'hsb';
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
        return `hsl(${this.hue}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%)`;
      case 'css':
      case 'hsla':
        return `hsla(${this.hue}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%, ${this.alpha})`;
      default:
        return this.toFormat(format).toString(format);
    }
  }

  toFormat(format: ColorFormat): IColor {
    switch (format) {
      case 'hsl':
      case 'hsla':
        return this;
      case 'hsb':
      case 'hsba':
        return this.toHSB();
      case 'rgb':
      case 'rgba':
        return this.toRGB();
      default:
        throw new Error('Unsupported color conversion: hsl -> ' + format);
    }
  }

  /**
   * Converts a HSL color to HSB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_HSV.
   * @returns An HSBColor object.
   */
  private toHSB(): Color {
    let s = this.saturation / 100;
    let l = this.lightness / 100;
    let v = l + s * Math.min(l, 1 - l);
    s = v === 0 ? 0 : 2 * (1 - l / v);
    return new HSBColor(
      this.hue,
      s * 100,
      v * 100,
      this.alpha
    );
  }

  /**
   * Converts a HSL color to RGB.
   * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative.
   * @returns An RGBColor object.
   */
  private toRGB(): Color {
    let h = this.hue;
    let s = this.saturation / 100;
    let l = this.lightness / 100;
    let a = s * Math.min(l, 1 - l);
    let fn = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return new RGBColor(
      Math.round(fn(0) * 255),
      Math.round(fn(8) * 255),
      Math.round(fn(4) * 255),
      this.alpha
    );
  }

  clone(): Color {
    return new HSLColor(this.hue, this.saturation, this.lightness, this.alpha);
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case 'hue':
        return {minValue: 0, maxValue: 360, step: 1};
      case 'saturation':
      case 'lightness':
        return {minValue: 0, maxValue: 100, step: 1};
      case 'alpha':
        return {minValue: 0, maxValue: 1, step: 0.01};
      default:
        throw new Error('Unknown color channel: ' + channel);
    }
  }

  formatChannelValue(channel: ColorChannel, locale: string) {
    let options: Intl.NumberFormatOptions;
    let value = this.getChannelValue(channel);
    switch (channel) {
      case 'hue':
        options = {style: 'unit', unit: 'degree', unitDisplay: 'narrow'};
        break;
      case 'saturation':
      case 'lightness':
        options = {style: 'percent'};
        value /= 100;
        break;
      case 'alpha':
        options = {style: 'percent'};
        break;
      default:
        throw new Error('Unknown color channel: ' + channel);
    }
    return new NumberFormatter(locale, options).format(value);
  }

  getColorSpace(): ColorFormat {
    return 'hsl';
  }
}

const BANG_COLOR_NAMES = {
  '#FFF6F6': 'pinkish_white',
  '#FFE2E2': 'very_pale_pink',
  '#FFC2C2': 'pale_pink',
  '#FF9E9E': 'lightpink',
  '#FF6565': 'light_brilliant_red',
  '#FF0000': 'luminous_vivid_red',
  '#E7DADA': 'pinkish_gray',
  '#E7B8B8': 'pale_grayish_pink',
  '#E78B8B': 'pink',
  '#E75151': 'brilliant_red',
  '#E70000': 'vivid_red',
  '#A89C9C': 'reddish_gray',
  '#A87D7D': 'grayish_red',
  '#A84A4A': 'moderate_red',
  '#A80000': 'strong_red',
  '#595353': 'reddish_brownish_gray',
  '#594242': 'dark_grayish_reddish_brown',
  '#592727': 'reddish_brown',
  '#590000': 'deep_reddish_brown',
  '#1D1A1A': 'reddish_brownish_black',
  '#1D1111': 'very_reddish_brown',
  '#1D0000': 'very_deep_reddish_brown',
  '#FFC9C2': 'pale_scarlet',
  '#FFAA9E': 'very_light_scarlet',
  '#FF7865': 'light_brilliant_scarlet',
  '#FF2000': 'luminous_vivid_scarlet',
  '#E7968B': 'light_scarlet',
  '#E76451': 'brilliant_scarlet',
  '#E71D00': 'vivid_scarlet',
  '#A8554A': 'moderate_scarlet',
  '#A81500': 'strong_scarlet',
  '#592D27': 'dark_scarlet',
  '#590B00': 'deep_scarlet',
  '#FFE9E2': 'very_pale_vermilion',
  '#FFD1C2': 'pale_vermilion',
  '#FFB69E': 'very_light_vermilion',
  '#FF8B65': 'light_brilliant_vermilion',
  '#FF4000': 'luminous_vivid_vermilion',
  '#E7C4B8': 'pale_light_grayish_vermilion',
  '#E7A28B': 'light_vermilion',
  '#E77751': 'brilliant_vermilion',
  '#E73A00': 'vivid_vermilion',
  '#A8887D': 'grayish_vermilion',
  '#A8614A': 'moderate_vermilion',
  '#A82A00': 'strong_vermilion',
  '#594842': 'dark_grayish_vermilion',
  '#593427': 'dark_vermilion',
  '#591600': 'deep_vermilion',
  '#FFD9C2': 'pale_tangelo',
  '#FFC29E': 'very_light_tangelo',
  '#FF9F65': 'light_brilliant_tangelo',
  '#FF6000': 'luminous_vivid_tangelo',
  '#E7AE8B': 'light_tangelo',
  '#E78951': 'brilliant_tangelo',
  '#E75700': 'vivid_tangelo',
  '#A86D4A': 'moderate_tangelo',
  '#A83F00': 'strong_tangelo',
  '#593A27': 'dark_tangelo',
  '#592100': 'deep_tangelo',
  '#FFF0E2': 'very_pale_orange',
  '#FFE0C2': 'pale_orange',
  '#FFCF9E': 'very_light_orange',
  '#FFB265': 'light_brilliant_orange',
  '#FF8000': 'luminous_vivid_orange',
  '#E7D0B8': 'pale_light_grayish_brown',
  '#E7B98B': 'light_orange',
  '#E79C51': 'brilliant_orange',
  '#E77400': 'vivid_orange',
  '#A8937D': 'grayish_brown',
  '#A8794A': 'moderate_orange',
  '#A85400': 'strong_orange',
  '#594E42': 'dark_grayish_brown',
  '#594027': 'brown',
  '#592D00': 'deep_brown',
  '#1D1711': 'very_brown',
  '#1D0E00': 'very_deep_brown',
  '#FFE8C2': 'pale_gamboge',
  '#FFDB9E': 'very_light_gamboge',
  '#FFC565': 'light_brilliant_gamboge',
  '#FF9F00': 'luminous_vivid_gamboge',
  '#E7C58B': 'light_gamboge',
  '#E7AF51': 'brilliant_gamboge',
  '#E79100': 'vivid_gamboge',
  '#A8854A': 'moderate_gamboge',
  '#A86900': 'strong_gamboge',
  '#594627': 'dark_gamboge',
  '#593800': 'deep_gamboge',
  '#FFF8E2': 'very_pale_amber',
  '#FFF0C2': 'pale_amber',
  '#FFE79E': 'very_light_amber',
  '#FFD865': 'light_brilliant_amber',
  '#FFBF00': 'luminous_vivid_amber',
  '#E7DCB8': 'pale_light_grayish_amber',
  '#E7D08B': 'light_amber',
  '#E7C251': 'brilliant_amber',
  '#E7AE00': 'vivid_amber',
  '#A89E7D': 'grayish_amber',
  '#A8914A': 'moderate_amber',
  '#A87E00': 'strong_amber',
  '#595442': 'dark_grayish_amber',
  '#594D27': 'dark_amber',
  '#594300': 'deep_amber',
  '#FFF7C2': 'pale_gold',
  '#FFF39E': 'very_light_gold',
  '#FFEC65': 'light_brilliant_gold',
  '#FFDF00': 'luminous_vivid_gold',
  '#E7DC8B': 'light_gold',
  '#E7D551': 'brilliant_gold',
  '#E7CA00': 'vivid_gold',
  '#A89C4A': 'moderate_gold',
  '#A89300': 'strong_gold',
  '#595327': 'dark_gold',
  '#594E00': 'deep_gold',
  '#FFFFF6': 'yellowish_white',
  '#FFFFE2': 'very_pale_yellow',
  '#FFFFC2': 'pale_yellow',
  '#FFFF9E': 'very_light_yellow',
  '#FFFF65': 'light_brilliant_yellow',
  '#FFFF00': 'luminous_vivid_yellow',
  '#E7E7DA': 'light_yellowish_gray',
  '#E7E7B8': 'pale_light_grayish_olive',
  '#E7E78B': 'lightyellow',
  '#E7E751': 'brilliant_yellow',
  '#E7E700': 'vivid_yellow',
  '#A8A89C': 'yellowish_gray',
  '#A8A87D': 'grayish_olive',
  '#A8A84A': 'moderate_olive',
  '#A8A800': 'strong_olive',
  '#595953': 'dark_olivish_gray',
  '#595942': 'dark_grayish_olive',
  '#595927': 'dark_olive',
  '#595900': 'deep_olive',
  '#1D1D1A': 'yellowish_black',
  '#1D1D11': 'very_dark_olive',
  '#1D1D00': 'very_deep_olive',
  '#F7FFC2': 'pale_apple_green',
  '#F3FF9E': 'very_light_apple_green',
  '#ECFF65': 'light_brilliant_apple_green',
  '#DFFF00': 'luminous_vivid_apple_green',
  '#DCE78B': 'light_apple_green',
  '#D5E751': 'brilliant_apple_green',
  '#CAE700': 'vivid_apple_green',
  '#9CA84A': 'moderate_apple_green',
  '#93A800': 'strong_apple_green',
  '#535927': 'dark_apple_green',
  '#4E5900': 'deep_apple_green',
  '#F8FFE2': 'very_pale_lime_green',
  '#F0FFC2': 'pale_lime_green',
  '#E7FF9E': 'very_light_lime_green',
  '#D8FF65': 'light_brilliant_lime_green',
  '#BFFF00': 'luminous_vivid_lime_green',
  '#DCE7B8': 'pale_light_grayish_lime_green',
  '#D0E78B': 'light_lime_green',
  '#C2E751': 'brilliant_lime_green',
  '#AEE700': 'vivid_lime_green',
  '#9EA87D': 'grayish_lime_green',
  '#91A84A': 'moderate_lime_green',
  '#7EA800': 'strong_lime_green',
  '#545942': 'dark_grayish_lime_green',
  '#4D5927': 'dark_lime_green',
  '#435900': 'deep_lime_green',
  '#E8FFC2': 'pale_spring_bud',
  '#DBFF9E': 'very_light_spring_bud',
  '#C5FF65': 'light_brilliant_spring_bud',
  '#9FFF00': 'luminous_vivid_spring_bud',
  '#C5E78B': 'light_spring_bud',
  '#AFE751': 'brilliant_spring_bud',
  '#91E700': 'vivid_spring_bud',
  '#85A84A': 'moderate_spring_bud',
  '#69A800': 'strong_spring_bud',
  '#465927': 'dark_spring_bud',
  '#385900': 'deep_spring_bud',
  '#F0FFE2': 'very_pale_chartreuse_green',
  '#E0FFC2': 'pale_chartreuse_green',
  '#CFFF9E': 'very_light_chartreuse_green',
  '#B2FF65': 'light_brilliant_chartreuse_green',
  '#80FF00': 'luminous_vivid_chartreuse_green',
  '#D0E7B8': 'pale_light_grayish_chartreuse_green',
  '#B9E78B': 'light_chartreuse_green',
  '#9CE751': 'brilliant_chartreuse_green',
  '#74E700': 'vivid_chartreuse_green',
  '#93A87D': 'grayish_chartreuse_green',
  '#79A84A': 'moderate_chartreuse_green',
  '#54A800': 'strong_chartreuse_green',
  '#4E5942': 'dark_grayish_chartreuse_green',
  '#405927': 'dark_chartreuse_green',
  '#2D5900': 'deep_chartreuse_green',
  '#171D11': 'very_dark_chartreuse_green',
  '#0E1D00': 'very_deep_chartreuse_green',
  '#D9FFC2': 'pale_pistachio',
  '#C2FF9E': 'very_light_pistachio',
  '#9FFF65': 'light_brilliant_pistachio',
  '#60FF00': 'luminous_vivid_pistachio',
  '#AEE78B': 'light_pistachio',
  '#89E751': 'brilliant_pistachio',
  '#57E700': 'vivid_pistachio',
  '#6DA84A': 'moderate_pistachio',
  '#3FA800': 'strong_pistachio',
  '#3A5927': 'dark_pistachio',
  '#215900': 'deep_pistachio',
  '#E9FFE2': 'very_pale_harlequin',
  '#D1FFC2': 'pale_harlequin',
  '#B6FF9E': 'very_light_harlequin',
  '#8BFF65': 'light_brilliant_harlequin',
  '#40FF00': 'luminous_vivid_harlequin',
  '#C4E7B8': 'pale_light_grayish_harlequin',
  '#A2E78B': 'light_harlequin',
  '#77E751': 'brilliant_harlequin',
  '#3AE700': 'vivid_harlequin',
  '#88A87D': 'grayish_harlequin',
  '#61A84A': 'moderate_harlequin',
  '#2AA800': 'strong_harlequin',
  '#485942': 'dark_grayish_harlequin',
  '#345927': 'dark_harlequin',
  '#165900': 'deep_harlequin',
  '#C9FFC2': 'pale_sap_green',
  '#AAFF9E': 'very_light_sap_green',
  '#78FF65': 'light_brilliant_sap_green',
  '#20FF00': 'luminous_vivid_sap_green',
  '#96E78B': 'light_sap_green',
  '#64E751': 'brilliant_sap_green',
  '#1DE700': 'vivid_sap_green',
  '#55A84A': 'moderate_sap_green',
  '#15A800': 'strong_sap_green',
  '#2D5927': 'dark_sap_green',
  '#0B5900': 'deep_sap_green',
  '#F6FFF6': 'greenish_white',
  '#E2FFE2': 'very_pale_green',
  '#C2FFC2': 'palegreen',
  '#9EFF9E': 'very_light_green',
  '#65FF65': 'light_brilliant_green',
  '#00FF00': 'luminous_vivid_green',
  '#DAE7DA': 'light_greenish_gray',
  '#B8E7B8': 'pale_light_grayish_green',
  '#8BE78B': 'lightgreen',
  '#51E751': 'brilliant_green',
  '#00E700': 'vivid_green',
  '#9CA89C': 'greenish_gray',
  '#7DA87D': 'grayish_green',
  '#4AA84A': 'moderate_green',
  '#00A800': 'strong_green',
  '#535953': 'dark_greenish_gray',
  '#425942': 'dark_grayish_green',
  '#275927': 'darkgreen',
  '#005900': 'deep_green',
  '#1A1D1A': 'greenish_black',
  '#111D11': 'very_dark_green',
  '#001D00': 'very_deep_green',
  '#C2FFC9': 'pale_emerald_green',
  '#9EFFAA': 'very_light_emerald_green',
  '#65FF78': 'light_brilliant_emerald_green',
  '#00FF20': 'luminous_vivid_emerald_green',
  '#8BE796': 'light_emerald_green',
  '#51E764': 'brilliant_emerald_green',
  '#00E71D': 'vivid_emerald_green',
  '#4AA855': 'moderate_emerald_green',
  '#00A815': 'strong_emerald_green',
  '#27592D': 'dark_emerald_green',
  '#00590B': 'deep_emerald_green',
  '#E2FFE9': 'very_pale_malachite_green',
  '#C2FFD1': 'pale_malachite_green',
  '#9EFFB6': 'very_light_malachite_green',
  '#65FF8B': 'light_brilliant_malachite_green',
  '#00FF40': 'luminous_vivid_malachite_green',
  '#B8E7C4': 'pale_light_grayish_malachite_green',
  '#8BE7A2': 'light_malachite_green',
  '#51E777': 'brilliant_malachite_green',
  '#00E73A': 'vivid_malachite_green',
  '#7DA888': 'grayish_malachite_green',
  '#4AA861': 'moderate_malachite_green',
  '#00A82A': 'strong_malachite_green',
  '#425948': 'dark_grayish_malachite_green',
  '#275934': 'dark_malachite_green',
  '#005916': 'deep_malachite_green',
  '#C2FFD9': 'pale_sea_green',
  '#9EFFC2': 'very_light_sea_green',
  '#65FF9F': 'light_brilliant_sea_green',
  '#00FF60': 'luminous_vivid_sea_green',
  '#8BE7AE': 'lightseagreen',
  '#51E789': 'brilliant_sea_green',
  '#00E757': 'vivid_sea_green',
  '#4AA86D': 'moderate_sea_green',
  '#00A83F': 'strong_sea_green',
  '#27593A': 'darkseagreen',
  '#005921': 'deep_sea_green',
  '#E2FFF0': 'very_pale_spring_green',
  '#C2FFE0': 'pale_spring_green',
  '#9EFFCF': 'very_light_spring_green',
  '#65FFB2': 'light_brilliant_spring_green',
  '#00FF80': 'luminous_vivid_spring_green',
  '#B8E7D0': 'pale_light_grayish_spring_green',
  '#8BE7B9': 'light_spring_green',
  '#51E79C': 'brilliant_spring_green',
  '#00E774': 'vivid_spring_green',
  '#7DA893': 'grayish_spring_green',
  '#4AA879': 'moderate_spring_green',
  '#00A854': 'strong_spring_green',
  '#42594E': 'dark_grayish_spring_green',
  '#275940': 'dark_spring_green',
  '#00592D': 'deep_spring_green',
  '#111D17': 'very_dark_spring_green',
  '#001D0E': 'very_deep_spring_green',
  '#C2FFE8': 'pale_aquamarine',
  '#9EFFDB': 'very_light_aquamarine',
  '#65FFC5': 'light_brilliant_aquamarine',
  '#00FF9F': 'luminous_vivid_aquamarine',
  '#8BE7C5': 'light_aquamarine',
  '#51E7AF': 'brilliant_aquamarine',
  '#00E791': 'vivid_aquamarine',
  '#4AA885': 'moderate_aquamarine',
  '#00A869': 'strong_aquamarine',
  '#275946': 'dark_aquamarine',
  '#005938': 'deep_aquamarine',
  '#E2FFF8': 'very_pale_turquoise',
  '#C2FFF0': 'paleturquoise',
  '#9EFFE7': 'very_light_turquoise',
  '#65FFD8': 'light_brilliant_turquoise',
  '#00FFBF': 'luminous_vivid_turquoise',
  '#B8E7DC': 'pale_light_grayish_turquoise',
  '#8BE7D0': 'light_turquoise',
  '#51E7C2': 'brilliant_turquoise',
  '#00E7AE': 'vivid_turquoise',
  '#7DA89E': 'grayish_turquoise',
  '#4AA891': 'moderate_turquoise',
  '#00A87E': 'strong_turquoise',
  '#425954': 'dark_grayish_turquoise',
  '#27594D': 'darkturquoise',
  '#005943': 'deep_turquoise',
  '#C2FFF7': 'pale_opal',
  '#9EFFF3': 'very_light_opal',
  '#65FFEC': 'light_brilliant_opal',
  '#00FFDF': 'luminous_vivid_opal',
  '#8BE7DC': 'light_opal',
  '#51E7D5': 'brilliant_opal',
  '#00E7CA': 'vivid_opal',
  '#4AA89C': 'moderate_opal',
  '#00A893': 'strong_opal',
  '#275953': 'dark_opal',
  '#00594E': 'deep_opal',
  '#F6FFFF': 'cyanish_white',
  '#E2FFFF': 'very_pale_cyan',
  '#C2FFFF': 'pale_cyan',
  '#9EFFFF': 'very_light_cyan',
  '#65FFFF': 'light_brilliant_cyan',
  '#00FFFF': 'luminous_vivid_cyan',
  '#DAE7E7': 'light_cyanish_gray',
  '#B8E7E7': 'pale_light_grayish_cyan',
  '#8BE7E7': 'lightcyan',
  '#51E7E7': 'brilliant_cyan',
  '#00E7E7': 'vivid_cyan',
  '#9CA8A8': 'cyanish_gray',
  '#7DA8A8': 'grayish_cyan',
  '#4AA8A8': 'moderate_cyan',
  '#00A8A8': 'strong_cyan',
  '#535959': 'dark_cyanish_gray',
  '#425959': 'dark_grayish_cyan',
  '#275959': 'darkcyan',
  '#005959': 'deep_cyan',
  '#1A1D1D': 'cyanish_black',
  '#111D1D': 'very_dark_cyan',
  '#001D1D': 'very_deep_cyan',
  '#C2F7FF': 'pale_arctic_blue',
  '#9EF3FF': 'very_light_arctic_blue',
  '#65ECFF': 'light_brilliant_arctic_blue',
  '#00DFFF': 'luminous_vivid_arctic_blue',
  '#8BDCE7': 'light_arctic_blue',
  '#51D5E7': 'brilliant_arctic_blue',
  '#00CAE7': 'vivid_arctic_blue',
  '#4A9CA8': 'moderate_arctic_blue',
  '#0093A8': 'strong_arctic_blue',
  '#275359': 'dark_arctic_blue',
  '#004E59': 'deep_arctic_blue',
  '#E2F8FF': 'very_pale_cerulean',
  '#C2F0FF': 'pale_cerulean',
  '#9EE7FF': 'very_light_cerulean',
  '#65D8FF': 'light_brilliant_cerulean',
  '#00BFFF': 'luminous_vivid_cerulean',
  '#B8DCE7': 'pale_light_grayish_cerulean',
  '#8BD0E7': 'light_cerulean',
  '#51C2E7': 'brilliant_cerulean',
  '#00AEE7': 'vivid_cerulean',
  '#7D9EA8': 'grayish_cerulean',
  '#4A91A8': 'moderate_cerulean',
  '#007EA8': 'strong_cerulean',
  '#425459': 'dark_grayish_cerulean',
  '#274D59': 'dark_cerulean',
  '#004359': 'deep_cerulean',
  '#C2E8FF': 'pale_cornflower_blue',
  '#9EDBFF': 'very_light_cornflower_blue',
  '#65C5FF': 'light_brilliant_cornflower_blue',
  '#009FFF': 'luminous_vivid_cornflower_blue',
  '#8BC5E7': 'light_cornflower_blue',
  '#51AFE7': 'brilliant_cornflower_blue',
  '#0091E7': 'vivid_cornflower_blue',
  '#4A85A8': 'moderate_cornflower_blue',
  '#0069A8': 'strong_cornflower_blue',
  '#274659': 'dark_cornflower_blue',
  '#003859': 'deep_cornflower_blue',
  '#E2F0FF': 'very_pale_azure',
  '#C2E0FF': 'pale_azure',
  '#9ECFFF': 'very_light_azure',
  '#65B2FF': 'light_brilliant_azure',
  '#0080FF': 'luminous_vivid_azure',
  '#B8D0E7': 'pale_light_grayish_azure',
  '#8BB9E7': 'light_azure',
  '#519CE7': 'brilliant_azure',
  '#0074E7': 'vivid_azure',
  '#7D93A8': 'grayish_azure',
  '#4A79A8': 'moderate_azure',
  '#0054A8': 'strong_azure',
  '#424E59': 'dark_grayish_azure',
  '#274059': 'dark_azure',
  '#002D59': 'deep_azure',
  '#11171D': 'very_dark_azure',
  '#000E1D': 'very_deep_azure',
  '#C2D9FF': 'pale_cobalt_blue',
  '#9EC2FF': 'very_light_cobalt_blue',
  '#659FFF': 'light_brilliant_cobalt_blue',
  '#0060FF': 'luminous_vivid_cobalt_blue',
  '#8BAEE7': 'light_cobalt_blue',
  '#5189E7': 'brilliant_cobalt_blue',
  '#0057E7': 'vivid_cobalt_blue',
  '#4A6DA8': 'moderate_cobalt_blue',
  '#003FA8': 'strong_cobalt_blue',
  '#273A59': 'dark_cobalt_blue',
  '#002159': 'deep_cobalt_blue',
  '#E2E9FF': 'very_pale_sapphire_blue',
  '#C2D1FF': 'pale_sapphire_blue',
  '#9EB6FF': 'very_light_sapphire_blue',
  '#658BFF': 'light_brilliant_sapphire_blue',
  '#0040FF': 'luminous_vivid_sapphire_blue',
  '#B8C4E7': 'pale_light_grayish_sapphire_blue',
  '#8BA2E7': 'light_sapphire_blue',
  '#5177E7': 'brilliant_sapphire_blue',
  '#003AE7': 'vivid_sapphire_blue',
  '#7D88A8': 'grayish_sapphire_blue',
  '#4A61A8': 'moderate_sapphire_blue',
  '#002AA8': 'strong_sapphire_blue',
  '#424859': 'dark_grayish_sapphire_blue',
  '#273459': 'dark_sapphire_blue',
  '#001659': 'deep_sapphire_blue',
  '#C2C9FF': 'pale_phthalo_blue',
  '#9EAAFF': 'very_light_phthalo_blue',
  '#6578FF': 'light_brilliant_phthalo_blue',
  '#0020FF': 'luminous_vivid_phthalo_blue',
  '#8B96E7': 'light_phthalo_blue',
  '#5164E7': 'brilliant_phthalo_blue',
  '#001DE7': 'vivid_phthalo_blue',
  '#4A55A8': 'moderate_phthalo_blue',
  '#0015A8': 'strong_phthalo_blue',
  '#272D59': 'dark_phthalo_blue',
  '#000B59': 'deep_phthalo_blue',
  '#F6F6FF': 'bluish_white',
  '#E2E2FF': 'very_pale_blue',
  '#C2C2FF': 'pale_blue',
  '#9E9EFF': 'very_light_blue',
  '#6565FF': 'light_brilliant_blue',
  '#0000FF': 'luminous_vivid_blue',
  '#DADAE7': 'light_bluish_gray',
  '#B8B8E7': 'pale_light_grayish_blue',
  '#8B8BE7': 'lightblue',
  '#5151E7': 'brilliant_blue',
  '#0000E7': 'vivid_blue',
  '#9C9CA8': 'bluish_gray',
  '#7D7DA8': 'grayish_blue',
  '#4A4AA8': 'moderate_blue',
  '#0000A8': 'strong_blue',
  '#535359': 'dark_bluish_gray',
  '#424259': 'dark_grayish_blue',
  '#272759': 'darkblue',
  '#000059': 'deep_blue',
  '#1A1A1D': 'bluish_black',
  '#11111D': 'very_dark_blue',
  '#00001D': 'very_deep_blue',
  '#C9C2FF': 'pale_persian_blue',
  '#AA9EFF': 'very_light_persian_blue',
  '#7865FF': 'light_brilliant_persian_blue',
  '#2000FF': 'luminous_vivid_persian_blue',
  '#968BE7': 'light_persian_blue',
  '#6451E7': 'brilliant_persian_blue',
  '#1D00E7': 'vivid_persian_blue',
  '#554AA8': 'moderate_persian_blue',
  '#1500A8': 'strong_persian_blue',
  '#2D2759': 'dark_persian_blue',
  '#0B0059': 'deep_persian_blue',
  '#E9E2FF': 'very_pale_indigo',
  '#D1C2FF': 'pale_indigo',
  '#B69EFF': 'very_light_indigo',
  '#8B65FF': 'light_brilliant_indigo',
  '#4000FF': 'luminous_vivid_indigo',
  '#C4B8E7': 'pale_light_grayish_indigo',
  '#A28BE7': 'light_indigo',
  '#7751E7': 'brilliant_indigo',
  '#3A00E7': 'vivid_indigo',
  '#887DA8': 'grayish_indigo',
  '#614AA8': 'moderate_indigo',
  '#2A00A8': 'strong_indigo',
  '#484259': 'dark_grayish_indigo',
  '#342759': 'dark_indigo',
  '#160059': 'deep_indigo',
  '#D9C2FF': 'pale_blue_violet',
  '#C29EFF': 'very_light_blue_violet',
  '#9F65FF': 'light_brilliant_blue_violet',
  '#6000FF': 'luminous_vivid_blue_violet',
  '#AE8BE7': 'light_blue_violet',
  '#8951E7': 'brilliant_blue_violet',
  '#5700E7': 'vivid_blue_violet',
  '#6D4AA8': 'moderate_blue_violet',
  '#3F00A8': 'strong_blue_violet',
  '#3A2759': 'dark_blue_violet',
  '#210059': 'deep_blue_violet',
  '#F0E2FF': 'very_pale_violet',
  '#E0C2FF': 'pale_violet',
  '#CF9EFF': 'very_light_violet',
  '#B265FF': 'light_brilliant_violet',
  '#8000FF': 'luminous_vivid_violet',
  '#D0B8E7': 'pale_light_grayish_violet',
  '#B98BE7': 'light_violet',
  '#9C51E7': 'brilliant_violet',
  '#7400E7': 'vivid_violet',
  '#937DA8': 'grayish_violet',
  '#794AA8': 'moderate_violet',
  '#5400A8': 'strong_violet',
  '#4E4259': 'dark_grayish_violet',
  '#402759': 'darkviolet',
  '#2D0059': 'deep_violet',
  '#17111D': 'very_dark_violet',
  '#0E001D': 'very_deep_violet',
  '#E8C2FF': 'pale_purple',
  '#DB9EFF': 'very_light_purple',
  '#C565FF': 'light_brilliant_purple',
  '#9F00FF': 'luminous_vivid_purple',
  '#C58BE7': 'light_purple',
  '#AF51E7': 'brilliant_purple',
  '#9100E7': 'vivid_purple',
  '#854AA8': 'moderate_purple',
  '#6900A8': 'strong_purple',
  '#462759': 'dark_purple',
  '#380059': 'deep_purple',
  '#F8E2FF': 'very_pale_mulberry',
  '#F0C2FF': 'pale_mulberry',
  '#E79EFF': 'very_light_mulberry',
  '#D865FF': 'light_brilliant_mulberry',
  '#BF00FF': 'luminous_vivid_mulberry',
  '#DCB8E7': 'pale_light_grayish_mulberry',
  '#D08BE7': 'light_mulberry',
  '#C251E7': 'brilliant_mulberry',
  '#AE00E7': 'vivid_mulberry',
  '#9E7DA8': 'grayish_mulberry',
  '#914AA8': 'moderate_mulberry',
  '#7E00A8': 'strong_mulberry',
  '#544259': 'dark_grayish_mulberry',
  '#4D2759': 'dark_mulberry',
  '#430059': 'deep_mulberry',
  '#F7C2FF': 'pale_heliotrope',
  '#F39EFF': 'very_light_heliotrope',
  '#EC65FF': 'light_brilliant_heliotrope',
  '#DF00FF': 'luminous_vivid_heliotrope',
  '#DC8BE7': 'light_heliotrope',
  '#D551E7': 'brilliant_heliotrope',
  '#CA00E7': 'vivid_heliotrope',
  '#9C4AA8': 'moderate_heliotrope',
  '#9300A8': 'strong_heliotrope',
  '#532759': 'dark_heliotrope',
  '#4E0059': 'deep_heliotrope',
  '#FFF6FF': 'magentaish_white',
  '#FFE2FF': 'very_pale_magenta',
  '#FFC2FF': 'pale_magenta',
  '#FF9EFF': 'very_light_magenta',
  '#FF65FF': 'light_brilliant_magenta',
  '#FF00FF': 'luminous_vivid_magenta',
  '#E7DAE7': 'light_magentaish_gray',
  '#E7B8E7': 'pale_light_grayish_magenta',
  '#E78BE7': 'light_magenta',
  '#E751E7': 'brilliant_magenta',
  '#E700E7': 'vivid_magenta',
  '#A89CA8': 'magentaish_gray',
  '#A87DA8': 'grayish_magenta',
  '#A84AA8': 'moderate_magenta',
  '#A800A8': 'strong_magenta',
  '#595359': 'dark_magentaish_gray',
  '#594259': 'dark_grayish_magenta',
  '#592759': 'darkmagenta',
  '#590059': 'deep_magenta',
  '#1D1A1D': 'magentaish_black',
  '#1D111D': 'very_dark_magenta',
  '#1D001D': 'very_deep_magenta',
  '#FFC2F7': 'pale_orchid',
  '#FF9EF3': 'very_light_orchid',
  '#FF65EC': 'light_brilliant_orchid',
  '#FF00DF': 'luminous_vivid_orchid',
  '#E78BDC': 'light_orchid',
  '#E751D5': 'brilliant_orchid',
  '#E700CA': 'vivid_orchid',
  '#A84A9C': 'moderate_orchid',
  '#A80093': 'strong_orchid',
  '#592753': 'darkorchid',
  '#59004E': 'deep_orchid',
  '#FFE2F8': 'very_pale_fuchsia',
  '#FFC2F0': 'pale_fuchsia',
  '#FF9EE7': 'very_light_fuchsia',
  '#FF65D8': 'light_brilliant_fuchsia',
  '#FF00BF': 'luminous_vivid_fuchsia',
  '#E7B8DC': 'pale_light_grayish_fuchsia',
  '#E78BD0': 'light_fuchsia',
  '#E751C2': 'brilliant_fuchsia',
  '#E700AE': 'vivid_fuchsia',
  '#A87D9E': 'grayish_fuchsia',
  '#A84A91': 'moderate_fuchsia',
  '#A8007E': 'strong_fuchsia',
  '#594254': 'dark_grayish_fuchsia',
  '#59274D': 'dark_fuchsia',
  '#590043': 'deep_fuchsia',
  '#FFC2E8': 'pale_cerise',
  '#FF9EDB': 'very_light_cerise',
  '#FF65C5': 'light_brilliant_cerise',
  '#FF009F': 'luminous_vivid_cerise',
  '#E78BC5': 'light_cerise',
  '#E751AF': 'brilliant_cerise',
  '#E70091': 'vivid_cerise',
  '#A84A85': 'moderate_cerise',
  '#A80069': 'strong_cerise',
  '#592746': 'dark_cerise',
  '#590038': 'deep_cerise',
  '#FFE2F0': 'very_pale_rose',
  '#FFC2E0': 'pale_rose',
  '#FF9ECF': 'very_light_rose',
  '#FF65B2': 'light_brilliant_rose',
  '#FF0080': 'luminous_vivid_rose',
  '#E7B8D0': 'pale_light_grayish_rose',
  '#E78BB9': 'light_rose',
  '#E7519C': 'brilliant_rose',
  '#E70074': 'vivid_rose',
  '#A87D93': 'grayish_rose',
  '#A84A79': 'moderate_rose',
  '#A80054': 'strong_rose',
  '#59424E': 'dark_grayish_rose',
  '#592740': 'dark_rose',
  '#59002D': 'deep_rose',
  '#1D1117': 'very_dark_rose',
  '#1D000E': 'very_deep_rose',
  '#FFC2D9': 'pale_raspberry',
  '#FF9EC2': 'very_light_raspberry',
  '#FF659F': 'light_brilliant_raspberry',
  '#FF0060': 'luminous_vivid_raspberry',
  '#E78BAE': 'light_raspberry',
  '#E75189': 'brilliant_raspberry',
  '#E70057': 'vivid_raspberry',
  '#A84A6D': 'moderate_raspberry',
  '#A8003F': 'strong_raspberry',
  '#59273A': 'dark_raspberry',
  '#590021': 'deep_raspberry',
  '#FFE2E9': 'very_pale_crimson',
  '#FFC2D1': 'pale_crimson',
  '#FF9EB6': 'very_light_crimson',
  '#FF658B': 'light_brilliant_crimson',
  '#FF0040': 'luminous_vivid_crimson',
  '#E7B8C4': 'pale_light_grayish_crimson',
  '#E78BA2': 'light_crimson',
  '#E75177': 'brilliant_crimson',
  '#E7003A': 'vivid_crimson',
  '#A87D88': 'grayish_crimson',
  '#A84A61': 'moderate_crimson',
  '#A8002A': 'strong_crimson',
  '#594248': 'dark_grayish_crimson',
  '#592734': 'dark_crimson',
  '#590016': 'deep_crimson',
  '#FFC2C9': 'pale_amaranth',
  '#FF9EAA': 'very_light_amaranth',
  '#FF6578': 'light_brilliant_amaranth',
  '#FF0020': 'luminous_vivid_amaranth',
  '#E78B96': 'light_amaranth',
  '#E75164': 'brilliant_amaranth',
  '#E7001D': 'vivid_amaranth',
  '#A84A55': 'moderate_amaranth',
  '#A80015': 'strong_amaranth',
  '#59272D': 'dark_amaranth',
  '#59000B': 'deep_amaranth'
};

const CSS_COLOR_NAMES = {
  '#F0F8FF': 'aliceblue',
  '#FAEBD7': 'antiquewhite',
  '#7FFFD4': 'aquamarine',
  '#F0FFFF': 'azure',
  '#F5F5DC': 'beige',
  '#FFE4C4': 'bisque',
  '#000000': 'black',
  '#FFEBCD': 'blanchedalmond',
  '#0000FF': 'blue',
  '#8A2BE2': 'blueviolet',
  '#A52A2A': 'brown',
  '#DEB887': 'burlywood',
  '#5F9EA0': 'cadetblue',
  '#7FFF00': 'chartreuse',
  '#D2691E': 'chocolate',
  '#FF7F50': 'coral',
  '#6495ED': 'cornflowerblue',
  '#FFF8DC': 'cornsilk',
  '#DC143C': 'crimson',
  '#00FFFF': 'cyan',
  '#00008B': 'darkblue',
  '#008B8B': 'darkcyan',
  '#B8860B': 'darkgoldenrod',
  '#A9A9A9': 'darkgray',
  '#006400': 'darkgreen',
  '#BDB76B': 'darkkhaki',
  '#8B008B': 'darkmagenta',
  '#556B2F': 'darkolivegreen',
  '#FF8C00': 'darkorange',
  '#9932CC': 'darkorchid',
  '#8B0000': 'darkred',
  '#E9967A': 'darksalmon',
  '#8FBC8F': 'darkseagreen',
  '#483D8B': 'darkslateblue',
  '#2F4F4F': 'darkslategray',
  '#00CED1': 'darkturquoise',
  '#9400D3': 'darkviolet',
  '#FF1493': 'deeppink',
  '#00BFFF': 'deepskyblue',
  '#696969': 'dimgray',
  '#1E90FF': 'dodgerblue',
  '#B22222': 'firebrick',
  '#FFFAF0': 'floralwhite',
  '#228B22': 'forestgreen',
  '#DCDCDC': 'gainsboro',
  '#F8F8FF': 'ghostwhite',
  '#FFD700': 'gold',
  '#DAA520': 'goldenrod',
  '#808080': 'gray',
  '#008000': 'green',
  '#ADFF2F': 'greenyellow',
  '#F0FFF0': 'honeydew',
  '#FF69B4': 'hotpink',
  '#CD5C5C': 'indianred',
  '#4B0082': 'indigo',
  '#FFFFF0': 'ivory',
  '#F0E68C': 'khaki',
  '#E6E6FA': 'lavender',
  '#FFF0F5': 'lavenderblush',
  '#7CFC00': 'lawngreen',
  '#FFFACD': 'lemonchiffon',
  '#ADD8E6': 'lightblue',
  '#F08080': 'lightcoral',
  '#E0FFFF': 'lightcyan',
  '#FAFAD2': 'lightgoldenrodyellow',
  '#D3D3D3': 'lightgreen',
  '#90EE90': 'lightgray',
  '#FFB6C1': 'lightpink',
  '#FFA07A': 'lightsalmon',
  '#20B2AA': 'lightseagreen',
  '#87CEFA': 'lightskyblue',
  '#778899': 'lightslategray',
  '#B0C4DE': 'lightsteelblue',
  '#FFFFE0': 'lightyellow',
  '#00FF00': 'lime',
  '#32CD32': 'limegreen',
  '#FAF0E6': 'linen',
  '#FF00FF': 'magenta',
  '#800000': 'maroon',
  '#66CDAA': 'mediumaquamarine',
  '#0000CD': 'mediumblue',
  '#BA55D3': 'mediumorchid',
  '#9370D8': 'mediumpurple',
  '#3CB371': 'mediumseagreen',
  '#7B68EE': 'mediumslateblue',
  '#00FA9A': 'mediumspringgreen',
  '#48D1CC': 'mediumturquoise',
  '#C71585': 'mediumvioletred',
  '#191970': 'midnightblue',
  '#F5FFFA': 'mintcream',
  '#FFE4E1': 'mistyrose',
  '#FFE4B5': 'moccasin',
  '#FFDEAD': 'navajowhite',
  '#000080': 'navy',
  '#FDF5E6': 'oldlace',
  '#808000': 'olive',
  '#6B8E23': 'olivedrab',
  '#FFA500': 'orange',
  '#FF4500': 'orangered',
  '#DA70D6': 'orchid',
  '#EEE8AA': 'palegoldenrod',
  '#98FB98': 'palegreen',
  '#AFEEEE': 'paleturquoise',
  '#D87093': 'palevioletred',
  '#FFEFD5': 'papayawhip',
  '#FFDAB9': 'peachpuff',
  '#CD853F': 'peru',
  '#FFC0CB': 'pink',
  '#DDA0DD': 'plum',
  '#B0E0E6': 'powderblue',
  '#800080': 'purple',
  '#663399': 'rebeccapurple',
  '#FF0000': 'red',
  '#BC8F8F': 'rosybrown',
  '#4169E1': 'royalblue',
  '#8B4513': 'saddlebrown',
  '#FA8072': 'salmon',
  '#F4A460': 'sandybrown',
  '#2E8B57': 'seagreen',
  '#FFF5EE': 'seashell',
  '#A0522D': 'sienna',
  '#C0C0C0': 'silver',
  '#87CEEB': 'skyblue',
  '#6A5ACD': 'slateblue',
  '#708090': 'slategray',
  '#FFFAFA': 'snow',
  '#00FF7F': 'springgreen',
  '#4682B4': 'steelblue',
  '#D2B48C': 'tan',
  '#008080': 'teal',
  '#D8BFD8': 'thistle',
  '#FF6347': 'tomato',
  '#40E0D0': 'turquoise',
  '#EE82EE': 'violet',
  '#F5DEB3': 'wheat',
  '#FFFFFF': 'white',
  '#F5F5F5': 'whitesmoke',
  '#FFFF00': 'yellow',
  '#9ACD32': 'yellowgreen'
};

const COLOR_NAMES_MAP = {
  ...BANG_COLOR_NAMES,
  ...CSS_COLOR_NAMES
};

const HUE_NAMES_MAP = {
  0: 'red',
  15: 'vermilion',
  30: 'orange',
  45: 'amber',
  60: 'yellow',
  75: 'lime',
  90: 'chartreuse',
  105: 'harlequin',
  120: 'green',
  135: 'erin',
  150: 'springgreen',
  165: 'aquamarine',
  180: 'cyan',
  195: 'capri',
  210: 'azure',
  225: 'cerulean',
  240: 'blue',
  255: 'indigo',
  270: 'violet',
  285: 'purple',
  300: 'magenta',
  315: 'cerise',
  330: 'rose',
  345: 'crimson',
  360: 'red'
};
