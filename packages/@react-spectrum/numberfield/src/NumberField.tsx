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

import {AriaButtonProps} from '@react-types/button';
import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {Field, HelpText, Label} from '@react-spectrum/label';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import {NumberFieldState, useNumberFieldState} from '@react-stately/numberfield';
import React, {HTMLAttributes, InputHTMLAttributes, RefObject, useRef} from 'react';
import {SpectrumNumberFieldProps} from '@react-types/numberfield';
import {StepButton} from './StepButton';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useNumberField} from '@react-aria/numberfield';
import {useProvider, useProviderProps} from '@react-spectrum/provider';
import { textfieldStyles } from '@react-spectrum/textfield/src/TextFieldBase';
import {tv} from 'tailwind-variants';
import {Group, Input, NumberField as RACNumberField, Button} from 'react-aria-components';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import Add from '@spectrum-icons/workflow/Add';
import Remove from '@spectrum-icons/workflow/Remove';
import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';

const fieldBorder = 'transition reset-border border-gray-300 group-hover:border-gray-400 group-focus-within:border-gray-900 group-invalid:group-border-base-negative group-disabled:border-disabled';

function NumberField(props: SpectrumNumberFieldProps, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  let provider = useProvider();
  let {
    isQuiet,
    isReadOnly,
    isDisabled,
    hideStepper
  } = props;

  let {styleProps} = useStyleProps(props);

  // let {locale} = useLocale();
  // let state = useNumberFieldState({...props, locale});
  let inputRef = useRef<HTMLInputElement>();
  let domRef = useFocusableRef<HTMLElement>(ref, inputRef);
  // let {
  //   groupProps,
  //   labelProps,
  //   inputProps,
  //   incrementButtonProps,
  //   decrementButtonProps,
  //   descriptionProps,
  //   errorMessageProps
  // } = useNumberField(props, state, inputRef);
  let isMobile = provider.scale === 'large';
  // let showStepper = !hideStepper;

  // let {isHovered, hoverProps} = useHover({isDisabled});

  // let className =
  //   classNames(
  //     stepperStyle,
  //     'spectrum-Stepper',
  //     {
  //       'spectrum-Stepper--isQuiet': isQuiet,
  //       'is-disabled': isDisabled,
  //       'spectrum-Stepper--readonly': isReadOnly,
  //       'is-invalid': props.validationState === 'invalid' && !isDisabled,
  //       'spectrum-Stepper--showStepper': showStepper,
  //       'spectrum-Stepper--isMobile': isMobile,
  //       'is-hovered': isHovered,
  //       // because FocusRing won't pass along the className from Field, we have to handle that ourselves
  //       [style.className]: !props.label && style.className
  //     }
  //   );

  // return (
  //   <Field
  //     {...props as Omit<SpectrumNumberFieldProps, 'onChange'>}
  //     descriptionProps={descriptionProps}
  //     errorMessageProps={errorMessageProps}
  //     labelProps={labelProps}
  //     ref={domRef}
  //     wrapperClassName={classNames(
  //       stepperStyle,
  //       'spectrum-Stepper-container',
  //       {
  //         'spectrum-Stepper-container--isMobile': isMobile
  //       }
  //     )}>
  //     <NumberFieldInput
  //       {...props}
  //       groupProps={mergeProps(groupProps, hoverProps)}
  //       inputProps={inputProps}
  //       inputRef={inputRef}
  //       incrementProps={incrementButtonProps}
  //       decrementProps={decrementButtonProps}
  //       className={className}
  //       style={style}
  //       state={state} />
  //   </Field>
  // );

  let {base, fieldWrapper, field, input, label, invalidIcon, validIcon} = textfieldStyles({
    size: 'M',
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign
  });

  let isInvalid = props.validationState === 'invalid';
  let validation = isInvalid ? <AlertMedium UNSAFE_className={invalidIcon()} /> : <CheckmarkMedium UNSAFE_className={validIcon()} />;

  return (
    <RACNumberField {...styleProps} ref={domRef} {...props} isInvalid={isInvalid} className={base()}>
      <div className={label()}>
        {props.label && <Label {...props}>{props.label}</Label>}
        {props.contextualHelp}
      </div>
      <div className={fieldWrapper()}>
        <Group className={field()}>
          {isMobile && !hideStepper && <Button slot="decrement" className={`h-full aspect-square p-0 flex items-center justify-center bg-base-gray-75 text-base-neutral disabled:text-disabled outline-none border-r-200 ${fieldBorder}`}><Remove size="S" /></Button>}
          <Input ref={inputRef} className={input()} />
          {props.validationState && !isDisabled ? validation : null}
          {!isMobile && !hideStepper && <Stepper />}
          {isMobile && !hideStepper && <Button slot="increment" className={`h-full aspect-square p-0 flex items-center justify-center bg-base-gray-75 text-base-neutral disabled:text-disabled outline-none border-l-200 ${fieldBorder}`}><Add size="S" /></Button>}
        </Group>
        <HelpText {...props} isInvalid={isInvalid} />
      </div>
    </RACNumberField>
  )
}

function Stepper() {
  return (
    <div className={`flex flex-col w-[24px] h-full box-border border-s-200 ${fieldBorder}`}>
      <Button slot="increment" className="flex-1 p-0 flex items-center justify-center transition bg-base-gray-75 text-base-neutral disabled:bg-disabled disabled:text-disabled border-none outline-none">
        <ChevronUpSmall />
      </Button>
      <div className={`border-b-200 ${fieldBorder}`} />
      <Button slot="decrement" className="flex-1 p-0 flex items-center justify-center transition bg-base-gray-75 text-base-neutral disabled:bg-disabled disabled:text-disabled border-none outline-none">
        <ChevronDownSmall />
      </Button>
    </div>
  );
}

interface NumberFieldInputProps extends SpectrumNumberFieldProps {
  groupProps: HTMLAttributes<HTMLDivElement>,
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  incrementProps: AriaButtonProps,
  decrementProps: AriaButtonProps,
  className?: string,
  style?: React.CSSProperties,
  state: NumberFieldState
}

const NumberFieldInput = React.forwardRef(function NumberFieldInput(props: NumberFieldInputProps, ref: RefObject<HTMLElement>) {
  let {
    groupProps,
    inputProps,
    inputRef,
    incrementProps,
    decrementProps,
    className,
    style,
    autoFocus,
    isQuiet,
    isDisabled,
    hideStepper,
    validationState,
    name,
    state
  } = props;
  let showStepper = !hideStepper;

  return (
    <FocusRing
      within
      isTextInput
      focusClass={classNames(stepperStyle, 'is-focused')}
      focusRingClass={classNames(stepperStyle, 'focus-ring')}
      autoFocus={autoFocus}>
      <div
        {...groupProps}
        ref={ref as RefObject<HTMLDivElement>}
        style={style}
        className={className}>
        <TextFieldBase
          UNSAFE_className={
            classNames(
              stepperStyle,
              'spectrum-Stepper-field'
            )
          }
          inputClassName={
            classNames(
              stepperStyle,
              'spectrum-Stepper-input'
            )
          }
          validationIconClassName={
            classNames(
              stepperStyle,
              'spectrum-Stepper-icon'
            )
          }
          isQuiet={isQuiet}
          inputRef={inputRef}
          validationState={validationState}
          inputProps={inputProps}
          isDisabled={isDisabled}
          disableFocusRing />
        {showStepper &&
        <>
          <StepButton direction="up" isQuiet={isQuiet} {...incrementProps} />
          <StepButton direction="down" isQuiet={isQuiet} {...decrementProps} />
        </>
        }
        {name && <input type="hidden" name={name} value={isNaN(state.numberValue) ? '' : state.numberValue} />}
      </div>
    </FocusRing>
  );
});

/**
 * NumberFields allow users to enter a number, and increment or decrement the value using stepper buttons.
 */
let _NumberField = React.forwardRef(NumberField);
export {_NumberField as NumberField};
