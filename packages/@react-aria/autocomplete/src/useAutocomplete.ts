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

import {AriaLabelingProps, BaseEvent, DOMProps, FocusableElement, FocusEvents, KeyboardEvents, Node, RefObject, ValueBase} from '@react-types/shared';
import {AriaTextFieldProps} from '@react-aria/textfield';
import {AutocompleteProps, AutocompleteState} from '@react-stately/autocomplete';
import {CLEAR_FOCUS_EVENT, FOCUS_EVENT, getActiveElement, getOwnerDocument, isAndroid, isCtrlKeyPressed, isIOS, mergeProps, mergeRefs, useEffectEvent, useEvent, useId, useLabels, useObjectRef} from '@react-aria/utils';
import {dispatchVirtualBlur, dispatchVirtualFocus, getVirtuallyFocusedElement, moveVirtualFocus} from '@react-aria/focus';
import {getInteractionModality} from '@react-aria/interactions';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface CollectionOptions extends DOMProps, AriaLabelingProps {
  /** Whether the collection items should use virtual focus instead of being focused directly. */
  shouldUseVirtualFocus: boolean,
  /** Whether typeahead is disabled. */
  disallowTypeAhead: boolean
}

export interface InputProps<T = FocusableElement> extends DOMProps,
  FocusEvents<T>,
  KeyboardEvents,
  Pick<ValueBase<string>, 'onChange' | 'value'>,
  Pick<AriaTextFieldProps, 'enterKeyHint' | 'aria-controls' | 'aria-autocomplete' | 'aria-activedescendant' | 'spellCheck' | 'autoCorrect' | 'autoComplete'> {}

export interface AriaAutocompleteProps<T> extends AutocompleteProps {
  /**
   * An optional filter function used to determine if a option should be included in the autocomplete list.
   * Include this if the items you are providing to your wrapped collection aren't filtered by default.
   */
  filter?: (textValue: string, inputValue: string, node: Node<T>) => boolean,

  /**
   * Whether or not to focus the first item in the collection after a filter is performed. Note this is only applicable
   * if virtual focus behavior is not turned off via `disableVirtualFocus`.
   * @default false
   */
  disableAutoFocusFirst?: boolean,

  /**
   * Whether the autocomplete should disable virtual focus, instead making the wrapped collection directly tabbable.
   * @default false
   */
  disableVirtualFocus?: boolean
}

export interface AriaAutocompleteOptions<T> extends Omit<AriaAutocompleteProps<T>, 'children'> {
  /** The ref for the wrapped collection element. */
  inputRef: RefObject<HTMLInputElement | null>,
  /** The ref for the wrapped collection element. */
  collectionRef: RefObject<HTMLElement | null>
}

export interface AutocompleteAria<T> {
  /** Props for the autocomplete input element. These should be passed to the input's aria hooks (e.g. useTextField/useSearchField/etc) respectively. */
  inputProps: InputProps,
  /** Props for the collection, to be passed to collection's respective aria hook (e.g. useMenu). */
  collectionProps: CollectionOptions,
  /** Ref to attach to the wrapped collection. */
  collectionRef: RefObject<HTMLElement | null>,
  /** A filter function that returns if the provided collection node should be filtered out of the collection. */
  filter?: (nodeTextValue: string, node: Node<T>) => boolean
}

/**
 * Provides the behavior and accessibility implementation for an autocomplete component.
 * An autocomplete combines a text input with a collection, allowing users to filter the collection's contents match a query.
 * @param props - Props for the autocomplete.
 * @param state - State for the autocomplete, as returned by `useAutocompleteState`.
 */
export function useAutocomplete<T>(props: AriaAutocompleteOptions<T>, state: AutocompleteState): AutocompleteAria<T> {
  let {
    inputRef,
    collectionRef,
    filter,
    disableAutoFocusFirst = false,
    disableVirtualFocus = false
  } = props;

  let collectionId = useId();
  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let delayNextActiveDescendant = useRef(false);
  let queuedActiveDescendant = useRef<string | null>(null);
  let lastCollectionNode = useRef<HTMLElement>(null);

  // For mobile screen readers, we don't want virtual focus, instead opting to disable FocusScope's restoreFocus and manually
  // moving focus back to the subtriggers
  let isMobileScreenReader = getInteractionModality() === 'virtual' && (isIOS() || isAndroid());
  let [shouldUseVirtualFocus, setShouldUseVirtualFocus] = useState(!isMobileScreenReader && !disableVirtualFocus);
  // Tracks if a collection has been connected to the autocomplete. If false, we don't want to add various attributes to the autocomplete input
  // since it isn't attached to a filterable collection (e.g. Tabs)
  let [hasCollection, setHasCollection] = useState(false);

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  let updateActiveDescendant = useEffectEvent((e: Event) => {
    // Ensure input is focused if the user clicks on the collection directly.
    if (!e.isTrusted && shouldUseVirtualFocus && inputRef.current && getActiveElement(getOwnerDocument(inputRef.current)) !== inputRef.current) {
      inputRef.current.focus();
    }

    let target = e.target as Element | null;
    if (e.isTrusted || !target || queuedActiveDescendant.current === target.id) {
      return;
    }

    clearTimeout(timeout.current);
    if (target !== collectionRef.current) {
      if (delayNextActiveDescendant.current) {
        queuedActiveDescendant.current = target.id;
        timeout.current = setTimeout(() => {
          state.setFocusedNodeId(target.id);
        }, 500);
      } else {
        queuedActiveDescendant.current = target.id;
        state.setFocusedNodeId(target.id);
      }
    } else if (queuedActiveDescendant.current && !document.getElementById(queuedActiveDescendant.current)) {
      // If we recieve a focus event refocusing the collection, either we have newly refocused the input and are waiting for the
      // wrapped collection to refocus the previously focused node if any OR
      // we are in a state where we've filtered to such a point that there aren't any matching items in the collection to focus.
      // In this case we want to clear tracked item if any and clear active descendant
      queuedActiveDescendant.current = null;
      state.setFocusedNodeId(null);
    }

    delayNextActiveDescendant.current = false;
  });

  let callbackRef = useCallback((collectionNode) => {
    if (collectionNode != null) {
      // When typing forward, we want to delay the setting of active descendant to not interrupt the native screen reader announcement
      // of the letter you just typed. If we recieve another focus event then we clear the queued update
      // We track lastCollectionNode to do proper cleanup since callbackRefs just pass null when unmounting. This also handles
      // React 19's extra call of the callback ref in strict mode
      lastCollectionNode.current?.removeEventListener('focusin', updateActiveDescendant);
      lastCollectionNode.current = collectionNode;
      collectionNode.addEventListener('focusin', updateActiveDescendant);
      // If useSelectableCollection isn't passed shouldUseVirtualFocus even when useAutocomplete provides it
      // that means the collection doesn't support it (e.g. Table). If that is the case, we need to disable it here regardless
      // of what the user's provided so that the input doesn't recieve the onKeyDown and autocomplete props.
      if (collectionNode.getAttribute('tabindex') != null) {
        setShouldUseVirtualFocus(false);
      }
      setHasCollection(true);
    } else {
      lastCollectionNode.current?.removeEventListener('focusin', updateActiveDescendant);
      setHasCollection(false);
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
    moveVirtualFocus(getActiveElement());
    queuedActiveDescendant.current = null;
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

  let lastInputType = useRef('');
  useEvent(inputRef, 'input', e => {
    let {inputType} = e as InputEvent;
    lastInputType.current = inputType;
  });

  let onChange = (value: string) => {
    // Tell wrapped collection to focus the first element in the list when typing forward and to clear focused key when modifying the text via
    // copy paste/backspacing/undo/redo for screen reader announcements
    if (lastInputType.current === 'insertText' && !disableAutoFocusFirst) {
      focusFirstItem();
    } else if (lastInputType.current && (lastInputType.current.includes('insert') || lastInputType.current.includes('delete') || lastInputType.current.includes('history'))) {
      clearVirtualFocus(true);

      // If onChange was triggered before the timeout actually updated the activedescendant, we need to fire
      // our own dispatchVirtualFocus so focusVisible gets reapplied on the input
      if (getVirtuallyFocusedElement(document) === inputRef.current) {
        dispatchVirtualFocus(inputRef.current!, null);
      }
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

    let focusedNodeId = queuedActiveDescendant.current;
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
        if ((e.key === 'Home' || e.key === 'End') && focusedNodeId == null && e.shiftKey) {
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
    }

    // Emulate the keyboard events that happen in the input field in the wrapped collection. This is for triggering things like onAction via Enter
    // or moving focus from one item to another. Stop propagation on the input event if it isn't already stopped so it doesn't leak out. For events
    // like ESC, the dispatched event below will bubble out of the collection and be stopped if handled by useSelectableCollection, otherwise will bubble
    // as expected
    if (!e.isPropagationStopped()) {
      e.stopPropagation();
    }

    let shouldPerformDefaultAction = true;
    if (collectionRef.current !== null) {
      if (focusedNodeId == null) {
        shouldPerformDefaultAction = collectionRef.current?.dispatchEvent(
          new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
        ) || false;
      } else {
        let item = document.getElementById(focusedNodeId);
        if (item) {
          shouldPerformDefaultAction = item?.dispatchEvent(
            new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
          ) || false;
        }
      }
    }

    if (shouldPerformDefaultAction) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          // Clear the activedescendant so NVDA announcements aren't interrupted but retain the focused key in the collection so the
          // user's keyboard navigation restarts from where they left off
          clearVirtualFocus();
          break;
        }
        case 'Enter':
          // Trigger click action on item when Enter key was pressed.
          if (focusedNodeId != null) {
            let item = document.getElementById(focusedNodeId);
            item?.click();
          }
          break;
      }
    } else {
      // TODO: check if we can do this, want to stop textArea from using its default Enter behavior so items are properly triggered
      e.preventDefault();
    }
  };

  let onKeyUpCapture = useEffectEvent((e) => {
    // Dispatch simulated key up events for things like triggering links in listbox
    // Make sure to stop the propagation of the input keyup event so that the simulated keyup/down pair
    // is detected by usePress instead of the original keyup originating from the input
    if (e.target === keyDownTarget.current) {
      e.stopImmediatePropagation();
      let focusedNodeId = queuedActiveDescendant.current;
      if (focusedNodeId == null) {
        collectionRef.current?.dispatchEvent(
          new KeyboardEvent(e.type, e)
        );
      } else {
        let item = document.getElementById(focusedNodeId);
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

  let filterFn = useCallback((nodeTextValue: string, node: Node<T>) => {
    if (filter) {
      return filter(nodeTextValue, state.inputValue, node);
    }

    return true;
  }, [state.inputValue, filter]);

  // Be sure to clear/restore the virtual + collection focus when blurring/refocusing the field so we only show the
  // focus ring on the virtually focused collection when are actually interacting with the Autocomplete
  let onBlur = (e: ReactFocusEvent) => {
    if (!e.isTrusted) {
      return;
    }

    let lastFocusedNode = queuedActiveDescendant.current ? document.getElementById(queuedActiveDescendant.current) : null;
    if (lastFocusedNode) {
      dispatchVirtualBlur(lastFocusedNode, e.relatedTarget);
    }
  };

  let onFocus = (e: ReactFocusEvent) => {
    if (!e.isTrusted) {
      return;
    }

    let curFocusedNode = queuedActiveDescendant.current ? document.getElementById(queuedActiveDescendant.current) : null;
    if (curFocusedNode) {
      let target = e.target;
      queueMicrotask(() => {
        // instead of focusing the last focused node, just focus the collection instead and have the collection handle what item to focus via useSelectableCollection/Item
        dispatchVirtualBlur(target, collectionRef.current);
        dispatchVirtualFocus(collectionRef.current!, target);
      });
    }
  };

  // Only apply the autocomplete specific behaviors if the collection component wrapped by it is actually
  // being filtered/allows filtering by the Autocomplete.
  let inputProps = {
    value: state.inputValue,
    onChange
  } as AriaTextFieldProps<FocusableElement>;

  let virtualFocusProps = {
    onKeyDown,
    'aria-activedescendant': state.focusedNodeId ?? undefined,
    onBlur,
    onFocus
  };

  if (hasCollection) {
    inputProps = {
      ...inputProps,
      ...(shouldUseVirtualFocus && virtualFocusProps),
      enterKeyHint: 'go',
      'aria-controls': collectionId,
      // TODO: readd proper logic for completionMode = complete (aria-autocomplete: both)
      'aria-autocomplete': 'list',
      // This disable's iOS's autocorrect suggestions, since the autocomplete provides its own suggestions.
      autoCorrect: 'off',
      // This disable's the macOS Safari spell check auto corrections.
      spellCheck: 'false',
      autoComplete: 'off'
    };
  }

  return {
    inputProps,
    collectionProps: mergeProps(collectionProps, {
      shouldUseVirtualFocus,
      disallowTypeAhead: shouldUseVirtualFocus
    }),
    collectionRef: mergedCollectionRef,
    filter: filter != null ? filterFn : undefined
  };
}
