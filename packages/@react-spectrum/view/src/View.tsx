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
import {filterDOMProps, useStyleProps, viewStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {HTMLAttributes, JSXElementConstructor, ReactNode, RefObject} from 'react';
import {ViewStyleProps} from '@react-types/shared';

export interface ViewProps extends ViewStyleProps, Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> {
  elementType?: string | JSXElementConstructor<any>,
  children?: ReactNode
}

export const View = React.forwardRef((props: ViewProps, ref: RefObject<HTMLElement>) => {
  let {
    elementType: ElementType = 'div',
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props, viewStyleProps);

  return (
    <ElementType
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={ref}>
      {children}
    </ElementType>
  );
});
