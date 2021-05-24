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

import {dimensionValue} from '../';


describe('styleProps', function () {
  describe('dimensionValue', function () {
    describe('number', function () {
      it('100', function () {
        let value = dimensionValue(100);
        expect(value).toBe('100px');
      });
    });

    describe('units', function () {
      it('px', function () {
        let value = dimensionValue('100px');
        expect(value).toBe('100px');
      });
      it('vh', function () {
        let value = dimensionValue('100vh');
        expect(value).toBe('100vh');
      });
    });

    describe('variables', function () {
      it('size-100', function () {
        let value = dimensionValue('size-100');
        expect(value).toBe('var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100))');
      });
      it('static-size-100', function () {
        let value = dimensionValue('static-size-100');
        expect(value).toBe('var(--spectrum-global-dimension-static-size-100, var(--spectrum-alias-static-size-100))');
      });
      it('single-line-width', function () {
        let value = dimensionValue('single-line-width');
        expect(value).toBe('var(--spectrum-global-dimension-single-line-width, var(--spectrum-alias-single-line-width))');
      });
      it('single-line-height', function () {
        let value = dimensionValue('single-line-height');
        expect(value).toBe('var(--spectrum-global-dimension-single-line-height, var(--spectrum-alias-single-line-height))');
      });
    });

    describe('css functions', function () {
      it('calc(100px - size-100)', function () {
        let value = dimensionValue('calc(100px - size-100)');
        expect(value).toBe('calc(100px - var(--spectrum-global-dimension-size-100, var(--spectrum-alias-size-100)))');
      });
      it('min(100px, size-100)', function () {
        let value = dimensionValue('min(100px, static-size-100)');
        expect(value).toBe('min(100px, var(--spectrum-global-dimension-static-size-100, var(--spectrum-alias-static-size-100)))');
      });
      it('var(--custom-variable, calc(100% - single-line-width))', function () {
        let value = dimensionValue('var(--custom-variable, calc(100% - single-line-width))');
        expect(value).toBe('var(--custom-variable, calc(100% - var(--spectrum-global-dimension-single-line-width, var(--spectrum-alias-single-line-width))))');
      });
    });
  });
});
