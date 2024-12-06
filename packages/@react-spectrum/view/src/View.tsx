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

import {ClearSlots, useDOMRef, useSlotProps, useStyleProps, viewStyleProps} from '@react-spectrum/utils';
import {ColorVersion, DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {forwardRef, ReactElement} from 'react';
import {ViewProps} from '@react-types/view';

/**
 * View is a general purpose container with no specific semantics that can be used for custom styling purposes.
 * It supports Spectrum style props to ensure consistency with other Spectrum components.
 */
export const View = forwardRef(function View<C extends ColorVersion>(props: ViewProps<C>, ref: DOMRef) {
  props = useSlotProps(props);
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
      <ClearSlots>
        {children}
      </ClearSlots>
    </ElementType>
  );
}) as <C extends ColorVersion = 5>(props: ViewProps<C> & {ref?: DOMRef}) => ReactElement;
