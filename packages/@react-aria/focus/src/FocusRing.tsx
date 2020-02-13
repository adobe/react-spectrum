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
import React, {ReactElement, useState} from 'react';
import {useFocus, useFocusVisible, useFocusWithin} from '@react-aria/interactions';

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
  let [isFocused, setFocused] = useState(false);
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {isFocusVisible} = useFocusVisible(props);
  let {focusProps} = useFocus({
    isDisabled: within,
    onFocusChange: setFocused,
    onFocus: e => e.continuePropagation(),
    onBlur: e => e.continuePropagation()
  });
  let {focusWithinProps} = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: setFocusWithin,
    onFocusWithin: e => e.continuePropagation(),
    onBlurWithin: e => e.continuePropagation()
  });
  let child = React.Children.only(children);

  return React.cloneElement(child, mergeProps(child.props, {
    ...(within ? focusWithinProps : focusProps),
    className: classNames({
      [focusClass || '']: (within ? isFocusWithin : isFocused),
      [focusRingClass || '']: (within ? isFocusWithin : isFocused) && isFocusVisible
    })
  }));
}
