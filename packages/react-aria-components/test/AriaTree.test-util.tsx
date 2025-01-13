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

import {act, render, within} from '@testing-library/react';
import {
  pointerMap
} from '@react-spectrum/test-utils-internal';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

let describeInteractions = ((name, tests) => describe.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
  ${'touch'}
`(`${name} - $interactionType`, tests));

// @ts-ignore
describeInteractions.only = ((name, tests) => describe.only.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
  ${'touch'}
`(`${name} - $interactionType`, tests));

// @ts-ignore
describeInteractions.skip = ((name, tests) => describe.skip.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
  ${'touch'}
`(`${name} - $interactionType`, tests));

interface AriaBaseTestProps {
  setup?: () => void,
  prefix?: string
}
interface AriaTreeTestProps extends AriaBaseTestProps {
  renderers: {
    // must have an aria-label
    standard: (props?: {name: string}) => ReturnType<typeof render>,
    // must have an aria-label
    singleSelection?: (props?: {name: string}) => ReturnType<typeof render>,
    // must have an aria-label
    allInteractionsDisabled?: (props?: {name: string}) => ReturnType<typeof render>
  }
}
export const AriaTreeTests = ({renderers, setup, prefix}: AriaTreeTestProps) => {
  describe(prefix ? prefix + 'AriaTree' : 'AriaTree', function () {
    let user;
    let testUtilUser = new User();
    setup?.();

    beforeAll(function () {
      jest.useFakeTimers();
    });

    beforeEach(function () {
      user = userEvent.setup({delay: null, pointerMap});
    });

    afterEach(() => {
      act(() => jest.runAllTimers());
    });

    it('should have the base set of aria and data attributes', () => {
      let root = (renderers.standard!)();
      let treeTester = testUtilUser.createTester('Tree', {user, root: root.container});
      let tree = treeTester.tree;
      expect(tree).toHaveAttribute('aria-label');

      for (let row of treeTester.rows) {
        expect(row).toHaveAttribute('aria-level');
        expect(row).toHaveAttribute('aria-posinset');
        expect(row).toHaveAttribute('aria-setsize');
      }
      expect(treeTester.rows[0]).not.toHaveAttribute('aria-expanded');
      expect(treeTester.rows[1]).toHaveAttribute('aria-expanded', 'false');
    });

    describeInteractions('interaction', function ({interactionType}) {
      it('should have the expected attributes on the rows', async () => {
        let tree = (renderers.standard!)();
        let treeTester = testUtilUser.createTester('Tree', {user, root: tree.container, interactionType});
        await treeTester.toggleRowExpansion({row: 1});
        await treeTester.toggleRowExpansion({row: 2});

        let rows = treeTester.rows;
        let rowNoChild = rows[0];
        expect(rowNoChild).toHaveAttribute('aria-label');
        expect(rowNoChild).not.toHaveAttribute('aria-expanded');
        expect(rowNoChild).toHaveAttribute('aria-level', '1');
        expect(rowNoChild).toHaveAttribute('aria-posinset', '1');
        expect(rowNoChild).toHaveAttribute('aria-setsize', '3');

        let rowWithChildren = rows[1];
        // Row has action since it is expandable but not selectable.
        expect(rowWithChildren).toHaveAttribute('aria-expanded', 'true');
        expect(rowWithChildren).toHaveAttribute('aria-level', '1');
        expect(rowWithChildren).toHaveAttribute('aria-posinset', '2');
        expect(rowWithChildren).toHaveAttribute('aria-setsize', '3');

        let level2ChildRow = rows[2];
        expect(level2ChildRow).toHaveAttribute('aria-expanded', 'true');
        expect(level2ChildRow).toHaveAttribute('data-expanded', 'true');
        expect(level2ChildRow).toHaveAttribute('aria-level', '2');
        expect(level2ChildRow).toHaveAttribute('aria-posinset', '1');
        expect(level2ChildRow).toHaveAttribute('aria-setsize', '3');

        let level3ChildRow = rows[3];
        expect(level3ChildRow).not.toHaveAttribute('aria-expanded');
        expect(level3ChildRow).toHaveAttribute('aria-level', '3');
        expect(level3ChildRow).toHaveAttribute('aria-posinset', '1');
        expect(level3ChildRow).toHaveAttribute('aria-setsize', '1');

        let level2ChildRow2 = rows[4];
        expect(level2ChildRow2).not.toHaveAttribute('aria-expanded');
        expect(level2ChildRow2).toHaveAttribute('aria-level', '2');
        expect(level2ChildRow2).toHaveAttribute('aria-posinset', '2');
        expect(level2ChildRow2).toHaveAttribute('aria-setsize', '3');

        let level2ChildRow3 = rows[5];
        expect(level2ChildRow3).not.toHaveAttribute('aria-expanded');
        expect(level2ChildRow3).toHaveAttribute('aria-level', '2');
        expect(level2ChildRow3).toHaveAttribute('aria-posinset', '3');
        expect(level2ChildRow3).toHaveAttribute('aria-setsize', '3');

        // Collapse the first row and make sure it's collpased and that the inner rows are gone
        await treeTester.toggleRowExpansion({row: 1});
        expect(rowWithChildren).toHaveAttribute('aria-expanded', 'false');
        expect(level2ChildRow).not.toBeInTheDocument();
      });
    });

    if (renderers.singleSelection) {
      describe('single selection', function () {
        describeInteractions('interaction', function ({interactionType}) {
          // todo add test for using Space on the row to select it
          it('can select items', async () => {
            let tree = (renderers.singleSelection!)();
            let treeTester = testUtilUser.createTester('Tree', {user, root: tree.container, interactionType});

            let rows = treeTester.rows;
            expect(rows[0]).toHaveAttribute('aria-selected', 'false');
            expect(rows[1]).toHaveAttribute('aria-selected', 'false');
            // disabled rows should not be selectable
            expect(rows[2]).not.toHaveAttribute('aria-selected');
            expect(within(rows[2]).getByRole('checkbox')).toHaveAttribute('disabled');

            await treeTester.toggleRowSelection({row: 0});
            expect(rows[0]).toHaveAttribute('aria-selected', 'true');
            expect(rows[1]).toHaveAttribute('aria-selected', 'false');
            expect(treeTester.selectedRows).toHaveLength(1);
            expect(within(treeTester.rows[0]).getByRole('checkbox')).toBeChecked();

            await treeTester.toggleRowSelection({row: 1});
            expect(rows[0]).toHaveAttribute('aria-selected', 'false');
            expect(rows[1]).toHaveAttribute('aria-selected', 'true');
            expect(treeTester.selectedRows).toHaveLength(1);
            expect(within(treeTester.rows[0]).getByRole('checkbox')).not.toBeChecked();
            expect(within(treeTester.rows[1]).getByRole('checkbox')).toBeChecked();

            await treeTester.toggleRowSelection({row: 2});
            expect(rows[0]).toHaveAttribute('aria-selected', 'false');
            expect(rows[1]).toHaveAttribute('aria-selected', 'true');
            expect(rows[2]).not.toHaveAttribute('aria-selected');

            await treeTester.toggleRowExpansion({row: 1});
            rows = treeTester.rows;
            // row 2 is now the subrow of row 1 because we expanded it
            expect(rows[2]).toHaveAttribute('aria-selected', 'false');

            await treeTester.toggleRowSelection({row: 2});
            expect(rows[0]).toHaveAttribute('aria-selected', 'false');
            expect(rows[1]).toHaveAttribute('aria-selected', 'false');
            expect(rows[2]).toHaveAttribute('aria-selected', 'true');

            // collapse and re-expand to make sure the selection persists
            await treeTester.toggleRowExpansion({row: 1});
            await treeTester.toggleRowExpansion({row: 1});
            rows = treeTester.rows;
            expect(rows[2]).toHaveAttribute('aria-selected', 'true');

            await treeTester.toggleRowSelection({row: 2});
            expect(rows[0]).toHaveAttribute('aria-selected', 'false');
            expect(rows[1]).toHaveAttribute('aria-selected', 'false');
            expect(rows[2]).toHaveAttribute('aria-selected', 'false');

            await treeTester.toggleRowExpansion({row: 1});
            // items inside a disabled item can be selected
            await treeTester.toggleRowExpansion({row: 2});
            rows = treeTester.rows;

            await treeTester.toggleRowSelection({row: 3});
            expect(rows[3]).toHaveAttribute('aria-selected', 'true');
          });
        });
      });
    }

    if (renderers.allInteractionsDisabled) {
      describe('all interactions disabled', function () {
        describeInteractions('interaction', function ({interactionType}) {
          it('should not be able to interact with the tree', async () => {
            let tree = (renderers.allInteractionsDisabled!)();
            let treeTester = testUtilUser.createTester('Tree', {user, root: tree.container, interactionType});

            let rows = treeTester.rows;
            expect(rows[2]).toHaveAttribute('aria-expanded', 'false');

            await treeTester.toggleRowExpansion({row: 2});
            expect(rows[2]).toHaveAttribute('aria-expanded', 'false');

            await treeTester.toggleRowSelection({row: 2});
            expect(rows[2]).not.toHaveAttribute('aria-selected');
          });
        });
      });
    }
  });
};
