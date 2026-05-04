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

import {AriaLabelingProps, Orientation, RefObject} from '@react-types/shared';
import {createFocusManager} from '../focus/FocusScope';
import {filterDOMProps} from '../utils/filterDOMProps';
import {FocusEventHandler, HTMLAttributes, useEffect, useRef, useState} from 'react';
import {getActiveElement, getEventTarget, nodeContains} from '../utils/shadowdom/DOMFunctions';
import {useKeyboard} from '../interactions/useKeyboard';
import {useLayoutEffect} from '../utils/useLayoutEffect';
import {useLocale} from '../i18n/I18nProvider';

export interface AriaToolbarProps extends AriaLabelingProps {
  /**
   * The orientation of the entire toolbar.
   *
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

export interface ToolbarAria {
  /**
   * Props for the toolbar container.
   */
  toolbarProps: HTMLAttributes<HTMLElement>;
}

/**
 * Provides the behavior and accessibility implementation for a toolbar.
 * A toolbar is a container for a set of interactive controls with arrow key navigation.
 *
 * @param props - Props to be applied to the toolbar.
 * @param ref - A ref to a DOM element for the toolbar.
 */
export function useToolbar(
  props: AriaToolbarProps,
  ref: RefObject<HTMLElement | null>
): ToolbarAria {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    orientation = 'horizontal'
  } = props;
  let [isInToolbar, setInToolbar] = useState(false);
  // should be safe because re-calling set state with the same value it already has is a no-op
  // this will allow us to react should a parent re-render and change its role though
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    setInToolbar(!!(ref.current && ref.current.parentElement?.closest('[role="toolbar"]')));
  });
  const {direction} = useLocale();
  let focusManager = createFocusManager(ref);

  useEffect(() => {
    const onFocusManagerFocusWrap = (e: CustomEvent<{action: string}>) => {
      if (
        (orientation === 'horizontal' &&
          (e.detail.action === 'ArrowRight' || e.detail.action === 'ArrowLeft')) ||
        (orientation === 'vertical' &&
          (e.detail.action === 'ArrowDown' || e.detail.action === 'ArrowUp'))
      ) {
        e.preventDefault();
      }
    };
    let toolbar = ref.current;
    toolbar?.addEventListener('focus-manager-focus-wrap', onFocusManagerFocusWrap as EventListener);
    return () =>
      toolbar?.removeEventListener(
        'focus-manager-focus-wrap',
        onFocusManagerFocusWrap as EventListener
      );
  }, [ref, orientation]);

  let flipDirection = direction === 'rtl' && orientation === 'horizontal';
  let {keyboardProps} = useKeyboard({
    shortcuts: {
      ArrowRight: () => {
        let next;
        if (orientation === 'horizontal') {
          if (flipDirection) {
            next = focusManager.focusPrevious({wrap: false, action: 'ArrowRight'});
          } else {
            next = focusManager.focusNext({wrap: false, action: 'ArrowRight'});
          }
        }
        return next !== null;
      },
      ArrowLeft: () => {
        let next;
        if (orientation === 'horizontal') {
          if (flipDirection) {
            next = focusManager.focusNext({wrap: false, action: 'ArrowLeft'});
          } else {
            next = focusManager.focusPrevious({wrap: false, action: 'ArrowLeft'});
          }
        }
        return next !== null;
      },
      ArrowDown: () => {
        let next;
        if (orientation === 'vertical') {
          next = focusManager.focusNext({wrap: false, action: 'ArrowDown'});
        }
        return next !== null;
      },
      ArrowUp: () => {
        let next;
        if (orientation === 'vertical') {
          next = focusManager.focusPrevious({wrap: false, action: 'ArrowUp'});
        }
        return next !== null;
      },
      Tab: () => {
        lastFocused.current = getActiveElement() as HTMLElement;
        focusManager.focusLast();
        return {shouldPreventDefault: false, shouldContinuePropagation: false};
      },
      'Shift+Tab': () => {
        lastFocused.current = getActiveElement() as HTMLElement;
        focusManager.focusFirst();
        return {shouldPreventDefault: false, shouldContinuePropagation: false};
      }
    }
  });

  // Record the last focused child when focus moves out of the toolbar.
  const lastFocused = useRef<HTMLElement | null>(null);
  const onBlur: FocusEventHandler<HTMLElement> = e => {
    if (!nodeContains(e.currentTarget, e.relatedTarget) && !lastFocused.current) {
      lastFocused.current = getEventTarget(e);
    }
  };

  // Restore focus to the last focused child when focus returns into the toolbar.
  // If the element was removed, do nothing, either the first item in the first group,
  // or the last item in the last group will be focused, depending on direction.
  const onFocus: FocusEventHandler<HTMLElement> = e => {
    if (
      lastFocused.current &&
      !nodeContains(e.currentTarget, e.relatedTarget) &&
      nodeContains(ref.current, getEventTarget(e))
    ) {
      lastFocused.current?.focus();
      lastFocused.current = null;
    }
  };

  return {
    toolbarProps: {
      ...filterDOMProps(props, {labelable: true}),
      role: !isInToolbar ? 'toolbar' : 'group',
      'aria-orientation': orientation,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabel == null ? ariaLabelledBy : undefined,
      onKeyDown: !isInToolbar ? keyboardProps.onKeyDown : undefined,
      onKeyUp: !isInToolbar ? keyboardProps.onKeyUp : undefined,
      onFocusCapture: !isInToolbar ? onFocus : undefined,
      onBlurCapture: !isInToolbar ? onBlur : undefined
    }
  };
}
