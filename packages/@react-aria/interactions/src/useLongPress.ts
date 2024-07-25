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

import {DOMAttributes, LongPressEvent} from '@react-types/shared';
import {mergeProps, useDescription, useGlobalListeners} from '@react-aria/utils';
import {usePress} from './usePress';
import {useRef} from 'react';

export interface LongPressProps {
  /** Whether long press events should be disabled. */
  isDisabled?: boolean,
  /** Handler that is called when a long press interaction starts. */
  onLongPressStart?: (e: LongPressEvent) => void,
  /**
   * Handler that is called when a long press interaction ends, either
   * over the target or when the pointer leaves the target.
   */
  onLongPressEnd?: (e: LongPressEvent) => void,
  /**
   * Handler that is called when the threshold time is met while
   * the press is over the target.
   */
  onLongPress?: (e: LongPressEvent) => void,
  /**
   * The amount of time in milliseconds to wait before triggering a long press.
   * @default 500ms
   */
  threshold?: number,
  /**
   * A description for assistive techology users indicating that a long press
   * action is available, e.g. "Long press to open menu".
   */
  accessibilityDescription?: string
}

export interface LongPressResult {
  /** Props to spread on the target element. */
  longPressProps: DOMAttributes
}

const DEFAULT_THRESHOLD = 500;

/**
 * Handles long press interactions across mouse and touch devices. Supports a customizable time threshold,
 * accessibility description, and normalizes behavior across browsers and devices.
 */
export function useLongPress(props: LongPressProps): LongPressResult {
  let {
    isDisabled,
    onLongPressStart,
    onLongPressEnd,
    onLongPress,
    threshold = DEFAULT_THRESHOLD,
    accessibilityDescription
  } = props;

  const timeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  let {pressProps} = usePress({
    isDisabled,
    onPressStart(e) {
      e.continuePropagation();
      if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
        if (onLongPressStart) {
          onLongPressStart({
            ...e,
            type: 'longpressstart'
          });
        }

        timeRef.current = setTimeout(() => {
          // Prevent other usePress handlers from also handling this event.
          e.target.dispatchEvent(new PointerEvent('pointercancel', {bubbles: true}));
          if (onLongPress) {
            onLongPress({
              ...e,
              type: 'longpress'
            });
          }
          timeRef.current = undefined;
        }, threshold);

        // Prevent context menu, which may be opened on long press on touch devices
        if (e.pointerType === 'touch') {
          let onContextMenu = e => {
            e.preventDefault();
          };

          addGlobalListener(e.target, 'contextmenu', onContextMenu, {once: true});
          addGlobalListener(window, 'pointerup', () => {
            // If no contextmenu event is fired quickly after pointerup, remove the handler
            // so future context menu events outside a long press are not prevented.
            setTimeout(() => {
              removeGlobalListener(e.target, 'contextmenu', onContextMenu);
            }, 30);
          }, {once: true});
        }
      }
    },
    onPressEnd(e) {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }

      if (onLongPressEnd && (e.pointerType === 'mouse' || e.pointerType === 'touch')) {
        onLongPressEnd({
          ...e,
          type: 'longpressend'
        });
      }
    }
  });

  let descriptionProps = useDescription(onLongPress && !isDisabled ? accessibilityDescription : undefined);

  return {
    longPressProps: mergeProps(pressProps, descriptionProps)
  };
}
