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

import {baseColor, focusRing, space, style} from '../style' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {
  CheckboxButton,
  CheckboxField,
  CheckboxFieldProps,
  CheckboxRenderProps
} from 'react-aria-components/Checkbox';
import {CheckboxGroupStateContext} from 'react-aria-components/CheckboxGroup';
import CheckmarkIcon from '../ui-icons/Checkmark';
import {ContextValue, useSlottedContext} from 'react-aria-components/slots';
import {
  controlBorderRadius,
  controlFont,
  controlSize,
  getAllowedOverrides,
  StyleProps
} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import DashIcon from '../ui-icons/Dash';
import {
  FocusableRef,
  FocusableRefValue,
  GlobalDOMAttributes,
  HelpTextProps
} from '@react-types/shared';
import {FormContext, useFormProps} from './Form';
import {HelpText} from './Field';
import {pressScale} from './pressScale';
import {useFocusableRef} from './useDOMRef';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface CheckboxStyleProps {
  /**
   * The size of the Checkbox.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /** Whether the Checkbox should be displayed with an emphasized style. */
  isEmphasized?: boolean;
}

interface RenderProps extends CheckboxRenderProps, CheckboxStyleProps {}

export interface CheckboxProps
  extends
    Omit<
      CheckboxFieldProps,
      | 'className'
      | 'style'
      | 'render'
      | 'children'
      | 'onHover'
      | 'onHoverStart'
      | 'onHoverEnd'
      | 'onHoverChange'
      | 'onClick'
      | keyof GlobalDOMAttributes
    >,
    HelpTextProps,
    StyleProps,
    CheckboxStyleProps {
  /** The label for the element. */
  children?: ReactNode;
}

export const CheckboxContext =
  createContext<
    ContextValue<Partial<CheckboxProps>, FocusableRefValue<HTMLInputElement, HTMLDivElement>>
  >(null);

const field = style(
  {
    display: 'grid',
    gridTemplateColumns: {
      default: ['max-content', '1fr'],
      isNoVisibleLabel: ['max-content']
    },
    columnGap: 'text-to-control',
    alignContent: 'start',
    width: {
      default: 'fit',
      isInCheckboxGroup: 'auto'
    },
    font: controlFont(),
    '--field-height': {
      type: 'height',
      value: controlSize()
    },
    rowGap: {
      default: 'calc(var(--field-height) - 1lh)',
      isInCheckboxGroup: {
        size: {
          S: space(1),
          M: space(1),
          L: 2,
          XL: 2
        }
      }
    },
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
  position: 'relative',
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

export const box = style<RenderProps>({
  ...focusRing(),
  ...controlBorderRadius('sm'),
  size: controlSize('sm'),
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: space(2),
  boxSizing: 'border-box',
  borderStyle: 'solid',
  transition: 'default',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: 'gray-25',
    forcedColors: 'Background',
    isSelected: {
      default: baseColor('neutral'),
      isEmphasized: baseColor('accent-900'),
      forcedColors: 'Highlight',
      isInvalid: {
        default: baseColor('negative-900'),
        forcedColors: 'Mark'
      },
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
      }
    }
  },
  borderColor: {
    default: baseColor('gray-800'),
    forcedColors: 'ButtonBorder',
    isInvalid: {
      default: baseColor('negative'),
      forcedColors: 'Mark'
    },
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    isSelected: 'transparent'
  }
});

export const iconStyles = style({
  pointerEvents: 'none',
  '--iconPrimary': {
    type: 'fill',
    value: {
      default: 'gray-25',
      forcedColors: 'HighlightText'
    }
  }
});

const smallerSize = {
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;

/**
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 */
export const Checkbox = forwardRef(function Checkbox(
  {children, ...props}: CheckboxProps,
  ref: FocusableRef<HTMLInputElement, HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, CheckboxContext);
  let boxRef = useRef(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let isInForm = !!useContext(FormContext);
  props = useFormProps(props);
  let isInCheckboxGroup = !!useContext(CheckboxGroupStateContext);
  let ctx = useSlottedContext(CheckboxContext, props.slot);

  return (
    <CheckboxField
      {...props}
      ref={domRef}
      inputRef={inputRef}
      style={props.UNSAFE_style}
      className={
        (props.UNSAFE_className || '') +
        field(
          {size: props.size || 'M', isInCheckboxGroup, isNoVisibleLabel: !children},
          props.styles
        )
      }>
      {({isDisabled, isInvalid}) => (
        <>
          <CheckboxButton
            className={renderProps => wrapper({...renderProps, isInForm, size: props.size || 'M'})}>
            {renderProps => {
              let checkbox = (
                <div
                  ref={boxRef}
                  style={pressScale(boxRef)(renderProps)}
                  className={box({
                    ...renderProps,
                    isSelected: renderProps.isSelected || renderProps.isIndeterminate,
                    size: props.size || 'M',
                    isEmphasized: isInCheckboxGroup ? ctx?.isEmphasized : props.isEmphasized
                  })}>
                  {renderProps.isIndeterminate && (
                    <DashIcon size={smallerSize[props.size || 'M']} className={iconStyles} />
                  )}
                  {renderProps.isSelected && !renderProps.isIndeterminate && (
                    <CheckmarkIcon size={smallerSize[props.size || 'M']} className={iconStyles} />
                  )}
                </div>
              );

              // Only render checkbox without center baseline if no label.
              // This avoids expanding the checkbox height to the font's line height.
              if (!children) {
                return checkbox;
              }

              return (
                <>
                  <CenterBaseline>{checkbox}</CenterBaseline>
                  <span className={style({gridColumnStart: 2})}>{children}</span>
                </>
              );
            }}
          </CheckboxButton>
          <HelpText
            size={isInCheckboxGroup ? smallerSize[props.size || 'M'] : props.size || 'M'}
            styles={style({
              gridColumnStart: {
                default: 1,
                isInCheckboxGroup: 2
              },
              paddingTop: 0
            })({isInCheckboxGroup})}
            isDisabled={isDisabled}
            isInvalid={isInCheckboxGroup ? false : isInvalid}
            description={props.description}
            showErrorIcon>
            {props.errorMessage}
          </HelpText>
        </>
      )}
    </CheckboxField>
  );
});
