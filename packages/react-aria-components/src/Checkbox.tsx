import {AriaCheckboxProps, mergeProps, useCheckbox, useFocusRing, useHover, usePress, VisuallyHidden} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, useState} from 'react';
import {RenderProps, useContextProps, useRenderProps, WithRef} from './utils';
import {useToggleState} from 'react-stately';
import {ValidationState} from '@react-types/shared';

interface CheckboxProps extends Omit<AriaCheckboxProps, 'children'>, RenderProps<CheckboxRenderProps> {}

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
   * Whether the button is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the button is keyboard focused.
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
  validationState: ValidationState,
  /**
   * Whether the checkbox is required.
   * @selector [data-required]
   */
  isRequired: boolean
}

const CheckboxContext = createContext<WithRef<AriaCheckboxProps, HTMLInputElement>>(null);

function Checkbox(props: CheckboxProps, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, CheckboxContext);
  let state = useToggleState(props);
  let {inputProps, isPressed: isPressedKeyboard} = useCheckbox(props, state, ref);
  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let isDisabled = props.isDisabled || props.isReadOnly;

  // Handle press state for full label. Keyboard press state is returned by useCheckbox
  // since it is handled on the <input> element itself.
  let [isPressed, setPressed] = useState(false);
  let {pressProps} = usePress({
    isDisabled,
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
    isDisabled
  });

  let pressed = isDisabled ? false : (isPressed || isPressedKeyboard);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Checkbox',
    values: {
      isSelected: state.isSelected,
      isIndeterminate: props.isIndeterminate || false,
      isPressed: pressed,
      isHovered,
      isFocused,
      isFocusVisible,
      isDisabled: props.isDisabled || false,
      isReadOnly: props.isReadOnly || false,
      validationState: props.validationState,
      isRequired: props.isRequired || false
    }
  });

  return (
    <label 
      {...mergeProps(pressProps, hoverProps, renderProps)}
      data-selected={state.isSelected || undefined}
      data-indeterminate={props.isIndeterminate || undefined}
      data-pressed={pressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={props.isDisabled || undefined}
      data-readonly={props.isReadOnly || undefined}
      data-validation-state={props.validationState || undefined}
      data-required={props.isRequired || undefined}>
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      {renderProps.children}
    </label>
  );
}

const _Checkbox = forwardRef(Checkbox);
export {_Checkbox as Checkbox};
