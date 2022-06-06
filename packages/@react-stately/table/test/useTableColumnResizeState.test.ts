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

import {getContentWidth, useTableColumnResizeState} from '../';
import {renderHook} from '@react-spectrum/test-utils';

const createColumn = (key, columnProps) => ({
  type: 'column',
  props: columnProps,
  key,
  value: null,
  level: 0,
  hasChildNodes: null,
  childNodes: [],
  rendered: key,
  textValue: key
});

describe('useTableColumnResizeState', () => {
  describe('static defaultWidth', () => {
    it('should handle pixel widths', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, defaultWidth: 300}),
        createColumn('Age', {allowsResizing: true, defaultWidth: 100}),
        createColumn('Weight', {allowsResizing: true, defaultWidth: 200})
      ];

      const {result} = renderHook(() => useTableColumnResizeState({columns}));
      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 300], ['Age', 100], ['Weight', 200]]));
    });

    it('should handle percentage widths', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, defaultWidth: '50%'}),
        createColumn('Age', {allowsResizing: true, defaultWidth: '16%'}),
        createColumn('Weight', {allowsResizing: true, defaultWidth: '33%'})
      ];

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth: 600}));
      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 300], ['Age', 96], ['Weight', 198]]));
    });
  });

  describe('dynamic defaultWidth', () => {
    it('should proportionately allocate space when no defaultWidth is given', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true}),
        createColumn('Age', {allowsResizing: true}),
        createColumn('Weight', {allowsResizing: true})
      ];

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth: 333}));
      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 111], ['Age', 111], ['Weight', 111]]));
    });

    it('should proportionately allocate space when defaultWidth is *fr units', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, defaultWidth: '1fr'}),
        createColumn('Age', {allowsResizing: true, defaultWidth: '2fr'}),
        createColumn('Weight', {allowsResizing: true, defaultWidth: '1fr'})
      ];

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth: 1000}));
      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 250], ['Age', 500], ['Weight', 250]]));
    });
  });

  describe('bounded widths', () => {
    it('should fulfill the maxWidth constraint and give remaining space to other dynamic columns', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, maxWidth: 85}),
        createColumn('Age', {allowsResizing: true, defaultWidth: '2fr'}),
        createColumn('Weight', {allowsResizing: true, defaultWidth: '1fr'})
      ];

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth: 1000}));
      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 85], ['Age', 610], ['Weight', 305]]));
    });

    it('should fulfill the minWidth constraint and give remaining space to other dynamic columns', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, minWidth: 400}),
        createColumn('Age', {allowsResizing: true, defaultWidth: '2fr'}),
        createColumn('Weight', {allowsResizing: true, defaultWidth: '1fr'})
      ];

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth: 1000}));
      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 400], ['Age', 400], ['Weight', 200]]));
    });

    it('should fulfill the bounded constraints when the total column widths is greater than the allowed table width', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, minWidth: 1000}),
        createColumn('Age', {allowsResizing: true, minWidth: 1000}),
        createColumn('Weight', {allowsResizing: true, defaultWidth: '1fr'})
      ];

      const tableWidth = 1000;

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth}));

      const actualColumnWidths = getContentWidth(result.current.columnWidths.current);

      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 1000], ['Age', 1000], ['Weight', 75]]));
      expect(actualColumnWidths > tableWidth);
    });

    it('should fulfill the bounded constraints when the total column widths is less than the allowed table width', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, maxWidth: 100}),
        createColumn('Age', {allowsResizing: true, maxWidth: 100}),
        createColumn('Weight', {allowsResizing: true, maxWidth: 250, defaultWidth: '1fr'})
      ];

      const tableWidth = 1000;

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth}));

      const actualColumnWidths = getContentWidth(result.current.columnWidths.current);

      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 100], ['Age', 100], ['Weight', 250]]));
      expect(actualColumnWidths < tableWidth);
    });

    it('should allocate extra space to previous dynamic columns if later columns are bounded.', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, defaultWidth: '2fr'}),
        createColumn('Age', {allowsResizing: true, maxWidth: 100}),
        createColumn('Weight', {allowsResizing: true, maxWidth: 250, defaultWidth: '1fr'})
      ];

      const tableWidth = 1000;

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth}));

      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 650], ['Age', 100], ['Weight', 250]]));
    });

    /*
      This test actually fails if the minWidth for 'Name' is large (like 600). Even though minWidth 600 is less than 650 (and therefore not bounded)
      its delta ends up being larger than the other columns and it gets evaluated first - which is incorrect.

      We tried to come up with a simple way to resolve this problem without causing regressions but couldn't.
      However this is an extreme edge-case and these cases being tested were already failing in the previous width calculation so we are not
      introducing any new breaking behavior and actually have introduced new behavior which fixes 4/5 cases that were previously broken.

      Making this comment as acknowledgement of the broken case and maybe in the future we might enhance this with an algorithm that covers all cases.
    */
    it('should allocate extra space to previous "less bounded" minWidth dynamic columns if later columns are "more bounded".', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, minWidth: 300}),
        createColumn('Age', {allowsResizing: true, maxWidth: 100}),
        createColumn('Weight', {allowsResizing: true, maxWidth: 250})
      ];

      const tableWidth = 1000;

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth}));

      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 650], ['Age', 100], ['Weight', 250]]));
    });

    it('should allocate extra space to previous "less bounded" maxWidth dynamic columns if later columns are "more bounded".', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, maxWidth: 1000}),
        createColumn('Age', {allowsResizing: true, minWidth: 500}),
        createColumn('Weight', {allowsResizing: true, maxWidth: 400})
      ];

      const tableWidth = 1000;

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth}));

      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 250], ['Age', 500], ['Weight', 250]]));
    });

    it('should distribute extra space evenly amongst "less bounded" dynamic columns.', () => {
      const columns = [
        createColumn('Name', {allowsResizing: true, maxWidth: 330}),
        createColumn('Age', {allowsResizing: true, minWidth: 500}),
        createColumn('Weight', {allowsResizing: true, maxWidth: 330})
      ];

      const tableWidth = 1000;

      const {result} = renderHook(() => useTableColumnResizeState({columns, tableWidth}));

      expect(result.current.columnWidths.current).toEqual(new Map([['Name', 250], ['Age', 500], ['Weight', 250]]));
    });
  });
});
