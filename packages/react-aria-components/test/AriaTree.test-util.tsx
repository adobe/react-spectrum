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

import {act, render} from '@testing-library/react';

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
    // must have label "test tree"
    standard: (props?: {name: string}) => ReturnType<typeof render>
  }
}
export const AriaTreeTests = ({renderers, setup, prefix}: AriaTreeTestProps) => {
  describe(prefix ? prefix + 'AriaTree' : 'AriaTree', function () {
    setup?.();

    beforeAll(function () {
      jest.useFakeTimers();
    });

    afterEach(() => {
      act(() => jest.runAllTimers());
    });

    it('should have the base set of aria and data attributes', () => {
      let {getByRole, getAllByRole} = (renderers.standard!)();
      let tree = getByRole('treegrid');
      expect(tree).toHaveAttribute('aria-label', 'test tree');

      for (let row of getAllByRole('row')) {
        expect(row).toHaveAttribute('aria-level');
        expect(row).toHaveAttribute('aria-posinset');
        expect(row).toHaveAttribute('aria-setsize');
      }
    });

    // if (renderers.singleSelection) {
    //   describe('single selection', function () {
    //     it('selects an option via mouse', async function () {
    //       let tree = (renderers.singleSelection!)();
    //       let menuTester = testUtilUser.createTester('Menu', {user, root: tree.container});
    //       let triggerButton = menuTester.trigger!;

    //       await menuTester.open();
    //       act(() => {jest.runAllTimers();});

    //       let menu = menuTester.menu;
    //       expect(menu).toBeTruthy();
    //       expect(menu).toHaveAttribute('aria-labelledby', triggerButton.id);

    //       let options = menuTester.options;

    //       await menuTester.selectOption({option: options[1], menuSelectionMode: 'single'});

    //       act(() => {jest.runAllTimers();});
    //       expect(menu).not.toBeInTheDocument();

    //       await menuTester.open();
    //       act(() => {jest.runAllTimers();});

    //       options = menuTester.options;
    //       expect(options[0]).toHaveAttribute('aria-checked', 'false');
    //       expect(options[1]).toHaveAttribute('aria-checked', 'true');
    //     });
    //   });
    // }
  });
};
