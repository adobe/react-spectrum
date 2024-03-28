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

import {convertStyleProps, dimensionValue, viewStyleProps} from '../';


describe('styleProps', function () {
  describe('dimensionValue', function () {
    describe('number', function () {
      it('100', function () {
        let value = dimensionValue(100);
        expect(value).toBe('100px');
      });
    });

    describe('falsy', function () {
      it('""', function () {
        let value = dimensionValue();
        expect(value).toBe(undefined);
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

  describe('backgroundColorValue', () => {
    it('falsy', () => {
      let style = convertStyleProps({backgroundColor: {S: 'gray-50'}}, viewStyleProps, 'ltr', ['base']);
      expect(style.backgroundColor).toBe(undefined);
    });
    it('gray-50, version 5', () => {
      let style = convertStyleProps({backgroundColor: {S: 'gray-50'}}, viewStyleProps, 'ltr', ['base', 'S']);
      expect(style.backgroundColor).toBe('var(--spectrum-alias-background-color-gray-50, var(--spectrum-legacy-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-background))))');
    });
    it('red-1400, version 6', () => {
      let style = convertStyleProps({backgroundColor: {S: 'red-1400'}, colorVersion: 6}, viewStyleProps, 'ltr', ['base', 'S']);
      expect(style.backgroundColor).toBe('var(--spectrum-alias-background-color-red-1400, var(--spectrum-red-1400, var(--spectrum-semantic-red-1400-color-background)))');
    });
  });

  describe('borderColorValue', () => {
    it('falsy', () => {
      let style = convertStyleProps({borderColor: {S: 'gray-50'}}, viewStyleProps, 'ltr', ['base']);
      expect(style.borderColor).toBe(undefined);
    });
    it('default', () => {
      let style = convertStyleProps({borderColor: 'default'}, viewStyleProps, 'ltr', ['base']);
      expect(style.borderColor).toBe('var(--spectrum-alias-border-color)');
    });
    it('gray-50, version 5', () => {
      let style = convertStyleProps({borderColor: {S: 'gray-50'}}, viewStyleProps, 'ltr', ['base', 'S']);
      expect(style.borderColor).toBe('var(--spectrum-alias-border-color-gray-50, var(--spectrum-legacy-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-border))))');
    });
    it('red-1400, version 6', () => {
      let style = convertStyleProps({borderColor: {S: 'red-1400'}, colorVersion: 6}, viewStyleProps, 'ltr', ['base', 'S']);
      expect(style.borderColor).toBe('var(--spectrum-alias-border-color-red-1400, var(--spectrum-red-1400, var(--spectrum-semantic-red-1400-color-border)))');
    });
  });

  describe('borderRadiusValue', () => {
    it('falsy', () => {
      let style = convertStyleProps({borderRadius: {S: 'small'}}, viewStyleProps, 'ltr', ['base']);
      expect(style.borderRadius).toBe(undefined);
    });
    it('small', () => {
      let style = convertStyleProps({borderRadius: {S: 'small'}}, viewStyleProps, 'ltr', ['base', 'S']);
      expect(style.borderRadius).toBe('var(--spectrum-alias-border-radius-small)');
    });
  });

  describe('borderSizeValue', function () {
    it('should default to 0 if base is undefined', function () {
      let style = convertStyleProps({borderEndWidth: {S: 'thin'}}, viewStyleProps, 'ltr', ['base']);
      expect(style.borderRightWidth).toBe('0');
      style = convertStyleProps({borderEndWidth: {S: 'thin'}}, viewStyleProps, 'ltr', ['S', 'base']);
      expect(style.borderRightWidth).toBe('var(--spectrum-alias-border-size-thin)');
      style = convertStyleProps({borderEndWidth: {S: 'thin'}}, viewStyleProps, 'ltr', ['M', 'S', 'base']);
      expect(style.borderRightWidth).toBe('var(--spectrum-alias-border-size-thin)');
    });

    it('should accept "none" to unset the border size', function () {
      let style = convertStyleProps({borderEndWidth: {S: 'thick', M: 'none', L: 'thin'}}, viewStyleProps, 'ltr', ['S', 'base']);
      expect(style.borderRightWidth).toBe('var(--spectrum-alias-border-size-thick)');
      style = convertStyleProps({borderEndWidth: {S: 'thick', M: 'none', L: 'thin'}}, viewStyleProps, 'ltr', ['M', 'S', 'base']);
      expect(style.borderRightWidth).toBe('0');
      style = convertStyleProps({borderEndWidth: {S: 'thick', M: 'none', L: 'thin'}}, viewStyleProps, 'ltr', ['L', 'M', 'S', 'base']);
      expect(style.borderRightWidth).toBe('var(--spectrum-alias-border-size-thin)');
    });
  });
});
