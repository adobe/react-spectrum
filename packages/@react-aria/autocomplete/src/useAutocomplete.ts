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
import {AriaListBoxOptions, getItemId, listData} from '@react-aria/listbox';
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


export interface AriaAutocompleteProps<T> extends AutocompleteProps<T>, DOMProps, InputDOMProps, AriaLabelingProps {
  /** Whether keyboard navigation is circular. */
  shouldFocusWrap?: boolean
}

export interface AriaAutocompleteOptions<T> extends Omit<AriaAutocompleteProps<T>, 'children'>, DOMProps, InputDOMProps, AriaLabelingProps {
  /** The ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>,
  /** The ref for the list box. */
  listBoxRef: RefObject<HTMLElement | null>,
  /** An optional keyboard delegate implementation, to override the default. */
  keyboardDelegate?: KeyboardDelegate,
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate
}
export interface AutocompleteAria<T> extends ValidationResult {
  /** Props for the label element. */
  labelProps: DOMAttributes,
  /** Props for the autocomplete input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  // TODO change this menu props
  /** Props for the list box, to be passed to [useListBox](useListBox.html). */
  listBoxProps: AriaListBoxOptions<T>,
  /** Props for the autocomplete description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the autocomplete error message element, if any. */
  errorMessageProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a listbox, allowing users to filter a list of options to items matching a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete<T>(props: AriaAutocompleteOptions<T>, state: AutocompleteState<T>): AutocompleteAria<T> {
  let {
    inputRef,
    listBoxRef,
    keyboardDelegate,
    layoutDelegate,
    shouldFocusWrap,
    isReadOnly,
    isDisabled
  } = props;

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/combobox');
  // TODO: we will only need the menu props for the id for listData (might need a replacement for aria-labelledby and autofocus?)
  let menuId = useId();

  // Set listbox id so it can be used when calling getItemId later
  listData.set(state, {id: menuId});

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let {collection} = state;
  let {disabledKeys} = state.selectionManager;
  let delegate = useMemo(() => (
    keyboardDelegate || new ListKeyboardDelegate({
      collection,
      disabledKeys,
      ref: listBoxRef,
      layoutDelegate
    })
  ), [keyboardDelegate, layoutDelegate, collection, disabledKeys, listBoxRef]);

  // Use useSelectableCollection to get the keyboard handlers to apply to the textfield
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate,
    disallowTypeAhead: true,
    disallowEmptySelection: true,
    shouldFocusWrap,
    ref: inputRef,
    // Prevent item scroll behavior from being applied here, should be handled in the user's Popover + ListBox component
    // TODO: If we are using menu, then maybe we get rid of this?
    isVirtualized: true
  });

  let router = useRouter();

  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<KeyboardEvent<any>>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }
    switch (e.key) {
      case 'Enter':
      case 'Tab':
        // TODO: Prevent form submission at all times?
        e.preventDefault();

        // If the focused item is a link, trigger opening it. Items that are links are not selectable.
        if (state.selectionManager.focusedKey != null && state.selectionManager.isLink(state.selectionManager.focusedKey)) {
          if (e.key === 'Enter') {
            let item = listBoxRef.current.querySelector(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`);
            if (item instanceof HTMLAnchorElement) {
              let collectionItem = state.collection.getItem(state.selectionManager.focusedKey);
              router.open(item, e, collectionItem.props.href, collectionItem.props.routerOptions as RouterOptions);
            }
          }

          // TODO: previously used to call state.close here which would toggle selection for a link and set the input value to that link's input text
          // I think that doens't make sense really so opting to do nothing here.
        } else {
          state.commit();
        }
        break;
      case 'Escape':
        if (
          state.selectedKey !== null ||
          state.inputValue === '' ||
          props.allowsCustomValue
        ) {
          e.continuePropagation();
        }

        // TODO: right now hitting escape multiple times will not clear the input field, perhaps only do that if the user provides a searchfiled to the autocomplete
        state.revert();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        state.selectionManager.setFocused(true);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        state.selectionManager.setFocusedKey(null);
        break;
    }
  };

  let onBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (props.onBlur) {
      props.onBlur(e);
    }

    state.setFocused(false);
  };

  let onFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (state.isFocused) {
      return;
    }

    if (props.onFocus) {
      props.onFocus(e);
    }

    state.setFocused(true);
  };

  let {isInvalid, validationErrors, validationDetails} = state.displayValidation;
  let {labelProps, inputProps, descriptionProps, errorMessageProps} = useTextField({
    ...props,
    onChange: state.setInputValue,
    onKeyDown: !isReadOnly ? chain(collectionProps.onKeyDown, onKeyDown, props.onKeyDown) : props.onKeyDown,
    onBlur,
    value: state.inputValue,
    onFocus,
    autoComplete: 'off',
    validate: undefined,
    [privateValidationStateProp]: state
  }, inputRef);

  let listBoxProps = useLabels({
    id: menuId,
    'aria-label': stringFormatter.format('listboxLabel'),
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  // If a touch happens on direct center of ComboBox input, might be virtual click from iPad so open ComboBox menu
  let lastEventTime = useRef(0);
  let onTouchEnd = (e: TouchEvent) => {
    if (isDisabled || isReadOnly) {
      return;
    }

    // Sometimes VoiceOver on iOS fires two touchend events in quick succession. Ignore the second one.
    if (e.timeStamp - lastEventTime.current < 500) {
      e.preventDefault();
      inputRef.current.focus();
      return;
    }

    let rect = (e.target as Element).getBoundingClientRect();
    let touch = e.changedTouches[0];

    let centerX = Math.ceil(rect.left + .5 * rect.width);
    let centerY = Math.ceil(rect.top + .5 * rect.height);

    if (touch.clientX === centerX && touch.clientY === centerY) {
      e.preventDefault();
      inputRef.current.focus();

      lastEventTime.current = e.timeStamp;
    }
  };

  // VoiceOver has issues with announcing aria-activedescendant properly on change
  // (especially on iOS). We use a live region announcer to announce focus changes
  // manually. In addition, section titles are announced when navigating into a new section.
  let focusedItem = state.selectionManager.focusedKey != null
    ? state.collection.getItem(state.selectionManager.focusedKey)
    : undefined;
  let sectionKey = focusedItem?.parentKey ?? null;
  let itemKey = state.selectionManager.focusedKey ?? null;
  let lastSection = useRef(sectionKey);
  let lastItem = useRef(itemKey);
  useEffect(() => {
    if (isAppleDevice() && focusedItem != null && itemKey !== lastItem.current) {
      let isSelected = state.selectionManager.isSelected(itemKey);
      let section = sectionKey != null ? state.collection.getItem(sectionKey) : null;
      let sectionTitle = section?.['aria-label'] || (typeof section?.rendered === 'string' ? section.rendered : '') || '';

      let announcement = stringFormatter.format('focusAnnouncement', {
        isGroupChange: section && sectionKey !== lastSection.current,
        groupTitle: sectionTitle,
        groupCount: section ? [...getChildNodes(section, state.collection)].length : 0,
        optionText: focusedItem['aria-label'] || focusedItem.textValue || '',
        isSelected
      });

      announce(announcement);
    }

    lastSection.current = sectionKey;
    lastItem.current = itemKey;
  });

  // Announce the number of available suggestions when it changes
  let optionCount = getItemCount(state.collection);
  let lastSize = useRef(optionCount);
  let [announced, setAnnounced] = useState(false);

  // TODO: test this behavior below, now that there isn't a open state this should just announce for the first render in which the field is focused?
  useEffect(() => {
    // Only announce the number of options available when the autocomplete first renders if there is no
    // focused item, otherwise screen readers will typically read e.g. "1 of 6".
    // The exception is VoiceOver since this isn't included in the message above.
    let didRenderWithoutFocusedItem = !announced && (state.selectionManager.focusedKey == null || isAppleDevice());

    if ((didRenderWithoutFocusedItem || optionCount !== lastSize.current)) {
      let announcement = stringFormatter.format('countAnnouncement', {optionCount});
      announce(announcement);
      setAnnounced(true);
    }

    lastSize.current = optionCount;
  }, [announced, setAnnounced, optionCount, stringFormatter, state.selectionManager.focusedKey]);

  // Announce when a selection occurs for VoiceOver. Other screen readers typically do this automatically.
  let lastSelectedKey = useRef(state.selectedKey);
  useEffect(() => {

    if (isAppleDevice() && state.isFocused && state.selectedItem && state.selectedKey !== lastSelectedKey.current) {
      let optionText = state.selectedItem['aria-label'] || state.selectedItem.textValue || '';
      let announcement = stringFormatter.format('selectedAnnouncement', {optionText});
      announce(announcement);
    }

    lastSelectedKey.current = state.selectedKey;
  });

  return {
    labelProps,
    inputProps: mergeProps(inputProps, {
      'aria-controls': menuId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      'aria-activedescendant': focusedItem ? getItemId(state, focusedItem.key) : undefined,
      onTouchEnd,
      // This disable's iOS's autocorrect suggestions, since the combo box provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false'
    }),
    listBoxProps: mergeProps(listBoxProps, {
      shouldUseVirtualFocus: true,
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      linkBehavior: 'selection' as const
    }),
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails
  };
}
