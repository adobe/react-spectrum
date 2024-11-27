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

import {ActionButtonGroupProps, actionGroupStyle} from './ActionButtonGroup';
import {ContextValue, ToggleButtonGroup as RACToggleButtonGroup, ToggleButtonGroupProps as RACToggleButtonGroupProps} from 'react-aria-components';
import {createContext, ForwardedRef, forwardRef} from 'react';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ToggleButtonGroupProps extends ActionButtonGroupProps, Omit<RACToggleButtonGroupProps, 'children' | 'style' | 'className'> {
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean
}

export const ToggleButtonGroupContext = createContext<ContextValue<ToggleButtonGroupProps, HTMLDivElement>>(null);

/**
 * A ToggleButtonGroup is a grouping of related ToggleButtons, with single or multiple selection.
 */
export const ToggleButtonGroup = forwardRef(function ToggleButtonGroup(props: ToggleButtonGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ToggleButtonGroupContext);
  let {
    density = 'regular',
    size = 'M',
    orientation = 'horizontal',
    isJustified,
    children,
    UNSAFE_className = '',
    UNSAFE_style,
    styles
  } = props;

  return (
    <RACToggleButtonGroup
      {...props}
      ref={ref}
      style={UNSAFE_style}
      className={UNSAFE_className + actionGroupStyle({size, density, orientation, isJustified}, styles)}>
      <ToggleButtonGroupContext.Provider value={props}>
        {children}
      </ToggleButtonGroupContext.Provider>
    </RACToggleButtonGroup>
  );
});
