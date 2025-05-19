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

import {
  Button,
  ButtonProps,
  ButtonRenderProps
} from 'react-aria-components';
import {controlSize} from './style-utils' with {type: 'macro'};
import CrossIcon from '../ui-icons/Cross';
import {FocusableRef} from '@react-types/shared';
import {focusRing, style} from '../style' with {type: 'macro'};
import {forwardRef} from 'react';
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';
interface ClearButtonStyleProps {
  /**
   * The size of the ClearButton.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** Whether the ClearButton should be displayed with a static color. */
  isStaticColor?: boolean
}

interface ClearButtonRenderProps extends ButtonRenderProps, ClearButtonStyleProps {}
interface ClearButtonProps extends ButtonProps, ClearButtonStyleProps {}

const focusRingStyles = focusRing();

const visibleClearButton = style<ClearButtonRenderProps>({
  ...focusRingStyles,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'full',
  width: controlSize(),
  flexShrink: 0,
  borderRadius: 'full',
  borderStyle: 'none',
  backgroundColor: 'transparent',
  boxSizing: 'border-box',
  padding: 0,
  outlineOffset: -4,
  outlineColor: {
    default: focusRingStyles.outlineColor,
    isStaticColor: 'white'
  },
  color: 'inherit',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export const ClearButton = forwardRef(function ClearButton(props: ClearButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let {size = 'M', isStaticColor = false, ...rest} = props;
  let domRef = useFocusableRef(ref);
  return (
    <Button
      {...rest}
      ref={domRef}
      style={pressScale(domRef)}
      className={renderProps => visibleClearButton({...renderProps, size, isStaticColor})}>
      <CrossIcon size={props.size} />
    </Button>
  );
});
