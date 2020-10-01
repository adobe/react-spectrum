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

import {Color} from '../src/Color';

describe('Color', function () {
  describe('hex', function () {
    it('should parse a short hex color', function () {
      let color = new Color('#abc');
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
      let color = new Color('#abcdef');
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
      expect(() => new Color('#ggg')).toThrow('Invalid color value: #ggg');
    });

    it('should parse a hsl color', function () {
      let color = new Color('hsl(120, 100%, 50%)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hsl')).toBe('hsl(120, 100%, 50%)');
      expect(color.toString('hsla')).toBe('hsla(120, 100%, 50%, 1)');
      expect(color.toString('css')).toBe('hsla(120, 100%, 50%, 1)');
    });

    it('should parse a hsl color', function () {
      let color = new Color('hsl(120, 100%, 50%)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hsl')).toBe('hsl(120, 100%, 50%)');
      expect(color.toString('hsla')).toBe('hsla(120, 100%, 50%, 1)');
      expect(color.toString('css')).toBe('hsla(120, 100%, 50%, 1)');
    });

    it('should parse a hsla color', function () {
      let color = new Color('hsla(120, 100%, 50%, 0.5)');
      expect(color.getChannelValue('hue')).toBe(120);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(50);
      expect(color.getChannelValue('alpha')).toBe(0.5);
      expect(color.toString('hsl')).toBe('hsl(120, 100%, 50%)');
      expect(color.toString('hsla')).toBe('hsla(120, 100%, 50%, 0.5)');
      expect(color.toString('css')).toBe('hsla(120, 100%, 50%, 0.5)');
    });

    it('normalizes hsla value by clamping', function () {
      let color = new Color('hsla(-400, 120%, -4%, -1)');
      expect(color.getChannelValue('hue')).toBe(320);
      expect(color.getChannelValue('saturation')).toBe(100);
      expect(color.getChannelValue('lightness')).toBe(0);
      expect(color.getChannelValue('alpha')).toBe(0);
      expect(color.toString('hsla')).toBe('hsla(320, 100%, 0%, 0)');
    });
  });
});
