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

import {AriaLabelingProps, BaseEvent, DOMProps, RefObject} from '@react-types/shared';
import {AriaTextFieldProps} from '@react-aria/textfield';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {CLEAR_FOCUS_EVENT, FOCUS_EVENT, isCtrlKeyPressed, mergeProps, mergeRefs, UPDATE_ACTIVEDESCENDANT, useEffectEvent, useId, useLabels, useObjectRef} from '@react-aria/utils';
import {getInteractionModality} from '@react-aria/interactions';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface CollectionOptions extends DOMProps, AriaLabelingProps {
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus: boolean,
  /** Whether typeahead is disabled. */
  disallowTypeAhead: boolean
}
export interface AriaAutocompleteProps extends AutocompleteProps {
  /**
   * An optional filter function used to determine if a option should be included in the autocomplete list.
   * Include this if the items you are providing to your wrapped collection aren't filtered by default.
   */
  filter?: (textValue: string, inputValue: string) => boolean
}

export interface AriaAutocompleteOptions extends Omit<AriaAutocompleteProps, 'children'> {
  /** The ref for the wrapped collection element. */
  collectionRef: RefObject<HTMLElement | null>
}

export interface AutocompleteAria {
  /** Props for the autocomplete textfield/searchfield element. These should be passed to the textfield/searchfield aria hooks respectively. */
  textFieldProps: AriaTextFieldProps,
  /** Props for the collection, to be passed to collection's respective aria hook (e.g. useMenu). */
  collectionProps: CollectionOptions,
  /** Ref to attach to the wrapped collection. */
  collectionRef: RefObject<HTMLElement | null>,
  /** A filter function that returns if the provided collection node should be filtered out of the collection. */
  filterFn?: (nodeTextValue: string) => boolean
}

/**
 * Provides the behavior and accessibility implementation for a autocomplete component.
 * A autocomplete combines a text input with a collection, allowing users to filter the collection's contents match a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function UNSTABLE_useAutocomplete(props: AriaAutocompleteOptions, state: AutocompleteState): AutocompleteAria {
  let {
    collectionRef,
    filter
  } = props;

  let collectionId = useId();
  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let delayNextActiveDescendant = useRef(false);
  let queuedActiveDescendant = useRef(null);
  let lastCollectionNode = useRef<HTMLElement>(null);
  // Stores the previously focused item id if it was cleared via ArrowLeft/Right. Used to dispatch keyboard events to the proper item
  // even though we've cleared state.focusedNodeId so that things like ArrowLeft/Right will still open the submenutrigger after it is closed
  // TODO: ideally, we'd just preserve state.focusedNodeId if the user's ArrowLeft/Right was being used to trigger the focused submenutrigger but
  // that would involve differentiating that event from a moving the text cursor in the input. Will be a moot point if/when NVDA announces
  // moving the text cursor when an activedescendant is set properly.
  let clearedFocusedId = useRef<string | null>(null);

  let updateActiveDescendant = useEffectEvent((e) => {
    let {target} = e;
    if (queuedActiveDescendant.current === target.id) {
      return;
    }

    clearTimeout(timeout.current);
    e.stopPropagation();

    if (target !== collectionRef.current) {
      if (delayNextActiveDescendant.current) {
        queuedActiveDescendant.current = target.id;
        timeout.current = setTimeout(() => {
          state.setFocusedNodeId(target.id);
          queuedActiveDescendant.current = null;
          clearedFocusedId.current = null;
        }, 500);
      } else {
        state.setFocusedNodeId(target.id);
        clearedFocusedId.current = null;
      }
    } else {
      state.setFocusedNodeId(null);
      clearedFocusedId.current = null;
    }

    delayNextActiveDescendant.current = false;
  });

  let callbackRef = useCallback((collectionNode) => {
    if (collectionNode != null) {
      // When typing forward, we want to delay the setting of active descendant to not interrupt the native screen reader announcement
      // of the letter you just typed. If we recieve another UPDATE_ACTIVEDESCENDANT call then we clear the queued update
      // We track lastCollectionNode to do proper cleanup since callbackRefs just pass null when unmounting. This also handles
      // React 19's extra call of the callback ref in strict mode
      lastCollectionNode.current?.removeEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
      lastCollectionNode.current = collectionNode;
      collectionNode.addEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
    } else {
      lastCollectionNode.current?.removeEventListener(UPDATE_ACTIVEDESCENDANT, updateActiveDescendant);
    }
  }, [updateActiveDescendant]);

  // Make sure to memo so that React doesn't keep registering a new event listeners on every rerender of the wrapped collection
  let mergedCollectionRef = useObjectRef(useMemo(() => mergeRefs(collectionRef, callbackRef), [collectionRef, callbackRef]));

  let focusFirstItem = useEffectEvent(() => {
    delayNextActiveDescendant.current = true;
    collectionRef.current?.dispatchEvent(
      new CustomEvent(FOCUS_EVENT, {
        cancelable: true,
        bubbles: true,
        detail: {
          focusStrategy: 'first'
        }
      })
    );
  });

  let clearVirtualFocus = useEffectEvent((clearFocusKey?: boolean) => {
    if (clearFocusKey === false && state.focusedNodeId) {
      clearedFocusedId.current = state.focusedNodeId;
    } else if (clearFocusKey) {
      clearedFocusedId.current = null;
    }

    state.setFocusedNodeId(null);
    let clearFocusEvent = new CustomEvent(CLEAR_FOCUS_EVENT, {
      cancelable: true,
      bubbles: true,
      detail: {
        clearFocusKey
      }
    });
    clearTimeout(timeout.current);
    delayNextActiveDescendant.current = false;
    collectionRef.current?.dispatchEvent(clearFocusEvent);
  });

  // TODO: update to see if we can tell what kind of event (paste vs backspace vs typing) is happening instead
  let onChange = (value: string) => {
    // Tell wrapped collection to focus the first element in the list when typing forward and to clear focused key when deleting text
    // for screen reader announcements
    if (state.inputValue !== value && state.inputValue.length <= value.length) {
      focusFirstItem();
    } else {
      // Fully clear focused key when backspacing since the list may change and thus we'd want to start fresh again
      clearVirtualFocus(true);
    }

    state.setInputValue(value);
  };

  let keyDownTarget = useRef<Element | null>(null);
  // For textfield specific keydown operations
  let onKeyDown = (e: BaseEvent<ReactKeyboardEvent<any>>) => {
    keyDownTarget.current = e.target as Element;
    if (e.nativeEvent.isComposing) {
      return;
    }

    switch (e.key) {
      case 'a':
        if (isCtrlKeyPressed(e)) {
          return;
        }
        break;
      case 'Escape':
        // Early return for Escape here so it doesn't leak the Escape event from the simulated collection event below and
        // close the dialog prematurely. Ideally that should be up to the discretion of the input element hence the check
        // for isPropagationStopped
        if (e.isDefaultPrevented()) {
          return;
        }
        break;
      case ' ':
        // Space shouldn't trigger onAction so early return.
        return;
      case 'Tab':
         // Don't propogate Tab down to the collection, otherwise we will try to focus the collection via useSelectableCollection's Tab handler (aka shift tab logic)
         // We want FocusScope to handle Tab if one exists (aka sub dialog), so special casepropogate
        if ('continuePropagation' in e) {
          e.continuePropagation();
        }
        return;
      case 'Home':
      case 'End':
      case 'PageDown':
      case 'PageUp':
      case 'ArrowUp':
      case 'ArrowDown': {
        if ((e.key === 'Home' || e.key === 'End') && state.focusedNodeId == null && e.shiftKey) {
          return;
        }

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
        // Clear the activedescendant so NVDA announcements aren't interrupted but retain the focused key in the collection so the
        // user's keyboard navigation restarts from where they left off
        // TODO: What about wrapped grids where ArrowLeft and ArrowRight should navigate left/right? Is it weird that the focused key will remain visible
        // but activedescendant got cleared? If so, then we'll need to know if we are pressing Left/Right on a submenu/dialog trigger...
        clearVirtualFocus(false);
        break;
    }

    // Emulate the keyboard events that happen in the input field in the wrapped collection. This is for triggering things like onAction via Enter
    // or moving focus from one item to another. Stop propagation on the input event if it isn't already stopped so it doesn't leak out. For events
    // like ESC, the dispatched event below will bubble out of the collection and be stopped if handled by useSelectableCollection, otherwise will bubble
    // as expected
    if (!e.isPropagationStopped()) {
      e.stopPropagation();
    }

    let focusedElementId = state.focusedNodeId ?? clearedFocusedId.current;
    if (focusedElementId == null) {
      collectionRef.current?.dispatchEvent(
        new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      );
    } else {
      let item = document.getElementById(focusedElementId);
      item?.dispatchEvent(
        new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
      );
    }
  };

  let onKeyUpCapture = useEffectEvent((e) => {
    // Dispatch simulated key up events for things like triggering links in listbox
    // Make sure to stop the propagation of the input keyup event so that the simulated keyup/down pair
    // is detected by usePress instead of the original keyup originating from the input
    if (e.target === keyDownTarget.current) {
      e.stopImmediatePropagation();
      if (state.focusedNodeId == null) {
        collectionRef.current?.dispatchEvent(
          new KeyboardEvent(e.type, e)
        );
      } else {
        let item = document.getElementById(state.focusedNodeId);
        item?.dispatchEvent(
          new KeyboardEvent(e.type, e)
        );
      }
    }
  });

  useEffect(() => {
    document.addEventListener('keyup', onKeyUpCapture, true);
    return () => {
      document.removeEventListener('keyup', onKeyUpCapture, true);
    };
  }, [onKeyUpCapture]);

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/autocomplete');
  let collectionProps = useLabels({
    id: collectionId,
    'aria-label': stringFormatter.format('collectionLabel')
  });

  let filterFn = useCallback((nodeTextValue: string) => {
    if (filter) {
      return filter(nodeTextValue, state.inputValue);
    }

    return true;
  }, [state.inputValue, filter]);

  return {
    textFieldProps: {
      value: state.inputValue,
      onChange,
      onKeyDown,
      autoComplete: 'off',
      'aria-haspopup': 'listbox',
      'aria-controls': collectionId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.focusedNodeId ?? undefined,
      // This disable's iOS's autocorrect suggestions, since the autocomplete provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false',
      [parseInt(React.version, 10) >= 17 ? 'enterKeyHint' : 'enterkeyhint']: 'enter'
    },
    collectionProps: mergeProps(collectionProps, {
      // For mobile screen readers, we don't want virtual focus, instead opting to disable FocusScope's restoreFocus and manually
      // moving focus back to the subtriggers
      shouldUseVirtualFocus: getInteractionModality() !== 'virtual',
      disallowTypeAhead: true
    }),
    collectionRef: mergedCollectionRef,
    filterFn: filter != null ? filterFn : undefined
  };
}
