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
import {PositionProps} from '@react-types/overlays';
import {ReactElement, ReactNode, RefObject} from 'react';
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

export interface SpectrumDialogProps extends DOMProps, StyleProps {
  /** The contents of the Dialog. */
  children: ReactNode,
  /**
   * Replaces the default slots used within Dialog.
   */
  slots?: Slots,
  /** The size of the Dialog. Only applies to "modal" type Dialogs. */
  size?: 'S' | 'M' | 'L' | 'fullscreen' | 'fullscreenTakeover',
  /** Whether the Dialog is [dismissable](#dismissable). */
  isDismissable?: boolean,
  onDismiss?: () => void,
  role?: 'dialog' | 'alertdialog'
}

export interface SpectrumAlertDialogProps extends DOMProps, StyleProps {
  /** The [visual style](https://spectrum.adobe.com/page/dialog/#Options) of the AlertDialog.  */
  variant?: 'confirmation' | 'information' | 'destructive' | 'error' | 'warning'
  /** The title of the AlertDialog. */
  title: string,
  /** The contents of the AlertDialog. */
  children: ReactNode,
  /** The label to display within the cancel button. */
  cancelLabel?: string,
  /** The label to display within the confirm button. */
  primaryLabel: string,
  /** The label to display within the secondary button. */
  secondaryLabel?: string,
  /** Whether the primary button is disabled. */
  isPrimaryActionDisabled?: boolean,
  /** Whether the secondary button is disabled. */
  isSecondaryActionDisabled?: boolean,
  /** Handler that is called when the cancel button is pressed. */
  onCancel?: () => void,
  /** Handler that is called when the confirm button is pressed. */
  onConfirm?: (button: 'primary' | 'secondary') => void,
  /** Button to focus by default upon render. */
  autoFocusButton?: 'cancel' | 'primary' | 'secondary',
  // allowsKeyboardConfirmation?: boolean, // triggers primary action
  // isKeyboardCancelDisabled?: boolean // needed?
}
