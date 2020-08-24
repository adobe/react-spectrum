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

import {classNames, SlotProvider, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps, useLayoutEffect} from '@react-aria/utils';
import React, {useCallback, useEffect, useState} from 'react';
import {SpectrumButtonGroupProps} from '@react-types/buttongroup';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useProvider, useProviderProps} from '@react-spectrum/provider';

function ButtonGroup(props: SpectrumButtonGroupProps, ref: DOMRef<HTMLDivElement>) {
  let {scale} = useProvider();
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
  let [hasOverflow, setHasOverflow] = useState(false);
  let [dirty, setDirty] = useState(false);

  let checkForOverflow = useCallback(() => {
    if (domRef.current && orientation === 'horizontal') {
      setHasOverflow(false);
      let buttonGroupChildren = Array.from(domRef.current.children) as HTMLElement[];
      let maxX = domRef.current.offsetWidth + 1; // + 1 to account for rounding errors
      // If any buttons have negative X positions (align="end") or extend beyond
      // the width of the button group (align="start"), then switch to vertical.
      if (buttonGroupChildren.some(child => child.offsetLeft < 0 || child.offsetLeft + child.offsetWidth > maxX)) {
        setHasOverflow(true);
      }
    }
  }, [domRef, orientation]);

  // On scale or children change, remove vertical orientation class via dirty = true and check for overflow
  useLayoutEffect(() => {
    if (dirty) {
      checkForOverflow();
      setDirty(false);
    }
  }, [dirty, checkForOverflow]);

  useEffect(() => {
    if (!dirty) {
      setDirty(true);
    }
  // Don't add dirty to dep array since it will cause infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, scale]);

  // Check for overflow on window resize
  useEffect(() => {
    if (orientation !== 'vertical') {
      // I think performance could be optimized here by creating a global, debounced hook for listening to resize
      // events rather than creating an event-listener per component.
      window.addEventListener('resize', checkForOverflow);
      checkForOverflow();
      return () => {
        window.removeEventListener('resize', checkForOverflow);
      };
    }
  }, [checkForOverflow, orientation]);

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
            'spectrum-ButtonGroup--vertical': orientation === 'vertical' || (!dirty && hasOverflow),
            'spectrum-ButtonGroup--alignEnd': align === 'end',
            'spectrum-ButtonGroup--alignCenter': align === 'center'
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
 * ButtonGroup handles overflow for a grouping of buttons whose actions are related to each other.
 */
let _ButtonGroup = React.forwardRef(ButtonGroup);
export {_ButtonGroup as ButtonGroup};
