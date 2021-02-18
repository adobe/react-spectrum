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

import {parseColor} from '../src/Color';

describe('Color', function () {
  describe('hex', function () {
    it('should parse a short hex color', function () {
      let color = parseColor('#abc');
      expect(color.getChannelValue('red')).toBe(170);
      expect(color.getChannelValue('green')).toBe(187);
      expect(color.getChannelValue('blue')).toBe(204);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hex')).toBe('#AABBCC');
      expect(color.toString('rgb')).toBe('rgb(170, 187, 204)');
      expect(color.toString('rgba')).toBe('rgba(170, 187, 204, 1)');
      expect(color.toString('css')).toBe('rgba(170, 187, 204, 1)');
    });

    it('should parse a long hex color', function () {
      let color = parseColor('#abcdef');
      expect(color.getChannelValue('red')).toBe(171);
      expect(color.getChannelValue('green')).toBe(205);
      expect(color.getChannelValue('blue')).toBe(239);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hex')).toBe('#ABCDEF');
      expect(color.toString('rgb')).toBe('rgb(171, 205, 239)');
      expect(color.toString('rgba')).toBe('rgba(171, 205, 239, 1)');
      expect(color.toString('css')).toBe('rgba(171, 205, 239, 1)');
    });

    it('should throw on invalid hex value', function () {
      expect(() => parseColor('#ggg')).toThrow('Invalid color value: #ggg');
    });
  });

  it('should convert a color to its equivalent hex value in decimal format', function () {
    const color = parseColor('#abcdef');
    expect(color.toHexInt()).toBe(0xABCDEF);
  });

  describe('rgb', function () {
    it('should parse a rgb color', function () {
      let color = parseColor('rgb(128, 128, 0)');
      expect(color.getChannelValue('red')).toBe(128);
      expect(color.getChannelValue('green')).toBe(128);
      expect(color.getChannelValue('blue')).toBe(0);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('rgb')).toBe('rgb(128, 128, 0)');
      expect(color.toString('rgba')).toBe('rgba(128, 128, 0, 1)');
      expect(color.toString('css')).toBe('rgba(128, 128, 0, 1)');
    });

    it('should parse a rgba color', function () {
      let color = parseColor('rgba(128, 128, 0, 0.5)');
      expect(color.getChannelValue('red')).toBe(128);
      expect(color.getChannelValue('green')).toBe(128);
      expect(color.getChannelValue('blue')).toBe(0);
      expect(color.getChannelValue('alpha')).toBe(0.5);
      expect(color.toString('rgb')).toBe('rgb(128, 128, 0)');
      expect(color.toString('rgba')).toBe('rgba(128, 128, 0, 0.5)');
      expect(color.toString('css')).toBe('rgba(128, 128, 0, 0.5)');
    });

    it('normalizes rgba value by clamping', function () {
      let color = parseColor('rgba(300, -10, 0, 4)');
      expect(color.getChannelValue('red')).toBe(255);
      expect(color.getChannelValue('green')).toBe(0);
      expect(color.getChannelValue('blue')).toBe(0);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('rgba')).toBe('rgba(255, 0, 0, 1)');
    });
  });

  describe('hsl', function () {
    it('should parse a hsl color', function () {
      let color = parseColor('hsl(120, 100%, 50%)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hsl')).toBe('hsl(120, 100%, 50%)');
      expect(color.toString('hsla')).toBe('hsla(120, 100%, 50%, 1)');
      expect(color.toString('css')).toBe('hsla(120, 100%, 50%, 1)');
    });

    it('should parse a hsla color', function () {
      let color = parseColor('hsla(120, 100%, 50%, 0.5)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(0.5);
      expect(color.toString('hsl')).toBe('hsl(120, 100%, 50%)');
      expect(color.toString('hsla')).toBe('hsla(120, 100%, 50%, 0.5)');
      expect(color.toString('css')).toBe('hsla(120, 100%, 50%, 0.5)');
    });

    it('normalizes hsla value by clamping', function () {
      let color = parseColor('hsla(-400, 120%, -4%, -1)');
      expect(color.getChannelValue('hue')).toBe(320);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(0);
      expect(color.getChannelValue('alpha')).toBe(0);
      expect(color.toString('hsla')).toBe('hsla(320, 100%, 0%, 0)');
    });
  });

  it('withChannelValue', () => {
    let color = parseColor('hsl(120, 100%, 50%)');
    let newColor = color.withChannelValue('hue', 200);
    expect(newColor.getChannelValue('hue')).toBe(200);
    expect(newColor.getChannelValue('saturation')).toBe(color.getChannelValue('saturation'));
    expect(newColor.getChannelValue('lightness')).toBe(color.getChannelValue('lightness'));
    expect(newColor.getChannelValue('alpha')).toBe(color.getChannelValue('alpha'));
  });

  describe('hsb', function () {
    it('should parse a hsb color', function () {
      let color = parseColor('hsb(120, 100%, 50%)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('brightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hsb')).toBe('hsb(120, 100%, 50%)');
      expect(color.toString('hsba')).toBe('hsba(120, 100%, 50%, 1)');
    });

    it('should parse a hsba color', function () {
      let color = parseColor('hsba(120, 100%, 50%, 0.5)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('brightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(0.5);
      expect(color.toString('hsb')).toBe('hsb(120, 100%, 50%)');
      expect(color.toString('hsba')).toBe('hsba(120, 100%, 50%, 0.5)');
    });

    it('normalizes hsba value by clamping', function () {
      let color = parseColor('hsba(-400, 120%, -4%, -1)');
      expect(color.getChannelValue('hue')).toBe(320);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('brightness')).toBe(0);
      expect(color.getChannelValue('alpha')).toBe(0);
      expect(color.toString('hsba')).toBe('hsba(320, 100%, 0%, 0)');
    });
  });

  it('withChannelValue', () => {
    let color = parseColor('hsl(120, 100%, 50%)');
    let newColor = color.withChannelValue('hue', 200);
    expect(newColor.getChannelValue('hue')).toBe(200);
    expect(newColor.getChannelValue('saturation')).toBe(color.getChannelValue('saturation'));
    expect(newColor.getChannelValue('lightness')).toBe(color.getChannelValue('lightness'));
    expect(newColor.getChannelValue('alpha')).toBe(color.getChannelValue('alpha'));
  });
});
