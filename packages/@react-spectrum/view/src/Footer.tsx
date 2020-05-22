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
import {filterDOMProps, useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {FooterProps} from '@react-types/view';
import React, {forwardRef} from 'react';

function Footer(props: FooterProps, ref: DOMRef) {
  props = useSlotProps(props, 'footer');
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <footer {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      {children}
    </footer>
  );
}

const _Footer = forwardRef(Footer);
export {_Footer as Footer};
