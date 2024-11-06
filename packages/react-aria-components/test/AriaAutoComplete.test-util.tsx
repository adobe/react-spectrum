/*
 * Copyright 2024 Adobe. All rights reserved.
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
import userEvent from '@testing-library/user-event';

// TODO: bring this in when a test util is written so that we can have proper testing for all interaction modalities
// let describeInteractions = ((name, tests) => describe.each`
//   interactionType
//   ${'mouse'}
//   ${'keyboard'}
//   ${'touch'}
// `(`${name} - $interactionType`, tests));

// TODO: place somewhere central?
interface AriaBaseTestProps {
  setup?: () => void,
  prefix?: string
}

interface RendererArgs {
  autocompleteProps?: any,
  menuProps?: any
}
interface AriaAutocompleteTestProps extends AriaBaseTestProps {
  renderers: {
    // needs to wrap a menu with at three items, all enabled. The items should be Foo, Bar, and Baz
    standard: (args: RendererArgs) => ReturnType<typeof render>,
    // needs at least two sections, each with three items
    sections?: (args: RendererArgs) => ReturnType<typeof render>,
    // needs a item with a link
    links?: (args: RendererArgs) => ReturnType<typeof render>,
    // needs a menu with three items, with the middle one disabled
    disabledOption?: (args: RendererArgs) => ReturnType<typeof render>,
    controlled?: (args: RendererArgs) => ReturnType<typeof render>
    // TODO, add tests for this when we support it
    // submenus?: (props?: {name: string}) => ReturnType<typeof render>
  }
}
export const AriaAutocompleteTests = ({renderers, setup, prefix}: AriaAutocompleteTestProps) => {
  describe(prefix ? prefix + 'AriaAutocomplete' : 'AriaAutocomplete', function () {
    // let onOpenChange = jest.fn();
    // let onOpen = jest.fn();
    // let onClose = jest.fn();
    // let onSelect = jest.fn();
    // let onSelectionChange = jest.fn();
    let user;
    setup?.();

    beforeAll(function () {
      user = userEvent.setup({delay: null, pointerMap});
      // window.HTMLElement.prototype.scrollIntoView = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      // onOpenChange.mockClear();
      // onOpen.mockClear();
      // onClose.mockClear();
      // onSelect.mockClear();
      // onSelectionChange.mockClear();
      act(() => jest.runAllTimers());
    });

    it('has default behavior (input field renders with expected attributes)', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('aria-controls');

      let menu = getByRole('menu');
      expect(menu).toHaveAttribute('id', input.getAttribute('aria-controls'));
    });

    it('should support disabling the field', async function () {
      let {getByRole} = renderers.standard({autocompleteProps: {isDisabled: true}});
      let input = getByRole('searchbox');
      expect(input).toHaveAttribute('disabled');
    });

    it('should support making the field read only', async function () {
      let {getByRole} = renderers.standard({autocompleteProps: {isReadOnly: true}});
      let input = getByRole('searchbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should support filtering', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      expect(input).toHaveValue('');
      let menu = getByRole('menu');
      let options = within(menu).getAllByRole('menuitem');
      expect(options).toHaveLength(3);

      await user.tab();
      expect(document.activeElement).toBe(input);
      await user.keyboard('F');
      act(() => jest.runAllTimers());
      options = within(menu).getAllByRole('menuitem');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Foo');

      expect(input).toHaveValue('F');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      expect(document.activeElement).toBe(input);

      await user.keyboard('{Backspace}');
      options = within(menu).getAllByRole('menuitem');
      expect(options).toHaveLength(3);
      expect(input).not.toHaveAttribute('aria-activedescendant');
      expect(document.activeElement).toBe(input);
    });

    it('should support keyboard navigation', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', options[2].id);
      await user.keyboard('{ArrowUp}');
      expect(input).toHaveAttribute('aria-activedescendant', options[1].id);

      expect(document.activeElement).toBe(input);
    });

    it('should clear the focused key when using ArrowLeft and ArrowRight', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('Foo');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('{ArrowRight}');
      expect(input).not.toHaveAttribute('aria-activedescendant');
      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('{ArrowLeft}');
      expect(input).not.toHaveAttribute('aria-activedescendant');
      expect(document.activeElement).toBe(input);
    });

    // it('should trigger the menu\'s onAction', async function () {

    // });

    // it('temp', async function () {

    // });

    // TODO: test filtering with defaultValue, controlled value
    // test that onaction fires
    // check defaultFilter

    // write tests for sections (filtering and keyboard navigation) and for link (triggers link)
    // skips disabled keys, skips sections
  });
};
