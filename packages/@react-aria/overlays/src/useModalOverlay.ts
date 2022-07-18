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

import {HTMLAttributes, RefObject} from 'react';
import {mergeProps} from '@react-aria/utils';
import {OverlayTriggerState} from '@react-stately/overlays';
import {useFocusScope} from '@react-aria/focus';
import {useModal} from './useModal';
import {useOverlay} from './useOverlay';
import {usePreventScroll} from './usePreventScroll';

interface ModalOverlayProps {
  /**
   * Whether to close the modal when the user interacts outside it.
   * @default false
   */
   isDismissable?: boolean,
  /**
   * Whether pressing the escape key to close the modal should be disabled.
   * @default false
   */
  isKeyboardDismissDisabled?: boolean
}

interface ModalOverlayAria {
  modalProps: HTMLAttributes<HTMLElement>,
  underlayProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a modal component.
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
export function useModalOverlay(props: ModalOverlayProps, state: OverlayTriggerState, ref: RefObject<HTMLElement>): ModalOverlayAria {
  let {overlayProps, underlayProps} = useOverlay({
    ...props,
    isOpen: state.isOpen,
    onClose: state.close
  }, ref);

  let {modalProps} = useModal({
    isDisabled: !state.isOpen
  });

  usePreventScroll({
    isDisabled: !state.isOpen
  });

  useFocusScope({
    restoreFocus: state.isOpen,
    contain: state.isOpen
  }, ref);

  return {
    modalProps: mergeProps(overlayProps, modalProps),
    underlayProps
  };
}
