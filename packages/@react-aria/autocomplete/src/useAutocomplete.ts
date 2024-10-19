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

import {announce} from '@react-aria/live-announcer';
import {AriaLabelingProps, BaseEvent, DOMAttributes, DOMProps, InputDOMProps, KeyboardDelegate, LayoutDelegate, RefObject, RouterOptions, ValidationResult} from '@react-types/shared';
import {AriaMenuItemProps, AriaMenuOptions, menuData} from '@react-aria/menu';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {chain, isAppleDevice, mergeProps, useId, useLabels, useRouter} from '@react-aria/utils';
import {FocusEvent, InputHTMLAttributes, KeyboardEvent, TouchEvent, useEffect, useMemo, useRef, useState} from 'react';
import {getChildNodes, getItemCount} from '@react-stately/collections';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListKeyboardDelegate, useSelectableCollection} from '@react-aria/selection';
import {privateValidationStateProp} from '@react-stately/form';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useTextField} from '@react-aria/textfield';
import { focusSafely } from '@react-aria/focus';

export interface AriaAutocompleteProps<T> extends AutocompleteProps<T>, DOMProps, InputDOMProps, AriaLabelingProps {}

// TODO: all of this is menu specific but will need to eventually be agnostic to what collection element is inside
// Update all instances of menu then
export interface AriaAutocompleteOptions<T> extends Omit<AriaAutocompleteProps<T>, 'children'>, DOMProps, InputDOMProps, AriaLabelingProps {
  /** The ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>
}
export interface AutocompleteAria<T> {
  /** Props for the label element. */
  labelProps: DOMAttributes,
  /** Props for the autocomplete input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  // TODO change this menu props
  /** Props for the menu, to be passed to [useMenu](useMenu.html). */
  menuProps: AriaMenuOptions<T>,
  /** Props for the autocomplete description element, if any. */
  descriptionProps: DOMAttributes,
  // TODO: fairly non-standard thing to return from a hook, discuss how best to share this with hook only users
  // This is for the user to register a callback that upon recieving a keyboard event key returns the expected virtually focused node id
  register: (callback: (string) => string) => void
}

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete<T>(props: AriaAutocompleteOptions<T>, state: AutocompleteState<T>): AutocompleteAria<T> {
  let {
    inputRef,
    isReadOnly
  } = props;

  // let router = useRouter();
  let menuId = useId();

  // TODO: may need to move this into Autocomplete? Kinda odd to return this from the hook? Maybe the callback should be considered
  // external to the hook, and the onus is on the user to pass in a onKeydown to this hook that updates state.focusedNodeId in response to a key
  // stroke
  let callbackRef = useRef<(string) => string>(null);
  let register = (callback) => {
    callbackRef.current = callback;
  };

  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<KeyboardEvent<any>>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    switch (e.key) {
      case 'Enter':
        // TODO: how best to trigger the focused element's action? I guess I could dispatch an event
        // Also, we might want to add popoverRef so we can bring in MobileCombobox's additional handling for Enter
        // to close virtual keyboard, depends if we think this experience is only for in a tray/popover


        // // If the focused item is a link, trigger opening it. Items that are links are not selectable.
        // if (state.selectionManager.focusedKey != null && state.selectionManager.isLink(state.selectionManager.focusedKey)) {
        //   if (e.key === 'Enter') {
        //     let item = menuRef.current?.querySelector(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`);
        //     if (item instanceof HTMLAnchorElement) {
        //       let collectionItem = state.collection.getItem(state.selectionManager.focusedKey);
        //       collectionItem && router.open(item, e, collectionItem.props.href, collectionItem.props.routerOptions as RouterOptions);
        //     }
        //   }

        //   // TODO: previously used to call state.close here which would toggle selection for a link and set the input value to that link's input text
        //   // I think that doens't make sense really so opting to do nothing here.
        // } else {
        //   state.commit();
        // }
        break;
      case 'Escape':
        if (state.inputValue !== '') {
          state.setInputValue('');
        }

        break;
    }
    if (callbackRef.current) {
      let focusedNodeId = callbackRef.current(e.key);
      state.setFocusedNodeId(focusedNodeId);
    }

  };

  // let onBlur = (e: FocusEvent<HTMLInputElement>) => {
  //   if (props.onBlur) {
  //     props.onBlur(e);
  //   }

  //   state.setFocused(false);
  // };

  // let onFocus = (e: FocusEvent<HTMLInputElement>) => {
  //   if (state.isFocused) {
  //     return;
  //   }

  //   if (props.onFocus) {
  //     props.onFocus(e);
  //   }

  //   state.setFocused(true);
  // };

  let {labelProps, inputProps, descriptionProps} = useTextField({
    ...props,
    onChange: state.setInputValue,
    onKeyDown: !isReadOnly ? chain(onKeyDown, props.onKeyDown) : props.onKeyDown,
    // TODO: will I still need the blur and stuff
    // // @ts-ignore
    // onBlur,
    // // @ts-ignore
    // onFocus,
    value: state.inputValue,
    autoComplete: 'off',
    validate: undefined
  }, inputRef);

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/autocomplete');
  let menuProps = useLabels({
    id: menuId,
    // TODO: update this
    'aria-label': stringFormatter.format('listboxLabel'),
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  // TODO: add the stuff from mobile combobox, check if I need the below
  // removed touch end since we did the same in MobileComboboxTray
  useEffect(() => {
    focusSafely(inputRef.current);
  }, []);


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

  // // Announce when a selection occurs for VoiceOver. Other screen readers typically do this automatically.
  // let lastSelectedKey = useRef(state.selectedKey);
  // useEffect(() => {

  //   if (isAppleDevice() && state.isFocused && state.selectedItem && state.selectedKey !== lastSelectedKey.current) {
  //     let optionText = state.selectedItem['aria-label'] || state.selectedItem.textValue || '';
  //     let announcement = stringFormatter.format('selectedAnnouncement', {optionText});
  //     announce(announcement);
  //   }

  //   lastSelectedKey.current = state.selectedKey;
  // });

  return {
    labelProps,
    inputProps: mergeProps(inputProps, {
      'aria-haspopup': 'listbox',
      'aria-controls': menuId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      // TODO: will need a way to get the currently focused menuitem's id. This is currently difficult since the
      // menu uses useTreeState which useAutocomplete state doesn't substitute for
      // 'aria-activedescendant': focusedItem ? getItemId(state, focusedItem.key) : undefined,
      'aria-activedescendant': state.focusedNodeId ?? undefined,
      role: 'searchbox',
      // This disable's iOS's autocorrect suggestions, since the combo box provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false'
    }),
    menuProps: mergeProps(menuProps, {
      shouldUseVirtualFocus: true,
      //
      onHoverStart: (e) => {
        // TODO: another thing to thing about, what is the best way to past this to menu so that hovering on
        // a item also updates the focusedNode
        console.log('e', e.target)
        state.setFocusedNodeId(e.target.id);
      }
    }),
    descriptionProps,
    register
  };
}
