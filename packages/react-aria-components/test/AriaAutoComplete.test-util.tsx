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
  mockClickDefault,
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
  inputProps?: any,
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
    controlled?: (args: RendererArgs) => ReturnType<typeof render>
    // TODO, add tests for this when we support it
    // submenus?: (props?: {name: string}) => ReturnType<typeof render>
  }
}
export const AriaAutocompleteTests = ({renderers, setup, prefix}: AriaAutocompleteTestProps) => {
  describe(prefix ? prefix + 'AriaAutocomplete' : 'AriaAutocomplete', function () {
    let onAction = jest.fn();
    let onSelectionChange = jest.fn();
    let user;
    setup?.();

    beforeAll(function () {
      user = userEvent.setup({delay: null, pointerMap});
      jest.useFakeTimers();
    });

    afterEach(() => {
      onAction.mockClear();
      act(() => jest.runAllTimers());
    });

    it('has default behavior (input field renders with expected attributes)', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      expect(input).toHaveAttribute('aria-controls');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('autoCorrect', 'off');
      expect(input).toHaveAttribute('spellCheck', 'false');

      let menu = getByRole('menu');
      expect(menu).toHaveAttribute('id', input.getAttribute('aria-controls')!);

      let label = document.getElementById(input.getAttribute('aria-labelledby')!);
      expect(label).toHaveTextContent('Test');

      let description = document.getElementById(input.getAttribute('aria-describedby')!);
      expect(description).toHaveTextContent('Please select an option below');
    });

    it('should support disabling the field', async function () {
      let {getByRole} = renderers.standard({inputProps: {isDisabled: true}});
      let input = getByRole('searchbox');
      expect(input).toHaveAttribute('disabled');
    });

    it('should support making the field read only', async function () {
      let {getByRole} = renderers.standard({inputProps: {isReadOnly: true}});
      let input = getByRole('searchbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should support default value', async function () {
      let {getByRole} = renderers.standard({autocompleteProps: {defaultInputValue: 'Ba'}});
      let input = getByRole('searchbox');
      expect(input).toHaveValue('Ba');
      let menu = getByRole('menu');
      let options = within(menu).getAllByRole('menuitem');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Bar');
      expect(options[1]).toHaveTextContent('Baz');

      await user.tab();
      expect(document.activeElement).toBe(input);
      await user.keyboard('z');
      act(() => jest.runAllTimers());
      options = within(menu).getAllByRole('menuitem');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('Baz');
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
      act(() => jest.runAllTimers());
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

    it('should trigger the wrapped element\'s onAction when hitting Enter', async function () {
      let {getByRole} = renderers.standard({menuProps: {onAction}});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('{ArrowDown}');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenLastCalledWith('1');

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledTimes(2);
      expect(onAction).toHaveBeenLastCalledWith('2');
    });

    it('should not trigger the wrapped element\'s onAction when hitting Space', async function () {
      let {getByRole} = renderers.standard({menuProps: {onAction}});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('{ArrowDown}');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('[Space]');
      act(() => jest.runAllTimers());
      expect(onAction).toHaveBeenCalledTimes(0);
      options = within(menu).queryAllByRole('menuitem');
      expect(options).toHaveLength(0);
    });

    it('should trigger the wrapped element\'s onSelectionChange when hitting Enter', async function () {
      let {getByRole} = renderers.standard({menuProps: {onSelectionChange, selectionMode: 'multiple'}});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('{ArrowDown}');
      let options = within(menu).getAllByRole('menuitemcheckbox');
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('{Enter}');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['1']));

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['1', '2']));

      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');
      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      expect(new Set(onSelectionChange.mock.calls[2][0])).toEqual(new Set(['2']));
    });

    it('should properly skip over disabled keys', async function () {
      let {getByRole} = renderers.standard({menuProps: {disabledKeys: ['2'], onAction}});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      let options = within(menu).getAllByRole('menuitem');
      expect(options[1]).toHaveAttribute('aria-disabled', 'true');

      await user.tab();
      expect(document.activeElement).toBe(input);
      await user.keyboard('{ArrowDown}');
      act(() => jest.runAllTimers());
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      await user.keyboard('{ArrowDown}');
      act(() => jest.runAllTimers());
      expect(input).toHaveAttribute('aria-activedescendant', options[2].id);

      await user.keyboard('Bar');
      act(() => jest.runAllTimers());
      options = within(menu).getAllByRole('menuitem');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveAttribute('aria-disabled', 'true');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.click(options[0]);
      expect(onAction).toHaveBeenCalledTimes(0);
    });

    it('should update the aria-activedescendant when hovering over an item', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);
      // Need to press to set a modality
      await user.click(input);
      await user.hover(options[1]);
      act(() => jest.runAllTimers());
      expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
      expect(document.activeElement).toBe(input);
    });

    it('should delay the aria-activedescendant being set when autofocusing the first option', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('a');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).not.toHaveAttribute('aria-activedescendant');
      act(() => jest.advanceTimersByTime(500));
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    });

    it('should maintain the newest focused item as the activescendant if set after autofocusing the first option', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox');
      let menu = getByRole('menu');
      expect(input).not.toHaveAttribute('aria-activedescendant');

      await user.tab();
      expect(document.activeElement).toBe(input);

      await user.keyboard('a');
      let options = within(menu).getAllByRole('menuitem');
      expect(input).not.toHaveAttribute('aria-activedescendant');
      await user.keyboard('{ArrowDown}');
      act(() => jest.runAllTimers());
      expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
    });

    it('should not move the text input cursor when using Home/End/ArrowUp/ArrowDown', async function () {
      let {getByRole} = renderers.standard({});
      let input = getByRole('searchbox') as HTMLInputElement;

      await user.tab();
      expect(document.activeElement).toBe(input);
      await user.keyboard('Bar');
      act(() => jest.runAllTimers());
      expect(input.selectionStart).toBe(3);

      await user.keyboard('{ArrowLeft}');
      act(() => jest.runAllTimers());
      expect(input.selectionStart).toBe(2);

      await user.keyboard('{Home}');
      act(() => jest.runAllTimers());
      expect(input.selectionStart).toBe(2);

      await user.keyboard('{End}');
      act(() => jest.runAllTimers());
      expect(input.selectionStart).toBe(2);

      await user.keyboard('{ArrowDown}');
      act(() => jest.runAllTimers());
      expect(input.selectionStart).toBe(2);

      await user.keyboard('{ArrowUp}');
      act(() => jest.runAllTimers());
      expect(input.selectionStart).toBe(2);
    });

    let filterTests = (renderer) => {
      describe('text filtering', function () {
        it('should support filtering', async function () {
          let {getByRole} = renderer({});
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

        it('should support custom filtering', async function () {
          let {getByRole} = renderer({autocompleteProps: {defaultFilter: () => true}});
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
          expect(options).toHaveLength(3);
          expect(options[0]).toHaveTextContent('Foo');
        });
      });
    };

    filterTests(renderers.standard);

    if (renderers.controlled) {
      describe('controlled', function () {
        filterTests(renderers.controlled);
      });
    }

    if (renderers.links) {
      describe('with links', function () {
        it('should trigger the link option when hitting Enter', async function () {
          let {getByRole} = (renderers.links!)({menuProps: {onAction}});
          let input = getByRole('searchbox');
          let menu = getByRole('menu');
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.tab();
          expect(document.activeElement).toBe(input);

          await user.keyboard('{ArrowDown}');
          await user.keyboard('{ArrowDown}');
          await user.keyboard('{ArrowDown}');

          let options = within(menu).getAllByRole('menuitem');
          expect(options[2].tagName).toBe('A');
          expect(options[2]).toHaveAttribute('href', 'https://google.com');
          let onClick = mockClickDefault();

          await user.keyboard('{Enter}');
          expect(onAction).toHaveBeenCalledTimes(1);
          expect(onAction).toHaveBeenLastCalledWith('3');
          expect(onClick).toHaveBeenCalledTimes(1);
          window.removeEventListener('click', onClick);
        });
      });
    }

    if (renderers.sections) {
      describe('with sections', function () {
        it('should properly skip over sections when keyboard navigating', async function () {
          let {getByRole} = (renderers.sections!)({});
          let input = getByRole('searchbox');
          let menu = getByRole('menu');
          let sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(2);
          expect(sections[0]).toHaveTextContent('Section 1');
          expect(sections[1]).toHaveTextContent('Section 2');
          expect(within(menu).getByRole('separator')).toBeInTheDocument();

          let firstSecOpts = within(sections[0]).getAllByRole('menuitem');
          expect(firstSecOpts).toHaveLength(3);
          let secondSecOpts = within(sections[1]).getAllByRole('menuitem');
          expect(secondSecOpts).toHaveLength(3);

          await user.tab();
          expect(document.activeElement).toBe(input);
          for (let section of sections) {
            let options = within(section).getAllByRole('menuitem');
            for (let opt of options) {
              await user.keyboard('{ArrowDown}');
              expect(input).toHaveAttribute('aria-activedescendant', opt.id);
            }
          }
        });

        it('should omit section titles and dividers when filtering', async function () {
          let {getByRole} = (renderers.sections!)({});
          let input = getByRole('searchbox');
          let menu = getByRole('menu');
          let sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(2);
          let options = within(menu).getAllByRole('menuitem');
          expect(options).toHaveLength(6);
          let divider = within(menu).getAllByRole('separator');
          expect(divider).toHaveLength(1);

          // This should just have the first section
          await user.tab();
          expect(document.activeElement).toBe(input);
          await user.keyboard('F');
          act(() => jest.runAllTimers());
          sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(1);
          expect(sections[0]).toHaveAttribute('aria-labelledby');
          expect(document.getElementById(sections[0].getAttribute('aria-labelledby')!)).toHaveTextContent('Section 1');
          options = within(sections[0]).getAllByRole('menuitem');
          expect(options).toHaveLength(1);
          divider = within(menu).queryAllByRole('separator');
          expect(divider).toHaveLength(0);
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          expect(options[0]).toHaveTextContent('Foo');

          // Return to unfiltered view
          await user.keyboard('{Backspace}');
          act(() => jest.runAllTimers());
          sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(2);
          options = within(menu).getAllByRole('menuitem');
          expect(options).toHaveLength(6);
          divider = within(menu).getAllByRole('separator');
          expect(divider).toHaveLength(1);
          expect(input).not.toHaveAttribute('aria-activedescendant');
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          expect(options[0]).toHaveTextContent('Foo');

          // This should just have the second section
          await user.keyboard('e');
          act(() => jest.runAllTimers());
          sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(1);
          expect(sections[0]).toHaveAttribute('aria-labelledby');
          expect(document.getElementById(sections[0].getAttribute('aria-labelledby')!)).toHaveTextContent('Section 2');
          options = within(sections[0]).getAllByRole('menuitem');
          expect(options).toHaveLength(1);
          divider = within(menu).queryAllByRole('separator');
          expect(divider).toHaveLength(0);
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          expect(options[0]).toHaveTextContent('Paste');

          await user.keyboard('{Backspace}');
          act(() => jest.runAllTimers());
          // This should just have both sections
          await user.keyboard('a');
          act(() => jest.runAllTimers());
          sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(2);
          options = within(menu).getAllByRole('menuitem');
          expect(options).toHaveLength(3);
          divider = within(menu).queryAllByRole('separator');
          expect(divider).toHaveLength(1);
          let firstSecOpts = within(sections[0]).getAllByRole('menuitem');
          expect(firstSecOpts).toHaveLength(2);
          let secondSecOpts = within(sections[1]).getAllByRole('menuitem');
          expect(secondSecOpts).toHaveLength(1);
          expect(input).toHaveAttribute('aria-activedescendant', firstSecOpts[0].id);
          expect(firstSecOpts[0]).toHaveTextContent('Bar');
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', firstSecOpts[1].id);
          expect(firstSecOpts[1]).toHaveTextContent('Baz');
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', secondSecOpts[0].id);
          expect(secondSecOpts[0]).toHaveTextContent('Paste');
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', firstSecOpts[0].id);
        });
      });
    }
  });
};
