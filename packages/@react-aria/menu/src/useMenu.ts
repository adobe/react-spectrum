/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {AriaMenuProps} from '@react-types/menu';
import {DOMAttributes, HoverEvent, KeyboardDelegate, KeyboardEvents, RefObject} from '@react-types/shared';
import {filterDOMProps, isAppleDevice, mergeProps, useId} from '@react-aria/utils';
import {getChildNodes, getItemCount} from '@react-stately/collections';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {menuData} from './utils';
import {TreeState} from '@react-stately/tree';
import {useEffect, useRef, useState} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSelectableList} from '@react-aria/selection';

export interface MenuAria {
  /** Props for the menu element. */
  menuProps: DOMAttributes
}

export interface AriaMenuOptions<T> extends Omit<AriaMenuProps<T>, 'children'>, KeyboardEvents {
  /** Whether the menu uses virtual scrolling. */
  isVirtualized?: boolean,
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate,
  /**
   * Whether the menu items should use virtual focus instead of being focused directly.
   */
  shouldUseVirtualFocus?: boolean,
  /**
   * Handler that is called when a hover interaction starts on a menu item.
   */
  onHoverStart?: (e: HoverEvent) => void
}

/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 * @param props - Props for the menu.
 * @param state - State for the menu, as returned by `useListState`.
 */
export function useMenu<T>(props: AriaMenuOptions<T>, state: TreeState<T>, ref: RefObject<HTMLElement | null>): MenuAria {
  let {
    shouldFocusWrap = true,
    onKeyDown,
    onKeyUp,
    onHoverStart,
    ...otherProps
  } = props;

  if (!props['aria-label'] && !props['aria-labelledby']) {
    console.warn('An aria-label or aria-labelledby prop is required for accessibility.');
  }

  let domProps = filterDOMProps(props, {labelable: true});
  let {listProps} = useSelectableList({
    ...otherProps,
    ref,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    shouldFocusWrap,
    linkBehavior: 'override'
  });

  let id = useId(props.id);
  menuData.set(state, {
    onClose: props.onClose,
    onAction: props.onAction,
    shouldUseVirtualFocus: props.shouldUseVirtualFocus,
    onHoverStart,
    id
  });

  // TODO: for now I'm putting these announcement into menu but would like to discuss where we may this these could go
  // I was thinking perhaps in @react-aria/interactions (it is interaction specific aka virtualFocus) or @react-aria/collections (dependent on tracking a focused key in a collection)
  // but those felt kinda iffy. A new package?
  // TODO: port all other translations/remove stuff if not needed

  // VoiceOver has issues with announcing aria-activedescendant properly on change
  // (especially on iOS). We use a live region announcer to announce focus changes
  // manually. In addition, section titles are announced when navigating into a new section.
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/menu');
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
    if (didRenderWithoutFocusedItem || optionCount !== lastSize.current) {
      let announcement = stringFormatter.format('countAnnouncement', {optionCount});
      announce(announcement);
      setAnnounced(true);
    }

    lastSize.current = optionCount;
  }, [announced, setAnnounced, optionCount, stringFormatter, state.selectionManager.focusedKey]);

  // TODO: Omitted the custom announcement for selection because we expect to only trigger onActions for Autocomplete, selected key isn't a thing

  return {
    menuProps: mergeProps(domProps, {onKeyDown, onKeyUp}, {
      role: 'menu',
      ...listProps,
      id,
      onKeyDown: (e) => {
        // don't clear the menu selected keys if the user is presses escape since escape closes the menu
        if (e.key !== 'Escape') {
          listProps.onKeyDown(e);
        }
      }
    })
  };
}
