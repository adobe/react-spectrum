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

import {DOMProps, StyleProps} from '@react-types/shared';
import {HTMLAttributes, ReactElement, ReactNode, RefObject} from 'react';
import {PositionProps} from '@react-types/overlays';
import {Slots} from '@react-types/layout';

export type SpectrumDialogClose = (close: () => void) => ReactElement;

export interface SpectrumDialogTriggerProps extends PositionProps {
  children: [ReactElement, SpectrumDialogClose | ReactElement],
  type?: 'modal' | 'popover' | 'tray' | 'fullscreen' | 'fullscreenTakeover',
  mobileType?: 'modal' | 'tray' | 'fullscreen' | 'fullscreenTakeover',
  hideArrow?: boolean,
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  isDismissable?: boolean
}

export interface SpectrumDialogTriggerBase {
  type?: 'modal' | 'popover' | 'tray' | 'fullscreen' | 'fullscreenTakeover',
  isOpen?: boolean,
  onPress?: any,
  onClose?: () => void,
  isDismissable?: boolean
  dialogProps?: SpectrumDialogProps | {},
  triggerProps?: any,
  overlay: ReactElement,
  trigger: ReactElement
}

export interface SpectrumBaseDialogProps extends HTMLAttributes<HTMLElement> {
  slots?: Slots,
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  role?: 'dialog' | 'alertdialog'
}

export interface SpectrumDialogProps extends DOMProps, StyleProps {
  children: ReactNode,
  slots?: Slots,
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  isDismissable?: boolean, // adds close button and enables clicking on background
  onDismiss?: () => void,
  role?: 'dialog' | 'alertdialog'
}


export interface SpectrumAlertDialogProps extends DOMProps, StyleProps {
  variant?: 'confirmation' | 'information' | 'destructive' | 'error' | 'warning'
  title: string,
  children: ReactNode,
  cancelLabel?: string,
  primaryLabel?: string,
  secondaryLabel?: string,
  isConfirmDisabled?: boolean,
  onCancel?: () => void,
  onConfirm?: (button: 'primary' | 'secondary') => void,
  autoFocusButton?: 'cancel' | 'primary' | 'secondary',
  allowsKeyboardConfirmation?: boolean, // triggers primary action
  isKeyboardCancelDisabled?: boolean // needed?
}
