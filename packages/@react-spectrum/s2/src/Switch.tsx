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

import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {ContextValue} from 'react-aria-components/slots';
import {
  controlFont,
  controlSize,
  getAllowedOverrides,
  StyleProps
} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {
  Direction,
  FocusableRef,
  FocusableRefValue,
  GlobalDOMAttributes,
  HelpTextProps
} from '@react-types/shared';
import {FormContext, useFormProps} from './Form';
import {HelpText} from './Field';
import {pressScale} from './pressScale';
import {
  SwitchButton,
  SwitchField,
  SwitchFieldProps,
  SwitchRenderProps
} from 'react-aria-components/Switch';
import {useFocusableRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface SwitchStyleProps {
  /**
   * The size of the Switch.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * Whether the Switch should be displayed with an emphasized style.
   */
  isEmphasized?: boolean;
}

interface RenderProps extends SwitchRenderProps, SwitchStyleProps {}

export interface SwitchProps
  extends
    Omit<
      SwitchFieldProps,
      | 'className'
      | 'style'
      | 'render'
      | 'children'
      | 'onHover'
      | 'onHoverStart'
      | 'onHoverEnd'
      | 'onHoverChange'
      | keyof GlobalDOMAttributes
    >,
    HelpTextProps,
    StyleProps,
    SwitchStyleProps {
  children?: ReactNode;
}

export const SwitchContext =
  createContext<
    ContextValue<Partial<SwitchProps>, FocusableRefValue<HTMLInputElement, HTMLDivElement>>
  >(null);

const field = style(
  {
    display: 'grid',
    gridTemplateColumns: {
      default: ['max-content', '1fr'],
      isNoVisibleLabel: ['max-content']
    },
    columnGap: 'text-to-control',
    width: 'fit',
    font: controlFont(),
    '--field-height': {
      type: 'height',
      value: controlSize()
    },
    rowGap: 'calc(var(--field-height) - 1lh)',
    gridColumnStart: {
      isInForm: 'field'
    }
  },
  getAllowedOverrides()
);

const wrapper = style({
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  alignItems: 'baseline',
  transition: 'colors',
  color: {
    default: baseColor('neutral'),
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  disableTapHighlight: true
});

const track = style<RenderProps>({
  ...focusRing(),
  borderRadius: 'full',
  '--trackWidth': {
    type: 'width',
    value: fontRelative(26)
  },
  '--trackHeight': {
    type: 'height',
    value: controlSize('sm')
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
      default: baseColor('neutral'),
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
    default: baseColor('neutral'),
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'gray-25'
  },
  transition: 'default'
});

// Use an inline style to calculate the transform so we can combine it with the press scale.
const transformStyle = ({isSelected, direction}: SwitchRenderProps & {direction: Direction}) => {
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
  const placement =
    direction === 'ltr'
      ? // The selected state also translates the X position to the end of the track (minus the borders).
        'translateX(calc(var(--trackWidth) - 100% - 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)'
      : 'translateX(calc(100% - var(--trackWidth) + 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)';
  return {
    transform: isSelected
      ? placement
      : 'perspective(calc(var(--trackHeight) - 8px)) translateZ(-4px)'
  };
};

/**
 * Switches allow users to turn an individual option on or off.
 * They are usually used to activate or deactivate a specific setting.
 */
export const Switch = /*#__PURE__*/ forwardRef(function Switch(
  props: SwitchProps,
  ref: FocusableRef<HTMLInputElement, HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, SwitchContext);
  let {children, UNSAFE_className = '', UNSAFE_style} = props;
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let handleRef = useRef(null);
  let isInForm = !!useContext(FormContext);
  let {direction} = useLocale();
  props = useFormProps(props);
  return (
    <SwitchField
      {...props}
      ref={domRef}
      inputRef={inputRef}
      style={UNSAFE_style}
      className={renderProps =>
        UNSAFE_className +
        field(
          {...renderProps, isInForm, size: props.size || 'M', isNoVisibleLabel: !children},
          props.styles
        )
      }>
      {({isDisabled, isInvalid}) => (
        <>
          <SwitchButton
            className={renderProps => wrapper({...renderProps, isInForm, size: props.size || 'M'})}>
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
                      style={pressScale(handleRef, transformStyle)({...renderProps, direction})}
                      className={handle(renderProps)}
                    />
                  </div>
                </CenterBaseline>
                {children}
              </>
            )}
          </SwitchButton>
          <HelpText
            size={props.size || 'M'}
            styles={style({
              gridColumnStart: 1,
              paddingTop: 0
            })}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            description={props.description}
            showErrorIcon>
            {props.errorMessage}
          </HelpText>
        </>
      )}
    </SwitchField>
  );
});
