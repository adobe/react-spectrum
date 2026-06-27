'use client';
import {Minus, Plus} from 'lucide-react';
import {Group} from 'react-aria-components/Group';
import {useButton, type AriaButtonProps} from 'react-aria/useButton';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useLocale} from 'react-aria/I18nProvider';
import {mergeProps} from 'react-aria/mergeProps';
import {useNumberField, type AriaNumberFieldProps} from 'react-aria/useNumberField';
import {useNumberFieldState} from 'react-stately/useNumberFieldState';
import {useRef} from 'react';
import './Button.css';
import './NumberField.css';
import './Form.css';

export function NumberField(props: AriaNumberFieldProps & {label?: React.ReactNode}) {
  let {locale} = useLocale();
  let state = useNumberFieldState({...props, locale});
  let inputRef = useRef<HTMLInputElement>(null);
  let {labelProps, groupProps, inputProps, incrementButtonProps, decrementButtonProps} =
    useNumberField(props, state, inputRef);

  return (
    <div className="react-aria-NumberField">
      <label className="react-aria-Label" {...labelProps}>
        {props.label}
      </label>
      {/* Group renders the focus ring around the whole field via [data-focus-within]. */}
      <Group {...groupProps}>
        <input {...inputProps} ref={inputRef} className="react-aria-Input inset" />
        <StepperButton {...decrementButtonProps} slot="decrement">
          <Minus />
        </StepperButton>
        <StepperButton {...incrementButtonProps} slot="increment">
          <Plus />
        </StepperButton>
      </Group>
    </div>
  );
}

function StepperButton({slot, ...props}: AriaButtonProps & {slot: string}) {
  let ref = useRef<HTMLButtonElement>(null);
  // useButton turns the AriaButtonProps from useNumberField into DOM props for each stepper.
  let {buttonProps, isPressed} = useButton(props, ref);
  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      ref={ref}
      slot={slot}
      className="react-aria-Button button-base"
      data-variant="secondary"
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={props.isDisabled || undefined}>
      {props.children}
    </button>
  );
}
