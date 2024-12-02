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
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps,
  ContextValue,
  SwitchRenderProps
} from 'react-aria-components';
import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {FormContext, useFormProps} from './Form';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface SwitchStyleProps {
  /**
   * The size of the Switch.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether the Switch should be displayed with an emphasized style.
   */
  isEmphasized?: boolean
}

interface RenderProps extends SwitchRenderProps, SwitchStyleProps {}

export interface SwitchProps extends Omit<AriaSwitchProps, 'className' | 'style' | 'children'  | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps, SwitchStyleProps {
  children?: ReactNode
}

export const SwitchContext = createContext<ContextValue<SwitchProps, FocusableRefValue<HTMLLabelElement>>>(null);

const wrapper = style({
  display: 'flex',
  columnGap: 'text-to-control',
  alignItems: 'baseline',
  width: 'fit',
  font: 'control',
  transition: 'colors',
  color: {
    default: 'neutral',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  gridColumnStart: {
    isInForm: 'field'
  },
  disableTapHighlight: true
}, getAllowedOverrides());

const track = style<RenderProps>({
  ...focusRing(),
  borderRadius: 'full',
  '--trackWidth': {
    type: 'width',
    value: fontRelative(26)
  },
  '--trackHeight': {
    type: 'height',
    value: 'control-sm'
  },
  width: '--trackWidth',
  height: '--trackHeight',
  boxSizing: 'border-box',
  borderWidth: 2,
  borderStyle: 'solid',
  transition: 'default',
  forcedColorAdjust: 'none',
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'transparent'
  },
  backgroundColor: {
    default: 'gray-25',
    isSelected: {
      default: 'neutral',
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight',
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
      }
    }
  }
});

const handle = style<RenderProps>({
  height: 'full',
  aspectRatio: 'square',
  borderRadius: 'full',
  backgroundColor: {
    default: 'neutral',
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'gray-25'
  },
  transition: 'default'
});

// Use an inline style to calculate the transform so we can combine it with the press scale.
const transformStyle = ({isSelected}: SwitchRenderProps) => ({
  // In the default state, the handle is 8px smaller than the track. When selected it grows to 6px smaller than the track.
  // Normally this could be calculated as a scale transform with (trackHeight - 8px) / trackHeight, however,
  // CSS does not allow division with units. To solve this we use a 3d perspective transform. Perspective is the
  // distance from the Z=0 plane to the viewer. Since we want to scale the handle by a fixed amount and we cannot divide
  // by a value with units, we can set the Z translation to a fixed amount and change the perspective in order to achieve
  // the desired effect. Given the following formula:
  //
  //   scale = perspective / (perspective - translateZ)
  //
  // and desired scale factors (accounting for the 2px border on each side of the track):
  //
  //   defaultScale = (trackHeight - 8px) / (trackHeight - 4px)
  //   selectedScale = (trackHeight - 6px) / (trackHeight - 4px)
  //
  // we can solve for the perspective needed in each case where translateZ is hard coded to -4px:
  //
  //    defaultPerspective = trackHeight - 8px
  //    selectedPerspective = 2 * (trackHeight - 6px)
  transform: isSelected
    // The selected state also translates the X position to the end of the track (minus the borders).
    ? 'translateX(calc(var(--trackWidth) - 100% - 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)'
    : 'perspective(calc(var(--trackHeight) - 8px)) translateZ(-4px)'
});

/**
 * Switches allow users to turn an individual option on or off.
 * They are usually used to activate or deactivate a specific setting.
 */
export const Switch = /*#__PURE__*/ forwardRef(function Switch(props: SwitchProps, ref: FocusableRef<HTMLLabelElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SwitchContext);
  let {children, UNSAFE_className = '', UNSAFE_style} = props;
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let handleRef = useRef(null);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  return (
    <AriaSwitch
      {...props}
      ref={domRef}
      inputRef={inputRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + wrapper({...renderProps, isInForm, size: props.size || 'M'}, props.styles)}>
      {renderProps => (
        <>
          <CenterBaseline>
            <div
              className={track({
                ...renderProps,
                size: props.size || 'M',
                isEmphasized: props.isEmphasized
              })}>
              <div
                ref={handleRef}
                style={pressScale(handleRef, transformStyle)(renderProps)}
                className={handle(renderProps)} />
            </div>
          </CenterBaseline>
          {children}
        </>
      )}
    </AriaSwitch>
  );
});
