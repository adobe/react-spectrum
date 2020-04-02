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
import React, {ReactNode, useEffect, useLayoutEffect, useState} from 'react';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';

// TODO move to types package
import {DOMProps, DOMRef, Orientation, StyleProps} from '@react-types/shared';

interface ButtonGroupProps extends DOMProps, StyleProps {
  isDisabled?: boolean,
  // default: horizontal
  orientation?: Orientation,
  children: ReactNode
}

function ButtonGroup(props: ButtonGroupProps, ref: DOMRef<HTMLDivElement>) {
  let {scale} = useProvider(); 
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
  let [orientationState, setOrientation] = useState(orientation);

  // useEffect(() => {
  //   let buttonGroupChildren = Array.from(domRef.current.children);
  //   if (orientation === 'horizontal') {
  //     setOrientation('horizontal');
  //     return;
  //   }

  //   let childrenY = buttonGroupChildren.map(child => child.getBoundingClientRect().top);
  //   console.log('in resize', childrenY, orientationState);
  //   // If any button's top is different from the others, overflow is happening
  //   if (!childrenY.every(itemY => itemY === childrenY[0])) {
  //     console.log('setting orientation vertical 1');
  //     setOrientation('vertical');
  //   }
  // }, [scale, orientationState])

  // should this be useLayoutEffect
  useLayoutEffect(() => {
    let buttonGroupChildren = Array.from(domRef.current.children);
    let childrenF = buttonGroupChildren.map(child => child.getBoundingClientRect().top);
    console.log('in useeffect', childrenF);

    // If orientation of ButtonGroup is horizontal, stack buttons vertically if overflow occurs
    // Reset to horizontal orientation if it doesn't cause overflow anymore
    let onResize = () => {
      if (domRef.current && orientation === 'horizontal') {
        if (orientationState === 'vertical') {
          setOrientation('horizontal');
        }
      
        let childrenY = buttonGroupChildren.map(child => child.getBoundingClientRect().top);
        console.log('in resize', childrenY)
        // If any button's top is different from the others, overflow is happening
        if (!childrenY.every(itemY => itemY === childrenY[0])) {
          console.log('setting orientation vertical 2')
          setOrientation('vertical');
        }
      }
    }

    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [domRef, orientation, children, orientationState, scale])

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
            'spectrum-ButtonGroup--vertical': orientationState === 'vertical'
          },
          styleProps.className
        )  
      }>
      <SlotProvider
        slots={{
          button: {
            isDisabled,
            UNSAFE_className: classNames(styles, 'spectrum-Button')
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
