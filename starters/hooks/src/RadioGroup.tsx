'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useRadio,
  useRadioGroup,
  type AriaRadioGroupProps,
  type AriaRadioProps
} from 'react-aria/useRadioGroup';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useRadioGroupState, type RadioGroupState} from 'react-stately/useRadioGroupState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';
import React, {useRef} from 'react';
import './RadioGroup.css';

interface RadioGroupProps extends AriaRadioGroupProps {
  children?: React.ReactNode;
}

// The group state is shared with each radio through React context.
let RadioContext = React.createContext<RadioGroupState | null>(null);

export function RadioGroup({children, ...props}: RadioGroupProps) {
  // useRadioGroupState manages the selected value for the group.
  let state = useRadioGroupState(props);
  let {radioGroupProps, labelProps} = useRadioGroup(props, state);

  return (
    <div
      {...radioGroupProps}
      className="react-aria-RadioGroup"
      data-orientation={props.orientation || 'vertical'}
      data-invalid={state.isInvalid || undefined}
      data-disabled={state.isDisabled || undefined}
      data-readonly={state.isReadOnly || undefined}>
      {props.label && (
        <span {...labelProps} className="react-aria-Label">
          {props.label}
        </span>
      )}
      <div className="radio-items">
        <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
      </div>
    </div>
  );
}

export function Radio(props: AriaRadioProps) {
  let state = React.useContext(RadioContext)!;
  let ref = useRef<HTMLInputElement>(null);
  let {inputProps, isSelected, isPressed, isDisabled} = useRadio(props, state, ref);
  let {hoverProps, isHovered} = useHover({isDisabled: isDisabled || state.isReadOnly});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  return (
    <div
      className="react-aria-RadioField"
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}>
      {/* The label wraps a visually hidden native radio input plus the styled indicator. */}
      <label
        {...hoverProps}
        className="react-aria-RadioButton"
        data-selected={isSelected || undefined}
        data-pressed={isPressed || undefined}
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-disabled={isDisabled || undefined}
        data-readonly={state.isReadOnly || undefined}
        data-invalid={state.isInvalid || undefined}>
        <VisuallyHidden elementType="span">
          <input {...mergeProps(inputProps, focusProps)} ref={ref} />
        </VisuallyHidden>
        <div className="indicator" />
        {props.children}
      </label>
    </div>
  );
}
