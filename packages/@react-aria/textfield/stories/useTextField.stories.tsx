import {Meta, StoryObj} from '@storybook/react';
import React, {JSX, useRef} from 'react';
import {useTextField} from '../';

interface TextFieldProps {
  label: string,
  value?: string,
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters'
}

const TextInputField = (props: TextFieldProps): JSX.Element => {
  const {label} = props;
  const ref = useRef<HTMLInputElement>(null);
  const {labelProps, inputProps} = useTextField(props, ref);

  return (
    <div>
      <label {...labelProps}>{label}</label>
      <input {...inputProps} ref={ref} />
    </div>
  );
};

const TextAreaField = (props: TextFieldProps): JSX.Element => {
  const {label} = props;
  const ref = useRef<HTMLTextAreaElement>(null);
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

export const WithHTMLInputElement: StoryObj<typeof TextInputField> = {
  render: (args) => <TextInputField {...args} />,
  args: {
    label: 'Test label',
    value: 'Test value'
  }
};

export const WithHTMLTextAreaElement: StoryObj<typeof TextAreaField> = {
  render: (args) => <TextAreaField {...args} />,
  args: {
    label: 'Test label',
    value: 'Test value'
  }
};

export const WithAutoCapitalization: StoryObj<typeof TextInputField> = {
  render: (args) => <TextInputField {...args} />,
  args: {
    label: 'Test label',
    autoCapitalize: undefined
  },
  argTypes: {
    autoCapitalize: {
      options: [undefined, 'off', 'none', 'on', 'sentences', 'words', 'characters']
    }
  }
};

