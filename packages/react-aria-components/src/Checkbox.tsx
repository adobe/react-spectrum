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
import {AriaCheckboxGroupProps, AriaCheckboxProps, mergeProps, useCheckbox, useCheckboxGroup, useCheckboxGroupItem, useFocusRing, useHover, usePress, VisuallyHidden} from 'react-aria';
import {CheckboxGroupState, useCheckboxGroupState, useToggleState, ValidationState} from 'react-stately';
import {ContextValue, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useContext, useState} from 'react';
import {TextContext} from './Text';

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children' | 'label' | 'description' | 'errorMessage'>, RenderProps<CheckboxGroupRenderProps>, SlotProps {}
export interface CheckboxProps extends Omit<AriaCheckboxProps, 'children'>, RenderProps<CheckboxRenderProps>, SlotProps {}

export interface CheckboxGroupRenderProps {
  /**
   * Whether the checkbox group is disabled.
   * @selector [aria-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the checkbox group is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the checkbox group is required.
   * @selector [data-required]
   */
  isRequired: boolean,
  /**
   * The validation state of the checkbox group.
   * @selector [data-validation-state="invalid" | "valid"]
   */
  validationState: ValidationState
}

export interface CheckboxRenderProps {
  /**
   * Whether the checkbox is selected.
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * Whether the checkbox is selected.
   * @selector [data-indeterminate]
   */
  isIndeterminate: boolean,
  /**
   * Whether the checkbox is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the checkbox is currently in a pressed state.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the checkbox is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the checkbox is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the checkbox is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the checkbox is read only.
   * @selector [data-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the checkbox is valid or invalid.
   * @selector [data-validation-state="valid | invalid"]
   */
  validationState?: ValidationState,
  /**
   * Whether the checkbox is required.
   * @selector [data-required]
   */
  isRequired: boolean
}

export const CheckboxGroupContext = createContext<ContextValue<CheckboxGroupProps, HTMLDivElement>>(null);
const InternalCheckboxGroupContext = createContext<CheckboxGroupState | null>(null);

function CheckboxGroup(props: CheckboxGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, CheckboxGroupContext);
  let state = useCheckboxGroupState(props);
  let [labelRef, label] = useSlot();
  let {groupProps, labelProps, descriptionProps, errorMessageProps} = useCheckboxGroup({
    ...props,
    label
  }, state);

  let renderProps = useRenderProps({
    ...props,
    values: {
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
      isRequired: props.isRequired || false,
      validationState: state.validationState
    },
    defaultClassName: 'react-aria-CheckboxGroup'
  });

  return (
    <div
      {...groupProps}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-readonly={state.isReadOnly || undefined}
      data-required={props.isRequired || undefined}
      data-validation-state={state.validationState || undefined}>
      <Provider
        values={[
          [InternalCheckboxGroupContext, state],
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

export const CheckboxContext = createContext<ContextValue<CheckboxProps, HTMLInputElement>>(null);

function Checkbox(props: CheckboxProps, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, CheckboxContext);
  let groupState = useContext(InternalCheckboxGroupContext);
  let {inputProps, isSelected, isDisabled, isReadOnly, isPressed: isPressedKeyboard} = groupState
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useCheckboxGroupItem({
      ...props,
      // Value is optional for standalone checkboxes, but required for CheckboxGroup items;
      // it's passed explicitly here to avoid typescript error (requires ignore).
      // @ts-ignore
      value: props.value
    }, groupState, ref)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    : useCheckbox(props, useToggleState(props), ref);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isInteractionDisabled = isDisabled || isReadOnly;

  // Handle press state for full label. Keyboard press state is returned by useCheckbox
  // since it is handled on the <input> element itself.
  let [isPressed, setPressed] = useState(false);
  let {pressProps} = usePress({
    isDisabled: isInteractionDisabled,
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
    isDisabled: isInteractionDisabled
  });

  let pressed = isInteractionDisabled ? false : (isPressed || isPressedKeyboard);

  let renderProps = useRenderProps({
    // TODO: should data attrs go on the label or on the <input>? useCheckbox passes them to the input...
    ...props,
    defaultClassName: 'react-aria-Checkbox',
    values: {
      isSelected,
      isIndeterminate: props.isIndeterminate || false,
      isPressed: pressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly,
      validationState: props.validationState || groupState?.validationState,
      isRequired: props.isRequired || false
    }
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <label
      {...mergeProps(DOMProps, pressProps, hoverProps, renderProps)}
      slot={props.slot}
      data-selected={isSelected || undefined}
      data-indeterminate={props.isIndeterminate || undefined}
      data-pressed={pressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-validation-state={props.validationState || groupState?.validationState || undefined}
      data-required={props.isRequired || undefined}>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      {renderProps.children}
    </label>
  );
}

/**
 * A checkbox allows a user to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 */
const _Checkbox = forwardRef(Checkbox);

/**
 * A checkbox group allows a user to select multiple items from a list of options.
 */
const _CheckboxGroup = forwardRef(CheckboxGroup);

export {_Checkbox as Checkbox, _CheckboxGroup as CheckboxGroup};
