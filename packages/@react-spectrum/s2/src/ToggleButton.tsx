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

import {ActionButtonStyleProps, btnStyles} from './ActionButton';
import {centerBaseline} from './CenterBaseline';
import {ContextValue, Provider, ToggleButton as RACToggleButton, ToggleButtonProps as RACToggleButtonProps, useSlottedContext} from 'react-aria-components';
import {createContext, forwardRef, ReactNode} from 'react';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {fontRelative, style} from '../style' with {type: 'macro'};
import {IconContext} from './Icon';
import {pressScale} from './pressScale';
import {SkeletonContext} from './Skeleton';
import {StyleProps} from './style-utils';
import {Text, TextContext} from './Content';
import {ToggleButtonGroupContext} from './ToggleButtonGroup';
import {useFocusableRef} from '@react-spectrum/utils';
import {useFormProps} from './Form';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ToggleButtonProps extends Omit<RACToggleButtonProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps, ActionButtonStyleProps {
  /** The content to display in the button. */
  children?: ReactNode,
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean
}

export const ToggleButtonContext = createContext<ContextValue<ToggleButtonProps, FocusableRefValue<HTMLButtonElement>>>(null);

/**
 * ToggleButtons allow users to toggle a selection on or off, for example
 * switching between two states or modes.
 */
export const ToggleButton = forwardRef(function ToggleButton(props: ToggleButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ToggleButtonContext);
  props = useFormProps(props as any);
  let domRef = useFocusableRef(ref);
  let ctx = useSlottedContext(ToggleButtonGroupContext);
  let isInGroup = !!ctx;
  let {
    density = 'regular',
    isJustified,
    orientation = 'horizontal',
    staticColor = props.staticColor,
    isQuiet = props.isQuiet,
    isEmphasized = props.isEmphasized,
    size = props.size || 'M',
    isDisabled = props.isDisabled
  } = ctx || {};

  return (
    <RACToggleButton
      {...props}
      isDisabled={isDisabled}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + btnStyles({
        ...renderProps,
        staticColor,
        isStaticColor: !!staticColor,
        size,
        isQuiet,
        isEmphasized,
        isPending: false,
        density,
        isJustified,
        orientation,
        isInGroup
      }, props.styles)}>
      <Provider
        values={[
          [SkeletonContext, null],
          [TextContext, {styles: style({paddingY: '--labelPadding', order: 1, truncate: true})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </RACToggleButton>
  );
});
