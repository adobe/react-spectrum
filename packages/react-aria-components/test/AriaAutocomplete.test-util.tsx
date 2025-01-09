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
  AriaBaseTestProps,
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

interface AriaAutocompleteTestProps extends AriaBaseTestProps {
  renderers: {
    // needs to wrap a menu with at three items, all enabled. The items should be Foo, Bar, and Baz with ids 1, 2, and 3 respectively
    standard: () => ReturnType<typeof render>,
    // needs at two sections with titles containing Section 1 and Section 2. The first section should have Foo, Bar, Baz with ids 1, 2, and 3. The second section
    // should have Copy, Cut, Paste with ids 4, 5, 6
    sections?: () => ReturnType<typeof render>,
    // needs a 3 items, Foo, Bar, and Google with ids 1, 2, 3. The Google item should have a href of https://google.com
    links?: () => ReturnType<typeof render>,
    // needs a controlled input element and the same collection items as the standard renderer. Should default to an empty string for the input
    controlled?: () => ReturnType<typeof render>,
    // needs the collection to have item actions enabled and a mock listener for the action provided. Uses the same collection items as the standard renderer
    itemActions?: () => ReturnType<typeof render>,
    // needs the collection to have multiple item selection enabled and a mock listener for the selection provided. Uses the same collection items as the standard renderer
    multipleSelection?: () => ReturnType<typeof render>,
    // needs the collection to have the item with key 2 disabled. Should include a item action mock listener. Uses the same collection items as the standard renderer
    disabledItems?: () => ReturnType<typeof render>,
    // should set a default value of "Ba" on the autocomplete. Uses the same collection items as the standard renderer
    defaultValue?: () => ReturnType<typeof render>,
    // should allow the user to filter the items themselves in a async manner. The items should be Foo, Bar, and Baz with ids 1, 2, and 3 respectively.
    // The filtering can take any amount of time but should be standard non-case sensitive contains matching
    asyncFiltering?: () => ReturnType<typeof render>
    // TODO, add tests for this when we support it
    // submenus?: (props?: {name: string}) => ReturnType<typeof render>
  },
  ariaPattern?: 'menu' | 'listbox',
  selectionListener?: jest.Mock<any, any>,
  actionListener?: jest.Mock<any, any>
}
export const AriaAutocompleteTests = ({renderers, setup, prefix, ariaPattern = 'menu', selectionListener, actionListener}: AriaAutocompleteTestProps) => {
  describe(prefix ? prefix + ' AriaAutocomplete' : 'AriaAutocomplete', function () {
    let user;
    let collectionNodeRole;
    let collectionItemRole;
    let collectionSelectableItemRole;
    setup?.();

    beforeAll(function () {
      user = userEvent.setup({delay: null, pointerMap});
      jest.useFakeTimers();
      if (ariaPattern === 'menu') {
        collectionNodeRole = 'menu';
        collectionItemRole = 'menuitem';
        collectionSelectableItemRole = 'menuitemcheckbox';
      } else if (ariaPattern === 'listbox') {
        collectionNodeRole = 'listbox';
        collectionItemRole = 'option';
        collectionSelectableItemRole = 'option';
      }
    });

    afterEach(() => {
      actionListener?.mockClear();
      selectionListener?.mockClear();
      act(() => jest.runAllTimers());
    });

    describe('standard interactions', function () {
      it('has default behavior (input field renders with expected attributes)', async function () {
        let {getByRole} = renderers.standard();
        let input = getByRole('searchbox');
        expect(input).toHaveAttribute('aria-controls');
        expect(input).toHaveAttribute('aria-haspopup', 'listbox');
        expect(input).toHaveAttribute('aria-autocomplete', 'list');
        expect(input).toHaveAttribute('autoCorrect', 'off');
        expect(input).toHaveAttribute('spellCheck', 'false');

        let menu = getByRole(collectionNodeRole);
        expect(menu).toHaveAttribute('id', input.getAttribute('aria-controls')!);
      });

      it('should support keyboard navigation', async function () {
        let {getByRole} = renderers.standard();
        let input = getByRole('searchbox');
        let menu = getByRole(collectionNodeRole);
        let options = within(menu).getAllByRole(collectionItemRole);
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
        let {getByRole} = renderers.standard();
        let input = getByRole('searchbox');
        let menu = getByRole(collectionNodeRole);
        expect(input).not.toHaveAttribute('aria-activedescendant');

        await user.tab();
        expect(document.activeElement).toBe(input);

        await user.keyboard('Foo');
        act(() => jest.runAllTimers());
        let options = within(menu).getAllByRole(collectionItemRole);
        expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
        await user.keyboard('{ArrowRight}');
        expect(input).not.toHaveAttribute('aria-activedescendant');
        await user.keyboard('{ArrowDown}');
        expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
        await user.keyboard('{ArrowLeft}');
        expect(input).not.toHaveAttribute('aria-activedescendant');
        expect(document.activeElement).toBe(input);
      });

      it('should delay the aria-activedescendant being set when autofocusing the first option', async function () {
        let {getByRole} = renderers.standard();
        let input = getByRole('searchbox');
        let menu = getByRole(collectionNodeRole);
        expect(input).not.toHaveAttribute('aria-activedescendant');

        await user.tab();
        expect(document.activeElement).toBe(input);

        await user.keyboard('a');
        let options = within(menu).getAllByRole(collectionItemRole);
        expect(input).not.toHaveAttribute('aria-activedescendant');
        act(() => jest.advanceTimersByTime(500));
        expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      });

      it('should maintain the newest focused item as the activescendant if set after autofocusing the first option', async function () {
        let {getByRole} = renderers.standard();
        let input = getByRole('searchbox');
        let menu = getByRole(collectionNodeRole);
        expect(input).not.toHaveAttribute('aria-activedescendant');

        await user.tab();
        expect(document.activeElement).toBe(input);

        await user.keyboard('a');
        let options = within(menu).getAllByRole(collectionItemRole);
        expect(input).not.toHaveAttribute('aria-activedescendant');
        await user.keyboard('{ArrowDown}');
        act(() => jest.runAllTimers());
        expect(input).toHaveAttribute('aria-activedescendant', options[1].id);
      });

      it('should not move the text input cursor when using Home/End/ArrowUp/ArrowDown', async function () {
        let {getByRole} = renderers.standard();
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

      if (ariaPattern === 'menu') {
        it('should update the aria-activedescendant when hovering over an item', async function () {
          let {getByRole} = renderers.standard();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          let options = within(menu).getAllByRole(collectionItemRole);
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
      }
    });

    if (renderers.defaultValue) {
      describe('default text value', function () {
        it('should support default value', async function () {
          let {getByRole} = (renderers.defaultValue!)();
          let input = getByRole('searchbox');
          expect(input).toHaveValue('Ba');
          let menu = getByRole(collectionNodeRole);
          let options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(2);
          expect(options[0]).toHaveTextContent('Bar');
          expect(options[1]).toHaveTextContent('Baz');

          await user.tab();
          expect(document.activeElement).toBe(input);
          await user.keyboard('z');
          act(() => jest.runAllTimers());
          options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(1);
          expect(options[0]).toHaveTextContent('Baz');
        });
      });
    }

    if (ariaPattern === 'menu' && renderers.itemActions) {
      describe('item actions', function () {
        it('should trigger the wrapped element\'s actionListener when hitting Enter', async function () {
          let {getByRole} = (renderers.itemActions!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.tab();
          expect(document.activeElement).toBe(input);

          await user.keyboard('{ArrowDown}');
          let options = within(menu).getAllByRole(collectionItemRole);
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          await user.keyboard('{Enter}');
          expect(actionListener).toHaveBeenCalledTimes(1);
          expect(actionListener).toHaveBeenLastCalledWith('1');

          await user.keyboard('{ArrowDown}');
          await user.keyboard('{Enter}');
          expect(actionListener).toHaveBeenCalledTimes(2);
          expect(actionListener).toHaveBeenLastCalledWith('2');
        });

        it('should not trigger the wrapped element\'s actionListener when hitting Space', async function () {
          let {getByRole} = renderers.standard();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.tab();
          expect(document.activeElement).toBe(input);

          await user.keyboard('{ArrowDown}');
          let options = within(menu).getAllByRole(collectionItemRole);
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          await user.keyboard('[Space]');
          act(() => jest.runAllTimers());
          expect(actionListener).toHaveBeenCalledTimes(0);
          options = within(menu).queryAllByRole(collectionItemRole);
          expect(options).toHaveLength(0);
        });
      });
    }

    if (renderers.multipleSelection) {
      describe('supports multiple selection', function () {
        it('should trigger the wrapped element\'s onSelectionChange when hitting Enter', async function () {
          let {getByRole} = (renderers.multipleSelection!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.tab();
          expect(document.activeElement).toBe(input);

          await user.keyboard('{ArrowDown}');
          let options = within(menu).getAllByRole(collectionSelectableItemRole);
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          await user.keyboard('{Enter}');
          if (selectionListener) {
            expect(selectionListener).toHaveBeenCalledTimes(1);
            expect(new Set(selectionListener.mock.calls[0][0])).toEqual(new Set(['1']));
          }

          await user.keyboard('{ArrowDown}');
          await user.keyboard('{Enter}');
          if (selectionListener) {
            expect(selectionListener).toHaveBeenCalledTimes(2);
            expect(new Set(selectionListener.mock.calls[1][0])).toEqual(new Set(['1', '2']));
          }

          await user.keyboard('{ArrowUp}');
          await user.keyboard('{Enter}');
          if (selectionListener) {
            expect(selectionListener).toHaveBeenCalledTimes(3);
            expect(new Set(selectionListener.mock.calls[2][0])).toEqual(new Set(['2']));
          }
        });

        it('should clear the wrapped element\'s selection when hitting Escape', async function () {
          let {getByRole} = (renderers.multipleSelection!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.tab();
          expect(document.activeElement).toBe(input);

          await user.keyboard('{ArrowDown}');
          let options = within(menu).getAllByRole(collectionSelectableItemRole);
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          await user.keyboard('{Enter}');
          if (selectionListener) {
            expect(selectionListener).toHaveBeenCalledTimes(1);
            expect(new Set(selectionListener.mock.calls[0][0])).toEqual(new Set(['1']));
          }

          await user.keyboard('{ArrowDown}');
          await user.keyboard('{Enter}');
          if (selectionListener) {
            expect(selectionListener).toHaveBeenCalledTimes(2);
            expect(new Set(selectionListener.mock.calls[1][0])).toEqual(new Set(['1', '2']));
          }

          await user.keyboard('{Escape}');
          if (selectionListener) {
            expect(selectionListener).toHaveBeenCalledTimes(3);
            expect(new Set(selectionListener.mock.calls[2][0])).toEqual(new Set([]));
          }
        });
      });
    }

    if (renderers.disabledItems) {
      describe('disabled items', function () {
        it('should properly skip over disabled items', async function () {
          let {getByRole} =  (renderers.disabledItems!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          let options = within(menu).getAllByRole(collectionItemRole);
          expect(options[1]).toHaveAttribute('aria-disabled', 'true');

          await user.tab();
          expect(document.activeElement).toBe(input);
          await user.keyboard('{ArrowDown}');
          act(() => jest.runAllTimers());
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          await user.keyboard('{ArrowDown}');
          act(() => jest.runAllTimers());
          expect(input).toHaveAttribute('aria-activedescendant', options[2].id);

          await user.keyboard('B');
          act(() => jest.runAllTimers());
          await user.keyboard('a');
          act(() => jest.runAllTimers());
          await user.keyboard('r');
          act(() => jest.runAllTimers());
          options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(1);
          expect(options[0]).toHaveAttribute('aria-disabled', 'true');
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.click(options[0]);
          expect(actionListener).toHaveBeenCalledTimes(0);
        });
      });

      it('should not autofocus the first item if backspacing from a list state where there are only disabled items', async function () {
        let {getByRole} =  (renderers.disabledItems!)();
        let input = getByRole('searchbox');
        let menu = getByRole(collectionNodeRole);
        let options = within(menu).getAllByRole(collectionItemRole);
        expect(options[1]).toHaveAttribute('aria-disabled', 'true');

        await user.tab();
        expect(document.activeElement).toBe(input);
        await user.keyboard('r');
        act(() => jest.runAllTimers());
        options = within(menu).getAllByRole(collectionItemRole);
        expect(options).toHaveLength(1);
        expect(input).not.toHaveAttribute('aria-activedescendant');
        expect(options[0]).toHaveAttribute('aria-disabled', 'true');

        await user.keyboard('{Backspace}');
        act(() => jest.runAllTimers());
        options = within(menu).getAllByRole(collectionItemRole);
        expect(input).not.toHaveAttribute('aria-activedescendant');
        await user.keyboard('{ArrowDown}');
        act(() => jest.runAllTimers());
        expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
      });
    }

    let filterTests = (renderer) => {
      describe('default text filtering', function () {
        it('should support filtering', async function () {
          let {getByRole} = renderer();
          let input = getByRole('searchbox');
          expect(input).toHaveValue('');
          let menu = getByRole(collectionNodeRole);
          let options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(3);

          await user.tab();
          expect(document.activeElement).toBe(input);
          await user.keyboard('F');
          act(() => jest.runAllTimers());
          options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(1);
          expect(options[0]).toHaveTextContent('Foo');

          expect(input).toHaveValue('F');
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
          expect(document.activeElement).toBe(input);

          await user.keyboard('{Backspace}');
          options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(3);
          expect(input).not.toHaveAttribute('aria-activedescendant');
          expect(document.activeElement).toBe(input);
        });
      });
    };

    filterTests(renderers.standard);

    if (renderers.controlled) {
      describe('controlled text value', function () {
        filterTests(renderers.controlled);
      });
    }

    if (renderers.asyncFiltering) {
      describe('async filtering performed outside the autocomplete', function () {
        it('should properly filter and autofocus the first item when typing forward', async function () {
          let {getByRole} = (renderers.asyncFiltering!)();
          await act(async () => {
            jest.runAllTimers();
          });

          let input = getByRole('searchbox');
          expect(input).toHaveValue('');
          let menu = getByRole(collectionNodeRole);
          let options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(3);

          // Does not immediately set aria-activedescendant until the collection updates
          await user.tab();
          expect(document.activeElement).toBe(input);
          await user.keyboard('F');
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await act(async () => {
            jest.advanceTimersToNextTimer();
          });
          options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(1);
          expect(options[0]).toHaveTextContent('Foo');
          expect(input).not.toHaveAttribute('aria-activedescendant');

          // Only sets aria-activedescendant after the collection updates and the delay passes
          act(() => jest.advanceTimersToNextTimer());
          expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
        });
      });
    }

    if (renderers.links) {
      describe('with links', function () {
        it('should trigger the link option when hitting Enter', async function () {
          let {getByRole} = (renderers.links!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          expect(input).not.toHaveAttribute('aria-activedescendant');

          await user.tab();
          expect(document.activeElement).toBe(input);

          await user.keyboard('{ArrowDown}');
          await user.keyboard('{ArrowDown}');
          await user.keyboard('{ArrowDown}');

          let options = within(menu).getAllByRole(collectionItemRole);
          expect(options[2].tagName).toBe('A');
          expect(options[2]).toHaveAttribute('href', 'https://google.com');
          let onClick = mockClickDefault();

          await user.keyboard('{Enter}');
          expect(onClick).toHaveBeenCalledTimes(1);
          window.removeEventListener('click', onClick);
        });
      });
    }

    if (renderers.sections) {
      describe('with sections', function () {
        it('should properly skip over sections when keyboard navigating', async function () {
          let {getByRole} = (renderers.sections!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          let sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(2);
          expect(sections[0]).toHaveTextContent('Section 1');
          expect(sections[1]).toHaveTextContent('Section 2');
          expect(within(menu).getByRole('separator')).toBeInTheDocument();

          let firstSecOpts = within(sections[0]).getAllByRole(collectionItemRole);
          expect(firstSecOpts).toHaveLength(3);
          let secondSecOpts = within(sections[1]).getAllByRole(collectionItemRole);
          expect(secondSecOpts).toHaveLength(3);

          await user.tab();
          expect(document.activeElement).toBe(input);
          for (let section of sections) {
            let options = within(section).getAllByRole(collectionItemRole);
            for (let opt of options) {
              await user.keyboard('{ArrowDown}');
              expect(input).toHaveAttribute('aria-activedescendant', opt.id);
            }
          }
        });

        it('should omit section titles and dividers when filtering', async function () {
          let {getByRole} = (renderers.sections!)();
          let input = getByRole('searchbox');
          let menu = getByRole(collectionNodeRole);
          let sections = within(menu).getAllByRole('group');
          expect(sections).toHaveLength(2);
          let options = within(menu).getAllByRole(collectionItemRole);
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
          options = within(sections[0]).getAllByRole(collectionItemRole);
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
          options = within(menu).getAllByRole(collectionItemRole);
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
          options = within(sections[0]).getAllByRole(collectionItemRole);
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
          options = within(menu).getAllByRole(collectionItemRole);
          expect(options).toHaveLength(3);
          divider = within(menu).queryAllByRole('separator');
          expect(divider).toHaveLength(1);
          let firstSecOpts = within(sections[0]).getAllByRole(collectionItemRole);
          expect(firstSecOpts).toHaveLength(2);
          let secondSecOpts = within(sections[1]).getAllByRole(collectionItemRole);
          expect(secondSecOpts).toHaveLength(1);
          expect(input).toHaveAttribute('aria-activedescendant', firstSecOpts[0].id);
          expect(firstSecOpts[0]).toHaveTextContent('Bar');
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', firstSecOpts[1].id);
          expect(firstSecOpts[1]).toHaveTextContent('Baz');
          await user.keyboard('{ArrowDown}');
          expect(input).toHaveAttribute('aria-activedescendant', secondSecOpts[0].id);
          expect(secondSecOpts[0]).toHaveTextContent('Paste');
          if (ariaPattern === 'menu') {
            await user.keyboard('{ArrowDown}');
            expect(input).toHaveAttribute('aria-activedescendant', firstSecOpts[0].id);
          }
        });
      });
    }
  });
};
