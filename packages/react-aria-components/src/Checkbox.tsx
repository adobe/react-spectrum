import {AriaCheckboxGroupProps, AriaCheckboxProps, mergeProps, useCheckbox, useCheckboxGroup, useCheckboxGroupItem, useFocusRing, useHover, usePress, VisuallyHidden} from 'react-aria';
import {CheckboxGroupState, useCheckboxGroupState, useToggleState} from 'react-stately';
import {LabelContext} from './Label';
import {Provider, RenderProps, useContextProps, useRenderProps, useSlot, WithRef} from './utils';
import React, {createContext, ForwardedRef, forwardRef, useContext, useState} from 'react';
import {ValidationState} from '@react-types/shared';

interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'children' | 'label'>, RenderProps<CheckboxGroupState> {}
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
  validationState: ValidationState,
  /**
   * Whether the checkbox is required.
   * @selector [data-required]
   */
  isRequired: boolean
}

const CheckboxGroupContext = createContext<CheckboxGroupState>(null);

function CheckboxGroup(props: CheckboxGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  let state = useCheckboxGroupState(props);
  let [labelRef, label] = useSlot();
  let {groupProps, labelProps} = useCheckboxGroup({
    ...props,
    label
  }, state);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-CheckboxGroup'
  });

  return (
    <div 
      {...groupProps}
      {...renderProps}
      ref={ref}>
      <Provider
        values={[
          [CheckboxGroupContext, state],
          [LabelContext, {...labelProps, ref: labelRef}]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

export const CheckboxContext = createContext<WithRef<AriaCheckboxProps, HTMLInputElement>>(null);

function Checkbox(props: CheckboxProps, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, CheckboxContext);
  let groupState = useContext(CheckboxGroupContext);
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
      validationState: props.validationState,
      isRequired: props.isRequired || false
    }
  });

  return (
    <label 
      {...mergeProps(pressProps, hoverProps, renderProps)}
      data-selected={isSelected || undefined}
      data-indeterminate={props.isIndeterminate || undefined}
      data-pressed={pressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
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
const _CheckboxGroup = forwardRef(CheckboxGroup);
export {_Checkbox as Checkbox, _CheckboxGroup as CheckboxGroup};
