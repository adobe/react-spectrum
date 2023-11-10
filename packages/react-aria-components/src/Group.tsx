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

import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {ContextValue, forwardRefType, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {HoverProps, mergeProps, useFocusRing, useHover} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export interface GroupRenderProps {
  /**
   * Whether the group is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether an element within the group is focused, either via a mouse or keyboard.
   * @selector [data-focus-within]
   */
  isFocusWithin: boolean,
  /**
   * Whether an element within the group is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the group is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the group is invalid.
   * @selector [data-invalid]
   */
  isInvalid: boolean
}

export interface GroupProps extends AriaLabelingProps, Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style' | 'role' | 'slot'>, DOMProps, HoverProps, RenderProps<GroupRenderProps>, SlotProps {
  /** Whether the group is disabled. */
  isDisabled?: boolean,
  /** Whether the group is invalid. */
  isInvalid?: boolean,
  /**
   * An accessibility role for the group. By default, this is set to `'group'`.
   * Use `'region'` when the contents of the group is important enough to be
   * included in the page table of contents. Use `'presentation'` if the group
   * is visual only and does not represent a semantic grouping of controls.
   * @default 'group'
   */
  role?: 'group' | 'region' | 'presentation'
}

export const GroupContext = createContext<ContextValue<GroupProps, HTMLDivElement>>({});

function Group(props: GroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, GroupContext);
  let {isDisabled, isInvalid, onHoverStart, onHoverChange, onHoverEnd, ...otherProps} = props;

  let {hoverProps, isHovered} = useHover({onHoverStart, onHoverChange, onHoverEnd, isDisabled});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    within: true
  });

  isDisabled ??= !!props['aria-disabled'] && props['aria-disabled'] !== 'false';
  isInvalid ??= !!props['aria-invalid'] && props['aria-invalid'] !== 'false';
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isFocusWithin: isFocused, isFocusVisible, isDisabled, isInvalid},
    defaultClassName: 'react-aria-Group'
  });

  return (
    <div
      {...mergeProps(otherProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      role={props.role ?? 'group'}
      slot={props.slot ?? undefined}
      data-focus-within={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}>
      {renderProps.children}
    </div>
  );
}

/**
 * A group represents a set of related UI controls, and supports interactive states for styling.
 */
const _Group = /*#__PURE__*/ (forwardRef as forwardRefType)(Group);
export {_Group as Group};
