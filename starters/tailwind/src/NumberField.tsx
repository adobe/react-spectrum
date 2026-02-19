'use client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import {
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  Button,
  ButtonProps,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, FieldGroup, Input, Label, fieldBorderStyles } from './Field';
import { composeTailwindRenderProps } from './utils';

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string
}

export function NumberField(
  { label, description, errorMessage, placeholder, ...props }: NumberFieldProps
) {
  return (
    <AriaNumberField {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 font-sans')}>
      <Label>{label}</Label>
      <FieldGroup>
        {renderProps => (<>
          <Input className="w-20" placeholder={placeholder} />
          <div className={fieldBorderStyles({...renderProps, class: 'flex flex-col border-s h-full'})}>
            <StepperButton slot="increment">
              <ChevronUp aria-hidden className="w-4 h-4" />
            </StepperButton>
            <div className={fieldBorderStyles({...renderProps, class: 'border-b'})} />
            <StepperButton slot="decrement">
              <ChevronDown aria-hidden className="w-4 h-4" />
            </StepperButton>
          </div>
        </>)}
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}

function StepperButton(props: ButtonProps) {
  return <Button {...props} className="flex border-0 py-0 px-0.5 flex-1 box-border cursor-default text-neutral-500 bg-transparent pressed:bg-neutral-100 group-disabled:text-neutral-200 dark:text-neutral-400 dark:pressed:bg-neutral-800 dark:group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText] [-webkit-tap-highlight-color:transparent]" />
}
