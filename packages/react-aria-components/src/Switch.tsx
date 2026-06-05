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

import {AriaSwitchProps, SwitchAria, useSwitch} from 'react-aria/useSwitch';

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
  useSlottedContext
} from './utils';
import {FieldErrorContext} from './FieldError';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FormContext} from './Form';
import {forwardRefType, GlobalDOMAttributes, RefObject} from '@react-types/shared';
import {HoverEvents} from '@react-types/shared';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {TextContext} from './Text';
import {ToggleState, useToggleState} from 'react-stately/useToggleState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useObjectRef} from 'react-aria/useObjectRef';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface SwitchProps
  extends
    Omit<
      AriaSwitchProps,
      | 'children'
      | 'validationState'
      | 'validationBehavior'
      | 'isRequired'
      | 'isInvalid'
      | 'validate'
    >,
    HoverEvents,
    RenderProps<SwitchRenderProps, 'label'>,
    SlotProps,
    Omit<GlobalDOMAttributes<HTMLLabelElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Switch'
   */
  className?: ClassNameOrFunction<SwitchRenderProps>;
  /**
   * A ref for the HTML input element.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface SwitchFieldProps
  extends
    Omit<AriaSwitchProps, 'children' | 'validationState' | 'validationBehavior'>,
    RACValidation,
    RenderProps<SwitchFieldRenderProps>,
    SlotProps,
    Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SwitchField'
   */
  className?: ClassNameOrFunction<SwitchFieldRenderProps>;
  /**
   * A ref for the HTML input element.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
}

export interface SwitchButtonProps
  extends
    HoverEvents,
    RenderProps<SwitchButtonRenderProps, 'label'>,
    SlotProps,
    GlobalDOMAttributes<HTMLLabelElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SwitchButton'
   */
  className?: ClassNameOrFunction<SwitchButtonRenderProps>;
}

export interface SwitchRenderProps {
  /**
   * Whether the switch is selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the switch is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the switch is currently in a pressed state.
   *
   * @selector [data-pressed]
   */
  isPressed: boolean;
  /**
   * Whether the switch is focused, either via a mouse or keyboard.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the switch is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the switch is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the switch is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * State of the switch.
   */
  state: ToggleState;
}

export interface SwitchFieldRenderProps {
  /**
   * Whether the switch is selected.
   *
   * @selector [data-selected]
   */
  isSelected: boolean;
  /**
   * Whether the switch is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the switch is read only.
   *
   * @selector [data-readonly]
   */
  isReadOnly: boolean;
  /**
   * Whether the switch invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the switch is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * State of the switch.
   */
  state: ToggleState;
}

export interface SwitchButtonRenderProps extends SwitchRenderProps {
  /**
   * Whether the switch invalid.
   *
   * @selector [data-invalid]
   */
  isInvalid: boolean;
  /**
   * Whether the switch is required.
   *
   * @selector [data-required]
   */
  isRequired: boolean;
  /**
   * State of the switch.
   */
  state: ToggleState;
}

export const SwitchContext = createContext<ContextValue<SwitchProps, HTMLLabelElement>>(null);
export const SwitchFieldContext =
  createContext<ContextValue<SwitchFieldProps, HTMLDivElement>>(null);
export const ToggleStateContext = createContext<ToggleState | null>(null);

/**
 * A switch allows a user to turn a setting on or off.
 *
 * @deprecated Use SwitchField + SwitchButton instead.
 */
export const Switch = /*#__PURE__*/ (forwardRef as forwardRefType)(function Switch(
  props: SwitchProps,
  ref: ForwardedRef<HTMLLabelElement>
) {
  let {inputRef: userProvidedInputRef = null, ...otherProps} = props;
  [props, ref] = useContextProps(otherProps, ref, SwitchContext);
  let inputRef = useObjectRef(
    mergeRefs(userProvidedInputRef, props.inputRef !== undefined ? props.inputRef : null)
  );
  let state = useToggleState(props);
  let aria = useSwitch(
    {
      ...removeDataAttributes(props),
      // ReactNode type doesn't allow function children.
      children: typeof props.children === 'function' ? true : props.children
    },
    state,
    inputRef
  );

  return (
    <Provider
      values={[
        [ToggleStateContext, state],
        [
          InternalSwitchContext,
          {
            ...aria,
            inputRef,
            defaultClassName: 'react-aria-Switch'
          }
        ]
      ]}>
      <SwitchButton {...props} ref={ref} />
    </Provider>
  );
});

interface InternalSwitchContextValue extends SwitchAria {
  inputRef: RefObject<HTMLInputElement | null>;
  defaultClassName: string;
  isRequired?: boolean;
}

const InternalSwitchContext = createContext<InternalSwitchContextValue | null>(null);

/**
 * A switch allows a user to turn a setting on or off, with support for validation and help text.
 */
export const SwitchField = /*#__PURE__*/ (forwardRef as forwardRefType)(function Switch(
  props: SwitchFieldProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {inputRef: userProvidedInputRef = null, ...otherProps} = props;
  [props, ref] = useContextProps(otherProps, ref, SwitchFieldContext);
  let {validationBehavior: formValidationBehavior} = useSlottedContext(FormContext) || {};
  let validationBehavior = props.validationBehavior ?? formValidationBehavior ?? 'native';
  let inputRef = useObjectRef(
    mergeRefs(userProvidedInputRef, props.inputRef !== undefined ? props.inputRef : null)
  );
  let state = useToggleState(props);
  let aria = useSwitch(
    {
      ...removeDataAttributes(props),
      // ReactNode type doesn't allow function children.
      children: typeof props.children === 'function' ? true : props.children,
      validationBehavior
    },
    state,
    inputRef
  );
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
    defaultClassName: 'react-aria-SwitchField',
    values: {
      isSelected,
      isDisabled,
      isReadOnly,
      isInvalid,
      isRequired: props.isRequired || false,
      state
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
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      data-invalid={isInvalid || undefined}
      data-required={props.isRequired || undefined}>
      <Provider
        values={[
          [ToggleStateContext, state],
          [
            InternalSwitchContext,
            {
              ...aria,
              inputRef,
              defaultClassName: 'react-aria-SwitchButton',
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
          [FieldErrorContext, {isInvalid, validationDetails, validationErrors}]
        ]}>
        {renderProps.children}
      </Provider>
    </dom.div>
  );
});

/**
 * A switch button is the clickable area of a switch, including the indicator and label.
 */
export const SwitchButton = /*#__PURE__*/ (forwardRef as forwardRefType)(function SwitchButton(
  props: SwitchButtonProps,
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
    isRequired
  } = useContext(InternalSwitchContext)!;
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isInteractionDisabled = isDisabled || isReadOnly;
  let state = useContext(ToggleStateContext)!;

  let {hoverProps, isHovered} = useHover({
    ...props,
    isDisabled: isInteractionDisabled
  });

  let renderProps = useRenderProps({
    ...props,
    defaultClassName,
    values: {
      isSelected,
      isPressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly,
      isInvalid,
      isRequired: isRequired || false,
      state
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
