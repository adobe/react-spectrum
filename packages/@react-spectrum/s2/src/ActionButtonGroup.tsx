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

import {AriaLabelingProps} from '@react-types/shared';
import {ContextValue, SlotProps, Toolbar} from 'react-aria-components';
import {createContext, ForwardedRef, forwardRef, ReactNode} from 'react';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ActionButtonGroupProps extends AriaLabelingProps, UnsafeStyles, SlotProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The children of the group. */
  children: ReactNode,
  /**
   * Size of the buttons.
   * @default "M"
   */
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  /**
   * Spacing between the buttons.
   * @default "regular"
   */
  density?: 'compact' | 'regular',
  /** Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean,
  /** Whether the buttons should divide the container width equally. */
  isJustified?: boolean,
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  staticColor?: 'white' | 'black' | 'auto',
  /**
   * The axis the group should align with.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical',
  /** Whether the group is disabled. */
  isDisabled?: boolean
}

export const actionGroupStyle = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      horizontal: 'row',
      vertical: 'column'
    }
  },
  gap: {
    density: {
      compact: 2,
      regular: {
        size: {
          XS: 4,
          S: 4,
          M: 8,
          L: 8,
          XL: 8
        }
      }
    }
  }
}, getAllowedOverrides({height: true}));


export const ActionButtonGroupContext = createContext<ContextValue<Partial<ActionButtonGroupProps>, HTMLDivElement>>(null);

/**
 * An ActionButtonGroup is a grouping of related ActionButtons.
 */
export const ActionButtonGroup = forwardRef(function ActionButtonGroup(props: ActionButtonGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ActionButtonGroupContext);
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
    <Toolbar
      {...props}
      ref={ref}
      style={UNSAFE_style}
      className={UNSAFE_className + actionGroupStyle({size, density, orientation, isJustified}, styles)}>
      <ActionButtonGroupContext.Provider value={props}>
        {children}
      </ActionButtonGroupContext.Provider>
    </Toolbar>
  );
});
