'use client';
import {
  TokenField as AriaTokenField,
  Token as AriaToken,
  TokenFieldProps as AriaTokenFieldProps,
  TokenProps
} from 'react-aria-components/TokenField';
import './TokenField.css';

export interface TokenFieldProps extends AriaTokenFieldProps {
  placeholder?: string;
}

export function TokenField(props: TokenFieldProps) {
  return (
    <AriaTokenField
      {...props}
      data-placeholder={props.placeholder}
      className="react-aria-TokenField inset"
    />
  );
}

export function Token(props: TokenProps) {
  return <AriaToken {...props} />;
}
