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

import {AriaLabelingProps, BaseEvent, DOMAttributes, DOMProps, FocusableElement, InputDOMProps, RefObject} from '@react-types/shared';
import {AriaMenuOptions} from '@react-aria/menu';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {chain, mergeProps, useId, useLabels} from '@react-aria/utils';
import {focusSafely} from '@react-aria/focus';
import {InputHTMLAttributes, KeyboardEvent, useEffect, useRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';

export interface AriaAutocompleteProps extends AutocompleteProps, DOMProps, InputDOMProps, AriaLabelingProps {}

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
    // Also, we might want to add popoverRef so we can bring in MobileCombobox's additional handling for Enter
    // to close virtual keyboard, depends if we think this experience is only for in a tray/popover
    switch (e.key) {
      case 'Escape':
        if (state.inputValue !== '') {
          state.setInputValue('');
        }

        break;
      case 'Home':
      case 'End':
        // Prevent Fn + left/right from moving the text cursor in the input
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
    onKeyDown: !isReadOnly ? chain(onKeyDown, props.onKeyDown) : props.onKeyDown,
    value: state.inputValue,
    autoComplete: 'off',
    validate: undefined
  }, inputRef);

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/autocomplete');
  let menuProps = useLabels({
    id: menuId,
    'aria-label': stringFormatter.format('menuLabel'),
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  // TODO: add the stuff from mobile combobox, check if I need the below when testing in mobile devices
  // removed touch end since we did the same in MobileComboboxTray
  useEffect(() => {
    focusSafely(inputRef.current as FocusableElement);
  }, [inputRef]);

  // TODO: decide where the announcements should go, pehaps make a separate hook so that the collection component can call it
  // // VoiceOver has issues with announcing aria-activedescendant properly on change
  // // (especially on iOS). We use a live region announcer to announce focus changes
  // // manually. In addition, section titles are announced when navigating into a new section.
  // let focusedItem = state.selectionManager.focusedKey != null
  //   ? state.collection.getItem(state.selectionManager.focusedKey)
  //   : undefined;
  // let sectionKey = focusedItem?.parentKey ?? null;
  // let itemKey = state.selectionManager.focusedKey ?? null;
  // let lastSection = useRef(sectionKey);
  // let lastItem = useRef(itemKey);
  // useEffect(() => {
  //   if (isAppleDevice() && focusedItem != null && itemKey !== lastItem.current) {
  //     let isSelected = state.selectionManager.isSelected(itemKey);
  //     let section = sectionKey != null ? state.collection.getItem(sectionKey) : null;
  //     let sectionTitle = section?.['aria-label'] || (typeof section?.rendered === 'string' ? section.rendered : '') || '';

  //     let announcement = stringFormatter.format('focusAnnouncement', {
  //       isGroupChange: !!section && sectionKey !== lastSection.current,
  //       groupTitle: sectionTitle,
  //       groupCount: section ? [...getChildNodes(section, state.collection)].length : 0,
  //       optionText: focusedItem['aria-label'] || focusedItem.textValue || '',
  //       isSelected
  //     });

  //     announce(announcement);
  //   }

  //   lastSection.current = sectionKey;
  //   lastItem.current = itemKey;
  // });

  // // Announce the number of available suggestions when it changes
  // let optionCount = getItemCount(state.collection);
  // let lastSize = useRef(optionCount);
  // let [announced, setAnnounced] = useState(false);

  // // TODO: test this behavior below, now that there isn't a open state this should just announce for the first render in which the field is focused?
  // useEffect(() => {
  //   // Only announce the number of options available when the autocomplete first renders if there is no
  //   // focused item, otherwise screen readers will typically read e.g. "1 of 6".
  //   // The exception is VoiceOver since this isn't included in the message above.
  //   let didRenderWithoutFocusedItem = !announced && (state.selectionManager.focusedKey == null || isAppleDevice());

  //   if ((didRenderWithoutFocusedItem || optionCount !== lastSize.current)) {
  //     let announcement = stringFormatter.format('countAnnouncement', {optionCount});
  //     announce(announcement);
  //     setAnnounced(true);
  //   }

  //   lastSize.current = optionCount;
  // }, [announced, setAnnounced, optionCount, stringFormatter, state.selectionManager.focusedKey]);


  // TODO: Omitted the custom announcement for selection because we expect to only trigger onActions for Autocomplete, selected key isn't a thing

  return {
    labelProps,
    inputProps: mergeProps(inputProps, {
      'aria-haspopup': 'listbox',
      'aria-controls': menuId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.focusedNodeId ?? undefined,
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
      }
    }),
    descriptionProps,
    register
  };
}
