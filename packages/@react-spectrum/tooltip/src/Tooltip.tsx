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
import {classNames, createDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import InfoSmall from '@spectrum-icons/ui/InfoSmall';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useImperativeHandle, useRef} from 'react';
import {SpectrumTooltipProps} from '@react-types/tooltip';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import SuccessSmall from '@spectrum-icons/ui/SuccessSmall';
import {TooltipContext} from './context';
import {useTooltip} from '@react-aria/tooltip';

let iconMap = {
  info: InfoSmall,
  positive: SuccessSmall,
  negative: AlertSmall
};

/**
 * Display container for Tooltip content. Has a directional arrow dependent on its placement.
 */
export const Tooltip = React.forwardRef(function Tooltip(props: SpectrumTooltipProps, ref: DOMRef) {
  let {ref: overlayRef, arrowProps, state, arrowRef, ...tooltipProviderProps} = useContext(TooltipContext);
  let defaultRef = useRef(null);
  overlayRef = overlayRef || defaultRef;
  let backupPlacement = props.placement;
  props = mergeProps(props, tooltipProviderProps);
  let {
    variant = 'neutral',
    placement,
    isOpen,
    showIcon,
    ...otherProps
  } = props;
  if (placement == null) {
    placement = backupPlacement ?? 'top';
  }
  let {styleProps} = useStyleProps(otherProps);
  let {tooltipProps} = useTooltip(props, state);

  // Sync ref with overlayRef from context.
  useImperativeHandle(ref, () => createDOMRef(overlayRef));

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
          'is-open': isOpen,
          [`is-open--${placement}`]: isOpen
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
      <span {...arrowProps} ref={arrowRef} className={classNames(styles, 'spectrum-Tooltip-tip')} />
    </div>
  );
});
