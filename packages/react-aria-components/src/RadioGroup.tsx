/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaRadioGroupProps, AriaRadioProps, Orientation, useFocusRing, useHover, usePress, useRadio, useRadioGroup, VisuallyHidden} from 'react-aria';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps, mergeProps, useObjectRef} from '@react-aria/utils';
import {LabelContext} from './Label';
import {RadioGroupState, useRadioGroupState, ValidationState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, useState} from 'react';
import {TextContext} from './Text';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children' | 'label' | 'description' | 'errorMessage'>, RenderProps<RadioGroupRenderProps>, SlotProps {}
export interface RadioProps extends Omit<AriaRadioProps, 'children'>, RenderProps<RadioRenderProps> {}

export interface RadioGroupRenderProps {
  /**
   * The orientation of the radio group.
   * @selector [aria-orientation="horizontal | vertical"]
   */
  orientation: Orientation,
  /**
   * Whether the radio group is disabled.
   * @selector [aria-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the radio group is read only.
   * @selector [aria-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the radio group is required.
   * @selector [aria-required]
   */
  isRequired: boolean,
  /**
   * The validation state of the radio group.
   * @selector [aria-invalid]
   */
  validationState: ValidationState | null
}

export interface RadioRenderProps {
  /**
   * Whether the radio is selected.
   * @selector [data-selected]
   */
   isSelected: boolean,
   /**
    * Whether the radio is currently hovered with a mouse.
    * @selector [data-hovered]
    */
   isHovered: boolean,
   /**
    * Whether the radio is currently in a pressed state.
    * @selector [data-pressed]
    */
   isPressed: boolean,
   /**
    * Whether the radio is focused, either via a mouse or keyboard.
    * @selector [data-focused]
    */
   isFocused: boolean,
   /**
    * Whether the radio is keyboard focused.
    * @selector [data-focus-visible]
    */
   isFocusVisible: boolean,
   /**
    * Whether the radio is disabled.
    * @selector [data-disabled]
    */
   isDisabled: boolean,
   /**
    * Whether the radio is read only.
    * @selector [data-readonly]
    */
   isReadOnly: boolean,
   /**
    * Whether the radio is valid or invalid.
    * @selector [data-validation-state="valid | invalid"]
    */
   validationState: ValidationState | null,
   /**
    * Whether the checkbox is required.
    * @selector [data-required]
    */
   isRequired: boolean
}

export const RadioGroupContext = createContext<ContextValue<RadioGroupProps, HTMLDivElement>>(null);
let InternalRadioContext = createContext<RadioGroupState | null>(null);

function RadioGroup(props: RadioGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, RadioGroupContext);
  let state = useRadioGroupState(props);
  let [labelRef, label] = useSlot();
  let {radioGroupProps, labelProps, descriptionProps, errorMessageProps} = useRadioGroup({
    ...props,
    label
  }, state);

  let renderProps = useRenderProps({
    ...props,
    values: {
      orientation: props.orientation || 'vertical',
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
      isRequired: state.isRequired,
      validationState: state.validationState
    },
    defaultClassName: 'react-aria-RadioGroup'
  });

  return (
    <div {...radioGroupProps} {...renderProps} ref={ref} slot={props.slot}>
      <Provider
        values={[
          [InternalRadioContext, state],
          [LabelContext, {...labelProps, ref: labelRef}],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

function Radio(props: RadioProps, ref: ForwardedRef<HTMLInputElement>) {
  let state = React.useContext(InternalRadioContext)!;
  let domRef = useObjectRef(ref);
  let {inputProps, isSelected, isDisabled, isPressed: isPressedKeyboard} = useRadio(props, state, domRef);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let interactionDisabled = isDisabled || state.isReadOnly;

  // Handle press state for full label. Keyboard press state is returned by useCheckbox
  // since it is handled on the <input> element itself.
  let [isPressed, setPressed] = useState(false);
  let {pressProps} = usePress({
    isDisabled: interactionDisabled,
    onPressStart(e) {
      if (e.pointerType !== 'keyboard') {
        setPressed(true);
      }
    },
    onPressEnd(e) {
      if (e.pointerType !== 'keyboard') {
        setPressed(false);
      }
    }
  });

  let {hoverProps, isHovered} = useHover({
    isDisabled: interactionDisabled
  });

  let pressed = interactionDisabled ? false : (isPressed || isPressedKeyboard);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Radio',
    values: {
      isSelected,
      isPressed: pressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly: state.isReadOnly,
      validationState: state.validationState,
      isRequired: state.isRequired
    }
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <label
      {...mergeProps(DOMProps, pressProps, hoverProps, renderProps)}
      data-selected={isSelected || undefined}
      data-pressed={pressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-validation-state={state.validationState || undefined}
      data-required={state.isRequired || undefined}>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={domRef} />
      </VisuallyHidden>
      {renderProps.children}
    </label>
  );
}

/**
 * A radio group allows a user to select a single item from a list of mutually exclusive options.
 */
const _RadioGroup = forwardRef(RadioGroup);

/**
 * A radio represents an individual option within a radio group.
 */
const _Radio = forwardRef(Radio);

export {_RadioGroup as RadioGroup, _Radio as Radio};
