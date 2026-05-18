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
import {
  AriaCheckboxGroupProps,
  useCheckboxGroup,
  useCheckboxGroupItem
} from 'react-aria/useCheckboxGroup';

import {AriaCheckboxProps, CheckboxAria, useCheckbox} from 'react-aria/useCheckbox';
import {CheckboxGroupState, useCheckboxGroupState} from 'react-stately/useCheckboxGroupState';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  Provider,
  RACValidation,
  removeDataAttributes,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps,
  useSlot,
  useSlottedContext
} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FormContext} from './Form';
import {forwardRefType, GlobalDOMAttributes, RefObject} from '@react-types/shared';
import {HoverEvents} from '@react-types/shared';
import {LabelContext} from './Label';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {createContext, ForwardedRef, forwardRef, useContext, useMemo} from 'react';
import {TextContext} from './Text';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useToggleState} from 'react-stately/useToggleState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface CheckboxGroupProps
  extends
    Omit<
      AriaCheckboxGroupProps,
      | 'children'
      | 'label'
      | 'description'
      | 'errorMessage'
      | 'validationState'
      | 'validationBehavior'
    >,
    RACValidation,
    RenderProps<CheckboxGroupRenderProps, 'div'>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-CheckboxGroup'
   */
  className?: ClassNameOrFunction<CheckboxGroupRenderProps>;
}

export interface CheckboxProps
  extends
    Omit<AriaCheckboxProps, 'children' | 'validationState' | 'validationBehavior'>,
    HoverEvents,
    RACValidation,
    RenderProps<CheckboxRenderProps, 'label'>,
    SlotProps,
    Omit<GlobalDOMAttributes<HTMLLabelElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Checkbox'
   */
  className?: ClassNameOrFunction<CheckboxRenderProps>;
  /**
   * A ref for the HTML input element.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface CheckboxFieldProps
  extends
    Omit<AriaCheckboxProps, 'children' | 'validationState' | 'validationBehavior'>,
    RACValidation,
    RenderProps<CheckboxFieldRenderProps>,
    SlotProps,
    Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-CheckboxField'
   */
  className?: ClassNameOrFunction<CheckboxFieldRenderProps>;
  /**
   * A ref for the HTML input element.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface CheckboxButtonProps
  extends
    HoverEvents,
    RenderProps<CheckboxButtonRenderProps, 'label'>,
    SlotProps,
    GlobalDOMAttributes<HTMLLabelElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-CheckboxButton'
   */
  className?: ClassNameOrFunction<CheckboxButtonRenderProps>;
}

export interface CheckboxGroupRenderProps {
  /**
   * Whether the checkbox group is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the checkbox group is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the checkbox group is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * Whether the checkbox group is invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * State of the checkbox group.
   */
  state: CheckboxGroupState;
}

export interface CheckboxRenderProps {
  /**
   * Whether the checkbox is selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the checkbox is indeterminate.
   *
   * @selector [data-indeterminate]
   */
  isIndeterminate: boolean;
  /**
   * Whether the checkbox is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the checkbox is currently in a pressed state.
   *
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the checkbox is focused, either via a mouse or keyboard.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the checkbox is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the checkbox is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the checkbox is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the checkbox invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the checkbox is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
}

export interface CheckboxFieldRenderProps {
  /**
   * Whether the checkbox is selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the checkbox is indeterminate.
   *
   * @selector [data-indeterminate]
   */
  isIndeterminate: boolean;
  /**
   * Whether the checkbox is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the checkbox is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the checkbox invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the checkbox is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
}

export interface CheckboxButtonRenderProps extends CheckboxRenderProps {}

export const CheckboxContext = createContext<ContextValue<CheckboxProps, HTMLLabelElement>>(null);
export const CheckboxFieldContext =
  createContext<ContextValue<CheckboxFieldProps, HTMLDivElement>>(null);
export const CheckboxGroupContext =
  createContext<ContextValue<CheckboxGroupProps, HTMLDivElement>>(null);
export const CheckboxGroupStateContext = createContext<CheckboxGroupState | null>(null);

/**
 * A checkbox group allows a user to select multiple items from a list of options.
 */
export const CheckboxGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(function CheckboxGroup(
  props: CheckboxGroupProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, CheckboxGroupContext);
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let state = useCheckboxGroupState({
    ...props,
    validationBehavior
  });
  let [labelRef, label] = useSlot(!props['aria-label'] && !props['aria-labelledby']);
  let {groupProps, labelProps, descriptionProps, errorMessageProps, ...validation} =
    useCheckboxGroup(
      {
        ...props,
        label,
        validationBehavior
      },
      state
    );

  let renderProps = useRenderProps({
    ...props,
    values: {
      isDisabled: state.isDisabled,
      isReadOnly: state.isReadOnly,
      isRequired: props.isRequired || false,
      isInvalid: state.isInvalid,
      state
    },
    defaultClassName: 'react-aria-CheckboxGroup'
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <dom.div
      {...mergeProps(DOMProps, renderProps, groupProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-readonly={state.isReadOnly || undefined}
      data-required={props.isRequired || undefined}
      data-invalid={state.isInvalid || undefined}
      data-disabled={props.isDisabled || undefined}>
      <Provider
        values={[
          [CheckboxGroupStateContext, state],
          [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
          [
            TextContext,
            {
              slots: {
                description: descriptionProps,
                errorMessage: errorMessageProps
              }
            }
          ],
          [FieldErrorContext, validation]
        ]}>
        {renderProps.children}
      </Provider>
    </dom.div>
  );
});

interface InternalCheckboxContextValue extends CheckboxAria {
  inputRef: RefObject<HTMLInputElement | null>;
  defaultClassName: string;
  isIndeterminate?: boolean;
  isRequired?: boolean;
}

const InternalCheckboxContext = createContext<InternalCheckboxContextValue | null>(null);

/**
 * A checkbox allows a user to select an item, with support for validation and help text.
 */
export const CheckboxField = /*#__PURE__*/ (forwardRef as forwardRefType)(function Checkbox(
  props: CheckboxFieldProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {inputRef: userProvidedInputRef = null, ...otherProps} = props;
  [props, ref] = useContextProps(otherProps, ref, CheckboxFieldContext);
  let groupState = useContext(CheckboxGroupStateContext);
  let [aria, inputRef] = useCheckboxAria(props, userProvidedInputRef);
  let {
    descriptionProps,
    errorMessageProps,
    isSelected,
    isDisabled,
    isReadOnly,
    isInvalid,
    validationDetails,
    validationErrors
  } = aria;

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-CheckboxField',
    values: {
      isSelected,
      isIndeterminate: props.isIndeterminate || false,
      isDisabled,
      isReadOnly,
      isInvalid,
      isRequired: props.isRequired || false
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <dom.div
      {...mergeProps(DOMProps, renderProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-selected={isSelected || undefined}
      data-indeterminate={props.isIndeterminate || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-required={props.isRequired || undefined}>
      <Provider
        values={[
          [
            InternalCheckboxContext,
            {
              ...aria,
              inputRef,
              defaultClassName: 'react-aria-CheckboxButton',
              isIndeterminate: props.isIndeterminate,
              isRequired: props.isRequired
            }
          ],
          [
            TextContext,
            {
              slots: {
                description: descriptionProps,
                errorMessage: errorMessageProps
              }
            }
          ],
          // In a CheckboxGroup, validation is handled at the group level instead of repeated on each checkbox.
          [FieldErrorContext, groupState ? null : {isInvalid, validationDetails, validationErrors}]
        ]}>
        {renderProps.children}
      </Provider>
    </dom.div>
  );
});

function useCheckboxAria(
  props: CheckboxProps | CheckboxFieldProps,
  userProvidedInputRef: RefObject<HTMLInputElement | null> | null
): [CheckboxAria, RefObject<HTMLInputElement | null>] {
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let groupState = useContext(CheckboxGroupStateContext);
  let inputRef = useObjectRef(
    useMemo(
      () => mergeRefs(userProvidedInputRef, props.inputRef !== undefined ? props.inputRef : null),
      [userProvidedInputRef, props.inputRef]
    )
  );
  let checkboxProps = {
    ...removeDataAttributes(props),
    children: typeof props.children === 'function' ? true : props.children,
    value: props.value!,
    validationBehavior
  };

  let aria = groupState
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckboxGroupItem(checkboxProps, groupState, inputRef)
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useCheckbox(checkboxProps, useToggleState(props), inputRef);
  return [aria, inputRef];
}

/**
 * A checkbox allows a user to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 *
 * @deprecated Use CheckboxField + CheckboxButton instead.
 */
export const Checkbox = /*#__PURE__*/ (forwardRef as forwardRefType)(function Checkbox(
  props: CheckboxProps,
  ref: ForwardedRef<HTMLLabelElement>
) {
  let {inputRef: userProvidedInputRef = null, ...otherProps} = props;
  [props, ref] = useContextProps(otherProps, ref, CheckboxContext);
  let [aria, inputRef] = useCheckboxAria(props, userProvidedInputRef);

  return (
    <InternalCheckboxContext.Provider
      value={{
        ...aria,
        inputRef,
        defaultClassName: 'react-aria-Checkbox',
        isIndeterminate: props.isIndeterminate,
        isRequired: props.isRequired
      }}>
      <CheckboxButton {...props} ref={ref} />
    </InternalCheckboxContext.Provider>
  );
});

/**
 * A checkbox button is the clickable area of a checkbox, including the indicator and label.
 */
export const CheckboxButton = /*#__PURE__*/ (forwardRef as forwardRefType)(function CheckboxButton(
  props: CheckboxButtonProps,
  ref: ForwardedRef<HTMLLabelElement>
) {
  let {
    labelProps,
    inputProps,
    isSelected,
    isDisabled,
    isReadOnly,
    isPressed,
    isInvalid,
    inputRef,
    defaultClassName,
    isIndeterminate,
    isRequired
  } = useContext(InternalCheckboxContext)!;
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isInteractionDisabled = isDisabled || isReadOnly;

  let {hoverProps, isHovered} = useHover({
    ...props,
    isDisabled: isInteractionDisabled
  });

  let renderProps = useRenderProps({
    ...props,
    defaultClassName,
    values: {
      isSelected,
      isIndeterminate: isIndeterminate || false,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly,
      isInvalid,
      isRequired: isRequired || false
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <dom.label
      {...mergeProps(DOMProps, labelProps, hoverProps, renderProps)}
      ref={ref}
      slot={props.slot || undefined}
      data-selected={isSelected || undefined}
      data-indeterminate={isIndeterminate || undefined}
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-required={isRequired || undefined}>
      <VisuallyHidden elementType="span">
        <input {...mergeProps(inputProps, focusProps)} ref={inputRef} />
      </VisuallyHidden>
      {renderProps.children}
    </dom.label>
  );
});
