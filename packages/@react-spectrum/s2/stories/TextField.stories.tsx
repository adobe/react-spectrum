/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
