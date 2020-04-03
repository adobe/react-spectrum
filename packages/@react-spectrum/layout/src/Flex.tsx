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

import {DOMRef} from '@react-types/shared';
import {filterDOMProps, flexStyleProps, SlotProvider, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {FlexProps} from '@react-types/layout';
import React, {forwardRef} from 'react';

function Flex(props: FlexProps, ref: DOMRef<HTMLDivElement>) {
  props = useSlotProps(props);
  let {
    children,
    slots,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, flexStyleProps);
  styleProps.style.display = 'flex'; // inline-flex?
  let domRef = useDOMRef(ref);

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      <SlotProvider slots={slots}>
        {children}
      </SlotProvider>
    </div>
  );
}

const _Flex = forwardRef(Flex);
export {_Flex as Flex};
