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

import fc from 'fast-check';
import messages from 'react-aria/intl/numberfield/*.json';
import {NumberFormatter} from '../src/NumberFormatter';
import {NumberParser} from '../src/NumberParser';

// for some reason hu-HU isn't supported in jsdom/node
let locales = Object.keys(messages).filter(locale => locale !== 'hu-HU');

describe('NumberParser', function () {
  describe('parse', function () {
    it('should support basic numbers', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('10')).toBe(10);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('-10')).toBe(-10);
    });

    it('should support decimals', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('10.5')).toBe(10.5);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('-10.5')).toBe(-10.5);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('.5')).toBe(0.5);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('-.5')).toBe(-0.5);
    });

    it.each([
      ['sd', {}, 1234.5],
      ['sd', {style: 'currency', currency: 'USD'}, 12.5],
      ['pa-u-nu-arab', {}, 0.25],
      ['ur-u-nu-arab', {}, 1234.5],
      ['ar', {}, 1234.5],
      ['ar-u-nu-arab', {}, 1234.5]
    ])('should round trip formatted numbers in %s with %j', (locale, options, value) => {
      let formatted = new NumberFormatter(locale, options).format(value);
      expect(new NumberParser(locale, options).parse(formatted)).toBe(value);
    });

    it.each(['sd', 'pa-u-nu-arab', 'ur-u-nu-arab', 'ar-u-nu-arab'])(
      'should preserve native Arabic number separators across formats in %s',
      locale => {
        expect(Intl.NumberFormat.supportedLocalesOf([locale])).toEqual([locale]);
        for (let options of [
          {},
          {useGrouping: false},
          {style: 'currency', currency: 'USD'},
          {style: 'percent', maximumFractionDigits: 2},
          {style: 'unit', unit: 'liter'}
        ]) {
          let formatter = new NumberFormatter(locale, options);
          let parser = new NumberParser(locale, options);
          expect(formatter.resolvedOptions().numberingSystem).toBe('arab');
          for (let value of [-1234.5, -0.25, 0.25]) {
            let formatted = formatter.format(value);
            expect(parser.parse(formatted)).toBe(value);
            expect(parser.isValidPartialNumber(formatted)).toBe(true);
            expect(parser.getNumberingSystem(formatted)).toBe('arab');
          }
        }
      }
    );

    it.each([
      ['sd', '١٬٢٣٤.٥', 1234.5],
      ['pa-u-nu-arab', '١,٢٣٤.٥', 1234.5],
      ['ur-u-nu-arab', '١,٢٣٤،٥', 1234.5],
      ['ar-u-nu-arab', '١٬٢٣٤٫٥', 1234.5],
      ['ar-u-nu-arab', '١.٢٣٤,٥', 1234.5],
      ['ar-u-nu-arab', '١.٢٣٤،٥', 1234.5]
    ])('should parse native and keyboard separators in %s: %s', (locale, input, value) => {
      let parser = new NumberParser(locale);
      expect(parser.parse(input)).toBe(value);
      expect(parser.parse('-' + input)).toBe(-value);
      expect(parser.isValidPartialNumber(input)).toBe(true);
    });

    it.each([
      ['sd', ','],
      ['sd', '،'],
      ['pa-u-nu-arab', '،'],
      ['ur-u-nu-arab', '.']
    ])('should reject non-native Arabic separator alternatives in %s: %s', (locale, separator) => {
      for (let options of [
        {},
        {style: 'currency', currency: 'USD'},
        {style: 'percent', maximumFractionDigits: 2}
      ]) {
        let parser = new NumberParser(locale, options);
        for (let input of [
          separator + '٥',
          '١' + separator,
          '١' + separator + '٢',
          '١' + separator + '٢٣٤'
        ]) {
          for (let value of [input, '-' + input]) {
            expect(parser.parse(value)).toBeNaN();
            expect(parser.isValidPartialNumber(value)).toBe(false);
          }
        }
      }
    });

    it.each([
      ['sd', '١٬٢٣٤,٥'],
      ['sd', '١٬٢٣٤،٥'],
      ['pa-u-nu-arab', '١,٢٣٤،٥'],
      ['ur-u-nu-arab', '١.٢٣٤،٥']
    ])('should reject mixed native and non-native separators in %s: %s', (locale, input) => {
      let parser = new NumberParser(locale);
      expect(parser.parse(input)).toBeNaN();
      expect(parser.parse('-' + input)).toBeNaN();
      expect(parser.isValidPartialNumber(input)).toBe(false);
    });

    it.each([
      ['fr-FR', '1.000', {}],
      ['fa-IR', '۱.۲۳۴', {}],
      ['pl-PL', '1.1 roku', {style: 'unit', unit: 'year', unitDisplay: 'long'}]
    ])('should reject leftover periods in %s: %s', (locale, input, options) => {
      let parser = new NumberParser(locale, options);
      expect(parser.isValidPartialNumber(input)).toBe(false);
      expect(parser.parse(input)).toBeNaN();
    });

    it.each(['sv-SE', 'nb-NO'])(
      'should accept Arabic decimal keyboard aliases with the native grouping separator in %s',
      locale => {
        let parser = new NumberParser(locale);
        expect(parser.isValidPartialNumber('١٢٣,٥')).toBe(true);
        expect(parser.parse('١٢٣,٥')).toBe(123.5);
        expect(parser.parse('١٢٣،٥')).toBe(123.5);
      }
    );

    it('should support group characters', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('1,000')).toBe(1000);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('-1,000')).toBe(-1000);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('1,000,000')).toBe(1000000);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('-1,000,000')).toBe(-1000000);
    });

    it('should support signDisplay', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('+10')).toBe(10);
      expect(
        new NumberParser('en-US', {style: 'decimal', signDisplay: 'always'}).parse('+10')
      ).toBe(10);
    });

    it('should support negative numbers with different minus signs', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('-10')).toBe(-10);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('\u221210')).toBe(NaN);

      expect(new NumberParser('fi-FI', {style: 'decimal'}).parse('-10')).toBe(-10);
      expect(new NumberParser('fi-FI', {style: 'decimal'}).parse('\u221210')).toBe(-10);
    });

    it('should return NaN for random characters', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('g')).toBe(NaN);
      expect(new NumberParser('en-US', {style: 'decimal'}).parse('1abc')).toBe(NaN);
    });

    it('should return NaN for invalid grouping', function () {
      expect(new NumberParser('en-US', {useGrouping: false}).parse('1234,7')).toBeNaN();
      expect(new NumberParser('de-DE', {useGrouping: false}).parse('1234.7')).toBeNaN();
    });

    describe('currency', function () {
      it('should parse without the currency symbol', function () {
        expect(new NumberParser('en-US', {currency: 'USD', style: 'currency'}).parse('10.50')).toBe(
          10.5
        );
      });

      it('should ignore currency symbols', function () {
        expect(
          new NumberParser('en-US', {currency: 'USD', style: 'currency'}).parse('$10.50')
        ).toBe(10.5);
      });

      it('should ignore currency codes', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'code'
          }).parse('USD 10.50')
        ).toBe(10.5);
      });

      it('should ignore currency names', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'name'
          }).parse('10.50 US dollars')
        ).toBe(10.5);
      });

      it('should handle when the currency symbol contains valid number characters', function () {
        expect(
          new NumberParser('ar-AE', {currency: 'SAR', style: 'currency'}).parse('ر.س.‏ 10.50')
        ).toBe(10.5);
      });

      it('should support accounting format', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencySign: 'accounting'
          }).parse('(1.50)')
        ).toBe(-1.5);
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencySign: 'accounting'
          }).parse('($1.50)')
        ).toBe(-1.5);
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'code',
            currencySign: 'accounting'
          }).parse('(USD 1.50)')
        ).toBe(-1.5);
      });

      it('should support normal negative numbers in accounting format', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencySign: 'accounting'
          }).parse('-1.5')
        ).toBe(-1.5);
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencySign: 'accounting'
          }).parse('-$1.50')
        ).toBe(-1.5);
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'code',
            currencySign: 'accounting'
          }).parse('USD -1.50')
        ).toBe(-1.5);
      });

      it('should return NaN for unknown currency symbols', function () {
        expect(
          new NumberParser('en-US', {currency: 'USD', style: 'currency'}).parse('€10.50')
        ).toBe(NaN);
      });

      it('should return NaN for unknown currency codes', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'code'
          }).parse('EUR 10.50')
        ).toBe(NaN);
      });

      it('should return NaN for unknown currency names', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'name'
          }).parse('10.50 euros')
        ).toBe(NaN);
      });

      it('should return NaN for partial currency codes', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'code'
          }).parse('EU 10.50')
        ).toBe(NaN);
      });

      it('should return NaN for partial currency names', function () {
        expect(
          new NumberParser('en-US', {
            currency: 'USD',
            style: 'currency',
            currencyDisplay: 'name'
          }).parse('10.50 eur')
        ).toBe(NaN);
      });
    });

    describe('units', function () {
      it('should parse with units', function () {
        expect(new NumberParser('en-US', {style: 'unit', unit: 'inch'}).parse('23.5 in')).toBe(
          23.5
        );
      });

      it('should parse with narrow units', function () {
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'inch', unitDisplay: 'narrow'}).parse(
            '23.5″'
          )
        ).toBe(23.5);
      });

      it('should parse with long units', function () {
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'inch', unitDisplay: 'long'}).parse(
            '23.5 inches'
          )
        ).toBe(23.5);
      });

      it('should parse with singular long units', function () {
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'inch', unitDisplay: 'long'}).parse(
            '1 inch'
          )
        ).toBe(1);
      });

      it('should return NaN for unknown units', function () {
        expect(new NumberParser('en-US', {style: 'unit', unit: 'inch'}).parse('23.5 ft')).toBe(NaN);
      });

      it('should return NaN for partial units', function () {
        expect(new NumberParser('en-US', {style: 'unit', unit: 'inch'}).parse('23.5 i')).toBe(NaN);
      });

      it('should support plural forms', function () {
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '0 years'
          )
        ).toBe(0);
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '1 year'
          )
        ).toBe(1);
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '2 years'
          )
        ).toBe(2);
        expect(
          new NumberParser('en-US', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '1.1 years'
          )
        ).toBe(1.1);

        expect(
          new NumberParser('pl-PL', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '0 rok'
          )
        ).toBe(0);
        expect(
          new NumberParser('pl-PL', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '1 lat'
          )
        ).toBe(1);
        expect(
          new NumberParser('pl-PL', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '2 lata'
          )
        ).toBe(2);
        expect(
          new NumberParser('pl-PL', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '37 lata'
          )
        ).toBe(37);
        expect(
          new NumberParser('pl-PL', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '1,1 roku'
          )
        ).toBe(1.1);

        expect(
          new NumberParser('fr-FR', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '1 an'
          )
        ).toBe(1);
        expect(
          new NumberParser('fr-FR', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '8 ans'
          )
        ).toBe(8);
        expect(
          new NumberParser('fr-FR', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '1,3 an'
          )
        ).toBe(1.3);
        expect(
          new NumberParser('fr-FR', {style: 'unit', unit: 'year', unitDisplay: 'long'}).parse(
            '2,4 ans'
          )
        ).toBe(2.4);
      });
    });

    describe('percents', function () {
      it('should parse a percent', function () {
        expect(new NumberParser('en-US', {style: 'percent'}).parse('10%')).toBe(0.1);
      });

      it('should parse a percent with decimals', function () {
        expect(new NumberParser('en-US', {style: 'percent'}).parse('10.5%')).toBe(0.11);
        expect(
          new NumberParser('en-US', {style: 'percent', minimumFractionDigits: 2}).parse('10.5%')
        ).toBe(0.105);
      });
    });

    it('should parse a percent with signs', function () {
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'always'}).parse('+10%')
      ).toBe(0.1);
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'always'}).parse('+0%')
      ).toBe(0);
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'always'}).parse('-10%')
      ).toBe(-0.1);
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'always'}).parse('-0%')
      ).toBe(-0);
      expect(
        new NumberParser('en-US', {
          style: 'percent',
          signDisplay: 'exceptZero',
          minimumFractionDigits: 2
        }).parse('+0.50%')
      ).toBe(0.005);
    });

    it('should parse a percent with decimals and exceptZero', function () {
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'exceptZero'}).parse('+0.532%')
      ).toBe(0.01);
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'exceptZero'}).parse('+0%')
      ).toBe(0);
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'exceptZero'}).parse('0.532%')
      ).toBe(0.01);
      expect(
        new NumberParser('en-GB', {style: 'percent', signDisplay: 'exceptZero'}).parse('-0.532%')
      ).toBe(-0.01);
    });

    describe('NumberFormat options', function () {
      it('supports roundingIncrement', function () {
        expect(new NumberParser('en-US', {roundingIncrement: 2}).parse('10')).toBe(10);
        // This doesn't fail in Node 18 because roundingIncrement isn't on the resolved options. Hopefully later versions of Node this test will be meaningful.
        expect(
          new NumberParser('en-US', {
            roundingIncrement: 2,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).parse('10.00')
        ).toBe(10.0);
      });
    });

    it('should parse a swiss currency number', () => {
      expect(
        new NumberParser('de-CH', {style: 'currency', currency: 'CHF'}).parse('CHF 1’000.00')
      ).toBe(1000);
      expect(
        new NumberParser('de-CH', {style: 'currency', currency: 'CHF'}).parse("CHF 1'000.00")
      ).toBe(1000);
      expect(
        new NumberParser('de-CH', {style: 'currency', currency: 'CHF'}).parse("CHF 1'000.00")
      ).toBe(1000);
    });

    it('should parse arabic singular and dual counts', () => {
      expect(
        new NumberParser('ar-AE', {style: 'unit', unit: 'day', unitDisplay: 'long'}).parse('يومان')
      ).toBe(2);
      expect(
        new NumberParser('ar-AE', {style: 'unit', unit: 'day', unitDisplay: 'long'}).parse('يوم')
      ).toBe(1);
    });

    describe('round-trip regressions', () => {
      it.each(['zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'])(
        'should round trip compound units surrounding the number in %s',
        locale => {
          for (let unit of ['meter-per-second', 'kilometer-per-hour']) {
            let options = {style: 'unit', unit, unitDisplay: 'long'};
            let formatter = new NumberFormatter(locale, options);
            let parser = new NumberParser(locale, options);
            for (let value of [5, -5, 1.5]) {
              let formatted = formatter.format(value);
              let parsed = parser.parse(formatted);
              expect(parsed).toBe(value);
              expect(formatter.format(parsed)).toBe(formatted);
            }
          }
        }
      );

      it.each([
        ['ar-AE', 'day', 1],
        ['ar-AE', 'day', 2],
        ['ar-EG', 'hour', 1],
        ['ar-EG', 'hour', 2],
        ['he-IL', 'hour', 2]
      ])('should round trip unit-only quantities in %s: %s %s', (locale, unit, value) => {
        let options = {style: 'unit', unit, unitDisplay: 'long'};
        let formatter = new NumberFormatter(locale, options);
        let parser = new NumberParser(locale, options);
        let formatted = formatter.format(value);
        let parsed = parser.parse(formatted);
        expect(parsed).toBe(value);
        expect(formatter.format(parsed)).toBe(formatted);
      });

      it.each([
        ['ru-RU', 'hour', [1, 2, 5, 21, 1.5, -1.5]],
        ['pl-PL', 'meter', [1, 2, 5, 21, 1.5, -1.5]],
        ['en-US', 'hour', [1, 2, 1.5, -1.5]]
      ])('should round trip integer and fractional unit forms in %s', (locale, unit, values) => {
        let options = {style: 'unit', unit, unitDisplay: 'long'};
        let formatter = new NumberFormatter(locale, options);
        let parser = new NumberParser(locale, options);
        for (let value of values) {
          let formatted = formatter.format(value);
          let parsed = parser.parse(formatted);
          expect(parsed).toBe(value);
          expect(formatter.format(parsed)).toBe(formatted);
        }
      });

      it.each([
        ['en-US', {minimumFractionDigits: 1}, 1, 1],
        ['ru-RU', {minimumFractionDigits: 1}, 1, 1],
        ['en-US', {maximumFractionDigits: 1}, 1.04, 1],
        ['ru-RU', {maximumFractionDigits: 1}, 1.04, 1]
      ])(
        'should round trip unit forms after applying precision in %s with %j',
        (locale, precision, value, expected) => {
          let options = {style: 'unit', unit: 'hour', unitDisplay: 'long', ...precision};
          let formatter = new NumberFormatter(locale, options);
          let parser = new NumberParser(locale, options);
          let formatted = formatter.format(value);
          let parsed = parser.parse(formatted);
          expect(parsed).toBe(expected);
          expect(formatter.format(parsed)).toBe(formatted);
        }
      );

      it.each(['en-US', 'fr-FR', 'zh-CN'])('should round trip accounting signs in %s', locale => {
        for (let currencyDisplay of ['symbol', 'code']) {
          let options = {
            style: 'currency',
            currency: 'USD',
            currencySign: 'accounting',
            currencyDisplay
          };
          let formatter = new NumberFormatter(locale, options);
          let parser = new NumberParser(locale, options);
          for (let value of [-5, -0, 0, 5]) {
            let formatted = formatter.format(value);
            let parsed = parser.parse(formatted);
            expect(parsed).toBe(value);
            expect(formatter.format(parsed)).toBe(formatted);
          }
        }
      });

      it.each([0.5, -0.5, 0, -0, 0.005])(
        'should round trip a leading percent sign in Turkish for %s',
        value => {
          let options = {style: 'percent', maximumFractionDigits: 1};
          let formatter = new NumberFormatter('tr-TR', options);
          let parser = new NumberParser('tr-TR', options);
          let formatted = formatter.format(value);
          let parsed = parser.parse(formatted);
          expect(parsed).toBe(value);
          expect(formatter.format(parsed)).toBe(formatted);
          expect(parser.isValidPartialNumber(formatted)).toBe(true);
        }
      );

      it.each(['ar-EG', 'ar-EG-u-nu-latn'])(
        'should round trip signed units with bidi literals in %s',
        locale => {
          let options = {style: 'unit', unit: 'meter', unitDisplay: 'long'};
          let formatter = new NumberFormatter(locale, options);
          let parser = new NumberParser(locale, options);
          for (let value of [-5, -1.5]) {
            let formatted = formatter.format(value);
            let parsed = parser.parse(formatted);
            expect(parsed).toBe(value);
            expect(formatter.format(parsed)).toBe(formatted);
          }
        }
      );

      it.each(
        [
          ['en-US', 'short'],
          ['en-US', 'long'],
          ['zh-CN', 'short'],
          ['zh-CN', 'long']
        ].flatMap(([locale, compactDisplay]) =>
          [10000, -10000, 15000].map(value => [locale, compactDisplay, value])
        )
      )(
        'should round trip compact unit magnitudes in %s with %s display for %s',
        (locale, compactDisplay, value) => {
          let options = {
            style: 'unit',
            unit: 'meter',
            unitDisplay: 'long',
            notation: 'compact',
            compactDisplay
          };
          let formatter = new NumberFormatter(locale, options);
          let parser = new NumberParser(locale, options);
          let formatted = formatter.format(value);
          let parsed = parser.parse(formatted);
          expect(parsed).toBe(value);
          expect(formatter.format(parsed)).toBe(formatted);
        }
      );

      it.each(
        [
          ['en-US', 'scientific'],
          ['en-US', 'engineering'],
          ['de-DE', 'scientific'],
          ['de-DE', 'engineering'],
          ['ar-EG', 'scientific'],
          ['ar-EG', 'engineering']
        ].flatMap(([locale, notation]) =>
          [123000, -123000, 0.000123, -0.000123].map(value => [locale, notation, value])
        )
      )('should round trip %s units with %s notation for %s', (locale, notation, value) => {
        let options = {
          style: 'unit',
          unit: 'meter-per-second',
          unitDisplay: 'long',
          notation,
          maximumSignificantDigits: 3
        };
        let formatter = new NumberFormatter(locale, options);
        let parser = new NumberParser(locale, options);
        let formatted = formatter.format(value);
        let parsed = parser.parse(formatted);
        expect(parsed).toBe(value);
        expect(formatter.format(parsed)).toBe(formatted);
        expect(parser.isValidPartialNumber(formatted)).toBe(true);
      });
    });

    describe('notation', () => {
      it.each([
        ['en-US', {notation: 'compact'}, 1000000000],
        ['en-US', {notation: 'compact', maximumSignificantDigits: 3}, 0.000123],
        ['zh-CN', {notation: 'compact'}, 1000000000000],
        ['hi-IN', {notation: 'compact'}, 100000],
        ['sw-TZ', {notation: 'compact', compactDisplay: 'long'}, 1000],
        ['pl-PL', {notation: 'compact', compactDisplay: 'long'}, 2000],
        ['pl-PL', {notation: 'compact', compactDisplay: 'long'}, 5000],
        [
          'fr-FR',
          {
            notation: 'compact',
            compactDisplay: 'long',
            style: 'unit',
            unit: 'meter',
            unitDisplay: 'narrow'
          },
          10000
        ],
        [
          'en-US',
          {notation: 'compact', style: 'currency', currency: 'SEK', currencyDisplay: 'code'},
          10000
        ],
        [
          'en-US',
          {
            notation: 'compact',
            style: 'currency',
            currency: 'PGK',
            currencyDisplay: 'narrowSymbol'
          },
          10000
        ],
        [
          'en-US',
          {notation: 'compact', style: 'currency', currency: 'USD', currencySign: 'accounting'},
          -10000
        ],
        ['en-US', {notation: 'compact', style: 'percent'}, 100],
        ['en-US', {notation: 'scientific', style: 'percent'}, 0.0001],
        ['en-US', {notation: 'engineering', style: 'percent'}, 0.00012],
        ['en-US', {notation: 'scientific', style: 'percent', maximumSignificantDigits: 3}, 0.00123],
        [
          'en-US',
          {notation: 'engineering', style: 'percent', maximumSignificantDigits: 3},
          -0.00123
        ],
        ['fa-IR', {notation: 'scientific', maximumSignificantDigits: 3}, -0.000123]
      ])('should round trip %s with %j for %s', (locale, options, value) => {
        let formatter = new NumberFormatter(locale, options);
        let parser = new NumberParser(locale, options);
        let formatted = formatter.format(value);
        let parsed = parser.parse(formatted);
        expect(parsed).toBe(value);
        expect(formatter.format(parsed)).toBe(formatted);
        expect(parser.isValidPartialNumber(formatted)).toBe(true);
      });

      it.each(['1E', '1E-', '1E+'])('should allow an incomplete exponent in %s', value => {
        let parser = new NumberParser('en-US', {notation: 'scientific'});
        expect(parser.isValidPartialNumber(value)).toBe(true);
        expect(parser.parse(value)).toBeNaN();
      });

      it.each([
        ['', 0],
        ['.', 0],
        ['+', 0],
        ['+.', 0],
        ['-', -0],
        ['-.', -0]
      ])('should preserve incomplete percent input %s as zero', (value, expected) => {
        expect(new NumberParser('en-US', {style: 'percent'}).parse(value)).toBe(expected);
      });

      it.each([
        ['compact', 1, 123.4567, 123],
        ['scientific', 3, 1.234567, 1.235],
        ['engineering', 3, 0.01234567, 0.01235]
      ])(
        'should round percentages using %s notation',
        (notation, maximumFractionDigits, value, expected) => {
          let options = {notation, maximumFractionDigits, style: 'percent'};
          let formatter = new NumberFormatter('en-US', options);
          let parser = new NumberParser('en-US', options);
          let formatted = formatter.format(value);
          expect(parser.parse(formatted)).toBe(expected);
          expect(formatter.format(parser.parse(formatted))).toBe(formatted);
        }
      );

      it.each(['E3', '1E2E3', '1E2.3', '1E1,0', '1E--2'])(
        'should reject an invalid exponent in %s',
        value => {
          let parser = new NumberParser('en-US', {notation: 'scientific'});
          expect(parser.isValidPartialNumber(value)).toBe(false);
          expect(parser.parse(value)).toBeNaN();
        }
      );

      it.each(['K', 'K10', 'K10K', '10KK', '10KM'])(
        'should reject an invalid compact magnitude in %s',
        value => {
          let parser = new NumberParser('en-US', {notation: 'compact'});
          expect(parser.isValidPartialNumber(value)).toBe(false);
          expect(parser.parse(value)).toBeNaN();
        }
      );

      it('should validate exponent signs independently of the value bounds', () => {
        let parser = new NumberParser('en-US', {notation: 'scientific'});
        expect(parser.isValidPartialNumber('1E-2', 0)).toBe(true);
        expect(parser.parse('1E-2')).toBe(0.01);
        expect(parser.isValidPartialNumber('-1E2', 0)).toBe(false);
        expect(parser.isValidPartialNumber('1E+2')).toBe(true);
        expect(parser.parse('1E+2')).toBe(100);
      });
    });

    describe('round trips', function () {
      fc.configureGlobal({numRuns: 2000});
      // Locales have to include: 'de-DE', 'ar-EG', 'fr-FR' and possibly others
      // But for the moment they are not properly supported
      const localesArb = fc.constantFrom(...locales);
      const numeralArb = fc.constantFrom('latn', 'arab', 'hanidec', 'deva', 'beng');
      const styleOptsArb = fc.oneof(
        {withCrossShrink: true},
        fc.record({style: fc.constant('decimal')}),
        // 'percent' should be part of the possible options, but for the moment it fails for some tests
        fc.record({style: fc.constant('percent')}),
        fc.record(
          {
            style: fc.constant('currency'),
            currency: fc.constantFrom('USD', 'EUR', 'CNY', 'JPY'),
            currencyDisplay: fc.constantFrom('symbol', 'code', 'name')
          },
          {requiredKeys: ['style', 'currency']}
        ),
        fc.record(
          {
            style: fc.constant('unit'),
            unit: fc.constantFrom('inch', 'liter', 'kilometer-per-hour')
          },
          {requiredKeys: ['style', 'unit']}
        )
      );
      const genericOptsArb = fc.record(
        {
          localeMatcher: fc.constantFrom('best fit', 'lookup'),
          unitDisplay: fc.constantFrom('narrow', 'short', 'long'),
          useGrouping: fc.boolean(),
          minimumIntegerDigits: fc.integer({min: 1, max: 21}),
          minimumFractionDigits: fc.integer({min: 0, max: 20}),
          maximumFractionDigits: fc.integer({min: 0, max: 20}),
          minimumSignificantDigits: fc.integer({min: 1, max: 21}),
          maximumSignificantDigits: fc.integer({min: 1, max: 21})
        },
        {requiredKeys: []}
      );

      // We restricted the set of possible values to avoid unwanted overflows to infinity and underflows to zero
      // and stay in the domain of legit values.
      const DOUBLE_MIN = Number.EPSILON;
      const valueArb = fc
        .tuple(
          fc.constantFrom(1, -1),
          fc.double({next: true, noNaN: true, min: DOUBLE_MIN, max: 1 / DOUBLE_MIN})
        )
        .map(([sign, value]) => sign * value);

      const inputsArb = fc
        .tuple(valueArb, localesArb, styleOptsArb, genericOptsArb, numeralArb)
        .map(([d, locale, styleOpts, genericOpts, numerals]) => ({
          d,
          opts: {...styleOpts, ...genericOpts},
          locale,
          numerals
        }))
        .filter(
          ({opts}) =>
            opts.minimumFractionDigits === undefined ||
            opts.maximumFractionDigits === undefined ||
            opts.minimumFractionDigits <= opts.maximumFractionDigits
        )
        .filter(
          ({opts}) =>
            opts.minimumSignificantDigits === undefined ||
            opts.maximumSignificantDigits === undefined ||
            opts.minimumSignificantDigits <= opts.maximumSignificantDigits
        )
        .map(({d, opts, locale, numerals}) => {
          if (opts.style === 'percent') {
            opts.minimumFractionDigits =
              opts.minimumFractionDigits > 18 ? 18 : opts.minimumFractionDigits;
            opts.maximumFractionDigits =
              opts.maximumFractionDigits > 18 ? 18 : opts.maximumFractionDigits;
          }
          return {d, opts, locale, numerals};
        })
        .map(({d, opts, locale, numerals}) => {
          let adjustedNumberForFractions = d;
          if (Math.abs(d) < 1 && opts.minimumFractionDigits && opts.minimumFractionDigits > 1) {
            adjustedNumberForFractions = d * 10 ** (opts.minimumFractionDigits || 2);
          } else if (
            Math.abs(d) > 1 &&
            opts.minimumFractionDigits &&
            opts.minimumFractionDigits > 1
          ) {
            adjustedNumberForFractions = d / 10 ** (opts.minimumFractionDigits || 2);
          }
          return {adjustedNumberForFractions, opts, locale, numerals};
        });

      // skipping until we can reliably run it, until then, it's good to run manually
      // track counter examples below
      it('should fully reverse NumberFormat', function () {
        fc.assert(
          fc.property(inputsArb, function ({adjustedNumberForFractions, locale, opts, numerals}) {
            const formatter = new Intl.NumberFormat(`${locale}-u-nu-${numerals}`, opts);
            const parser = new NumberParser(locale, opts);

            const formattedOnce = formatter.format(adjustedNumberForFractions);
            expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
          })
        );
      });
    });
    describe('counter examples', () => {
      it('can still get all plural literals with minimum significant digits', () => {
        let locale = 'pl-PL';
        let options = {
          style: 'unit',
          unit: 'inch',
          minimumSignificantDigits: 4,
          maximumSignificantDigits: 6
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);

        const formattedOnce = formatter.format(60048.95);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      // See Bug https://github.com/nodejs/node/issues/49919
      it('formatted units keep their number', () => {
        let locale = 'da-DK';
        let options = {
          style: 'unit',
          unit: 'kilometer-per-hour',
          unitDisplay: 'long',
          minimumSignificantDigits: 1
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);

        const formattedOnce = formatter.format(1);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      it('should handle small numbers', () => {
        let locale = 'ar-AE';
        let options = {
          style: 'decimal',
          minimumIntegerDigits: 4,
          maximumSignificantDigits: 1
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);
        const formattedOnce = formatter.format(2.220446049250313e-16);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      it('should handle currency small numbers', () => {
        let locale = 'ar-AE-u-nu-latn';
        let options = {
          style: 'currency',
          currency: 'USD'
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);
        const formattedOnce = formatter.format(2.220446049250313e-16);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      it('should handle hanidec small numbers', () => {
        let locale = 'ar-AE-u-nu-hanidec';
        let options = {
          style: 'decimal'
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);
        const formattedOnce = formatter.format(2.220446049250313e-16);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      it('should handle beng with minimum integer digits', () => {
        let locale = 'ar-AE-u-nu-beng';
        let options = {
          style: 'decimal',
          minimumIntegerDigits: 4,
          maximumFractionDigits: 0
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);
        const formattedOnce = formatter.format(2.220446049250313e-16);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      it('should handle percent with minimum integer digits', () => {
        let locale = 'ar-AE-u-nu-latn';
        let options = {
          style: 'percent',
          minimumIntegerDigits: 4,
          minimumFractionDigits: 9,
          maximumSignificantDigits: 1,
          maximumFractionDigits: undefined
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);
        const formattedOnce = formatter.format(0.0095);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
      it('should handle non-grouping in russian locale', () => {
        let locale = 'ru-RU';
        let options = {
          style: 'percent',
          useGrouping: false,
          minimumFractionDigits: undefined,
          maximumFractionDigits: undefined
        };
        const formatter = new Intl.NumberFormat(locale, options);
        const parser = new NumberParser(locale, options);
        const formattedOnce = formatter.format(2.220446049250313e-16);
        expect(formatter.format(parser.parse(formattedOnce))).toBe(formattedOnce);
      });
    });
  });

  describe('isValidPartialNumber', function () {
    it.each([
      ['sd', '.'],
      ['pa-u-nu-arab', '.'],
      ['ur-u-nu-arab', '،'],
      ['ar-u-nu-arab', '٫'],
      ['ar-u-nu-arab', ','],
      ['ar-u-nu-arab', '،']
    ])('should allow editing Arabic fractions in %s with %s', (locale, decimal) => {
      let parser = new NumberParser(locale);
      for (let input of [decimal, '-' + decimal, '١' + decimal]) {
        expect(parser.isValidPartialNumber(input)).toBe(true);
      }
      expect(parser.parse(decimal)).toBeNaN();
      expect(parser.parse(decimal + '٥')).toBe(0.5);
      expect(parser.parse('-' + decimal + '٥')).toBe(-0.5);
      expect(parser.isValidPartialNumber('١' + decimal + '٢' + decimal)).toBe(false);
    });

    it('should support basic numbers', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('10')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-10')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-')).toBe(true);
    });

    it('should support decimals', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('10.5')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-10.5')).toBe(
        true
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('.')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('.5')).toBe(true);

      // Starting with arabic decimal point
      expect(new NumberParser('ar-AE', {style: 'decimal'}).isValidPartialNumber('٫')).toBe(true);
      expect(new NumberParser('ar-AE', {style: 'decimal'}).isValidPartialNumber('٫٥')).toBe(true);

      // Arabic locale, starting with latin decimal point
      expect(new NumberParser('ar-AE', {style: 'decimal'}).isValidPartialNumber('.')).toBe(true);
      expect(new NumberParser('ar-AE', {style: 'decimal'}).isValidPartialNumber('.5')).toBe(true);
    });

    it('should support group characters', function () {
      // starting with arabic decimal point
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber(',')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber(',000')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('000,000')).toBe(
        true
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('1,000')).toBe(
        true
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-1,000')).toBe(
        true
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('1,000,000')).toBe(
        true
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-1,000,000')).toBe(
        true
      );
    });

    it('should return false for invalid grouping', function () {
      expect(new NumberParser('en-US', {useGrouping: false}).isValidPartialNumber('1234,7')).toBe(
        false
      );
      expect(new NumberParser('de-DE', {useGrouping: false}).isValidPartialNumber('1234.7')).toBe(
        false
      );
    });

    it('should reject random characters', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('g')).toBe(false);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('1abc')).toBe(
        false
      );
    });

    it('should support signDisplay', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('+')).toBe(false);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('+10')).toBe(false);
      expect(
        new NumberParser('en-US', {style: 'decimal', signDisplay: 'always'}).isValidPartialNumber(
          '+'
        )
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'decimal', signDisplay: 'always'}).isValidPartialNumber(
          '+10'
        )
      ).toBe(true);
    });

    it('should support negative numbers with different minus signs', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-10')).toBe(true);
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('\u2212')).toBe(
        false
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('\u221210')).toBe(
        false
      );

      expect(new NumberParser('fi-FI', {style: 'decimal'}).isValidPartialNumber('-')).toBe(true);
      expect(new NumberParser('fi-FI', {style: 'decimal'}).isValidPartialNumber('-10')).toBe(true);
      expect(new NumberParser('fi-FI', {style: 'decimal'}).isValidPartialNumber('\u2212')).toBe(
        true
      );
      expect(new NumberParser('fi-FI', {style: 'decimal'}).isValidPartialNumber('\u221210')).toBe(
        true
      );
    });

    it('should return false for negative numbers if minValue >= 0', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-', 0)).toBe(
        false
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-', 10)).toBe(
        false
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('-10', 0)).toBe(
        false
      );
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber(
          '-$',
          0
        )
      ).toBe(false);
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber(
          '-$1',
          0
        )
      ).toBe(false);
    });

    it('should return false for positive numbers and signDisplay if maxValue < 0', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('+', -10, -5)).toBe(
        false
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('+', -10, 0)).toBe(
        false
      );
      expect(
        new NumberParser('en-US', {style: 'decimal'}).isValidPartialNumber('+10', -10, -5)
      ).toBe(false);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          signDisplay: 'always'
        }).isValidPartialNumber('+$', -10, -5)
      ).toBe(false);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          signDisplay: 'always'
        }).isValidPartialNumber('+$1', -10, -5)
      ).toBe(false);
    });

    it('should support currency', function () {
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber('10')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber('10.5')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber('$10')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber(
          '$10.5'
        )
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber('10')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'code'
        }).isValidPartialNumber('USD 10')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'code'
        }).isValidPartialNumber('US 10')
      ).toBe(false);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'name'
        }).isValidPartialNumber('10 US dollars')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'name'
        }).isValidPartialNumber('10 US d')
      ).toBe(false);
      expect(
        new NumberParser('en-US', {style: 'currency', currency: 'USD'}).isValidPartialNumber('(')
      ).toBe(false);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('(')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('($10)')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('-')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('-10')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('-$10')
      ).toBe(true);

      // typing latin characters in arabic locale should work
      // 1564 is the character code for the arabic letter mark, an invisible character that marks bidi text for printing, you can find this included in chrome too
      // TODO: we should still support just typing the '(' character, but this isn't a regression
      expect(
        new NumberParser('ar-AE', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber(`(${String.fromCharCode(1564)}`)
      ).toBe(true);
      expect(
        new NumberParser('ar-AE', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber(`(${String.fromCharCode(1564)}10)`)
      ).toBe(true);
      expect(
        new NumberParser('ar-AE', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('-')
      ).toBe(true);
      expect(
        new NumberParser('ar-AE', {
          style: 'currency',
          currency: 'USD',
          currencySign: 'accounting'
        }).isValidPartialNumber('-10')
      ).toBe(true);
    });

    it('should support units', function () {
      expect(
        new NumberParser('en-US', {style: 'unit', unit: 'inch'}).isValidPartialNumber('10')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'unit', unit: 'inch'}).isValidPartialNumber('10.5')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'unit', unit: 'inch'}).isValidPartialNumber('10 in')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'unit', unit: 'inch'}).isValidPartialNumber('10.5 in')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {style: 'unit', unit: 'inch'}).isValidPartialNumber('10 i')
      ).toBe(false);
      expect(
        new NumberParser('en-US', {style: 'unit', unit: 'inch'}).isValidPartialNumber('10.5 i')
      ).toBe(false);
    });

    it('should support percents', function () {
      expect(new NumberParser('en-US', {style: 'percent'}).isValidPartialNumber('10')).toBe(true);
      expect(new NumberParser('en-US', {style: 'percent'}).isValidPartialNumber('10.5')).toBe(
        false
      );
      expect(
        new NumberParser('en-US', {
          style: 'percent',
          minimumFractionDigits: 2
        }).isValidPartialNumber('10.5')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'percent',
          maximumFractionDigits: 2
        }).isValidPartialNumber('10.5')
      ).toBe(true);
      expect(new NumberParser('en-US', {style: 'percent'}).isValidPartialNumber('10%')).toBe(true);
      expect(new NumberParser('en-US', {style: 'percent'}).isValidPartialNumber('10.5%')).toBe(
        false
      );
      expect(
        new NumberParser('en-US', {
          style: 'percent',
          minimumFractionDigits: 2
        }).isValidPartialNumber('10.5%')
      ).toBe(true);
      expect(
        new NumberParser('en-US', {
          style: 'percent',
          maximumFractionDigits: 2
        }).isValidPartialNumber('10.5%')
      ).toBe(true);
      expect(new NumberParser('en-US', {style: 'percent'}).isValidPartialNumber('%')).toBe(true);
      expect(new NumberParser('en-US', {style: 'percent'}).isValidPartialNumber('10 %')).toBe(true);
    });
  });

  describe('getNumberingSystem', function () {
    it.each([
      ['en-US', 'latn'],
      ['ar-EG', 'arab'],
      ['en-US-u-nu-arab', 'arab'],
      ['ar-EG-u-nu-latn', 'latn']
    ])(
      'should retain the default numbering system for input without numerals when decimal places are disabled in %s',
      (locale, numberingSystem) => {
        for (let options of [
          {style: 'decimal'},
          {style: 'unit', unit: 'percent'},
          {style: 'percent'}
        ]) {
          let parser = new NumberParser(locale, {
            ...options,
            maximumFractionDigits: 0,
            signDisplay: 'always'
          });
          for (let value of ['', ' ', '.', ',', '-', '-.', '+,']) {
            expect(parser.getNumberingSystem(value)).toBe(numberingSystem);
          }
        }
      }
    );

    it('should detect non-default numerals', function () {
      let parser = new NumberParser('en-US', {
        style: 'unit',
        unit: 'percent',
        maximumFractionDigits: 0
      });
      for (let [value, numberingSystem] of [
        ['12', 'latn'],
        ['١٢', 'arab'],
        ['一二', 'hanidec'],
        ['१२', 'deva'],
        ['১২', 'beng'],
        ['１２', 'fullwide']
      ]) {
        expect(parser.getNumberingSystem(value)).toBe(numberingSystem);
      }
    });

    it('should return the default numbering system for a locale', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem(' ')).toBe('latn');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('12')).toBe('latn');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('.')).toBe('latn');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('12.5')).toBe('latn');

      expect(new NumberParser('ar-AE', {style: 'decimal'}).getNumberingSystem('١٢')).toBe('arab');
      expect(new NumberParser('ar-AE', {style: 'decimal'}).getNumberingSystem('٫')).toBe('arab');
      expect(new NumberParser('ar-AE', {style: 'decimal'}).getNumberingSystem('١٫٢')).toBe('arab');
    });

    it('should support using non-default numbering systems for a locale', function () {
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('١٢')).toBe('arab');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('٫')).toBe('arab');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('١٫٢')).toBe('arab');

      expect(new NumberParser('ar-AE', {style: 'decimal'}).getNumberingSystem('12')).toBe('latn');
      expect(new NumberParser('ar-AE', {style: 'decimal'}).getNumberingSystem('.')).toBe('latn');
      expect(new NumberParser('ar-AE', {style: 'decimal'}).getNumberingSystem('12.5')).toBe('latn');

      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('一二')).toBe(
        'hanidec'
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('一二.五')).toBe(
        'hanidec'
      );

      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('१२३४')).toBe('deva');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('१२४,२')).toBe(
        'deva'
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('२.३५१')).toBe(
        'deva'
      );

      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('১২৩')).toBe('beng');
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('১.২৫৩')).toBe(
        'beng'
      );
      expect(new NumberParser('en-US', {style: 'decimal'}).getNumberingSystem('১২৮,৪')).toBe(
        'beng'
      );
    });
  });
});
