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

import {isValidPartialNumber, parseNumber} from '../src/NumberParser';

describe('NumberParser', function () {
  describe('parse', function () {
    it('should support basic numbers', function () {
      expect(parseNumber('en-US', {style: 'decimal'}, '10')).toBe(10);
      expect(parseNumber('en-US', {style: 'decimal'}, '-10')).toBe(-10);
    });

    it('should support decimals', function () {
      expect(parseNumber('en-US', {style: 'decimal'}, '10.5')).toBe(10.5);
      expect(parseNumber('en-US', {style: 'decimal'}, '-10.5')).toBe(-10.5);
      expect(parseNumber('en-US', {style: 'decimal'}, '.5')).toBe(0.5);
      expect(parseNumber('en-US', {style: 'decimal'}, '-.5')).toBe(-0.5);
    });

    it('should support group characters', function () {
      expect(parseNumber('en-US', {style: 'decimal'}, '1,000')).toBe(1000);
      expect(parseNumber('en-US', {style: 'decimal'}, '-1,000')).toBe(-1000);
      expect(parseNumber('en-US', {style: 'decimal'}, '1,000,000')).toBe(1000000);
      expect(parseNumber('en-US', {style: 'decimal'}, '-1,000,000')).toBe(-1000000);
    });

    it('should support signDisplay', function () {
      expect(parseNumber('en-US', {style: 'decimal'}, '+10')).toBe(10);
      expect(parseNumber('en-US', {style: 'decimal', signDisplay: 'always'}, '+10')).toBe(10);
    });

    it('should support negative numbers with different minus signs', function () {
      expect(parseNumber('en-US', {style: 'decimal'}, '-10')).toBe(-10);
      expect(parseNumber('en-US', {style: 'decimal'}, '\u221210')).toBe(NaN);

      expect(parseNumber('fi-FI', {style: 'decimal'}, '-10')).toBe(-10);
      expect(parseNumber('fi-FI', {style: 'decimal'}, '\u221210')).toBe(-10);
    });

    it('should return NaN for random characters', function () {
      expect(parseNumber('en-US', {style: 'decimal'}, 'g')).toBe(NaN);
      expect(parseNumber('en-US', {style: 'decimal'}, '1abc')).toBe(NaN);
    });

    describe('currency', function () {
      it('should parse without the currency symbol', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency'}, '10.50')).toBe(10.5);
      });

      it('should ignore currency symbols', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency'}, '$10.50')).toBe(10.5);
      });

      it('should ignore currency codes', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'code'}, 'USD 10.50')).toBe(10.5);
      });

      it('should ignore currency names', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'name'}, '10.50 US dollars')).toBe(10.5);
      });

      it('should handle when the currency symbol contains valid number characters', function () {
        expect(parseNumber('ar-AE', {currency: 'SAR', style: 'currency'}, 'ر.س.‏ 10.50')).toBe(10.5);
      });

      it('should support accounting format', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencySign: 'accounting'}, '($1.50)')).toBe(-1.5);
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'code', currencySign: 'accounting'}, '(USD 1.50)')).toBe(-1.5);
      });

      it('should return NaN for unknown currency symbols', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency'}, '€10.50')).toBe(NaN);
      });

      it('should return NaN for unknown currency codes', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'code'}, 'EUR 10.50')).toBe(NaN);
      });

      it('should return NaN for unknown currency names', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'name'}, '10.50 euros')).toBe(NaN);
      });

      it('should return NaN for partial currency codes', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'code'}, 'EU 10.50')).toBe(NaN);
      });

      it('should return NaN for partial currency names', function () {
        expect(parseNumber('en-US', {currency: 'USD', style: 'currency', currencyDisplay: 'name'}, '10.50 eur')).toBe(NaN);
      });
    });

    describe('units', function () {
      it('should parse with units', function () {
        expect(parseNumber('en-US', {style: 'unit', unit: 'inch'}, '23.5 in')).toBe(23.5);
      });

      it('should parse with narrow units', function () {
        expect(parseNumber('en-US', {style: 'unit', unit: 'inch', unitDisplay: 'narrow'}, '23.5″')).toBe(23.5);
      });

      it('should parse with long units', function () {
        expect(parseNumber('en-US', {style: 'unit', unit: 'inch', unitDisplay: 'long'}, '23.5 inches')).toBe(23.5);
      });

      it('should parse with singular long units', function () {
        expect(parseNumber('en-US', {style: 'unit', unit: 'inch', unitDisplay: 'long'}, '1 inch')).toBe(1);
      });

      it('should return NaN for unknown units', function () {
        expect(parseNumber('en-US', {style: 'unit', unit: 'inch'}, '23.5 ft')).toBe(NaN);
      });

      it('should return NaN for partial units', function () {
        expect(parseNumber('en-US', {style: 'unit', unit: 'inch'}, '23.5 i')).toBe(NaN);
      });
    });

    describe('percents', function () {
      it('should parse a percent', function () {
        expect(parseNumber('en-US', {style: 'percent'}, '10%')).toBe(0.1);
      });

      it('should parse a percent with decimals', function () {
        expect(parseNumber('en-US', {style: 'percent'}, '10.5%')).toBe(0.1);
        expect(parseNumber('en-US', {style: 'percent', minimumFractionDigits: 2}, '10.5%')).toBe(0.105);
      });
    });
  });

  describe('isValidPartialNumber', function () {
    it('should support basic numbers', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-')).toBe(true);
    });

    it('should support decimals', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '10.5')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-10.5')).toBe(true);
    });

    it('should support group characters', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, ',')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, ',000')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '1,000')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-1,000')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '1,000,000')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-1,000,000')).toBe(true);
    });

    it('should reject random characters', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, 'g')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '1abc')).toBe(false);
    });

    it('should support signDisplay', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '+')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '+10')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal', signDisplay: 'always'}, '+')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal', signDisplay: 'always'}, '+10')).toBe(true);
    });

    it('should support negative numbers with different minus signs', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '\u2212')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '\u221210')).toBe(false);

      expect(isValidPartialNumber('fi-FI', {style: 'decimal'}, '-')).toBe(true);
      expect(isValidPartialNumber('fi-FI', {style: 'decimal'}, '-10')).toBe(true);
      expect(isValidPartialNumber('fi-FI', {style: 'decimal'}, '\u2212')).toBe(true);
      expect(isValidPartialNumber('fi-FI', {style: 'decimal'}, '\u221210')).toBe(true);
    });

    it('should return false for negative numbers if minValue >= 0', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-', 0)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-', 10)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '-10', 0)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '-$', 0)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '-$1', 0)).toBe(false);
    });

    it('should return false for positive numbers and signDisplay if maxValue < 0', function () {
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '+', -10, -5)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '+', -10, 0)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'decimal'}, '+10', -10, -5)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', signDisplay: 'always'}, '+$', -10, -5)).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', signDisplay: 'always'}, '+$1', -10, -5)).toBe(false);
    });

    it('should support currency', function () {
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '10.5')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '$10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '$10.5')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', currencyDisplay: 'code'}, 'USD 10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', currencyDisplay: 'code'}, 'US 10')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', currencyDisplay: 'name'}, '10 US dollars')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', currencyDisplay: 'name'}, '10 US d')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD'}, '(')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', currencySign: 'accounting'}, '(')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'currency', currency: 'USD', currencySign: 'accounting'}, '($10)')).toBe(true);
    });

    it('should support units', function () {
      expect(isValidPartialNumber('en-US', {style: 'unit', unit: 'inch'}, '10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'unit', unit: 'inch'}, '10.5')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'unit', unit: 'inch'}, '10 in')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'unit', unit: 'inch'}, '10.5 in')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'unit', unit: 'inch'}, '10 i')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'unit', unit: 'inch'}, '10.5 i')).toBe(false);
    });

    it('should support percents', function () {
      expect(isValidPartialNumber('en-US', {style: 'percent'}, '10')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'percent'}, '10.5')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'percent', minimumFractionDigits: 2}, '10.5')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'percent'}, '10%')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'percent'}, '10.5%')).toBe(false);
      expect(isValidPartialNumber('en-US', {style: 'percent', minimumFractionDigits: 2}, '10.5%')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'percent'}, '%')).toBe(true);
      expect(isValidPartialNumber('en-US', {style: 'percent'}, '10 %')).toBe(true);
    });
  });
});
