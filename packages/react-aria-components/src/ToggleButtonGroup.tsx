/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AriaToggleButtonGroupProps, useToggleButtonGroup} from 'react-aria';
import {ContextValue, RenderProps, SlotProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {SharedElementTransition} from './SharedElementTransition';
import {ToggleGroupState, useToggleGroupState} from 'react-stately';

export interface ToggleButtonGroupRenderProps {
  /**
   * Whether the toggle button group is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the toggle button group.
   */
  state: ToggleGroupState
}

export interface ToggleButtonGroupProps extends AriaToggleButtonGroupProps, RenderProps<ToggleButtonGroupRenderProps>, SlotProps, GlobalDOMAttributes<HTMLDivElement> {}

export const ToggleButtonGroupContext = createContext<ContextValue<ToggleButtonGroupProps, HTMLDivElement>>({});
export const ToggleGroupStateContext = createContext<ToggleGroupState | null>(null);

/**
 * A toggle button group allows a user to toggle multiple options, with single or multiple selection.
 */
export const ToggleButtonGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(function ToggleButtonGroup(props: ToggleButtonGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ToggleButtonGroupContext);
  let state = useToggleGroupState(props);
  let {groupProps} = useToggleButtonGroup(props, state, ref);

  let renderProps = useRenderProps({
    ...props,
    values: {
      isDisabled: state.isDisabled,
      state
    },
    defaultClassName: 'react-aria-ToggleButtonGroup'
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(DOMProps, renderProps, groupProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-orientation={props.orientation || 'horizontal'}
      data-disabled={props.isDisabled || undefined}>
      <ToggleGroupStateContext.Provider value={state}>
        <SharedElementTransition>
          {renderProps.children}
        </SharedElementTransition>
      </ToggleGroupStateContext.Provider>
    </div>
  );
});
