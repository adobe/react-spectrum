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
import {HTMLAttributes, ReactElement, ReactNode} from 'react';

export type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

export type Axis = 'top' | 'bottom' | 'left' | 'right';
export type SizeAxis = 'width' | 'height';
export type PlacementAxis = Axis | 'center';

export interface PositionProps {
  placement?: Placement,
  containerPadding?: number,
  offset?: number,
  crossOffset?: number,
  shouldFlip?: boolean,
  boundaryElement?: Element,
  isOpen?: boolean
}

export interface OverlayProps {
  children: ReactNode,
  isOpen?: boolean,
  container?: Element,
  onEnter?: () => void,
  onEntering?: () => void,
  onEntered?: () => void,
  onExit?: () => void,
  onExiting?: () => void,
  onExited?: () => void
}

export interface ModalProps extends DOMProps, StyleProps, OverlayProps {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void,
  type?: 'fullscreen' | 'fullscreenTakeover',
  isDismissable?: boolean
}

export interface PopoverProps extends DOMProps, StyleProps, OverlayProps {
  children: ReactNode,
  placement?: PlacementAxis,
  arrowProps?: HTMLAttributes<HTMLElement>,
  hideArrow?: boolean,
  isOpen?: boolean,
  onClose?: () => void,
  shouldCloseOnBlur?: boolean
}

export interface TrayProps extends DOMProps, StyleProps, OverlayProps {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void,
  shouldCloseOnBlur?: boolean
}
