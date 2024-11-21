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
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {chain, CLEAR_FOCUS_EVENT, DELAY_UPDATE, FOCUS_EVENT, mergeProps, UPDATE_ACTIVEDESCENDANT, useEffectEvent, useId, useLabels} from '@react-aria/utils';
import {InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode, useEffect, useRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

export interface CollectionOptions extends DOMProps, AriaLabelingProps {
  shouldUseVirtualFocus: boolean,
  disallowTypeAhead: boolean
}
export interface AriaAutocompleteProps extends AutocompleteProps, DOMProps, InputDOMProps, AriaLabelingProps {
  children: ReactNode
}

export interface AriaAutocompleteOptions extends Omit<AriaAutocompleteProps, 'children'> {
  /** The ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>,
  /** The ref for the wrapped collection element. */
  collectionRef: RefObject<HTMLElement | null>
}
export interface AutocompleteAria {
  /** Props for the label element. */
  labelProps: DOMAttributes,
  /** Props for the autocomplete input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the collection, to be passed to collection's respective aria hook (e.g. useMenu). */
  collectionProps: CollectionOptions,
  /** Props for the autocomplete description element, if any. */
  descriptionProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a collection, allowing users to filter the collection's contents match a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete(props: AriaAutocompleteOptions, state: AutocompleteState): AutocompleteAria {
  let {
    inputRef,
    isReadOnly,
    collectionRef
  } = props;

  let collectionId = useId();
  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let keyToDelay = useRef<{key: string | null, delay: number | null}>({key: null, delay: null});
  // Create listeners for updateActiveDescendant events that will be fired by wrapped collection whenever the focused key changes
  // so we can update the tracked active descendant for virtual focus
  useEffect(() => {
    let collection = collectionRef.current;
    // When typing forward, we want to delay the setting of active descendant to not interrupt the native screen reader announcement
    // of the letter you just typed. If we recieve another UPDATE_ACTIVEDESCENDANT call then we clear the queued update and
    let setUpDelay = (e) => {
      let {detail} = e;
      keyToDelay.current = {key: detail?.key, delay: detail?.delay};
    };

    let updateActiveDescendant = (e) => {
      let {detail} = e;
      clearTimeout(timeout.current);
      e.stopPropagation();

      if (detail?.id != null) {
        if (detail?.key === keyToDelay.current.key && keyToDelay.current.delay != null) {
          timeout.current = setTimeout(() => {
            state.setFocusedNodeId(detail.id);
          }, keyToDelay.current.delay);
        } else {
          state.setFocusedNodeId(detail.id);
        }
      } else {
        state.setFocusedNodeId(null);
      }

      keyToDelay.current = {key: null, delay: null};
    };

    collection?.addEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
    collection?.addEventListener(DELAY_UPDATE, setUpDelay);
    return () => {
      collection?.removeEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
      collection?.removeEventListener(DELAY_UPDATE, setUpDelay);
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

    collectionRef.current?.dispatchEvent(focusFirstEvent);
  });

  let clearVirtualFocus = useEffectEvent(() => {
    state.setFocusedNodeId(null);
    let clearFocusEvent = new CustomEvent(CLEAR_FOCUS_EVENT, {
      cancelable: true,
      bubbles: true
    });
    clearTimeout(timeout.current);
    keyToDelay.current = {key: null, delay: null};

    collectionRef.current?.dispatchEvent(clearFocusEvent);
  });

  // Tell wrapped collection to focus the first element in the list when typing forward and to clear focused key when deleting text
  // for screen reader announcements
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

  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<ReactKeyboardEvent<any>>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        if (state.inputValue !== '' && !isReadOnly) {
          state.setInputValue('');
        } else {
          e.continuePropagation();
        }

        return;
      case ' ':
        // Space shouldn't trigger onAction so early return.
        return;
      case 'Home':
      case 'End':
      case 'PageDown':
      case 'PageUp':
      case 'ArrowUp':
      case 'ArrowDown': {
        // Prevent these keys from moving the text cursor in the input
        e.preventDefault();
        // Move virtual focus into the wrapped collection
        let focusCollection = new CustomEvent(FOCUS_EVENT, {
          cancelable: true,
          bubbles: true
        });

        collectionRef.current?.dispatchEvent(focusCollection);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight':
        // TODO: will need to special case this so it doesn't clear the focused key if we are currently
        // focused on a submenutrigger? May not need to since focus would
        // But what about wrapped grids where ArrowLeft and ArrowRight should navigate left/right
        clearVirtualFocus();
        break;
    }

    // Emulate the keyboard events that happen in the input field in the wrapped collection. This is for triggering things like onAction via Enter
    // or moving focus from one item to another
    if (state.focusedNodeId == null) {
      collectionRef.current?.dispatchEvent(
        new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      );
    } else {
      let item = collectionRef.current?.querySelector(`#${CSS.escape(state.focusedNodeId)}`);
      item?.dispatchEvent(
        new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      );
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
  let collectionProps = useLabels({
    id: collectionId,
    'aria-label': stringFormatter.format('collectionLabel'),
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  return {
    labelProps,
    inputProps: mergeProps(inputProps, {
      'aria-haspopup': 'listbox',
      'aria-controls': collectionId,
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
    collectionProps: mergeProps(collectionProps, {
      // TODO: shouldFocusOnHover?
      shouldUseVirtualFocus: true,
      disallowTypeAhead: true
    }),
    descriptionProps
  };
}
