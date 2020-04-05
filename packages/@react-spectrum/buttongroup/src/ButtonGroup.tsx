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

import {classNames, filterDOMProps, SlotProvider, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React from 'react';
import {SpectrumButtonGroupProps} from '@react-types/buttongroup';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useHasOverflow} from './useHasOverflow';
import {useProviderProps} from '@react-spectrum/provider';

function ButtonGroup(props: SpectrumButtonGroupProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'buttonGroup');

  let {
    children,
    orientation = 'horizontal',
    isDisabled,
    align = 'start',
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);
  let hasOverflow = useHasOverflow(domRef, {skip: orientation === 'vertical'});

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-ButtonGroup',
          {
            'spectrum-ButtonGroup--vertical': orientation === 'vertical' || hasOverflow,
            'spectrum-ButtonGroup--alignEnd': align === 'end'
          },
          styleProps.className
        )
      }>
      <SlotProvider
        slots={{
          button: {
            isDisabled,
            UNSAFE_className: classNames(styles, 'spectrum-ButtonGroup-Button')
          }
        }}>
        {children}
      </SlotProvider>
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
