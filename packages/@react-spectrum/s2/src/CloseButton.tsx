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

import {baseColor, focusRing, style} from '../style' with {type: 'macro'};
import {Button, ButtonProps} from 'react-aria-components';
import CrossIcon from '../ui-icons/Cross';
import {FocusableRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';

interface CloseButtonProps extends Omit<ButtonProps, 'className' | 'style' | 'children'>, StyleProps {
  /**
   * The size of the CloseButton.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** The static color style to apply. Useful when the Button appears over a color background. */
  staticColor?: 'white' | 'black'
}

const hoverBackground = {
  default: 'gray-100',
  staticColor: {
    white: 'transparent-white-100',
    black: 'transparent-black-100'
  }
} as const;

const styles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: 'control',
  borderRadius: 'full',
  padding: 0,
  borderStyle: 'none',
  transition: 'default',
  backgroundColor: {
    default: 'transparent',
    isHovered: hoverBackground,
    isFocusVisible: hoverBackground,
    isPressed: hoverBackground
  },
  '--iconPrimary': {
    type: 'color',
    value: {
      default: 'neutral',
      isDisabled: 'disabled',
      staticColor: {
        white: {
          default: baseColor('transparent-white-800'),
          isDisabled: 'transparent-white-400'
        },
        black: {
          default: baseColor('transparent-black-800'),
          isDisabled: 'transparent-black-400'
        }
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    staticColor: {
      white: 'white',
      black: 'black'
    },
    forcedColors: 'Highlight'
  }
}, getAllowedOverrides());

function CloseButton(props: CloseButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let {UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useFocusableRef(ref);
  return (
    <Button
      {...props}
      ref={domRef}
      style={pressScale(domRef, UNSAFE_style)}
      className={renderProps => UNSAFE_className + styles(renderProps, props.styles)}>
      <CrossIcon size={({S: 'L', M: 'XL', L: 'XXL', XL: 'XXXL'} as const)[props.size || 'M']} />
    </Button>
  );
}

let _CloseButton = forwardRef(CloseButton);
export {_CloseButton as CloseButton};
