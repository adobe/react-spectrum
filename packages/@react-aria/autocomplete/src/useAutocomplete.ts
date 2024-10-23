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

import {AriaLabelingProps, BaseEvent, DOMAttributes, DOMProps, InputDOMProps, RefObject} from '@react-types/shared';
import type {AriaMenuOptions} from '@react-aria/menu';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {chain, mergeProps, useId, useLabels} from '@react-aria/utils';
import {InputHTMLAttributes, KeyboardEvent, ReactNode, useRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

export interface AriaAutocompleteProps extends AutocompleteProps, DOMProps, InputDOMProps, AriaLabelingProps {
  children: ReactNode
}

// TODO: all of this is menu specific but will need to eventually be agnostic to what collection element is inside
// Update all instances of "menu" then
export interface AriaAutocompleteOptions extends Omit<AriaAutocompleteProps, 'children'> {
  /** The ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>
}
export interface AutocompleteAria<T> {
  /** Props for the label element. */
  labelProps: DOMAttributes,
  /** Props for the autocomplete input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the menu, to be passed to [useMenu](useMenu.html). */
  menuProps: AriaMenuOptions<T>,
  /** Props for the autocomplete description element, if any. */
  descriptionProps: DOMAttributes,
  // TODO: fairly non-standard thing to return from a hook, discuss how best to share this with hook only users
  // This is for the user to register a callback that upon recieving a keyboard event key returns the expected virtually focused node id
  /** Register function that expects a callback function that returns the newlly virtually focused menu option when provided with the keyboard action that occurs in the input field. */
  register: (callback: (e: KeyboardEvent) => string) => void
}

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete<T>(props: AriaAutocompleteOptions, state: AutocompleteState): AutocompleteAria<T> {
  let {
    inputRef,
    isReadOnly
  } = props;

  let menuId = useId();

  // TODO: may need to move this into Autocomplete? Kinda odd to return this from the hook? Maybe the callback should be considered
  // external to the hook, and the onus is on the user to pass in a onKeydown to this hook that updates state.focusedNodeId in response to a key
  // stroke
  let callbackRef = useRef<(e: KeyboardEvent) => string>(null);
  let register = (callback) => {
    callbackRef.current = callback;
  };

  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<KeyboardEvent<any>>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    // TODO: how best to trigger the focused element's action? Currently having the registered callback handle dispatching a
    // keyboard event
    switch (e.key) {
      case 'Escape':
        if (state.inputValue !== '' && !isReadOnly) {
          state.setInputValue('');
        } else {
          e.continuePropagation();
        }

        break;
      case 'Home':
      case 'End':
      case 'ArrowUp':
      case 'ArrowDown':
        // Prevent these keys from moving the text cursor in the input
        e.preventDefault();
        break;
    }

    if (callbackRef.current) {
      let focusedNodeId = callbackRef.current(e);
      state.setFocusedNodeId(focusedNodeId);
    }
  };

  let {labelProps, inputProps, descriptionProps} = useTextField({
    ...props as any,
    onChange: state.setInputValue,
    onKeyDown: chain(onKeyDown, props.onKeyDown),
    value: state.inputValue,
    autoComplete: 'off'
  }, inputRef);

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/autocomplete');
  let menuProps = useLabels({
    id: menuId,
    'aria-label': stringFormatter.format('menuLabel'),
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  return {
    labelProps,
    inputProps: mergeProps(inputProps, {
      'aria-haspopup': 'listbox',
      'aria-controls': menuId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.focusedNodeId ?? undefined,
      // TODO: note that the searchbox role causes newly typed letters to interrupt the announcement of the number of available options in Safari.
      // I tested on iPad/Android/etc and the combobox role doesn't seem to do that but it will announce that there is a listbox which isn't true
      // and it will say press Control Option Space to display a list of options which is also incorrect. To be fair though, our combobox doesn't open with
      // that combination of buttons
      role: 'searchbox',
      // This disable's iOS's autocorrect suggestions, since the autocomplete provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false'
    }),
    menuProps: mergeProps(menuProps, {
      shouldUseVirtualFocus: true,
      onHoverStart: (e) => {
        // TODO: another thing to think about, what is the best way to past this to menu/wrapped collection component so that hovering on
        // a item also updates the focusedNode. Perhaps we should just pass down setFocusedNodeId instead
        state.setFocusedNodeId(e.target.id);
      },
      disallowTypeAhead: true
    }),
    descriptionProps,
    register
  };
}
