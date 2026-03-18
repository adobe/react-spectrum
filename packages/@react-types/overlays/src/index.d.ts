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

import {HTMLAttributes, ReactElement, ReactNode} from 'react';
import {OverlayProps} from '@react-spectrum/overlays';
import {PlacementAxis} from '@react-aria/overlays';
import {StyleProps} from '@react-types/shared';

export {OverlayTriggerProps} from '@react-stately/overlays';
export {Placement, Axis, SizeAxis, PlacementAxis, PositionProps} from '@react-aria/overlays';
export {OverlayProps} from '@react-spectrum/overlays';

// Old and unused. Left for backward compatibility.
export interface ModalProps extends StyleProps, Omit<OverlayProps, 'nodeRef'> {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void,
  type?: 'modal' | 'fullscreen' | 'fullscreenTakeover',
  isDismissable?: boolean
}

// Old and unused. Left for backward compatibility.
export interface PopoverProps extends StyleProps, Omit<OverlayProps, 'nodeRef'>  {
  children: ReactNode,
  placement?: PlacementAxis,
  arrowProps?: HTMLAttributes<HTMLElement>,
  hideArrow?: boolean,
  isOpen?: boolean,
  onClose?: () => void,
  shouldCloseOnBlur?: boolean,
  isNonModal?: boolean,
  isDismissable?: boolean
}

// Old and unused. Left for backward compatibility.
export interface TrayProps extends StyleProps, Omit<OverlayProps, 'nodeRef'>  {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void,
  shouldCloseOnBlur?: boolean,
  isFixedHeight?: boolean,
  isNonModal?: boolean
}
