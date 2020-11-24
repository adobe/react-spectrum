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

import Add from '@spectrum-icons/workflow/Add';
import {AriaButtonProps} from '@react-types/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames} from '@react-spectrum/utils';
import Remove from '@spectrum-icons/workflow/Remove';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {RefObject} from 'react';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {useButton} from '@react-aria/button';
import {useHover} from '@react-aria/interactions';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

interface StepButtonProps extends AriaButtonProps {
  isQuiet: boolean,
  direction: 'up' | 'down'
}

let iconMap = {
  large: {
    up: Add,
    down: Remove
  },
  medium: {
    up: ChevronUpSmall,
    down: ChevronDownSmall
  }
};

function StepButton(props: StepButtonProps, ref: RefObject<HTMLDivElement>) {
  props = useProviderProps(props);
  let {scale} = useProvider();
  let {direction, isDisabled, isQuiet} = props;
  let {buttonProps, isPressed} = useButton({...props, elementType: 'div'}, ref);
  let {hoverProps, isHovered} = useHover(props);
  let UpIcon = iconMap[scale].up;
  let DownIcon = iconMap[scale].down;
  return (
    <FocusRing focusRingClass={classNames(stepperStyle, 'focus-ring')}>
      <div
        className={
          classNames(
            stepperStyle,
            'spectrum-Stepper-button',
            {
              'spectrum-Stepper-button--stepUp': direction === 'up',
              'spectrum-Stepper-button--stepDown': direction === 'down',
              'spectrum-Stepper-button--isQuiet': isQuiet,
              'is-hovered': isHovered,
              'is-active': isPressed,
              'is-disabled': isDisabled
            }
          )
        }
        {...mergeProps(hoverProps, buttonProps)}
        ref={ref}
        tabIndex={props.excludeFromTabOrder && !props.isDisabled ? -1 : undefined}>
        {direction === 'up' &&
        <UpIcon UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-icon spectrum-Stepper-stepUpIcon')} {...(scale === 'large' ? {size: 'S'} : {})} />}
        {direction === 'down' &&
        <DownIcon UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-icon spectrum-Stepper-stepDownIcon')} {...(scale === 'large' ? {size: 'S'} : {})} />}
      </div>
    </FocusRing>
  );
}

/**
 * Buttons for NumberField.
 */
let _StepButton = React.forwardRef(StepButton);
export {_StepButton as StepButton};
