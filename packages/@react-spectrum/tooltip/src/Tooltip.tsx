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

import {classNames, filterDOMProps, useSlotProvider, useStyleProps} from '@react-spectrum/utils';
import React, {RefObject, useRef} from 'react';
import {SpectrumTooltipProps} from '@react-types/tooltip';
import styles from '@adobe/spectrum-css-temp/components/tooltip/vars.css';
import {useTooltip} from '@react-aria/tooltip';

export const Tooltip = React.forwardRef((props: SpectrumTooltipProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {
    variant = 'neutral',
    placement = 'right',
    isOpen,
    slot,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let slotProps = useSlotProvider(slot);
  let {tooltipProps} = useTooltip(props);

  return (
    <div
      {...filterDOMProps(otherProps)}
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
        styleProps.className,
        slotProps.className
      )}
      ref={ref}>
      {props.children && (
        <span className={classNames(styles, 'spectrum-Tooltip-label')}>
          {props.children}
        </span>
      )}
      <span className={classNames(styles, 'spectrum-Tooltip-tip')} />
    </div>
  );
});
