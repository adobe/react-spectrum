'use client';
import {
  TokenField as AriaTokenField,
  TokenInput as AriaTokenInput,
  Token as AriaToken,
  TokenFieldProps as AriaTokenFieldProps,
  TokenInputProps,
  TokenProps
} from 'react-aria-components/TokenField';
import {Label, Description} from './Form';
import './TokenField.css';
import type React from 'react';

export interface TokenFieldProps extends Omit<AriaTokenFieldProps, 'children'> {
  label?: string;
  description?: string;
  placeholder?: string;
  inputRef?: React.Ref<HTMLDivElement>;
  children: TokenInputProps['children'];
}

export function TokenField({
  label,
  description,
  placeholder,
  inputRef,
  style,
  children,
  ...props
}: TokenFieldProps) {
  return (
    <AriaTokenField {...props}>
      {label && <Label>{label}</Label>}
      <AriaTokenInput
        ref={inputRef}
        style={style}
        data-placeholder={placeholder}
        className="react-aria-TokenInput inset">
        {children}
      </AriaTokenInput>
      {description && <Description>{description}</Description>}
    </AriaTokenField>
  );
}

export function Token(props: TokenProps) {
  return <AriaToken {...props} />;
}
