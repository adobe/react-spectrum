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

import AlertSmall from '@spectrum-icons/ui/AlertSmall';
import {classNames, useStyleProps} from '@react-spectrum/utils';
import InfoSmall from '@spectrum-icons/ui/InfoSmall';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import {SpectrumTooltipProps} from '@react-types/tooltip';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import SuccessSmall from '@spectrum-icons/ui/SuccessSmall';
import {useTooltip} from '@react-aria/tooltip';
import {useTooltipProvider} from './TooltipTrigger';

let iconMap = {
  neutral: '',
  info: InfoSmall,
  positive: SuccessSmall,
  negative: AlertSmall
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Tooltip(props: SpectrumTooltipProps, ref: RefObject<HTMLDivElement>) {
  let defaultRef = useRef();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref = ref || defaultRef; // need to figure out how to merge?
  let {ref: overlayRef, ...tooltipProviderProps} = useTooltipProvider();
  props = mergeProps(props, tooltipProviderProps);
  let {
    variant = 'neutral',
    placement = 'right',
    isOpen,
    showIcon,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let {tooltipProps} = useTooltip(props);

  let Icon = iconMap[variant];

  return (
    <div
      {...styleProps}
      {...tooltipProps}
      className={classNames(
        styles,
        'spectrum-Tooltip',
        `spectrum-Tooltip--${variant}`,
        `spectrum-Tooltip--${placement}`,
        {
          'is-open': isOpen
        },
        styleProps.className
      )}
      ref={overlayRef}>
      {showIcon && variant !== 'neutral' && <Icon UNSAFE_className={classNames(styles, 'spectrum-Tooltip-typeIcon')} aria-hidden />}
      {props.children && (
        <span className={classNames(styles, 'spectrum-Tooltip-label')}>
          {props.children}
        </span>
      )}
      <span className={classNames(styles, 'spectrum-Tooltip-tip')} />
    </div>
  );
}


/**
 * Display container for Tooltip content. Has a directional arrow dependent on its placement.
 */
let _Tooltip = React.forwardRef(Tooltip);
export {_Tooltip as Tooltip};
