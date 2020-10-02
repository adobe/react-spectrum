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
import {ColorChannel, ColorFormat} from '@react-types/color';

export class Color {
  private value: ColorValue;

  constructor(value: string) {
    let parsed: ColorValue | void = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value);
    if (parsed) {
      this.value = parsed;
    } else {
      throw new Error('Invalid color value: ' + value);
    }
  }

  private static fromColorValue(value: ColorValue): Color {
    let x: Color = Object.create(Color.prototype);
    x.value = value;
    return x;
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case 'hex':
      case 'hexa':
      case 'rgb':
      case 'rgba':
        return Color.fromColorValue(this.value.toRGB());
      case 'hsl':
      case 'hsla':
        return Color.fromColorValue(this.value.toHSL());
      case 'hsb':
      case 'hsba':
        return Color.fromColorValue(this.value.toHSB());
      default:
        throw new Error('Invalid color format: ' + format);
    }
  }

  toString(format: ColorFormat | 'css') {
    switch (format) {
      case 'css':
        return this.value.toString('css');
      case 'hex':
      case 'hexa':
      case 'rgb':
      case 'rgba':
        return this.value.toRGB().toString(format);
      case 'hsl':
      case 'hsla':
        return this.value.toHSL().toString(format);
      case 'hsb':
      case 'hsba':
        return this.value.toHSB().toString(format);
      default:
        throw new Error('Invalid color format: ' + format);
    }
  }

  getChannelValue(channel: ColorChannel): number {
    if (channel in this.value) {
      return this.value[channel];
    }

    throw new Error('Unsupported color channel: ' + channel);
  }

  getChannelValuePercent(channel: ColorChannel): number {
    return this.value.getChannelValuePercent(channel);
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    let x = Color.fromColorValue(this.value.clone());
    x.value.setChannelValue(channel, value);
    return x;
  }

  withChannelValuePercent(channel: ColorChannel, value: number): Color {
    let x = Color.fromColorValue(this.value.clone());
    x.value.setChannelValuePercent(channel, value);
    return x;
  }
}

interface ColorValue {
  toRGB(): ColorValue,
  toHSB(): ColorValue,
  toHSL(): ColorValue,
  toString(format: ColorFormat | 'css'): string,
  clone(): ColorValue,
  setChannelValue(format: ColorChannel, value: number): void,
  setChannelValuePercent(format: ColorChannel, value: number): void,
  getChannelValuePercent(format: ColorChannel): number
}

const HEX_REGEX = /^#(?:([0-9a-f]{3})|([0-9a-f]{6}))$/i;

class RGBColor implements ColorValue {
  constructor(private red: number, private green: number, private blue: number, private alpha: number) {}

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
    } else {
      // TODO: check rgb and rgba strings
    }
  }

  toString(format: ColorFormat | 'css') {
    switch (format) {
      case 'hex':
        return '#' + (1 << 24 | this.red << 16 | this.green << 8 | this.blue).toString(16).slice(1).toUpperCase();
      case 'rgb':
        return `rgb(${this.red}, ${this.green}, ${this.blue})`;
      case 'css':
      case 'rgba':
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
      default:
        throw new Error('Unsupported color format: ' + format);
    }
  }


  toRGB(): ColorValue {
    return this;
  }

  toHSB(): ColorValue {
    throw new Error('Not implemented');
  }

  toHSL(): ColorValue {
    throw new Error('Not implemented');
  }

  clone(): ColorValue {
    return new RGBColor(this.red, this.green, this.blue, this.alpha);
  }

  setChannelValuePercent(channel: ColorChannel, value: number) {
    switch (channel) {
      case 'red':
      case 'green':
      case 'blue':
        this[channel] = value * 255;
        break;
      case 'alpha':
        this.alpha = value;
        break;
      default:
        throw new Error('Unkown channel for RGB: ' + channel);
    }
  }

  setChannelValue(channel: ColorChannel, value: number) {
    switch (channel) {
      case 'red':
      case 'green':
      case 'blue':
      case 'alpha':
        this[channel] = value;
        break;
      default:
        throw new Error('Unkown channel for RGB: ' + channel);
    }
  }

  getChannelValuePercent(channel: ColorChannel) {
    switch (channel) {
      case 'red':
      case 'green':
      case 'blue':
        return this[channel] / 255;
      case 'alpha':
        return this.alpha;
      default:
        throw new Error('Unkown channel for RGB: ' + channel);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HSBColor implements ColorValue {
  constructor(private hue: number, private saturation: number, private brightness: number, private alpha: number) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static parse(value: string): HSBColor | void {
    // TODO
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
        throw new Error('Unsupported color format: ' + format);
    }
  }

  toRGB(): ColorValue {
    throw new Error('Not implemented');
  }

  toHSB(): ColorValue {
    return this;
  }

  toHSL(): ColorValue {
    throw new Error('Not implemented');
  }

  clone(): ColorValue {
    return new HSBColor(this.hue, this.saturation, this.brightness, this.alpha);
  }

  setChannelValuePercent(channel: ColorChannel, value: number) {
    switch (channel) {
      case 'hue':
        this.hue = value * 360;
        break;
      case 'saturation':
      case 'brightness':
        this[channel] = value * 100;
        break;
      case 'alpha':
        this.alpha = value;
        break;
      default:
        throw new Error('Unkown channel for HSB: ' + channel);
    }
  }

  setChannelValue(channel: ColorChannel, value: number) {
    switch (channel) {
      case 'hue':
        this.hue = mod(value, 360);
        break;
      case 'saturation':
      case 'brightness':
        this[channel] = clamp(value, 0, 100);
        break;
      case 'alpha':
        this.alpha = clamp(value, 0, 1);
        break;
      default:
        throw new Error('Unkown channel for HSB: ' + channel);
    }
  }

  getChannelValuePercent(channel: ColorChannel) {
    switch (channel) {
      case 'hue':
        this.hue = this.hue / 360;
        break;
      case 'saturation':
      case 'brightness':
        return this[channel] / 100;
      case 'alpha':
        return this.alpha;
      default:
        throw new Error('Unkown channel for HSB: ' + channel);
    }
  }
}

// X = <negative/positive number with/without decimal places>
// before/after a comma, an 0 or more whitespaces are allowed
// - hsl(X, X%, X%)
// - hsla(X, X%, X%, X)
const HSL_REGEX = /hsl\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%)\)|hsla\(([-+]?\d+(?:.\d+)?\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d+(?:.\d+)?%\s*,\s*[-+]?\d(.\d+)?)\)/;

function mod(n, m) {
  return ((n % m) + m) % m;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HSLColor implements ColorValue {
  constructor(private hue: number, private saturation: number, private lightness: number, private alpha: number) {}

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
        throw new Error('Unsupported color format: ' + format);
    }
  }

  toRGB(): ColorValue {
    throw new Error('Not implemented');
  }

  toHSB(): ColorValue {
    throw new Error('Not implemented');
  }

  toHSL(): ColorValue {
    return this;
  }

  clone(): ColorValue {
    return new HSLColor(this.hue, this.saturation, this.lightness, this.alpha);
  }

  setChannelValuePercent(channel: ColorChannel, value: number) {
    switch (channel) {
      case 'hue':
        this[channel] = value * 360;
        break;
      case 'saturation':
      case 'lightness':
        this[channel] = value * 100;
        break;
      case 'alpha':
        this.alpha = value;
        break;
      default:
        throw new Error('Unkown channel for HSL: ' + channel);
    }
  }

  setChannelValue(channel: ColorChannel, value: number) {
    switch (channel) {
      case 'hue':
        this.hue = mod(value, 360);
        break;
      case 'saturation':
      case 'lightness':
        this[channel] = clamp(value, 0, 100);
        break;
      case 'alpha':
        this.alpha = clamp(value, 0, 1);
        break;
      default:
        throw new Error('Unkown channel for HSB: ' + channel);
    }
  }

  getChannelValuePercent(channel: ColorChannel) {
    switch (channel) {
      case 'hue':
        return this[channel] / 360;
      case 'saturation':
      case 'lightness':
        return this[channel] / 100;
      case 'alpha':
        return this.alpha;
      default:
        throw new Error('Unkown channel for HSL: ' + channel);
    }
  }
}
