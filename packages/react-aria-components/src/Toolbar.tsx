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
import {createFocusManager} from '@react-aria/focus';
import {filterDOMProps, mergeProps, useLayoutEffect} from '@react-aria/utils';
import {MultipleSelection, Orientation} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef, KeyboardEventHandler, RefObject, useRef, useState} from 'react';
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
function useToolbar(props: ToolbarProps, ref: RefObject<HTMLDivElement>) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    orientation = 'horizontal'
  } = props;
  let [isInToolbar, setInToolbar] = useState(false);
  useLayoutEffect(() => {
    if (ref.current && ref.current.parentElement?.closest('[role="toolbar"]')) {
      setInToolbar(true);
    }
  }, [ref]);
  const {direction} = useLocale();
  const shouldReverse = direction === 'rtl' && orientation === 'horizontal';
  let focusManager = createFocusManager(ref);

  const onKeyDown: KeyboardEventHandler = (e) => {
    // don't handle portalled events
    if (!e.currentTarget.contains(e.target as HTMLElement)) {
      return;
    }
    if (
      (orientation === 'horizontal' && e.key === 'ArrowRight')
      || (orientation === 'vertical' && e.key === 'ArrowDown')) {
      if (shouldReverse) {
        focusManager.focusPrevious();
      } else {
        focusManager.focusNext();
      }
    } else if (
      (orientation === 'horizontal' && e.key === 'ArrowLeft')
      || (orientation === 'vertical' && e.key === 'ArrowUp')) {
      if (shouldReverse) {
        focusManager.focusNext();
      } else {
        focusManager.focusPrevious();
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
      role: !isInToolbar ? 'toolbar' : undefined,
      'aria-orientation': orientation,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabel == null ? ariaLabelledBy : undefined,
      onKeyDownCapture: !isInToolbar ? onKeyDown : undefined,
      onFocusCapture: !isInToolbar ? onFocus : undefined,
      onBlurCapture: !isInToolbar ? onBlur : undefined
    }
  };
}

function Toolbar(props: ToolbarProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ToolbarContext);
  let {toolbarProps} = useToolbar(props, ref);
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
      {renderProps.children}
    </div>
  );
}

/**
 * A toolbar lets you group multiple interactive elements such as Buttons.
 */
const _Toolbar = /*#__PURE__*/ (forwardRef as forwardRefType)(Toolbar);
export {_Toolbar as Toolbar};
