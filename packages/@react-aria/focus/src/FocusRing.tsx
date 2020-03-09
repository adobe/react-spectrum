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
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement} from 'react';
import { useFocusRing } from './useFocusRing';

interface FocusRingProps {
  children?: ReactElement,
  focusClass?: string,
  focusRingClass?: string,
  within?: boolean,
  isTextInput?: boolean,
  autoFocus?: boolean
}

export function FocusRing(props: FocusRingProps) {
  let {children, focusClass, focusRingClass, within} = props;
  let {isFocused, isFocusVisible, focusProps} = useFocusRing(props);
  let child = React.Children.only(children);

  return React.cloneElement(child, mergeProps(child.props, {
    ...focusProps,
    className: classNames({
      [focusClass || '']: isFocused,
      [focusRingClass || '']: isFocusVisible
    })
  }));
}
