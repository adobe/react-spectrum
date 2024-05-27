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

import {ColorFormat} from '@react-types/color';
import fc from 'fast-check';
import {getDeltaE00} from 'delta-e';
import {parseColor} from '../src/Color';
import space from 'color-space';

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

    it('should parse a short hexa color', function () {
      let color = parseColor('#abc9');
      expect(color.getChannelValue('red')).toBe(170);
      expect(color.getChannelValue('green')).toBe(187);
      expect(color.getChannelValue('blue')).toBe(204);
      expect(color.getChannelValue('alpha')).toBe(0.6);
      expect(color.toString('hex')).toBe('#AABBCC');
      expect(color.toString('rgb')).toBe('rgb(170, 187, 204)');
      expect(color.toString('rgba')).toBe('rgba(170, 187, 204, 0.6)');
      expect(color.toString('css')).toBe('rgba(170, 187, 204, 0.6)');
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

    it('should parse a long hexa color', function () {
      let color = parseColor('#abcdef99');
      expect(color.getChannelValue('red')).toBe(171);
      expect(color.getChannelValue('green')).toBe(205);
      expect(color.getChannelValue('blue')).toBe(239);
      expect(color.getChannelValue('alpha')).toBe(0.6);
      expect(color.toString('hex')).toBe('#ABCDEF');
      expect(color.toString('rgb')).toBe('rgb(171, 205, 239)');
      expect(color.toString('rgba')).toBe('rgba(171, 205, 239, 0.6)');
      expect(color.toString('css')).toBe('rgba(171, 205, 239, 0.6)');
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

    it('should allow 360 as a hue value', function () {
      let color = parseColor('hsl(360, 100%, 50%)');
      expect(color.getChannelValue('hue')).toBe(360);
      expect(color.toString('hsl')).toBe('hsl(360, 100%, 50%)');
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

    it('should allow 360 as a hue value', function () {
      let color = parseColor('hsb(360, 100%, 50%)');
      expect(color.getChannelValue('hue')).toBe(360);
      expect(color.toString('hsb')).toBe('hsb(360, 100%, 50%)');
    });
  });

  describe('conversions', () => {
    // Since color spaces can represent unique values that don't exist in other spaces we can't test round trips easily.
    // For example: hsl 0, 1%, 0 -> rgb is 0, 0, 0 -> hsl 0, 0%, 0%
    // In order to test round trips, we can use delta-e, a way of telling the difference/distance between two colors.
    // We can use a conversion to LAB as the common ground to get the delta-e.


    let rgb = fc.tuple(fc.integer({min: 0, max: 255}), fc.integer({min: 0, max: 255}), fc.integer({min: 0, max: 255}))
      .map(([r, g, b]) => (['rgb', `rgb(${r}, ${g}, ${b})`, [r, g, b]]));
    let hsl = fc.tuple(fc.integer({min: 0, max: 360}), fc.integer({min: 0, max: 100}), fc.integer({min: 0, max: 100}))
      .map(([h, s, l]) => (['hsl', `hsl(${h}, ${s}%, ${l}%)`, [h, s, l]]));
    let hsb = fc.tuple(fc.integer({min: 0, max: 360}), fc.integer({min: 0, max: 100}), fc.integer({min: 0, max: 100}))
      .map(([h, s, b]) => (['hsb', `hsb(${h}, ${s}%, ${b}%)`, [h, s, b]]));
    let options = fc.record({
      colorSpace: fc.oneof(fc.constant('rgb'), fc.constant('hsl'), fc.constant('hsb')),
      color: fc.oneof(rgb, hsl, hsb)
    });
    let parse = {
      rgb: (rgbString) => {
        let rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
        return rgbString.match(rgbRegex).slice(1).map(Number);
      },
      hsl: (hslString) => {
        let hslRegex = /^hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)$/;
        return hslString.match(hslRegex).slice(1).map(Number);
      },
      hsb: (hsbString) => {
        let hsbRegex = /^hsb\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)$/;
        return hsbString.match(hsbRegex).slice(1).map(Number);
      }
    };
    let positionMap = {0: 'L', 1: 'A', 2: 'B'};
    let arrayToLab = (acc, item, index) => {
      acc[positionMap[index]] = item;
      return acc;
    };

    it('can perform round trips', () => {
      fc.assert(fc.property(options, ({colorSpace, color}: {colorSpace: ColorFormat, color: [string, string, number[]]}) => {
        let testColor = parseColor(color[1]);
        let convertedColor = testColor.toString(colorSpace);
        let convertedColorObj = parse[colorSpace](convertedColor);
        let labConvertedResult = space[colorSpace === 'hsb' ? 'hsv' : colorSpace].lab(convertedColorObj).reduce(arrayToLab, {});
        let labConvertedStart = space[color[0] === 'hsb' ? 'hsv' : color[0]].lab(color[2]).reduce(arrayToLab, {});
        // 1.5 chosen because that's about the limit of what humans can detect and 1.1 was the largest I found when running 100k runs of this
        // gives us a little over 30% tolerance to changes
        expect(getDeltaE00(labConvertedStart, labConvertedResult)).toBeLessThan(1.5);
      }));
    });

    // check a bare minimum that it won't blow up
    it('hsl to rgb', () => {
      expect(parseColor('hsl(0, 0%, 0%)').toString('rgb')).toBe('rgb(0, 0, 0)');
      expect(parseColor('hsl(0, 1%, 0%)').toString('rgb')).toBe('rgb(0, 0, 0)');
      expect(parseColor('hsl(0, 0%, 100%)').toString('rgb')).toBe('rgb(255, 255, 255)');
    });

    it('hsb to rgb', () => {
      expect(parseColor('hsb(0, 0%, 0%)').toString('rgb')).toBe('rgb(0, 0, 0)');
      expect(parseColor('hsb(0, 1%, 0%)').toString('rgb')).toBe('rgb(0, 0, 0)');
      expect(parseColor('hsb(0, 0%, 100%)').toString('rgb')).toBe('rgb(255, 255, 255)');
    });

    it('rgb to hsl', () => {
      expect(parseColor('rgb(0, 0, 0)').toString('hsl')).toBe('hsl(0, 0%, 0%)');
      expect(parseColor('rgb(0, 1, 0)').toString('hsl')).toBe('hsl(120, 100%, 0.2%)');
      expect(parseColor('rgb(20, 40, 60)').toString('hsl')).toBe('hsl(210, 50%, 15.69%)');
    });

    it('rgb to hsb', () => {
      expect(parseColor('rgb(0, 0, 0)').toString('hsb')).toBe('hsb(0, 0%, 0%)');
      expect(parseColor('rgb(0, 1, 0)').toString('hsb')).toBe('hsb(120, 100%, 0.39%)');
      expect(parseColor('rgb(20, 40, 60)').toString('hsb')).toBe('hsb(210, 66.67%, 23.53%)');
    });

    it('hsl to hsb', () => {
      expect(parseColor('hsl(0, 0%, 0%)').toString('hsb')).toBe('hsb(0, 0%, 0%)');
      expect(parseColor('hsl(0, 1%, 0%)').toString('hsb')).toBe('hsb(0, 0%, 0%)');
    });

    it('hsb to hsl', () => {
      expect(parseColor('hsb(0, 0%, 0%)').toString('hsl')).toBe('hsl(0, 0%, 0%)');
      expect(parseColor('hsb(0, 1%, 0%)').toString('hsl')).toBe('hsl(0, 0%, 0%)');
    });
  });

  describe('#getColorName', function () {
    it('should return localized color name', function () {
      let color = parseColor('hsl(30, 0%, 22.5%)');
      expect(color.getColorName('en-US')).toBe('dark gray');
      color = parseColor('hsl(30, 50%, 100%)');
      expect(color.getColorName('en-US')).toBe('white');
      color = parseColor('hsl(30, 100%, 0%)');
      expect(color.getColorName('en-US')).toBe('black');
      color = parseColor('#E78B8B');
      expect(color.getColorName('en-US')).toBe('light red');
      color = parseColor('#E7E7B8');
      expect(color.getColorName('en-US')).toBe('very light pale yellow');
      color = parseColor('hsl(30, 39%, 25%)');
      expect(color.getColorName('en-US')).toBe('dark grayish brown');
      color = parseColor('hsl(30, 100%, 50%)');
      expect(color.getColorName('en-US')).toBe('vibrant orange');
      color = parseColor('hsl(30, 100%, 80%)');
      expect(color.getColorName('en-US')).toBe('light pale orange');
      color = parseColor('hsb(200, 60%, 62%)');
      expect(color.getColorName('en-US')).toBe('grayish cyan blue');
      color = parseColor('hsb(0, 100%, 100%)');
      expect(color.getColorName('en-US')).toBe('vibrant red');
      color = parseColor('hsba(0, 100%, 100%, 0.2)');
      expect(color.getColorName('en-US')).toBe('vibrant red, 80% transparent');
      // Based on the css named colors
      expect(parseColor('#FFFF00').getColorName('en-US')).toBe('very light vibrant yellow'); // yellow
      expect(parseColor('#800080').getColorName('en-US')).toBe('dark vibrant magenta'); // purple
      expect(parseColor('#FF0000').getColorName('en-US')).toBe('vibrant red'); // red
      expect(parseColor('#800000').getColorName('en-US')).toBe('dark vibrant red'); // maroon
      expect(parseColor('#FF00FF').getColorName('en-US')).toBe('light vibrant magenta'); // fuchsia
      expect(parseColor('#008000').getColorName('en-US')).toBe('dark vibrant green'); // green
      expect(parseColor('#00FF00').getColorName('en-US')).toBe('very light vibrant green'); // lime
      expect(parseColor('#808000').getColorName('en-US')).toBe('yellow green'); // olive
      expect(parseColor('#000080').getColorName('en-US')).toBe('very dark vibrant blue'); // navy
      expect(parseColor('#0000FF').getColorName('en-US')).toBe('dark vibrant blue'); // blue
      expect(parseColor('#008080').getColorName('en-US')).toBe('dark grayish cyan'); // teal
      expect(parseColor('#00FFFF').getColorName('en-US')).toBe('very light vibrant cyan'); // aqua
      expect(parseColor('#faebd7').getColorName('en-US')).toBe('light pale orange yellow'); // antiquewhite
      expect(parseColor('#7fffd4').getColorName('en-US')).toBe('very light green cyan'); // aquamarine
      expect(parseColor('#8a2be2').getColorName('en-US')).toBe('dark vibrant purple'); // blueviolet
      expect(parseColor('#a52a2a').getColorName('en-US')).toBe('dark vibrant red'); // css calls this 'brown' but it is definitely more red
      expect(parseColor('#5f9ea0').getColorName('en-US')).toBe('grayish cyan'); // cadetblue
      expect(parseColor('#7fff00').getColorName('en-US')).toBe('very light vibrant green'); // chartreuse
      expect(parseColor('#d2691e').getColorName('en-US')).toBe('vibrant brown'); // chocolate
      expect(parseColor('#ff7f50').getColorName('en-US')).toBe('light vibrant red orange'); // coral
      expect(parseColor('#6495ed').getColorName('en-US')).toBe('cyan blue'); // cornflowerblue
      expect(parseColor('#dc143c').getColorName('en-US')).toBe('vibrant red'); // crimson
      expect(parseColor('#00ffff').getColorName('en-US')).toBe('very light vibrant cyan'); // cyan
      expect(parseColor('#00008b').getColorName('en-US')).toBe('very dark vibrant blue'); // darkblue
      expect(parseColor('#008b8b').getColorName('en-US')).toBe('grayish cyan'); // darkcyan
      expect(parseColor('#b8860b').getColorName('en-US')).toBe('brown yellow'); // darkgoldenrod
      expect(parseColor('#a9a9a9').getColorName('en-US')).toBe('light gray'); // css calls this 'darkgray' but it isn't very dark (actually lighter than just 'gray')
      expect(parseColor('#006400').getColorName('en-US')).toBe('dark green'); // darkgreen
      expect(parseColor('#bdb76b').getColorName('en-US')).toBe('light pale yellow green'); // darkkhaki (also not that dark)
      expect(parseColor('#8b008b').getColorName('en-US')).toBe('dark vibrant magenta'); // darkmagenta
      expect(parseColor('#556b2f').getColorName('en-US')).toBe('dark grayish yellow green'); // darkolivegreen
      expect(parseColor('#ff8c00').getColorName('en-US')).toBe('vibrant orange'); // darkorange
      expect(parseColor('#9932cc').getColorName('en-US')).toBe('dark vibrant purple magenta'); // darkorchid
      expect(parseColor('#8b0000').getColorName('en-US')).toBe('dark vibrant red'); // darkred
      expect(parseColor('#e9967a').getColorName('en-US')).toBe('light red orange'); // darksalmon
      expect(parseColor('#8fbc8f').getColorName('en-US')).toBe('light pale green'); // darkseagreen
      expect(parseColor('#483d8b').getColorName('en-US')).toBe('dark purple'); // darkslateblue
      expect(parseColor('#2f4f4f').getColorName('en-US')).toBe('dark grayish cyan'); // darkslategray
      expect(parseColor('#00ced1').getColorName('en-US')).toBe('light cyan'); // darkturquoise
      expect(parseColor('#ff1493').getColorName('en-US')).toBe('vibrant pink'); // deeppink
      expect(parseColor('#00bfff').getColorName('en-US')).toBe('light vibrant cyan blue'); // deep sky blue
      expect(parseColor('#696969').getColorName('en-US')).toBe('dark gray'); // dimgray
      expect(parseColor('#1e90ff').getColorName('en-US')).toBe('vibrant cyan blue'); // dodgerblue
      expect(parseColor('#b22222').getColorName('en-US')).toBe('dark vibrant red'); // firebrick
      expect(parseColor('#228b22').getColorName('en-US')).toBe('vibrant green'); // forestgreen
      expect(parseColor('#ffd700').getColorName('en-US')).toBe('very light vibrant yellow'); // gold
      expect(parseColor('#daa520').getColorName('en-US')).toBe('orange yellow'); // goldenrod
      expect(parseColor('#808080').getColorName('en-US')).toBe('gray'); // gray
      expect(parseColor('#adff2f').getColorName('en-US')).toBe('very light vibrant yellow green'); // greenyellow
      expect(parseColor('#ff69b4').getColorName('en-US')).toBe('light vibrant pink'); // hotpink
      expect(parseColor('#cd5c5c').getColorName('en-US')).toBe('red'); // indianred
      expect(parseColor('#4b0082').getColorName('en-US')).toBe('dark vibrant purple'); // indigo
      expect(parseColor('#f0e68c').getColorName('en-US')).toBe('very light yellow'); // khaki
      expect(parseColor('#e6e6fa').getColorName('en-US')).toBe('very light pale purple'); // lavender
      expect(parseColor('#7cfc00').getColorName('en-US')).toBe('very light vibrant green'); // lawngreen
      expect(parseColor('#90ee90').getColorName('en-US')).toBe('very light vibrant green'); // lightgreen
      expect(parseColor('#ffa07a').getColorName('en-US')).toBe('light red orange'); // lightsalmon
      expect(parseColor('#778899').getColorName('en-US')).toBe('grayish cyan blue'); // lightslategray
      expect(parseColor('#32cd32').getColorName('en-US')).toBe('light vibrant green'); // limegreen
      expect(parseColor('#0000cd').getColorName('en-US')).toBe('dark vibrant blue'); // mediumblue
      expect(parseColor('#9370db').getColorName('en-US')).toBe('vibrant purple'); // mediumpurple
      expect(parseColor('#00fa9a').getColorName('en-US')).toBe('very light vibrant green cyan'); // mediumspringgreen
      expect(parseColor('#48d1cc').getColorName('en-US')).toBe('light cyan'); // mediumturquoise
      expect(parseColor('#c71585').getColorName('en-US')).toBe('vibrant pink'); // mediumvioletred
      expect(parseColor('#191970').getColorName('en-US')).toBe('very dark blue'); // midnightblue
      expect(parseColor('#ffe4b5').getColorName('en-US')).toBe('light pale orange yellow'); // moccasin
      expect(parseColor('#6b8e23').getColorName('en-US')).toBe('yellow green'); // olivedrab
      expect(parseColor('#ffa500').getColorName('en-US')).toBe('vibrant orange'); // orange
      expect(parseColor('#ff4500').getColorName('en-US')).toBe('vibrant red orange'); // orangered
      expect(parseColor('#98fb98').getColorName('en-US')).toBe('very light vibrant green'); // palegreen
      expect(parseColor('#afeeee').getColorName('en-US')).toBe('very light pale cyan'); // paleturquoise
      expect(parseColor('#ffefd5').getColorName('en-US')).toBe('light pale orange yellow'); // papayawhip
      expect(parseColor('#cd853f').getColorName('en-US')).toBe('brown'); // peru
      expect(parseColor('#4169e1').getColorName('en-US')).toBe('vibrant blue'); // royalblue
      expect(parseColor('#8b4513').getColorName('en-US')).toBe('dark brown'); // saddlebrown
      expect(parseColor('#f4a460').getColorName('en-US')).toBe('orange'); // sandybrown
      expect(parseColor('#6a5acd').getColorName('en-US')).toBe('dark vibrant purple'); // slateblue
      expect(parseColor('#ff6347').getColorName('en-US')).toBe('vibrant red orange'); // tomato
      expect(parseColor('#d2b48c').getColorName('en-US')).toBe('grayish orange yellow'); // tan
      expect(parseColor('#008080').getColorName('en-US')).toBe('dark grayish cyan'); // teal
      expect(parseColor('#ee82ee').getColorName('en-US')).toBe('light vibrant magenta'); // violet
      expect(parseColor('#9acd32').getColorName('en-US')).toBe('light vibrant yellow green'); // yellowgreen
    });
  });
});
