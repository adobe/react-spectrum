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
import {DOMProps, StyleProps} from '@react-types/shared';
import {HTMLElement} from 'react-dom';
import React, {ReactNode, RefObject} from 'react';

export interface HeadingProps extends DOMProps, StyleProps {
  children: ReactNode | string
}

export const Heading = React.forwardRef((props: HeadingProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    slot = 'heading',
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let slotProps = useSlotProvider(slot);

  // h level hardcoded for the moment and no specific className at the moment, this is barebones
  return (
    <h1 {...filterDOMProps(otherProps, {'aria-level': 1})} {...styleProps} className={classNames({}, styleProps.className, slotProps.className)} ref={ref}>
      {children}
    </h1>
  );
});
