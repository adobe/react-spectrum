/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaPreviewTriggerProps, usePreviewTrigger} from 'react-aria/usePreviewTrigger';
import {FocusableElement} from '@react-types/shared';
import {FocusableProvider} from 'react-aria/private/interactions/useFocusable';
import {OverlayTriggerState, useOverlayTriggerState} from 'react-stately/useOverlayTriggerState';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext} from './Popover';
import {Provider} from './utils';
import React, {JSX, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {TooltipTriggerState} from 'react-stately/useTooltipTriggerState';

export interface PreviewTriggerProps extends AriaPreviewTriggerProps {
  /** The trigger and Popover that make up the preview trigger. */
  children: ReactNode;
  /**
   * The delay time in milliseconds before the preview opens.
   *
   * @default 600
   */
  delay?: number;
  /**
   * The delay time in milliseconds before the preview closes.
   *
   * @default 200
   */
  closeDelay?: number;
}

/**
 * A PreviewTrigger displays a non-modal popover on hover, focus, or long press. Unlike a tooltip,
 * the popover may contain interactive content.
 */
export function PreviewTrigger(props: PreviewTriggerProps): JSX.Element {
  let state = usePreviewTriggerState(props);
  let triggerRef = useRef<FocusableElement>(null);
  let popoverRef = useRef<HTMLElement>(null);
  let {triggerProps, popoverProps} = usePreviewTrigger({...props, triggerRef, popoverRef}, state);

  // The Popover and usePopover expect an OverlayTriggerState. Adapt the TooltipTriggerState (which
  // provides the warmup/cooldown delay behavior) to that interface.
  let overlayState = useMemo<OverlayTriggerState>(
    () => ({
      isOpen: state.isOpen,
      open: () => state.open(),
      close: () => state.close(),
      setOpen: isOpen => (isOpen ? state.open() : state.close()),
      toggle: () => (state.isOpen ? state.close() : state.open()),
      point: null,
      setPoint: () => {}
    }),
    [state]
  );

  return (
    <Provider
      values={[
        [OverlayTriggerStateContext, overlayState],
        [
          PopoverContext,
          {
            trigger: 'PreviewTrigger',
            triggerRef,
            ref: popoverRef,
            isNonModal: true,
            // Skip enter/exit animations when swapping between previews during the warmup period.
            shouldSkipAnimation: state.shouldSkipAnimation,
            ...popoverProps
          }
        ]
      ]}>
      <FocusableProvider {...triggerProps} ref={triggerRef}>
        {props.children}
      </FocusableProvider>
    </Provider>
  );
}

/**
 * Provides the state for a preview trigger with warmup/cooldown delay behavior, without
 * participating in the global tooltip trigger registry. This allows interactive content
 * inside the preview popover (e.g. Tooltip, Select) to open without closing the preview,
 * which would happen if useTooltipTriggerState were used directly (its closeOpenTooltips
 * function closes all other tooltip states, including the preview's).
 */
function usePreviewTriggerState(props: PreviewTriggerProps): TooltipTriggerState {
  let {delay = 600, closeDelay = 200} = props;
  let {isOpen, open, close} = useOverlayTriggerState(props);
  // Whether the current open/close transition should skip its animation. Set when swapping
  // between previews during the warmup period.
  let [shouldSkipAnimation, setShouldSkipAnimation] = useState(false);
  let openTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  let closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  let showPreview = useCallback((immediate?: boolean) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = null;
    }
    setShouldSkipAnimation(!!immediate);
    if (immediate || delay <= 0) {
      open();
    } else {
      openTimeout.current = setTimeout(() => {
        openTimeout.current = null;
        setShouldSkipAnimation(false);
        open();
      }, delay);
    }
  }, [delay, open]);

  let hidePreview = useCallback((immediate?: boolean) => {
    if (openTimeout.current) {
      clearTimeout(openTimeout.current);
      openTimeout.current = null;
    }
    if (immediate || closeDelay <= 0) {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
        closeTimeout.current = null;
      }
      close();
    } else if (!closeTimeout.current) {
      closeTimeout.current = setTimeout(() => {
        closeTimeout.current = null;
        close();
      }, closeDelay);
    }
  }, [closeDelay, close]);

  useEffect(() => {
    return () => {
      if (openTimeout.current) {
        clearTimeout(openTimeout.current);
      }
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  return {
    isOpen,
    shouldSkipAnimation,
    open: showPreview,
    close: hidePreview
  };
}