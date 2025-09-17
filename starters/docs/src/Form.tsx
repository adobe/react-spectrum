'use client';
import {
  Form as RACForm,
  FormProps,
  LabelProps,
  Label as RACLabel,
  FieldErrorProps,
  FieldError as RACFieldError,
  ButtonProps,
  Button
} from 'react-aria-components';
import './Form.css';

export function Form(props: FormProps) {
  return <RACForm {...props} />;
}

export function Label(props: LabelProps) {
  return <RACLabel {...props} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} />;
}

export function FieldButton(props: ButtonProps) {
  return <Button {...props} className="field-Button" />;
}
