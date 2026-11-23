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

import {ariaHideOutside, keepVisible} from './ariaHideOutside';
import {AriaOverlayProps, useOverlay} from './useOverlay';
import {DOMAttributes, RefObject} from '@react-types/shared';
import {mergeProps} from '../utils/mergeProps';
import {OverlayTriggerState} from 'react-stately/useOverlayTriggerState';
import {useEffect} from 'react';
import {useOverlayFocusContain} from './Overlay';
import {usePreventScroll} from './usePreventScroll';

export interface AriaModalOverlayProps extends Pick<
  AriaOverlayProps,
  'shouldCloseOnInteractOutside'
> {
  /**
   * Whether to close the modal when the user interacts outside it.
   *
   * @default false
   */
  isDismissable?: boolean;
  /**
   * Whether pressing the escape key to close the modal should be disabled.
   *
   * @default false
   */
  isKeyboardDismissDisabled?: boolean;
  /**
   * Whether the modal is currently performing an entry animation. Content outside the modal is
   * not hidden from assistive technology until the animation completes, so that the screen reader
   * cursor is not forced into the modal before it is ready.
   */
  isEntering?: boolean;
  /**
   * Whether to override the `focus()` method so it does not scroll the page.
   * This is temporary and will be removed after fully testing all overlays.
   *
   * @private
   */
  UNSTABLE_overrideFocus?: boolean;
}

export interface ModalOverlayAria {
  /** Props for the modal element. */
  modalProps: DOMAttributes;
  /** Props for the underlay element. */
  underlayProps: DOMAttributes;
}

/**
 * Provides the behavior and accessibility implementation for a modal component.
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
export function useModalOverlay(
  props: AriaModalOverlayProps,
  state: OverlayTriggerState,
  ref: RefObject<HTMLElement | null>
): ModalOverlayAria {
  let {overlayProps, underlayProps} = useOverlay(
    {
      ...props,
      isOpen: state.isOpen,
      onClose: state.close
    },
    ref
  );

  usePreventScroll({
    isDisabled: !state.isOpen,
    UNSTABLE_overrideFocus: props.UNSTABLE_overrideFocus
  });

  useOverlayFocusContain();

  let {isEntering} = props;
  useEffect(() => {
    if (state.isOpen && ref.current) {
      if (isEntering) {
        // Prevent a parent modal from hiding this one while it is entering.
        return keepVisible(ref.current);
      }
      return ariaHideOutside([ref.current], {shouldUseInert: true});
    }
  }, [state.isOpen, isEntering, ref]);

  return {
    modalProps: mergeProps(overlayProps),
    underlayProps
  };
}
