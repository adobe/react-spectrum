'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useCheckboxGroup,
  useCheckboxGroupItem,
  type AriaCheckboxGroupProps,
  type AriaCheckboxGroupItemProps
} from 'react-aria/useCheckboxGroup';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useCheckboxGroupState, type CheckboxGroupState} from 'react-stately/useCheckboxGroupState';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';
import React, {useRef} from 'react';
import './CheckboxGroup.css';
// The group items reuse the checkbox button styling.
import './Checkbox.css';

interface CheckboxGroupProps extends AriaCheckboxGroupProps {
  children?: React.ReactNode;
  /**
   * The axis the checkboxes should align with (Vanilla CSS implementation specific).
   *
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
}

// The group state is shared with each item through React context.
let CheckboxGroupContext = React.createContext<CheckboxGroupState | null>(null);

export function CheckboxGroup({children, orientation = 'vertical', ...props}: CheckboxGroupProps) {
  // useCheckboxGroupState manages the selected values for the group.
  let state = useCheckboxGroupState(props);
  let {groupProps, labelProps} = useCheckboxGroup(props, state);

  return (
    <div
      {...groupProps}
      className="react-aria-CheckboxGroup"
      data-orientation={orientation}
      data-readonly={state.isReadOnly || undefined}
      data-invalid={state.isInvalid || undefined}
      data-disabled={props.isDisabled || undefined}>
      {props.label && (
        <span {...labelProps} className="react-aria-Label">
          {props.label}
        </span>
      )}
      <div className="checkbox-items">
        <CheckboxGroupContext.Provider value={state}>{children}</CheckboxGroupContext.Provider>
      </div>
    </div>
  );
}

export function Checkbox(props: AriaCheckboxGroupItemProps) {
  let state = React.useContext(CheckboxGroupContext)!;
  let ref = useRef<HTMLInputElement>(null);
  let {inputProps, isSelected, isPressed, isDisabled, isReadOnly, isInvalid} = useCheckboxGroupItem(
    props,
    state,
    ref
  );
  let {hoverProps, isHovered} = useHover({isDisabled: isDisabled || isReadOnly});
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

  return (
    <div className="react-aria-CheckboxField" data-disabled={isDisabled || undefined}>
      <label
        {...hoverProps}
        className="react-aria-CheckboxButton"
        data-selected={isSelected || undefined}
        data-pressed={isPressed || undefined}
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-disabled={isDisabled || undefined}
        data-readonly={isReadOnly || undefined}
        data-invalid={isInvalid || undefined}>
        <VisuallyHidden elementType="span">
          <input {...mergeProps(inputProps, focusProps)} ref={ref} />
        </VisuallyHidden>
        <div className="indicator">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <polyline points="2 9 7 14 16 4" />
          </svg>
        </div>
        {props.children}
      </label>
    </div>
  );
}
