import {ReactNode} from 'react';
import {RadioGroup as RACRadioGroup, Radio as RACRadio, RadioGroupProps as RACRadioGroupProps, RadioProps, ValidationResult} from 'react-aria-components';
import {tv} from 'tailwind-variants';
import {Label, FieldError, Description} from './Field';

export interface RadioGroupProps extends Omit<RACRadioGroupProps, 'children'> {
  label?: string,
  children?: ReactNode,
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup(props: RadioGroupProps) {
  return (
    <RACRadioGroup {...props} className="flex flex-col gap-2">
      <Label>{props.label}</Label>
      {props.children}
      {props.description && <Description>{props.description}</Description>}
      <FieldError>{props.errorMessage}</FieldError>
    </RACRadioGroup>
  );
}

const styles = tv({
  base: 'w-5 h-5 rounded-full border-2 bg-white transition-all group-focus-visible:outline outline-2 outline-blue-600 outline-offset-2',
  variants: {
    isSelected: {
      false: 'border-gray-400 group-pressed:border-gray-500',
      true: 'border-[7px] border-gray-700 group-pressed:border-gray-800'
    },
    isInvalid: {
      true: 'border-red-700 group-pressed:border-red-800'
    },
    isDisabled: {
      true: 'border-gray-200'
    }
  }
});

export function Radio(props: RadioProps) {
  return (
    <RACRadio {...props} className="flex gap-2 items-center group text-gray-800 disabled:text-gray-300 text-sm transition">
      {({isSelected, isInvalid, isDisabled}) => <>
        <div className={styles({isSelected, isInvalid, isDisabled})} />
        {props.children}
      </>}
    </RACRadio>
  );
}
