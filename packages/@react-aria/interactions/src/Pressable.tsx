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

import {DOMAttributes} from '@react-types/shared';
import {mergeProps, useObjectRef} from '@react-aria/utils';
import {PressProps, usePress} from './usePress';
import React, {ForwardedRef, ReactElement} from 'react';

interface PressableProps extends PressProps {
  children: ReactElement<DOMAttributes, string>
}

export const Pressable = React.forwardRef(({children, ...props}: PressableProps, ref: ForwardedRef<HTMLElement>) => {
  ref = useObjectRef(ref);
  let {pressProps} = usePress({...props, ref});
  let child = React.Children.only(children);
  return React.cloneElement(
    child,
    // @ts-ignore
    {ref, ...mergeProps(child.props, pressProps)}
  );
});
