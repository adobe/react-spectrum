/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, createFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {Field, HelpText, Label} from '@react-spectrum/label';
import {mergeProps} from '@react-aria/utils';
import {PressEvents} from '@react-types/shared';
import React, {cloneElement, forwardRef, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactElement, Ref, RefObject, TextareaHTMLAttributes, useImperativeHandle, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';
import {Input, TextField as RACTextField, Text, Group} from 'react-aria-components';
import {tv} from 'tailwind-variants';

export const fieldStyles = tv({
  slots: {
    base: 'group inline-flex',
    label: 'flex gap-50',
    fieldWrapper: 'flex flex-col gap-[inherit]'
  },
  variants: {
    size: {
      S: {
        base: 'gap-65'
      },
      M: {
        base: 'gap-65'
      },
      L: {
        base: 'gap-115'
      },
      XL: {
        base: 'gap-130'
      }
    },
    labelPosition: {
      top: {
        base: 'flex-col w-field',
        fieldWrapper: 'w-full'
      },
      side: {
        base: 'flex-row items-baseline gap-static-100',
        fieldWrapper: 'flex-1 w-field'
      }
    },
    labelAlign: {
      start: {
        label: 'text-start justify-start'
      },
      end: {
        label: 'text-end justify-end'
      }
    }
  },
  defaultVariants: {
    labelPosition: 'top',
    labelAlign: 'start'
  }
}, {twMerge: false});

const fieldBorder = 'transition reset-border border-gray-300 hover:border-gray-400 focus-within:border-gray-900 invalid:border-base-negative disabled:border-disabled';

export const textfieldStyles = tv({
  extend: fieldStyles,
  slots: {
    field: 'group flex items-center rounded box-border overflow-hidden bg-gray-25 border-200 disabled:text-disabled focus-visible:ring ' + fieldBorder,
    input: 'flex-1 p-0 min-w-0 font-[inherit] text-base-neutral outline-none bg-transparent border-none',
    icon: '',
    invalidIcon: 'text-negative-visual shrink-0',
    validIcon: 'text-positive-visual shrink-0'
  },
  variants: {
    size: {
      S: {
        field: 'h-c-75',
        input: 'text-75 px-ett-75',
        icon: 'ps-ett-75',
        invalidIcon: 'pe-ett-75',
        validIcon: 'pe-ett-75'
      },
      M: {
        field: 'h-c-100',
        input: 'text-100 px-ett-100',
        icon: 'ps-ett-100',
        invalidIcon: 'pe-ett-100',
        validIcon: 'pe-ett-100'
      },
      L: {
        field: 'h-c-200 text-200',
        input: 'px-ett-200',
        icon: 'ps-ett-200',
        invalidIcon: 'pe-ett-200',
        validIcon: 'pe-ett-200'
      },
      XL: {
        field: 'h-c-300 text-300',
        input: 'px-ett-300',
        icon: 'ps-ett-300',
        invalidIcon: 'pe-ett-300',
        validIcon: 'pe-ett-300'
      }
    }
  }
}, {twMerge: false});

interface TextFieldBaseProps extends Omit<SpectrumTextFieldProps, 'onChange'>, PressEvents {
  wrapperChildren?: ReactElement | ReactElement[],
  inputClassName?: string,
  validationIconClassName?: string,
  multiLine?: boolean,
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>,
  inputProps: InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>,
  descriptionProps?: HTMLAttributes<HTMLElement>,
  errorMessageProps?: HTMLAttributes<HTMLElement>,
  inputRef?: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  loadingIndicator?: ReactElement,
  isLoading?: boolean,
  disableFocusRing?: boolean
}

function TextFieldBase(props: TextFieldBaseProps, ref: Ref<TextFieldRef>) {
  let {
    validationState,
    icon,
    isQuiet = false,
    isDisabled,
    multiLine,
    autoFocus,
    inputClassName,
    wrapperChildren,
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    inputRef: userInputRef,
    isLoading,
    loadingIndicator,
    validationIconClassName,
    disableFocusRing,
    size = 'M'
  } = props;
  let {hoverProps, isHovered} = useHover({isDisabled});
  let domRef = useRef<HTMLDivElement>(null);
  let defaultInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  let inputRef = userInputRef || defaultInputRef;

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    select() {
      if (inputRef.current) {
        inputRef.current.select();
      }
    },
    getInputElement() {
      return inputRef.current;
    }
  }));

  let ElementType: React.ElementType = multiLine ? 'textarea' : 'input';
  let isInvalid = validationState === 'invalid' && !isDisabled;

  let {base, fieldWrapper, field, input, label, icon: iconStyles, invalidIcon, validIcon} = textfieldStyles({
    size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign
  });

  if (icon) {
    // let UNSAFE_className = classNames(
    //   styles,
    //   icon.props && icon.props.UNSAFE_className,
    //   'spectrum-Textfield-icon'
    // );

    icon = cloneElement(icon, {
      UNSAFE_className: iconStyles(),
      size: 'S'
    });
  }

  let validation = isInvalid ? <AlertMedium UNSAFE_className={invalidIcon()} /> : <CheckmarkMedium UNSAFE_className={validIcon()} />;
  // let validation = cloneElement(validationIcon, {
  //   // UNSAFE_className: classNames(
  //   //   styles,
  //   //   'spectrum-Textfield-validationIcon',
  //   //   validationIconClassName
  //   // )
  //   UNSAFE_className: validationIcon()
  // });

  let {focusProps, isFocusVisible} = useFocusRing({
    isTextInput: true,
    autoFocus
  });

  // let textField = (
  //   <div
  //     className={
  //       classNames(
  //         styles,
  //         'spectrum-Textfield',
  //         {
  //           'spectrum-Textfield--invalid': isInvalid,
  //           'spectrum-Textfield--valid': validationState === 'valid' && !isDisabled,
  //           'spectrum-Textfield--loadable': loadingIndicator,
  //           'spectrum-Textfield--quiet': isQuiet,
  //           'spectrum-Textfield--multiline': multiLine,
  //           'focus-ring': !disableFocusRing && isFocusVisible
  //         }
  //       )
  //     }>
  //     <ElementType
  //       {...mergeProps(inputProps, hoverProps, focusProps)}
  //       ref={inputRef as any}
  //       rows={multiLine ? 1 : undefined}
  //       className={
  //         classNames(
  //           styles,
  //           'spectrum-Textfield-input',
  //           {
  //             'spectrum-Textfield-inputIcon': icon,
  //             'is-hovered': isHovered
  //           },
  //           inputClassName
  //         )
  //       } />
  //     {icon}
  //     {validationState && !isLoading && !isDisabled ? validation : null}
  //     {isLoading && loadingIndicator}
  //     {wrapperChildren}
  //   </div>
  // );

  // return (
  //   <Field
  //     {...props}
  //     labelProps={labelProps}
  //     descriptionProps={descriptionProps}
  //     errorMessageProps={errorMessageProps}
  //     wrapperClassName={
  //       classNames(
  //         styles,
  //         'spectrum-Textfield-wrapper',
  //         {
  //           'spectrum-Textfield-wrapper--quiet': isQuiet
  //         }
  //       )
  //     }
  //     showErrorIcon={false}
  //     ref={domRef}>
  //     {textField}
  //   </Field>
  // );

  let {styleProps} = useStyleProps(props);

  return (
    <RACTextField {...styleProps} ref={domRef} {...props} isInvalid={isInvalid} className={base()}>
      <div className={label()}>
        {props.label && <Label {...props}>{props.label}</Label>}
        {props.contextualHelp}
      </div>
      <div className={fieldWrapper()}>
        <Group role="presentation" className={field()}>
          {icon}
          <Input ref={inputRef} className={input()} />
          {isLoading && loadingIndicator}
          {validationState && !isLoading && !isDisabled ? validation : null}
        </Group>
        <HelpText {...props} isInvalid={isInvalid} />
      </div>
    </RACTextField>
  );
}

const _TextFieldBase = forwardRef(TextFieldBase);
export {_TextFieldBase as TextFieldBase};
