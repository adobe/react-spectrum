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

import {AriaLabelingProps, DOMProps, StyleProps} from '@react-types/shared';
import {OverlayTriggerProps, PositionProps} from '@react-types/overlays';
import {ReactElement, ReactNode} from 'react';

export interface TooltipTriggerProps extends OverlayTriggerProps {
  isDisabled?: boolean,
  delay?: number,
  offset?: number,
  crossOffset?: number
}

export interface SpectrumTooltipTriggerProps extends TooltipTriggerProps, PositionProps {
  children: [ReactElement, ReactElement]
}

export interface TooltipProps {
  children: ReactNode,
  isOpen?: boolean
}

export interface AriaTooltipProps extends TooltipProps, DOMProps, AriaLabelingProps {}

export interface SpectrumTooltipProps extends AriaTooltipProps, StyleProps {
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  placement?: 'start' | 'end' | 'right' | 'left' | 'top' | 'bottom',
  showIcon?: boolean
}
