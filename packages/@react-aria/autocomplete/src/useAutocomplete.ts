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
import {AriaMenuOptions, menuData} from '@react-aria/menu';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {chain, isAppleDevice, mergeProps, useId, useLabels, useRouter} from '@react-aria/utils';
import {FocusEvent, InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, TouchEvent, useEffect, useMemo, useRef, useState} from 'react';
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

// TODO: all of this is menu specific but will need to eventually be agnostic to what collection element is inside
// Update all instances of menu then
export interface AriaAutocompleteOptions<T> extends Omit<AriaAutocompleteProps<T>, 'children'>, DOMProps, InputDOMProps, AriaLabelingProps {
  /** The ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>,
  /** The ref for the menu. */
  menuRef: RefObject<HTMLElement | null>,
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
  /** Props for the menu, to be passed to [useMenu](useMenu.html). */
  menuProps: AriaMenuOptions<T>,
  /** Props for the autocomplete description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the autocomplete error message element, if any. */
  errorMessageProps: DOMAttributes
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
    menuRef,
    keyboardDelegate,
    layoutDelegate,
    shouldFocusWrap,
    isReadOnly,
    isDisabled
  } = props;

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/autocomplete');
  // TODO: we will only need the menu props for the id for listData (might need a replacement for aria-labelledby and autofocus?)
  let menuId = useId();
  menuData.set(state, {id: menuId});

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let {collection} = state;
  let {disabledKeys} = state.selectionManager;
  let delegate = useMemo(() => (
    keyboardDelegate || new ListKeyboardDelegate({
      collection,
      disabledKeys,
      ref: menuRef,
      layoutDelegate
    })
  ), [keyboardDelegate, layoutDelegate, collection, disabledKeys, menuRef]);

  // Use useSelectableCollection to get the keyboard handlers to apply to the textfield
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate,
    disallowTypeAhead: true,
    disallowEmptySelection: true,
    shouldFocusWrap,
    ref: inputRef
    // Prevent item scroll behavior from being applied here, should be handled in the user's Popover + ListBox component
    // TODO: If we are using menu, then maybe we get rid of this? However will be applicable for other virtualized collection components
    // isVirtualized: true
  });

  let router = useRouter();

  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<ReactKeyboardEvent<any>>) => {
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
            let item = menuRef.current?.querySelector(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`);
            if (item instanceof HTMLAnchorElement) {
              let collectionItem = state.collection.getItem(state.selectionManager.focusedKey);
              collectionItem && router.open(item, e, collectionItem.props.href, collectionItem.props.routerOptions as RouterOptions);
            }
          }

          // TODO: previously used to call state.close here which would toggle selection for a link and set the input value to that link's input text
          // I think that doens't make sense really so opting to do nothing here.
        } else {
          state.commit();
        }
        // TODO: would also need to make this only happen if we aren't in a submenu. Additionally would need to have submenus have a onAction that would call
        // state.setValue or something since state.commit is once again only applicable for the original menu
        collectionProps.onKeyDown(e);
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
        if (state.selectionManager.focusedKey != null) {
          let item = menuRef.current?.querySelectorAll(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`)[0];
          // TODO: uncomment below when we filter the collection
          // let item = menuRef.current?.querySelectorAll(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`)[1];
          if (item && item.hasAttribute('aria-controls')) {
            // TODO: here we would want to keep digging until we go to the final submenu and then dispatch the event there. For now only do a single level to test
            let submenuId = item.getAttribute('aria-controls');
            let submenu = submenuId && document.querySelector(`#${CSS.escape(submenuId.toString())}`);
            if (submenu) {
              submenu.dispatchEvent(
                new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
              );
              break;
            }
          }
        }
        collectionProps.onKeyDown(e);
        break;
      case 'ArrowLeft':
      case 'ArrowRight': {
        // TODO removed state.selectionManager.setFocused(false); for now so the focused key no longer gets removed when moving the cursor
        // and instead the event is dispatched to the currently focused item. Bit problematic though since that means the user won't be able to move the cursor if
        // virtual focus is in the menu and thus can't edit the field as freely as they may want. In addition, focus moves out of the input when this happens since the newly opened
        // sub menu
        if (state.selectionManager.focusedKey != null) {
          let item = menuRef.current?.querySelectorAll(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`)[0];
          // let item = menuRef.current?.querySelectorAll(`[data-key="${CSS.escape(state.selectionManager.focusedKey.toString())}"]`)[1];
          if (item) {
            item.dispatchEvent(
              new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
            );
          }
        }
        collectionProps.onKeyDown(e);
        break;
      }

      default:
        collectionProps.onKeyDown(e);
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
    // TODO: would want to fire keydown first and then only fire collectionProps.onKeyDown if we aren't currently in a submenu
    onKeyDown: !isReadOnly ? chain(onKeyDown, props.onKeyDown) : props.onKeyDown,
    // TODO: figure out how to fix these ts errors
    // @ts-ignore
    onBlur,
    value: state.inputValue,
    // @ts-ignore
    onFocus,
    autoComplete: 'off',
    validate: undefined,
    [privateValidationStateProp]: state
  }, inputRef);

  let menuProps = useLabels({
    id: menuId,
    // TODO: update this
    'aria-label': stringFormatter.format('listboxLabel'),
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  // If a touch happens on direct center of Autocomplete input, might be virtual click from iPad
  let lastEventTime = useRef(0);
  let onTouchEnd = (e: TouchEvent) => {
    if (isDisabled || isReadOnly) {
      return;
    }

    // Sometimes VoiceOver on iOS fires two touchend events in quick succession. Ignore the second one.
    if (e.timeStamp - lastEventTime.current < 500) {
      e.preventDefault();
      inputRef.current?.focus();
      return;
    }

    let rect = (e.target as Element).getBoundingClientRect();
    let touch = e.changedTouches[0];

    let centerX = Math.ceil(rect.left + .5 * rect.width);
    let centerY = Math.ceil(rect.top + .5 * rect.height);

    if (touch.clientX === centerX && touch.clientY === centerY) {
      e.preventDefault();
      inputRef.current?.focus();

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
        isGroupChange: !!section && sectionKey !== lastSection.current,
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
      // TODO: will need a way to get the currently focused menuitem's id. This is currently difficult since the
      // menu uses useTreeState which useAutocomplete state doesn't substitute for
      // 'aria-activedescendant': focusedItem ? getItemId(state, focusedItem.key) : undefined,
      'aria-activedescendant': focusedItem ? `${menuId}-option-${focusedItem.key}` : undefined,
      onTouchEnd,
      // This disable's iOS's autocorrect suggestions, since the combo box provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false'
    }),
    menuProps: mergeProps(menuProps, {
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
