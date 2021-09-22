import {Meta, Story} from '@storybook/react';
import React, {useRef} from 'react';
import {useTextField} from '../';

interface TextFieldProps {
  label: string,
  value?: string
}

const TextInputField = (props: TextFieldProps) => {
  const {label} = props;
  const ref = useRef<HTMLInputElement>();
  const {labelProps, inputProps} = useTextField(props, ref);

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input {...inputProps} ref={ref} />
    </div>
  );
};

const TextAreaField = (props: TextFieldProps) => {
  const {label} = props;
  const ref = useRef<HTMLTextAreaElement>();
  const {labelProps, inputProps} = useTextField({...props, inputElementType: 'textarea'}, ref);

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <textarea {...inputProps} ref={ref} />
    </div>
  );
};

export default {
  title: 'useTextField'
} as Meta;

const TextInputFieldTemplate: Story<TextFieldProps> = (args) => (
  <TextInputField {...args} />
);

const TextAreaFieldTemplate: Story<TextFieldProps> = (args) => (
  <TextAreaField {...args} />
);

export const WithHTMLInputElement = TextInputFieldTemplate.bind({});
WithHTMLInputElement.args = {
  inputElementType: 'input',
  label: 'Test label',
  value: 'Test value'
};

export const WithHTMLTextAreaElement = TextAreaFieldTemplate.bind({});
WithHTMLTextAreaElement.args = {
  inputElementType: 'textarea',
  label: 'Test label',
  value: 'Test value'
};
