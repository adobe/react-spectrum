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

import {ButtonProps} from '@react-types/button';
import {classNames, filterDOMProps, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import CrossSmall from '@spectrum-icons/ui/CrossSmall';
import {DOMProps, FocusableRef, StyleProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {useButton} from '@react-aria/button';

interface ClearButtonProps extends ButtonProps, DOMProps, StyleProps {
  focusClassName?: string,
  variant?: 'overBackground'
}

function ClearButton(props: ClearButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let {
    children = <CrossSmall />,
    focusClassName,
    variant,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring', focusClassName)} autoFocus={autoFocus}>
      <button
        {...filterDOMProps(otherProps)}
        {...styleProps}
        {...buttonProps}
        ref={domRef}
        className={
          classNames(
            styles,
            'spectrum-ClearButton',
            {
              [`spectrum-ClearButton--${variant}`]: variant,
              'is-active': isPressed
            },
            styleProps.className
          )
        }>
        {children}
      </button>
    </FocusRing>
  );
}

let _ClearButton = React.forwardRef(ClearButton);
export {_ClearButton as ClearButton};
