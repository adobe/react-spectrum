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
import {Button, ButtonProps, ContextValue} from 'react-aria-components';
import {createContext, forwardRef} from 'react';
import CrossIcon from '../ui-icons/Cross';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {getAllowedOverrides, staticColor, StyleProps} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface CloseButtonProps extends Pick<ButtonProps, 'isDisabled' | 'onPress'>, StyleProps {
  /**
   * The size of the CloseButton.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** The static color style to apply. Useful when the Button appears over a color background. */
  staticColor?: 'white' | 'black' | 'auto'
}

const hoverBackground = {
  default: 'gray-200',
  isStaticColor: 'transparent-overlay-200'
} as const;

const styles = style({
  ...focusRing(),
  ...staticColor(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: 'control',
  flexShrink: 0,
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
      isStaticColor: {
        default: baseColor('transparent-overlay-800'),
        isDisabled: 'transparent-overlay-400'
      },
      forcedColors: {
        default: 'ButtonText',
        isDisabled: 'GrayText'
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    isStaticColor: 'transparent-overlay-1000',
    forcedColors: 'Highlight'
  }
}, getAllowedOverrides());

export const CloseButtonContext = createContext<ContextValue<CloseButtonProps, FocusableRefValue<HTMLButtonElement>>>(null);

/**
 * A CloseButton allows a user to dismiss a dialog.
 */
export const CloseButton = forwardRef(function CloseButton(props: CloseButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, CloseButtonContext);
  let {UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useFocusableRef(ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  return (
    <Button
      {...props}
      ref={domRef}
      slot="close"
      aria-label={props['aria-label'] || stringFormatter.format('dialog.dismiss')}
      style={pressScale(domRef, UNSAFE_style)}
      className={renderProps => UNSAFE_className + styles({...renderProps, staticColor: props.staticColor, isStaticColor: !!props.staticColor}, props.styles)}>
      <CrossIcon size={({S: 'L', M: 'XL', L: 'XXL', XL: 'XXXL'} as const)[props.size || 'M']} />
    </Button>
  );
});
