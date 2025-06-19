import {Meta, StoryObj} from '@storybook/react';
import React, {JSX, useRef} from 'react';
import {useField} from '../';
import {ValidationState} from '@react-types/shared';

interface TextFieldProps {
  label: string,
  value?: string,
  description?: string,
  errorMessage?: string,
  validationState?: ValidationState
}

const TextInputField = (props: TextFieldProps): JSX.Element => {
  const {label, description, errorMessage, validationState} = props;
  const ref = useRef<HTMLInputElement>(null);
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

export const NoError: StoryObj<typeof TextInputField> = {
  render: (args) => <TextInputField {...args} />,
  args: {
    label: 'Test label',
    value: 'Test value',
    description: 'I describe the field.',
    errorMessage: "I'm a helpful error for the field."
  }
};

export const WithError: StoryObj<typeof TextInputField> = {
  render: (args) => <TextInputField {...args} />,
  args: {
    label: 'Test label',
    value: 'Test value',
    description: 'I describe the field.',
    errorMessage: "I'm a helpful error for the field.",
    validationState: 'invalid'
  }
};
