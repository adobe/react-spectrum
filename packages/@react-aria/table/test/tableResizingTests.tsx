/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, installPointerEvent} from '@react-spectrum/test-utils-internal';

import React from 'react';

let rows = [
  {id: 1, name: 'Charizard', type: 'Fire, Flying', level: '67', weight: '200lbs', height: '5\'7"'},
  {id: 2, name: 'Blastoise', type: 'Water', level: '56', weight: '188lbs', height: '5\'3"'},
  {id: 3, name: 'Venusaur', type: 'Grass, Poison', level: '83', weight: '220lbs', height: '6\'7"'},
  {id: 4, name: 'Pikachu', type: 'Electric', level: '100', weight: '13lbs', height: '1\'4"'},
  {id: 5, name: 'Charizard', type: 'Fire, Flying', level: '67', weight: '200lbs', height: '5\'7"'},
  {id: 6, name: 'Blastoise', type: 'Water', level: '56', weight: '188lbs', height: '5\'3"'},
  {id: 7, name: 'Venusaur', type: 'Grass, Poison', level: '83', weight: '220lbs', height: '6\'7"'},
  {id: 8, name: 'Pikachu', type: 'Electric', level: '100', weight: '13lbs', height: '1\'4"'},
  {id: 9, name: 'Charizard', type: 'Fire, Flying', level: '67', weight: '200lbs', height: '5\'7"'},
  {id: 10, name: 'Blastoise', type: 'Water', level: '56', weight: '188lbs', height: '5\'3"'},
  {id: 11, name: 'Venusaur', type: 'Grass, Poison', level: '83', weight: '220lbs', height: '6\'7"'},
  {id: 12, name: 'Pikachu', type: 'Electric', level: '100', weight: '13lbs', height: '1\'4"'}
];

function getColumnWidths(tree) {
  let rows = tree.getAllByRole('row') as HTMLElement[];
  return Array.from(rows[0].children).map(cell => Number((cell as HTMLElement).style.width.replace('px', '')));
}

export let resizingTests = (render, rerender, Table, ControlledTable, resizeCol, resizeTable) => {
// assumption with all these tests
// 1. the controlling values we pass in aren't actually controlling
// the sizes, they are instead more like the default values that the controlling logic uses
// 2. defaultWidth function and minDefaultWidth passed must be the same in any implementation using
// these tests, or the values will be wrong, if those functions were exposed we could generalize, but seems like a lot just for testing
  describe('Resizing', () => {
    installPointerEvent();
    let clientWidth, clientHeight;
    let onResize;

    beforeEach(function () {
      clientWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 900);
      clientHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
      jest.useFakeTimers();
      onResize = jest.fn();
    });

    afterEach(function () {
      act(() => {
        jest.runAllTimers();
      });
      clientWidth.mockReset();
      clientHeight.mockReset();
      onResize.mockReset();
      onResize = null;
    });

    describe.each`
      allowsResizing
      ${undefined}
      ${true}
    `('initial column sizes allowsResizing=$allowsResizing', ({allowsResizing}) => {
      it('should handle no value if table was written with default widths', () => {
        let columns = [
          {name: 'Name', id: 'name', allowsResizing},
          {name: 'Type', id: 'type', allowsResizing},
          {name: 'Level', id: 'level', allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([300, 300, 300]);
      });
      it('should handle default pixel widths', () => {
        let columns = [
          {name: 'Name', id: 'name', defaultWidth: 100, allowsResizing},
          {name: 'Type', id: 'type', defaultWidth: 100, allowsResizing},
          {name: 'Level', id: 'level', defaultWidth: 400, allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 400]);
      });
      it('should handle default percent widths', () => {
        let columns = [
          {name: 'Name', id: 'name', defaultWidth: '50%', allowsResizing},
          {name: 'Type', id: 'type', defaultWidth: '16%', allowsResizing},
          {name: 'Level', id: 'level', defaultWidth: '33%', allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([450, 144, 297]);
      });
      it('should handle default fr widths', () => {
        let columns = [
          {name: 'Name', id: 'name', defaultWidth: '4fr', allowsResizing},
          {name: 'Type', id: 'type', defaultWidth: '3fr', allowsResizing},
          {name: 'Level', id: 'level', defaultWidth: '2fr', allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([400, 300, 200]);
      });
      it('should handle a mix of default widths', () => {
        let columns = [
          {name: 'Name', id: 'name', defaultWidth: '50%', allowsResizing},
          {name: 'Type', id: 'type', defaultWidth: '2fr', allowsResizing},
          {name: 'Level', id: 'level', defaultWidth: 100, allowsResizing},
          {name: 'Height', id: 'height', allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([450, 233, 100, 117]);
      });
      it('any single remaining column with an FR will take the remaining space, regardless of how many FRs it is "worth"', () => {
        let columns = [
          {name: 'Name', id: 'name', defaultWidth: '50%', allowsResizing},
          {name: 'Type', id: 'type', defaultWidth: 100, allowsResizing},
          {name: 'Level', id: 'level', defaultWidth: 100, allowsResizing},
          {name: 'Height', id: 'height', allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([450, 100, 100, 250]);
      });
      it('cannot size less than the minWidth', () => {
        let columns = [
          {name: 'Name', id: 'name', minWidth: 500, defaultWidth: '50%', allowsResizing},
          {name: 'Type', id: 'type', minWidth: 100, defaultWidth: '1fr', allowsResizing},
          {name: 'Level', id: 'level', minWidth: 150, defaultWidth: 100, allowsResizing},
          {name: 'Height', id: 'height', minWidth: 200, allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([500, 100, 150, 200]);
      });
      it('cannot size more than the maxWidth', () => {
        let columns = [
          {name: 'Name', id: 'name', maxWidth: 400, defaultWidth: '50%', allowsResizing},
          {name: 'Type', id: 'type', maxWidth: 100, defaultWidth: '1fr', allowsResizing},
          {name: 'Level', id: 'level', maxWidth: 100, defaultWidth: 150, allowsResizing},
          {name: 'Height', id: 'height', maxWidth: 100, allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([400, 100, 100, 100]);
      });
      it('minWidth can be a percent', () => {
        let columns = [
          {name: 'Name', id: 'name', minWidth: '50%', defaultWidth: '30%', allowsResizing},
          {name: 'Type', id: 'type', maxWidth: 100, defaultWidth: '1fr', allowsResizing},
          {name: 'Level', id: 'level', maxWidth: 100, defaultWidth: 100, allowsResizing},
          {name: 'Height', id: 'height', maxWidth: 100, allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([450, 100, 100, 100]);
      });
      it('maxWidth can be a percent', () => {
        let columns = [
          {name: 'Name', id: 'name', maxWidth: '50%', defaultWidth: '70%', allowsResizing},
          {name: 'Type', id: 'type', maxWidth: 100, defaultWidth: '1fr', allowsResizing},
          {name: 'Level', id: 'level', maxWidth: 100, defaultWidth: 100, allowsResizing},
          {name: 'Height', id: 'height', maxWidth: 100, allowsResizing}
        ];
        let tree = render(<Table columns={columns} rows={rows} />);
        expect(getColumnWidths(tree)).toStrictEqual([450, 100, 100, 100]);
      });
    });

    describe('interactions', () => {
      function mapFromWidths(columnNames, widths) {
        return new Map(widths.map((width, i) => [columnNames[i].toLowerCase(), width]));
      }

      it.each`
      col         | delta  | expected                     | expectedOnResize
      ${'Name'}   | ${-50} | ${[75, 103, 103, 103, 516]}  | ${[75, '1fr', '1fr', '1fr', '5fr']}
      ${'Name'}   | ${50}  | ${[150, 94, 94, 93, 469]}    | ${[150, '1fr', '1fr', '1fr', '5fr']}
      ${'Type'}   | ${-50} | ${[100, 75, 104, 103, 518]}  | ${[100, 75, '1fr', '1fr', '5fr']}
      ${'Type'}   | ${50}  | ${[100, 150, 93, 93, 464]}   | ${[100, 150, '1fr', '1fr', '5fr']}
      ${'Height'} | ${-50} | ${[100, 100, 75, 104, 521]}  | ${[100, 100, 75, '1fr', '5fr']}
      ${'Height'} | ${50}  | ${[100, 100, 150, 92, 458]}  | ${[100, 100, 150, '1fr', '5fr']}
      ${'Weight'} | ${-50} | ${[100, 100, 100, 75, 525]}  | ${[100, 100, 100, 75, '5fr']}
      ${'Weight'} | ${50}  | ${[100, 100, 100, 150, 450]} | ${[100, 100, 100, 150, '5fr']}
      ${'Level'}  | ${-50} | ${[100, 100, 100, 100, 450]} | ${[100, 100, 100, 100, 450]}
      ${'Level'}  | ${50}  | ${[100, 100, 100, 100, 550]} | ${[100, 100, 100, 100, 550]}
    `('can resize $col to be $delta px different',
        function ({col, delta, expected, expectedOnResize}) {
          let columnNames = ['Name', 'Type', 'Height', 'Weight', 'Level'];
          let onResizeEnd = jest.fn();
          let tree = render(<ControlledTable onResize={onResize} onResizeEnd={onResizeEnd} />);
          expect(getColumnWidths(tree)).toStrictEqual([100, 100, 100, 100, 500]);

          resizeCol(tree, col, delta);

          expect(getColumnWidths(tree)).toStrictEqual(expected);
          expect(onResize).toHaveBeenCalledTimes(1);
          expect(onResize).toHaveBeenCalledWith(mapFromWidths(columnNames, expectedOnResize));
          let resizers = tree.getAllByRole('slider');
          resizers.forEach((resizer, index) => {
            expect(resizer).toHaveAttribute('value', `${expected[index]}`);
            expect(resizer).toHaveAttribute('min', `${75}`);
            expect(resizer).toHaveAttribute('max', `${Number.MAX_SAFE_INTEGER}`);
          });
          expect(onResizeEnd).toHaveBeenCalledTimes(1);
          expect(onResizeEnd).toHaveBeenCalledWith(mapFromWidths(columnNames, expectedOnResize));
        });

      it('cannot resize to be less than a minWidth, from start to end', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr', minWidth: 100},
          {name: 'Type', uid: 'type', width: '1fr', minWidth: 100},
          {name: 'Height', uid: 'height', minWidth: 100},
          {name: 'Weight', uid: 'weight', minWidth: 100},
          {name: 'Level', uid: 'level', width: '4fr', minWidth: 100}
        ];
        let columnNames = ['Name', 'Type', 'Height', 'Weight', 'Level'];

        let tree = render(<ControlledTable columns={columns} onResize={onResize} />);
        resizeCol(tree, 'Name', -50); // first column
        expect(getColumnWidths(tree)).toStrictEqual([100, 114, 115, 114, 457]);
        expect(onResize).toHaveBeenCalledTimes(1);
        expect(onResize).toHaveBeenCalledWith(mapFromWidths(columnNames, [100, '1fr', '1fr', '1fr', '4fr']));
        resizeCol(tree, 'Type', -50);
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 117, 116, 467]);
        expect(onResize).toHaveBeenCalledTimes(2);
        expect(onResize).toHaveBeenCalledWith(mapFromWidths(columnNames, [100, 100, '1fr', '1fr', '4fr']));
        resizeCol(tree, 'Height', -100);
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 100, 120, 480]);
        expect(onResize).toHaveBeenCalledTimes(3);
        expect(onResize).toHaveBeenCalledWith(mapFromWidths(columnNames, [100, 100, 100, '1fr', '4fr']));
        resizeCol(tree, 'Weight', -100);
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 100, 100, 500]);
        expect(onResize).toHaveBeenCalledTimes(4);
        expect(onResize).toHaveBeenCalledWith(mapFromWidths(columnNames, [100, 100, 100, 100, '4fr']));
        resizeCol(tree, 'Level', -500); // last column
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 100, 100, 100]);
        expect(onResize).toHaveBeenCalledTimes(5);
        expect(onResize).toHaveBeenCalledWith(mapFromWidths(columnNames, [100, 100, 100, 100, 100]));
        let resizers = tree.getAllByRole('slider');
        resizers.forEach(resizer => {
          expect(resizer).toHaveAttribute('min', `${100}`);
          expect(resizer).toHaveAttribute('max', `${Number.MAX_SAFE_INTEGER}`);
        });
      });

      it('cannot resize to be less than a minWidth, from end to start', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr', minWidth: 100},
          {name: 'Type', uid: 'type', width: '1fr', minWidth: 100},
          {name: 'Height', uid: 'height', minWidth: 100},
          {name: 'Weight', uid: 'weight', minWidth: 100},
          {name: 'Level', uid: 'level', width: '4fr', minWidth: 100}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Level', -500); // last column
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 100]);
        resizeCol(tree, 'Weight', -100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 100, 100]);
        resizeCol(tree, 'Height', -100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 100, 100, 100]);
        resizeCol(tree, 'Type', -100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 100, 100, 100, 100]);
        resizeCol(tree, 'Name', -500); // first column
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 100, 100, 100]);
      });

      it('cannot resize to be more than a maxWidth, from start to end', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr', maxWidth: 150},
          {name: 'Type', uid: 'type', width: '1fr', maxWidth: 150},
          {name: 'Height', uid: 'height', maxWidth: 200},
          {name: 'Weight', uid: 'weight', maxWidth: 200},
          {name: 'Level', uid: 'level', width: '4fr', maxWidth: 500}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Name', 150);
        expect(getColumnWidths(tree)).toStrictEqual([150, 107, 107, 107, 429]);
        resizeCol(tree, 'Type', 150);
        expect(getColumnWidths(tree)).toStrictEqual([150, 150, 100, 100, 400]);
        resizeCol(tree, 'Height', 150);
        expect(getColumnWidths(tree)).toStrictEqual([150, 150, 200, 80, 320]);
        resizeCol(tree, 'Weight', 200);
        expect(getColumnWidths(tree)).toStrictEqual([150, 150, 200, 200, 200]);
        resizeCol(tree, 'Level', 400);
        expect(getColumnWidths(tree)).toStrictEqual([150, 150, 200, 200, 500]);
        let resizers = tree.getAllByRole('slider');
        let expectedMaxWidths = [150, 150, 200, 200, 500];
        resizers.forEach((resizer, i) => {
          expect(resizer).toHaveAttribute('min', `${75}`);
          expect(resizer).toHaveAttribute('max', `${expectedMaxWidths[i]}`);
        });
      });

      it('cannot resize to be more than a maxWidth, from end to start', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr', maxWidth: 150},
          {name: 'Type', uid: 'type', width: '1fr', maxWidth: 150},
          {name: 'Height', uid: 'height', maxWidth: 200},
          {name: 'Weight', uid: 'weight', maxWidth: 200},
          {name: 'Level', uid: 'level', width: '4fr', maxWidth: 500}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Level', 150);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 500]);
        resizeCol(tree, 'Weight', 150);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 200, 500]);
        resizeCol(tree, 'Height', 100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 200, 200, 500]);
        resizeCol(tree, 'Type', 100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 150, 200, 200, 500]);
        resizeCol(tree, 'Name', 400);
        expect(getColumnWidths(tree)).toStrictEqual([150, 150, 200, 200, 500]);
      });

      it('resizing the starter column will preserve fr column ratios to the right', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
        resizeCol(tree, 'Name', -50);
        expect(getColumnWidths(tree)).toStrictEqual([75, 118, 118, 118, 471]);
        resizeCol(tree, 'Name', 38); // send it back to original size
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
      });

      it('resizing the last column will lock columns to pixels to the left', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Level', -50);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 400]);
        resizeCol(tree, 'Level', 50);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
      });

      it('can handle removing a column', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([129, 128, 129, 514]);
      });

      it('can handle adding a column', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([129, 128, 129, 514]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
      });

      it('can handle resizing, then removing an uncontrolled column, then adding the column again', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Name', -50);
        expect(getColumnWidths(tree)).toStrictEqual([75, 118, 118, 118, 471]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([75, 138, 137, 550]);
        rerender(tree, <ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([75, 118, 118, 118, 471]);
      });

      it('can handle resizing, then removing an controlled column, then adding the column again', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Name', -50);
        expect(getColumnWidths(tree)).toStrictEqual([75, 118, 118, 118, 471]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([75, 275, 275, 275]);
        rerender(tree, <ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([75, 118, 118, 118, 471]);
      });

      it('can add new columns after resizing', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Name', -50);
        expect(getColumnWidths(tree)).toStrictEqual([250, 325, 325]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([250, 163, 162, 163, 162]);
      });

      it('can remove and re-add the resized column', function () {
        jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        resizeCol(tree, 'Type', -50);
        expect(getColumnWidths(tree)).toStrictEqual([113, 75, 119, 118, 475]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 131, 131, 525]);
        rerender(tree, <ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 75, 119, 118, 475]);
      });

      it('can resize smaller if the minWidth gets smaller', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr', minWidth: 100},
          {name: 'Type', uid: 'type', width: '1fr', minWidth: 100},
          {name: 'Height', uid: 'height', minWidth: 100},
          {name: 'Weight', uid: 'weight', minWidth: 100},
          {name: 'Level', uid: 'level', width: '4fr', minWidth: 100}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
        resizeCol(tree, 'Type', -100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 100, 115, 114, 458]);
        let newColumns = [
          {name: 'Name', uid: 'name', width: '1fr', minWidth: 100},
          {name: 'Type', uid: 'type', width: '1fr', minWidth: 50},
          {name: 'Height', uid: 'height', minWidth: 100},
          {name: 'Weight', uid: 'weight', minWidth: 100},
          {name: 'Level', uid: 'level', width: '4fr', minWidth: 100}
        ];
        rerender(tree, <ControlledTable columns={newColumns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 100, 115, 114, 458]);
        resizeCol(tree, 'Type', -100);
        expect(getColumnWidths(tree)).toStrictEqual([113, 50, 123, 123, 491]);
      });

      it('onResize end called with values even if no resizing took place', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr', minWidth: 100},
          {name: 'Type', uid: 'type', width: '1fr', minWidth: 100},
          {name: 'Height', uid: 'height', minWidth: 100},
          {name: 'Weight', uid: 'weight', minWidth: 100},
          {name: 'Level', uid: 'level', width: '4fr', minWidth: 100}
        ];
        let columnNames = ['Name', 'Type', 'Height', 'Weight', 'Level'];
        let onResizeEnd = jest.fn();

        let tree = render(<ControlledTable columns={columns} onResizeEnd={onResizeEnd} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
        resizeCol(tree, 'Type', 0);
        expect(onResizeEnd).toHaveBeenCalledWith(mapFromWidths(columnNames, [113, 112, '1fr', '1fr', '4fr']));
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
      });

      it('onResize end called with values even if no resizing took place uncontrolled', function () {
        let allowsResizing = true;
        let columns = [
          {name: 'Name', id: 'name', allowsResizing},
          {name: 'Type', id: 'type', defaultWidth: '3fr', allowsResizing},
          {name: 'Level', id: 'level', allowsResizing},
          {name: 'Height', id: 'height', defaultWidth: '5fr', allowsResizing}
        ];
        let columnNames = ['Name', 'Type', 'Level', 'Height'];
        let onResizeEnd = jest.fn();
        let tree = render(<Table columns={columns} rows={rows} onResizeEnd={onResizeEnd} />);
        expect(getColumnWidths(tree)).toStrictEqual([90, 270, 90, 450]);
        resizeCol(tree, 'Type', 0);
        expect(getColumnWidths(tree)).toStrictEqual([90, 270, 90, 450]);
        expect(onResizeEnd).toHaveBeenCalledWith(mapFromWidths(columnNames, [90, 270, '1fr', '5fr']));
      });

      it('onResizeStart called with expected values', function () {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let columnNames = ['Name', 'Type', 'Height', 'Weight', 'Level'];
        let onResizeStart = jest.fn();

        let tree = render(<ControlledTable columns={columns} onResizeStart={onResizeStart} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
        resizeCol(tree, 'Height', -50);
        expect(onResizeStart).toHaveBeenCalledTimes(1);
        expect(onResizeStart).toHaveBeenCalledWith(mapFromWidths(columnNames, [113, 112, 113, '1fr', '4fr']));
      });
    });

    describe('resizing table', () => {
      it('will not affect pixel widths', () => {
        let columns = [
          {name: 'Name', uid: 'name', width: 100},
          {name: 'Type', uid: 'type', width: 100},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: 400}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 150, 150, 400]);
        resizeTable(clientWidth, 1000);
        expect(getColumnWidths(tree)).toStrictEqual([100, 100, 200, 200, 400]);
      });

      it('will resize all percent columns', () => {
        let columns = [
          {name: 'Name', uid: 'name', width: '20%'},
          {name: 'Type', uid: 'type', width: '20%'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '40%'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([180, 180, 90, 90, 360]);
        resizeTable(clientWidth, 1000);
        expect(getColumnWidths(tree)).toStrictEqual([200, 200, 100, 100, 400]);
      });

      it('will resize all fr columns', () => {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '1fr'},
          {name: 'Height', uid: 'height'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([113, 112, 113, 112, 450]);
        resizeTable(clientWidth, 1000);
        expect(getColumnWidths(tree)).toStrictEqual([125, 125, 125, 125, 500]);
      });

      it('will resize all fr columns only after percent columns', () => {
        let columns = [
          {name: 'Name', uid: 'name', width: '1fr'},
          {name: 'Type', uid: 'type', width: '20%'},
          {name: 'Height', uid: 'height', width: '20%'},
          {name: 'Weight', uid: 'weight'},
          {name: 'Level', uid: 'level', width: '4fr'}
        ];

        let tree = render(<ControlledTable columns={columns} />);
        expect(getColumnWidths(tree)).toStrictEqual([90, 180, 180, 90, 360]);
        resizeTable(clientWidth, 1000);
        expect(getColumnWidths(tree)).toStrictEqual([100, 200, 200, 100, 400]);
      });
    });
  });
};
