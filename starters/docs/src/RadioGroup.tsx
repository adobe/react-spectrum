'use client';
import {
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  ValidationResult,
  RadioProps,
  Radio as AriaRadio
} from 'react-aria-components';
import {Label, FieldError} from './Form';
import {Text} from './Content';
import './RadioGroup.css';

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
    (
      <AriaRadioGroup {...props}>
        <Label>{label}</Label>
        <div className="radio-items">
          {children}
        </div>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
      </AriaRadioGroup>
    )
  );
}

export function Radio(props: RadioProps) {
  return <AriaRadio {...props} />;
}
