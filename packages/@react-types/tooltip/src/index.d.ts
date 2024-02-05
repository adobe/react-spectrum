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
  /**
   * Whether the tooltip should be disabled, independent from the trigger.
   */
  isDisabled?: boolean,

  /**
   * The delay time for the tooltip to show up. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Immediate-or-delayed-appearance).
   * @default 1500
   */
  delay?: number,

  /**
   * The delay time for the tooltip to close. [See guidelines](https://spectrum.adobe.com/page/tooltip/#Warmup-and-cooldown).
   * @default 500
   */
  closeDelay?: number,

  /**
   * By default, opens for both focus and hover. Can be made to open only for focus.
   */
  trigger?: 'focus'
}

export interface SpectrumTooltipTriggerProps extends Omit<TooltipTriggerProps, 'closeDelay'>, PositionProps {
  children: [ReactElement, ReactElement],

  /**
   * The additional offset applied along the main axis between the element and its
   * anchor element.
   * @default 7
   */
  offset?: number
}

export interface TooltipProps {
  isOpen?: boolean
}

export interface AriaTooltipProps extends TooltipProps, DOMProps, AriaLabelingProps {}

export interface SpectrumTooltipProps extends AriaTooltipProps, StyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/tooltip/#Semantic-variants) of the Tooltip.
   */
  variant?: 'neutral' | 'positive' | 'negative' | 'info',

  /**
   * The placement of the element with respect to its anchor element.
   * @default 'top'
   */
  placement?: 'start' | 'end' | 'right' | 'left' | 'top' | 'bottom',

  /**
   * Whether the element is rendered.
   */
  showIcon?: boolean,

  children: ReactNode
}
