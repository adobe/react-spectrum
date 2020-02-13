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

export interface TooltipTriggerProps extends PositionProps {
  children: ReactElement[],
  type?: 'click' | 'hover',
  targetRef?: RefObject<HTMLElement>,
  isOpen?: boolean,
  isDisabled?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

export interface TooltipProps extends DOMProps {
  children: ReactNode,
  isOpen?: boolean,
  role?: 'tooltip',
  ref: RefObject<HTMLElement | null>
}

export interface SpectrumTooltipProps extends TooltipProps, StyleProps {
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  placement?: 'right' | 'left' | 'top' | 'bottom'
}
