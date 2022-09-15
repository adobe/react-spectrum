import {Meta, Story} from '@storybook/react';
import React, {useRef} from 'react';
import {useField} from '../';
import {ValidationState} from '@react-types/shared';

interface TextFieldProps {
  label: string,
  value?: string,
  description?: string,
  errorMessage?: string,
  validationState?: ValidationState
}

const TextInputField = (props: TextFieldProps) => {
  const {label, description, errorMessage, validationState} = props;
  const ref = useRef<HTMLInputElement>();
  const {labelProps, fieldProps, descriptionProps, errorMessageProps} = useField(props);

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input {...fieldProps} ref={ref} />
      <div {...descriptionProps}>{description}</div>
      {validationState === 'invalid' && <div {...errorMessageProps}>{errorMessage}</div>}
    </div>
  );
};

export default {
  title: 'useField'
} as Meta;

const TextInputFieldTemplate: Story<TextFieldProps> = (args) => (
  <TextInputField {...args} />
);

export const NoError = TextInputFieldTemplate.bind({});
NoError.args = {
  label: 'Test label',
  value: 'Test value',
  description: 'I describe the field.',
  errorMessage: 'I\'m a helpful error for the field.'
};

export const WithError = TextInputFieldTemplate.bind({});
WithError.args = {
  label: 'Test label',
  value: 'Test value',
  description: 'I describe the field.',
  errorMessage: 'I\'m a helpful error for the field.',
  validationState: 'invalid'
};
