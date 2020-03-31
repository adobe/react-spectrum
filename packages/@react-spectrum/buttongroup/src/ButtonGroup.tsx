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

import {classNames, filterDOMProps, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import React, {ReactNode} from 'react';
import {useProviderProps} from '@react-spectrum/provider';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';

import {DOMProps, DOMRef, Orientation, StyleProps} from '@react-types/shared';

interface ButtonGroupProps extends DOMProps, StyleProps {
  isDisabled?: boolean,
  // default: horizontal
  orientation?: Orientation,
  children: ReactNode
}

function ButtonGroup(props: ButtonGroupProps, ref: DOMRef<HTMLFormElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'buttonGroup');
  let {
    children,
    orientation = 'horizontal',
    isDisabled,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={styleProps.className}>
      {children}
    </div>
  );
}

/**
 * Buttons allow users to perform an action or to navigate to another page.
 * They have multiple styles for various needs, and are ideal for calling attention to
 * where a user needs to do something in order to move forward in a flow.
 */
let _ButtonGroup = React.forwardRef(ButtonGroup);
export {_ButtonGroup as ButtonGroup};
