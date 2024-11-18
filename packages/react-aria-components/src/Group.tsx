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

import {AriaLabelingProps, DOMProps, forwardRefType} from '@react-types/shared';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {FieldErrorContext} from './FieldError';
import {GroupStateContext, useGroupState} from 'react-stately';
import {HoverProps, mergeProps, useFocusRing, useHover} from 'react-aria';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {TextContext} from './Text';
import {useGroup} from '@react-aria/group';

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
  isInvalid: boolean,
  /**
   * Whether the group is read-only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean
}

export interface GroupProps extends AriaLabelingProps, Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style' | 'role' | 'slot'>, DOMProps, HoverProps, RenderProps<GroupRenderProps>, SlotProps {
  /** Whether the group is disabled. */
  isDisabled?: boolean,
  /** Whether the group is invalid. */
  isInvalid?: boolean,
  /** Whether the group is read-only. */
  isReadOnly?: boolean,
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
  let {onHoverStart, onHoverChange, onHoverEnd, ...otherProps} = props;

  let state = useGroupState(props);
  let {isDisabled, isReadOnly, ...validation} = state;

  let [labelRef, label] = useSlot();
  let {labelProps, groupProps, descriptionProps, errorMessageProps} = useGroup({...props, label}, state);
  let {hoverProps, isHovered} = useHover({onHoverStart, onHoverChange, onHoverEnd, isDisabled});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing({
    within: true
  });

  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isFocusWithin: isFocused, isFocusVisible, isDisabled, isInvalid: validation.isInvalid, isReadOnly},
    defaultClassName: 'react-aria-Group'
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {isDisabled: _, isInvalid: __, isReadOnly: ___, ...domProps} = otherProps;

  return (
    <div
      {...mergeProps(groupProps, domProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot ?? undefined}
      data-focus-within={isFocused || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-invalid={validation.isInvalid || undefined}
      data-readonly={isReadOnly || undefined}>
      <Provider 
        values={[
          [GroupStateContext, state],
          [LabelContext, {...labelProps, ref: labelRef}],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }],
          [FieldErrorContext, validation]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A group represents a set of related UI controls, and supports interactive states for styling.
 */
const _Group = /*#__PURE__*/ (forwardRef as forwardRefType)(Group);
export {_Group as Group};
