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
import {filterDOMProps, useDOMRef, useStyleProps, viewStyleProps} from '@react-spectrum/utils';
import React, {forwardRef} from 'react';
import {ViewProps} from '@react-types/view';

function View(props: ViewProps, ref: DOMRef) {
  let {
    elementType: ElementType = 'div',
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props, viewStyleProps);
  let domRef = useDOMRef(ref);

  return (
    <ElementType
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={domRef}>
      {children}
    </ElementType>
  );
}

const _View = forwardRef(View);
export {_View as View};

