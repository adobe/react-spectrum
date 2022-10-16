import {AriaRadioGroupProps, AriaRadioProps, useFocusRing, useHover, usePress, useRadio, useRadioGroup, VisuallyHidden} from 'react-aria';
import {LabelContext} from './Label';
import {mergeProps, useObjectRef} from '@react-aria/utils';
import {Orientation, ValidationState} from '@react-types/shared';
import {Provider, RenderProps, useRenderProps, useSlot} from './utils';
import {RadioGroupState, useRadioGroupState} from 'react-stately';
import React, {ForwardedRef, forwardRef, useState} from 'react';
import {TextContext} from './Text';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children' | 'label' | 'description' | 'errorMessage'>, RenderProps<RadioGroupRenderProps> {}
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
  validationState: ValidationState
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
   validationState: ValidationState,
   /**
    * Whether the checkbox is required.
    * @selector [data-required]
    */
   isRequired: boolean 
}

let RadioContext = React.createContext<RadioGroupState>(null);

function RadioGroup(props: RadioGroupProps, ref: ForwardedRef<HTMLDivElement>) {
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
    <div {...radioGroupProps} {...renderProps} ref={ref}>
      <Provider
        values={[
          [RadioContext, state],
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
  let state = React.useContext(RadioContext);
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

  return (
    <label
      {...mergeProps(pressProps, hoverProps, renderProps)}
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
