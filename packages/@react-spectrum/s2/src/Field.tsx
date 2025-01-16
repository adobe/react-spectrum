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

import AlertIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {Alignment, DOMRef, NecessityIndicator} from '@react-types/shared';
import AsteriskIcon from '../ui-icons/Asterisk';
import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {CenterBaseline, centerBaseline, centerBaselineBefore} from './CenterBaseline';
import {composeRenderProps, FieldError, FieldErrorProps, Group, GroupProps, Label, LabelProps, Provider, Input as RACInput, InputProps as RACInputProps, Text} from 'react-aria-components';
import {ContextualHelpContext} from './ContextualHelp';
import {fieldInput, fieldLabel, StyleProps, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {ForwardedRef, forwardRef, ReactNode} from 'react';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeStyles} from '../style/runtime';
import {StyleString} from '../style/types';
import {useDOMRef} from '@react-spectrum/utils';
import {useId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

interface FieldLabelProps extends Omit<LabelProps, 'className' | 'style' | 'children'>, StyleProps {
  isDisabled?: boolean,
  isRequired?: boolean,
  size?: 'S' | 'M' | 'L' | 'XL',
  necessityIndicator?: NecessityIndicator,
  labelAlign?: Alignment,
  labelPosition?: 'top' | 'side',
  includeNecessityIndicatorInAccessibilityName?: boolean,
  staticColor?: 'white' | 'black' | 'auto',
  contextualHelp?: ReactNode,
  isQuiet?: boolean,
  children?: ReactNode
}

export const FieldLabel = forwardRef(function FieldLabel(props: FieldLabelProps, ref: DOMRef<HTMLLabelElement>) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let {
    isDisabled,
    isRequired,
    size = 'M',
    necessityIndicator = 'icon',
    includeNecessityIndicatorInAccessibilityName = false,
    labelAlign,
    labelPosition,
    staticColor,
    contextualHelp,
    isQuiet,
    UNSAFE_style,
    UNSAFE_className = '',
    ...labelProps
  } = props;

  let domRef = useDOMRef(ref);
  let contextualHelpId = useId();
  let fallbackLabelPropsId = useId();
  if (contextualHelp && !labelProps.id) {
    labelProps.id = fallbackLabelPropsId;
  }

  if (!props.children) {
    return null;
  }

  return (
    <div
      className={style({
        gridArea: 'label',
        display: 'inline',
        textAlign: {
          labelAlign: {
            start: 'start',
            end: 'end'
          }
        },
        paddingBottom: {
          labelPosition: {
            top: '--field-gap'
          }
        },
        contain: {
          labelPosition: {
            top: 'inline-size'
          },
          isQuiet: 'none'
        }
      })({labelAlign, labelPosition, isQuiet})}>
      <Label
        {...labelProps}
        ref={domRef}
        style={UNSAFE_style}
        className={UNSAFE_className + mergeStyles(style(fieldLabel())({labelPosition, isDisabled, size, isStaticColor: !!staticColor}), props.styles)}>
        {props.children}
        {(isRequired || necessityIndicator === 'label') && (
          <span className={style({whiteSpace: 'nowrap'})}>
            &nbsp;
            {necessityIndicator === 'icon' &&
              <AsteriskIcon
                size={size === 'S' ? 'M' : size}
                className={style({
                  '--iconPrimary': {
                    type: 'fill',
                    value: 'currentColor'
                  }
                })}
                aria-label={includeNecessityIndicatorInAccessibilityName ? stringFormatter.format('label.(required)') : undefined} />
            }
            {necessityIndicator === 'label' &&
              /* The necessity label is hidden to screen readers if the field is required because
              * aria-required is set on the field in that case. That will already be announced,
              * so no need to duplicate it here. If optional, we do want it to be announced here.
              */
              <span aria-hidden={!includeNecessityIndicatorInAccessibilityName ? isRequired : undefined}>
                {isRequired ? stringFormatter.format('label.(required)') : stringFormatter.format('label.(optional)')}
              </span>
            }
          </span>
        )}
      </Label>
      {contextualHelp && (
        <span className={style({whiteSpace: 'nowrap'})}>
          &nbsp;
          <CenterBaseline
            styles={style({
              display: 'inline-flex',
              height: 0
            })}>
            <ContextualHelpContext.Provider
              value={{
                id: contextualHelpId,
                'aria-labelledby': labelProps?.id ? `${labelProps.id} ${contextualHelpId}` : undefined,
                size: (size === 'L' || size === 'XL') ? 'S' : 'XS'
              }}>
              {contextualHelp}
            </ContextualHelpContext.Provider>
          </CenterBaseline>
        </span>
      )}
    </div>
  );
});

interface FieldGroupProps extends Omit<GroupProps, 'className' | 'style' | 'children'>, UnsafeStyles {
  size?: 'S' | 'M' | 'L' | 'XL',
  children?: ReactNode,
  styles?: StyleString
}

const fieldGroupStyles = style({
  ...focusRing(),
  ...fieldInput(),
  display: 'flex',
  alignItems: 'center',
  height: 'control',
  boxSizing: 'border-box',
  paddingX: 'edge-to-text',
  font: 'control',
  borderRadius: 'control',
  borderWidth: 2,
  borderStyle: 'solid',
  transition: 'default',
  borderColor: {
    default: baseColor('gray-300'),
    isInvalid: 'negative',
    isFocusWithin: {
      default: 'gray-900',
      isInvalid: 'negative-1000',
      forcedColors: 'Highlight'
    },
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  backgroundColor: 'gray-25',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  cursor: {
    default: 'text',
    isDisabled: 'default'
  }
});

export const FieldGroup = forwardRef(function FieldGroup(props: FieldGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <Group
      ref={ref}
      {...props}
      onPointerDown={(e) => {
        // Forward focus to input element when clicking on a non-interactive child (e.g. icon or padding)
        if (e.pointerType === 'mouse' && !(e.target as Element).closest('button,input,textarea')) {
          e.preventDefault();
          e.currentTarget.querySelector('input')?.focus();
        }
      }}
      onPointerUp={e => {
        if (e.pointerType !== 'mouse' && !(e.target as Element).closest('button,input,textarea')) {
          e.preventDefault();
          e.currentTarget.querySelector('input')?.focus();
        }
      }}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + ' ' + centerBaselineBefore + mergeStyles(
        fieldGroupStyles({...renderProps, size: props.size || 'M'}),
        props.styles
      )} />
  );
});

export interface InputProps extends Omit<RACInputProps, 'className' | 'style'>, StyleProps {}

export const Input = forwardRef(function Input(props: InputProps, ref: ForwardedRef<HTMLInputElement>) {
  let {UNSAFE_className = '', UNSAFE_style, styles, ...otherProps} = props;
  return (
    <RACInput
      {...otherProps}
      ref={ref}
      style={UNSAFE_style}
      className={UNSAFE_className + mergeStyles(style({
        padding: 0,
        backgroundColor: 'transparent',
        color: '[inherit]',
        fontFamily: '[inherit]',
        fontSize: '[inherit]',
        fontWeight: '[inherit]',
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,
        width: 'full',
        outlineStyle: 'none',
        borderStyle: 'none',
        truncate: true
      }), styles)} />
  );
});

interface HelpTextProps extends FieldErrorProps {
  size?: 'S' | 'M' | 'L' | 'XL',
  isDisabled?: boolean,
  isInvalid?: boolean, // TODO: export FieldErrorContext from RAC to get this.
  description?: ReactNode,
  showErrorIcon?: boolean
}

const helpTextStyles = style({
  gridArea: 'helptext',
  display: 'flex',
  alignItems: 'baseline',
  gap: 'text-to-visual',
  font: 'control',
  color: {
    default: 'neutral-subdued',
    isInvalid: 'negative',
    isDisabled: 'disabled'
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  contain: 'inline-size',
  paddingTop: '--field-gap',
  cursor: {
    default: 'text',
    isDisabled: 'default'
  }
});

export function HelpText(props: HelpTextProps & {descriptionRef?: DOMRef<HTMLDivElement>, errorRef?: DOMRef<HTMLDivElement>}) {
  let domDescriptionRef = useDOMRef(props.descriptionRef || null);
  let domErrorRef = useDOMRef(props.errorRef || null);

  if (!props.isInvalid && props.description) {
    return (
      <Text
        slot="description"
        ref={domDescriptionRef}
        className={helpTextStyles({size: props.size || 'M', isDisabled: props.isDisabled})}>
        {props.description}
      </Text>
    );
  }

  return (
    <FieldError
      {...props}
      ref={domErrorRef}
      className={renderProps => helpTextStyles({...renderProps, size: props.size || 'M', isDisabled: props.isDisabled})}>
      {composeRenderProps(props.children, (children, {validationErrors}) => (<>
        {props.showErrorIcon &&
          <CenterBaseline>
            <AlertIcon />
          </CenterBaseline>
        }
        <span>{children || validationErrors.join(' ')}</span>
      </>))}
    </FieldError>
  );
}

export function FieldErrorIcon(props: {isDisabled?: boolean}) {
  return (
    <Provider
      values={[
        [IconContext, {
          render: centerBaseline({
            slot: 'icon',
            styles: style({
              order: 0,
              flexShrink: 0,
              '--iconPrimary': {
                type: 'fill',
                value: {
                  default: 'negative',
                  forcedColors: 'ButtonText'
                }
              }
            })}),
          styles: style({
            size: fontRelative(20),
            marginStart: 'text-to-visual',
            marginEnd: fontRelative(-2),
            flexShrink: 0
          })
        }]
      ]}>
      {!props.isDisabled && <AlertIcon />}
    </Provider>
  );
}
