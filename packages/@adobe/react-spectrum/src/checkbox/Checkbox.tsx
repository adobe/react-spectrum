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

import {AriaCheckboxProps, useCheckbox} from 'react-aria/useCheckbox';

import {CheckboxContext} from 'react-aria-components/Checkbox';
import {CheckboxGroupContext} from './context';
import CheckmarkSmall from '@spectrum-icons/ui/CheckmarkSmall';
import {classNames} from '../utils/classNames';
import DashSmall from '@spectrum-icons/ui/DashSmall';
import {FocusableRef, StyleProps} from '@react-types/shared';
import {FocusRing} from 'react-aria/FocusRing';
import React, {forwardRef, useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/checkbox/vars.css';
import {useCheckboxGroupItem} from 'react-aria/useCheckboxGroup';
import {useContextProps} from 'react-aria-components/slots';
import {useFocusableRef} from '../utils/useDOMRef';
import {useFormProps} from '../form/Form';
import {useHover} from 'react-aria/useHover';
import {useProviderProps} from '../provider/Provider';
import {useStyleProps} from '../utils/styleProps';
import {useToggleState} from 'react-stately/useToggleState';

export interface SpectrumCheckboxProps extends Omit<AriaCheckboxProps, 'onClick'>, StyleProps {
  /**
   * This prop sets the emphasized style which provides visual prominence.
   */
  isEmphasized?: boolean;
  /**
   * A slot name for the component. Slots allow the component to receive props from a parent
   * component. An explicit `null` value indicates that the local props completely override all
   * props received from a parent.
   *
   * @private
   */
  slot?: string | null;
}

interface CheckboxContentProps {
  props: SpectrumCheckboxProps;
  originalProps: SpectrumCheckboxProps;
  domRef: ReturnType<typeof useFocusableRef>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  isInvalid?: boolean;
  isDisabled?: boolean;
}

function CheckboxContent({
  props,
  originalProps,
  domRef,
  inputRef,
  labelProps,
  inputProps,
  isInvalid,
  isDisabled
}: CheckboxContentProps) {
  let {isIndeterminate = false, isEmphasized = false, autoFocus, children} = props;
  let {styleProps} = useStyleProps(props);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let groupState = useContext(CheckboxGroupContext);

  let markIcon = isIndeterminate ? (
    <DashSmall UNSAFE_className={classNames(styles, 'spectrum-Checkbox-partialCheckmark')} />
  ) : (
    <CheckmarkSmall UNSAFE_className={classNames(styles, 'spectrum-Checkbox-checkmark')} />
  );

  if (groupState && process.env.NODE_ENV !== 'production') {
    for (let key of ['isSelected', 'defaultSelected', 'isEmphasized']) {
      if (originalProps[key] != null) {
        console.warn(
          `${key} is unsupported on individual <Checkbox> elements within a <CheckboxGroup>. Please apply these props to the group instead.`
        );
      }
    }
    if (props.value == null) {
      console.warn('A <Checkbox> element within a <CheckboxGroup> requires a `value` property.');
    }
  }

  return (
    <label
      {...labelProps}
      {...styleProps}
      {...hoverProps}
      ref={domRef}
      className={classNames(
        styles,
        'spectrum-Checkbox',
        {
          'is-checked': inputProps.checked,
          'is-indeterminate': isIndeterminate,
          'spectrum-Checkbox--quiet': !isEmphasized,
          'is-invalid': isInvalid,
          'is-disabled': isDisabled,
          'is-hovered': isHovered
        },
        styleProps.className
      )}>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
        <input
          {...inputProps}
          ref={inputRef}
          className={classNames(styles, 'spectrum-Checkbox-input')}
        />
      </FocusRing>
      <span className={classNames(styles, 'spectrum-Checkbox-box')}>{markIcon}</span>
      {children && (
        <span className={classNames(styles, 'spectrum-Checkbox-label')}>{children}</span>
      )}
    </label>
  );
}

function CheckboxStandalone({
  props,
  originalProps,
  domRef,
  inputRef
}: {
  props: SpectrumCheckboxProps;
  originalProps: SpectrumCheckboxProps;
  domRef: ReturnType<typeof useFocusableRef>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  let {labelProps, inputProps, isInvalid, isDisabled} = useCheckbox(
    props,
    useToggleState(props),
    inputRef
  );

  return (
    <CheckboxContent
      props={props}
      originalProps={originalProps}
      domRef={domRef}
      inputRef={inputRef}
      labelProps={labelProps}
      inputProps={inputProps}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
    />
  );
}

function CheckboxInGroup({
  props,
  originalProps,
  domRef,
  inputRef,
  groupState
}: {
  props: SpectrumCheckboxProps;
  originalProps: SpectrumCheckboxProps;
  domRef: ReturnType<typeof useFocusableRef>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  groupState: NonNullable<React.ContextType<typeof CheckboxGroupContext>>;
}) {
  let {labelProps, inputProps, isInvalid, isDisabled} = useCheckboxGroupItem(
    {
      ...props,
      // Value is optional for standalone checkboxes, but required for CheckboxGroup items;
      // it's passed explicitly here to avoid typescript error (requires ignore).
      // @ts-ignore
      value: props.value,
      // Only pass isRequired and validationState to react-aria if they came from
      // the props for this individual checkbox, and not from the group via context.
      isRequired: originalProps.isRequired,
      validationState: originalProps.validationState,
      isInvalid: originalProps.isInvalid
    },
    groupState,
    inputRef
  );

  return (
    <CheckboxContent
      props={props}
      originalProps={originalProps}
      domRef={domRef}
      inputRef={inputRef}
      labelProps={labelProps}
      inputProps={inputProps}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
    />
  );
}

/**
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 */
export const Checkbox = forwardRef(function Checkbox(
  propsArg: SpectrumCheckboxProps,
  ref: FocusableRef<HTMLLabelElement>
) {
  let props = propsArg;
  let originalProps = props;
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);

  [props, domRef] = useContextProps(props, domRef, CheckboxContext);
  props = useProviderProps(props);
  props = useFormProps(props);

  let groupState = useContext(CheckboxGroupContext);
  if (groupState) {
    return (
      <CheckboxInGroup
        props={props}
        originalProps={originalProps}
        domRef={domRef}
        inputRef={inputRef}
        groupState={groupState}
      />
    );
  }

  return (
    <CheckboxStandalone
      props={props}
      originalProps={originalProps}
      domRef={domRef}
      inputRef={inputRef}
    />
  );
});
