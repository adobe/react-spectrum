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

import classNames from 'classnames';
import {DOMRef} from '@react-types/shared';
import {
  filterDOMProps,
  gridStyleProps,
  SlotProvider,
  useDOMRef,
  useStyleProps
} from '@react-spectrum/utils';
import {GridProps} from '@react-types/layout';
import React, {forwardRef} from 'react';

function Grid(props: GridProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    slots,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, gridStyleProps);
  styleProps.style.display = 'grid'; // inline-grid?
  let domRef = useDOMRef(ref);

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={domRef} className={classNames(styleProps.className, slots && slots.container && slots.container.UNSAFE_className)}>
      <SlotProvider slots={slots}>
        {children}
      </SlotProvider>
    </div>
  );
}

const _Grid = forwardRef(Grid);
export {_Grid as Grid};
