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

import {AriaLinkPreviewProps, useLinkPreviewTrigger} from 'react-aria/useLinkPreviewTrigger';
import {FocusableElement} from '@react-types/shared';
import {FocusableProvider} from 'react-aria/private/interactions/useFocusable';
import {OverlayTriggerState} from 'react-stately/useOverlayTriggerState';
import {OverlayTriggerStateContext} from './Dialog';
import {PopoverContext} from './Popover';
import {Provider} from './utils';
import React, {JSX, ReactNode, useMemo, useRef} from 'react';
import {useTooltipTriggerState} from 'react-stately/useTooltipTriggerState';

export interface LinkPreviewProps extends AriaLinkPreviewProps {
  /** The Link and Popover that make up the link preview. */
  children: ReactNode;
}

/**
 * A LinkPreview wraps a Link and a Popover to display a non-modal preview of the link's content
 * on hover, focus, or long press. Unlike a tooltip, the popover may contain interactive content.
 */
export function LinkPreview(props: LinkPreviewProps): JSX.Element {
  let state = useTooltipTriggerState({
    ...props,
    delay: props.delay ?? 600,
    closeDelay: props.closeDelay ?? 200
  });
  let triggerRef = useRef<FocusableElement>(null);
  let popoverRef = useRef<HTMLElement>(null);
  let {triggerProps, popoverProps} = useLinkPreviewTrigger(
    {...props, triggerRef, popoverRef},
    state
  );

  // The Popover and usePopover expect an OverlayTriggerState. Adapt the TooltipTriggerState (which
  // provides the warmup/cooldown delay behavior) to that interface.
  let overlayState = useMemo<OverlayTriggerState>(
    () => ({
      isOpen: state.isOpen,
      open: () => state.open(),
      close: () => state.close(),
      setOpen: isOpen => (isOpen ? state.open() : state.close()),
      toggle: () => (state.isOpen ? state.close() : state.open())
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
            trigger: 'LinkPreview',
            triggerRef,
            ref: popoverRef,
            isNonModal: true,
            // Skip enter/exit animations when swapping between previews during the warmup period.
            isInstant: state.isInstant,
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
