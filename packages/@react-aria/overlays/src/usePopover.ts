/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ariaHideOutside} from './ariaHideOutside';
import {DOMAttributes} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {OverlayTriggerState} from '@react-stately/overlays';
import {PositionProps} from '@react-types/overlays';
import {RefObject, useEffect} from 'react';
import {useOverlay} from './useOverlay';
import {useOverlayPosition} from './useOverlayPosition';

export interface AriaPopoverProps extends Omit<PositionProps, 'isOpen'> {
  /**
   * The ref for the element which the popover positions itself with respect to.
   */
  triggerRef: RefObject<Element>,
  /**
   * The ref for the popover element.
   */
  popoverRef: RefObject<Element>,
  /**
   * Whether the popover is non-modal, i.e. elements outside the popover may be
   * interacted with by assistive technologies.
   *
   * Most popovers should not use this option as it may negatively impact the screen
   * reader experience. Only use with components such as combobox, which are designed
   * to handle this situation carefully.
   */
  isNonModal?: boolean
}

export interface PopoverAria {
  /** Props for the popover element. */
  popoverProps: DOMAttributes,
  /** Props for the popover tip arrow if any. */
  arrowProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a popover component.
 * A popover is an overlay element positioned relative to a trigger.
 */
export function usePopover(props: AriaPopoverProps, state: OverlayTriggerState): PopoverAria {
  let {
    triggerRef,
    popoverRef,
    isNonModal,
    ...otherProps
  } = props;

  let {overlayProps} = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: true,
      isDismissable: true
    },
    popoverRef
  );

  let {overlayProps: positionProps, arrowProps} = useOverlayPosition({
    ...otherProps,
    targetRef: triggerRef,
    overlayRef: popoverRef,
    isOpen: state.isOpen
  });

  useEffect(() => {
    if (state.isOpen && !isNonModal) {
      return ariaHideOutside([popoverRef.current]);
    }
  }, [isNonModal, state.isOpen, popoverRef]);

  return {
    popoverProps: mergeProps(overlayProps, positionProps),
    arrowProps
  };
}
