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

import {ClearSlots} from '@react-spectrum/utils';
import {DOMProps, ViewStyleProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactNode, RefObject} from 'react';

export interface ContentProps extends DOMProps, ViewStyleProps {
  children: ReactNode
}

export const Content = React.forwardRef((props: ContentProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps({slot: 'content', ...otherProps});

  return (
    <section {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      <ClearSlots>
        {children}
      </ClearSlots>
    </section>
  );
});
