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
    });

    it('should throw on invalid hex value', function () {
      expect(() => new Color('#ggg')).toThrow('Invalid color value: #ggg');
    });
  });

  describe('utils', function () {
    it('should parse a color string into a Color object', function () {
      const color = Color.parse('#abcdef');
      expect(color).toBeInstanceOf(Color);
      expect(color.getChannelValue('red')).toBe(171);
      expect(color.getChannelValue('green')).toBe(205);
      expect(color.getChannelValue('blue')).toBe(239);
      expect(color.getChannelValue('alpha')).toBe(1);
      expect(color.toString('hex')).toBe('#ABCDEF');
      expect(color.toString('rgb')).toBe('rgb(171, 205, 239)');
      expect(color.toString('rgba')).toBe('rgba(171, 205, 239, 1)');
    });

    it('should convert a color to its equivalent hex value in decimal format', function () {
      const color = Color.parse('#abcdef');
      expect(color.toHexInt()).toBe(11259375);
    });
  });

});
