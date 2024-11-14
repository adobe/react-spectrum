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
import {chain, mergeProps, useEffectEvent, useId, useLabels} from '@react-aria/utils';
import {InputHTMLAttributes, KeyboardEvent, ReactNode, useEffect, useRef} from 'react';
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
  inputRef: RefObject<HTMLInputElement | null>,
  /** The ref for the wrapped collection element. */
  collectionRef: RefObject<HTMLElement | null>
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
  // // TODO: fairly non-standard thing to return from a hook, discuss how best to share this with hook only users
  // // This is for the user to register a callback that upon recieving a keyboard event key returns the expected virtually focused node id
  // /** Register function that expects a callback function that returns the newlly virtually focused menu option when provided with the keyboard action that occurs in the input field. */
  // register: (callback: (e: KeyboardEvent) => string | null) => void
}

// TODO: move these out and make them generic to react-aria/utils or selection?
const CLEAR_FOCUS_EVENT = 'react-aria-autocomplete-clear-focus';
const FOCUS_EVENT = 'react-aria-autocomplete-focus';
const UPDATE_ACTIVEDESCENDANT = 'react-aria-autocomplete-update-activedescendant';

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete<T>(props: AriaAutocompleteOptions, state: AutocompleteState): AutocompleteAria<T> {
  let {
    inputRef,
    isReadOnly,
    collectionRef
  } = props;

  let menuId = useId();

  // // TODO: may need to move this into Autocomplete? Kinda odd to return this from the hook? Maybe the callback should be considered
  // // external to the hook, and the onus is on the user to pass in a onKeydown to this hook that updates state.focusedNodeId in response to a key
  // // stroke
  // let callbackRef = useRef<(e: KeyboardEvent) => string>(null);
  // let register = (callback) => {
  //   callbackRef.current = callback;
  // };

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






    // TODO: dispatch event on various keyboard events that then the wrapped collection listens for
    // essentially should be what the register does in Menu right now,
    // some should be moved into useSelectableCollection (aka the parts where we update the selection manager's focused state) where we listen for the event with extra detail for 'blur' and 'focus' perhaps
    // otherwise if there is a existing aria activedescendant, we look up the node and dispatch an event directly onto it. This will bubble up to the menu anyways but will allow up to simulate onAction and stuff
    // Will need to handle RTL for ArrowLeft/Right as well, but also how will we handle it if the wrapped collection has grid navigation? Do we prioritize
    // moving focus or clearing focus for announcements?

    // As for updating the aria-activedescendant, we make a listener here for a custom event that gets fired by the wrapped collection element when the focusedKey changes.
    // This probably should happen in "navigate"
    // When typing, fire an custom event with "focusFirst" and "delay" that useSelectableCollection then in response will update the focusedKey immediately but delay firing its own
    // customEvent for the 500 delay. Will need to check what happens if the timeout is still ticking but then focus changes with hover or another interaction (arrowUp/Down), I believe
    // using useEffectEvent will always use the latest state and such will end up firing the proper currently focused key. We could just clear the timeout for other "navigate" calls


    // TODO: move filter function into here?


    // TODO use the below to dispatch events
    // let event = new CustomEvent('react-spectrum-toast', {
    //   cancelable: true,
    //   bubbles: true,
    //   detail: {
    //     children,
    //     variant,
    //     options
    //   }
    // });

    // let shouldContinue = window.dispatchEvent(event);





    // if (callbackRef.current) {
    //   let focusedNodeId = callbackRef.current(e);
    //   state.setFocusedNodeId(focusedNodeId);
    // }
  };


  useEffect(() => {
    let collection = collectionRef.current;
    console.log('collection ref', collection)
    let updateActiveDescendant = (id) => {
      console.log('updating id', id)
      state.setFocusedNodeId(id);
    };
    collection?.addEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);

    return () => {
      collection?.removeEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
    };
  }, [state, collectionRef]);

  let focusFirstItem = useEffectEvent(() => {
    let focusFirstEvent = new CustomEvent(FOCUS_EVENT, {
      cancelable: true,
      bubbles: true,
      detail: {
        focusStrategy: 'first'
      }
    });
    console.log('dispatching focus first')
    collectionRef.current?.dispatchEvent(focusFirstEvent);
  });

  let clearVirtualFocus = useEffectEvent(() => {
    state.setFocusedNodeId(null);
    let clearFocusEvent = new CustomEvent(CLEAR_FOCUS_EVENT, {
      cancelable: true,
      bubbles: true
    });
    console.log('dispatching cleaar focus')
    collectionRef.current?.dispatchEvent(clearFocusEvent);
  });

  let lastInputValue = useRef<string | null>(null);
  useEffect(() => {
    // inputValue will always be at least "" if menu is in a Autocomplete, null is not an accepted value for inputValue
    if (state.inputValue != null) {
      if (lastInputValue.current != null && lastInputValue.current !== state.inputValue && lastInputValue.current?.length <= state.inputValue.length) {
        focusFirstItem();
      } else {
        clearVirtualFocus();
      }

      lastInputValue.current = state.inputValue;
    }
  }, [state.inputValue, focusFirstItem, clearVirtualFocus]);


  // node.addEventListener(RESTORE_FOCUS_EVENT, stopPropagation);

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
      // TODO: remove this and instead have onHover in useMenuItem fire an event that we listen for here
      onHoverStart: (e) => {
        state.setFocusedNodeId(e.target.id);
      },
      disallowTypeAhead: true
    }),
    descriptionProps,
    // register
  };
}
