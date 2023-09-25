/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, forwardRefType, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {createFocusManager, focusSafely} from '@react-aria/focus';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {FocusableElement, MultipleSelection, Orientation} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef, KeyboardEventHandler, RefObject, useRef} from 'react';
import {useLocale} from '@react-aria/i18n';

export interface ToolbarRenderProps {
  /**
   * Whether the dropzone is currently hovered with a mouse.
   * @selector [data-orientation]
   */
  orientation: Orientation
}

export interface ToolbarProps extends MultipleSelection, SlotProps, RenderProps<ToolbarRenderProps> {
  /** Accessible label for the Toolbar. */
  'aria-label'?: string,

  /** Accessible label for the Toolbar. */
  'aria-labelledby'?: string,

  /**
   * The orientation of the entire toolbar.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
}

export const ToolbarContext = createContext<ContextValue<ToolbarProps, HTMLDivElement>>({});

// Extract out to aria hooks?
// Any reason not to include ref? i feel like we've been sad about not including it down the line
// same with state...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useToolbar(props: ToolbarProps & {isInsideAToolbar: boolean}, ref: RefObject<HTMLDivElement>) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    orientation = 'horizontal',
    isInsideAToolbar
  } = props;
  const {direction} = useLocale();
  const shouldReverse = direction === 'rtl' && orientation === 'horizontal';
  let focusManager = createFocusManager(ref, {tabbable: true});

  const onKeyDown: KeyboardEventHandler = (e) => {
    // don't handle portalled events
    if (!e.currentTarget.contains(e.target as HTMLElement)) {
      return;
    }
    if (
      ((orientation === 'horizontal' && e.key === 'ArrowRight')
      || (orientation === 'vertical' && e.key === 'ArrowDown'))
      && !e.nativeEvent.defaultPrevented) {
      if (shouldReverse) {
        let nextFocusable = focusManager.focusPrevious({tabbable: false, preview: true});
        let nextTabbable = focusManager.focusPrevious({preview: true});
        // for native radios, take over the focus so the radio isn't selected
        if (nextFocusable && nextFocusable.getAttribute('type') === 'radio') {
          focusElement(nextFocusable);
        } else if (nextTabbable) {
          focusElement(nextTabbable);
        }
      } else {
        let nextFocusable = focusManager.focusNext({tabbable: false, preview: true});
        let nextTabbable = focusManager.focusNext({preview: true});
        if (nextFocusable && nextFocusable.getAttribute('type') === 'radio') {
          focusElement(nextFocusable);
        } else if (nextTabbable) {
          focusElement(nextTabbable);
        }
      }
    } else if (
      ((orientation === 'horizontal' && e.key === 'ArrowLeft')
      || (orientation === 'vertical' && e.key === 'ArrowUp'))
      && !e.nativeEvent.defaultPrevented) {
      if (shouldReverse) {
        let nextFocusable = focusManager.focusNext({tabbable: false, preview: true});
        let nextTabbable = focusManager.focusNext({preview: true});
        if (nextFocusable && nextFocusable.getAttribute('type') === 'radio') {
          focusElement(nextFocusable);
        } else if (nextTabbable) {
          focusElement(nextTabbable);
        }
      } else {
        let nextFocusable = focusManager.focusPrevious({tabbable: false, preview: true});
        let nextTabbable = focusManager.focusPrevious({preview: true});
        if (nextFocusable && nextFocusable.getAttribute('type') === 'radio') {
          focusElement(nextFocusable);
        } else if (nextTabbable) {
          focusElement(nextTabbable);
        }
      }
    } else if (e.key === 'Tab') {
      // When the tab key is pressed, we want to move focus
      // out of the entire toolbar. To do this, move focus
      // to the first or last focusable child, and let the
      // browser handle the Tab key as usual from there.
      e.stopPropagation();
      lastFocused.current = document.activeElement as HTMLElement;
      if (e.shiftKey) {
        focusManager.focusFirst();
      } else {
        focusManager.focusLast();
      }
      return;
    } else {
      // if we didn't handle anything, return early so we don't preventDefault
      return;
    }

    // Prevent arrow keys from being handled by nested action groups.
    e.stopPropagation();
    e.preventDefault();
  };

  // Record the last focused child when focus moves out of the toolbar.
  const lastFocused = useRef<HTMLElement | null>(null);
  const onBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget) && !lastFocused.current) {
      lastFocused.current = e.target;
    }
  };

  // Restore focus to the last focused child when focus returns into the toolbar.
  // If the element was removed, do nothing, either the first item in the first group,
  // or the last item in the last group will be focused, depending on direction.
  const onFocus = (e) => {
    if (lastFocused.current && !e.currentTarget.contains(e.relatedTarget) && ref.current?.contains(e.target)) {
      lastFocused.current?.focus();
      lastFocused.current = null;
    }
  };

  return {
    toolbarProps: {
      role: !isInsideAToolbar ? 'toolbar' : undefined,
      'aria-orientation': orientation,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabel == null ? ariaLabelledBy : undefined,
      onKeyDown: !isInsideAToolbar ? onKeyDown : undefined,
      onFocus: !isInsideAToolbar ? onFocus : undefined,
      onBlur: !isInsideAToolbar ? onBlur : undefined
    }
  };
}

function Toolbar(props: ToolbarProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ToolbarContext);
  let {isInsideAToolbar} = useToolbarNestingContext();
  let {toolbarProps} = useToolbar({...props, isInsideAToolbar}, ref);
  let renderProps = useRenderProps({
    ...props,
    values: {orientation: props.orientation || 'horizontal'},
    defaultClassName: 'react-aria-Toolbar'
  });
  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(toolbarProps, DOMProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-orientation={props.orientation || 'horizontal'}>
      <ToolbarNestingContext.Provider value={{isInsideAToolbar: true}}>
        {renderProps.children}
      </ToolbarNestingContext.Provider>
    </div>
  );
}

// I don't like exporting this, but it's the only way I can think of for ActionGroup to know if it's in a Toolbar
// This is required so that we don't render a role="toolbar" inside another role="toolbar"
// Eventually we'll hopefully move ActionGroup to being implemented by Toolbar and then we can remove this
/** @private */
export const ToolbarNestingContext = createContext({isInsideAToolbar: false});
/** @private */
export const useToolbarNestingContext = () => React.useContext(ToolbarNestingContext);

function focusElement(element: FocusableElement | null, scroll = false) {
  if (element != null && !scroll) {
    try {
      focusSafely(element);
    } catch (err) {
      // ignore
    }
  } else if (element != null) {
    try {
      element.focus();
    } catch (err) {
      // ignore
    }
  }
}

/**
 * A toolbar lets you group multiple interactive elements such as Buttons.
 */
const _Toolbar = /*#__PURE__*/ (forwardRef as forwardRefType)(Toolbar);
export {_Toolbar as Toolbar};
