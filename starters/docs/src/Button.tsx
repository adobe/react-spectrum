'use client';
import {Button as RACButton, ButtonProps} from 'react-aria-components';
import './Button.css';

export function Button(props: ButtonProps) {
  return <RACButton {...props} />;
}
