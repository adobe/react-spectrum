/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, StyleRenderProps, useContextProps, useRenderProps} from './utils';
import {mergeProps, useFocusRing, useHover} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export interface GroupRenderProps {
  /**
   * Whether the group is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether an element within the group is focused, either via a mouse or keyboard.
   * @selector :focus-within
   */
  isFocusWithin: boolean,
  /**
   * Whether an element within the group is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean
}

export interface GroupProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'>, StyleRenderProps<GroupRenderProps> {}

export const GroupContext = createContext<ContextValue<GroupProps, HTMLDivElement>>({});

function Group(props: GroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, GroupContext);

  let {hoverProps, isHovered} = useHover({});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    within: true
  });

  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isFocusWithin: isFocused, isFocusVisible},
    defaultClassName: 'react-aria-Group'
  });

  return (
    <div
      {...mergeProps(props, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {props.children}
    </div>
  );
}

/**
 * An group represents a set of related UI controls.
 */
const _Group = forwardRef(Group);
export {_Group as Group};
