'use client';
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  ValidationResult,
  RadioProps,
  Radio as AriaRadio,
  composeRenderProps
} from 'react-aria-components';
import {Label, FieldError, Description} from './Form';
import './RadioGroup.css';
import './utilities.css';

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'children'> {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(
  {
    label,
    description,
    errorMessage,
    children,
    ...props
  }: RadioGroupProps
) {
  return (
    <AriaRadioGroup {...props}>
      <Label>{label}</Label>
      <div className="radio-items">
        {children}
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export function Radio(props: RadioProps) {
  return (
    <AriaRadio {...props}>
      {composeRenderProps(props.children, (children) => (
        <>
          <div className="indicator" />
          {children}
        </>
      ))}
    </AriaRadio>
  )
}
