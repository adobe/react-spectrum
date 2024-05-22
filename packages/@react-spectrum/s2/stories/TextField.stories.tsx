import {TextArea, TextField, Form, Button} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <TextField {...args} />;

Example.args = {
  label: 'Name'
};

export const Validation = (args: any) => (
  <Form>
    <TextField {...args} />
    <Button type="submit" variant="primary">Submit</Button>
  </Form>
);

Validation.args = {
  ...Example.args,
  isRequired: true
};

export const TextAreaExample = (args: any) => <TextArea {...args} />;
TextAreaExample.args = {
  label: 'Comment'
};

export const CustomWidth = (args: any) => <TextField {...args} styles={style({width: 384})} />;

CustomWidth.args = {
  label: 'Name'
};
CustomWidth.parameters = {
  docs: {
    disable: true
  }
};

export const SmallWidth = (args: any) => <TextField {...args} styles={style({width: 48})} />;

SmallWidth.args = {
  label: 'Name'
};
SmallWidth.parameters = {
  docs: {
    disable: true
  }
};

export const UNSAFEWidth = (args: any) => <TextField {...args} UNSAFE_style={{width: 384}} />;

UNSAFEWidth.args = {
  label: 'Name'
};
UNSAFEWidth.parameters = {
  docs: {
    disable: true
  }
};

export const InForm = (args: any) => (
  <Form>
    <TextField {...args} />
    <Button type="submit" variant="primary">Submit</Button>
  </Form>
);

InForm.args = {
  ...Example.args,
  isRequired: true
};
InForm.parameters = {
  docs: {
    disable: true
  }
};

export const FormCustomWidth = (args: any) => (
  <Form styles={style({width: 384})} labelPosition={args.labelPosition}>
    <TextField {...args} />
    <Button type="submit" variant="primary">Submit</Button>
  </Form>
);

FormCustomWidth.args = {
  ...Example.args,
  isRequired: true
};
FormCustomWidth.parameters = {
  docs: {
    disable: true
  }
};
