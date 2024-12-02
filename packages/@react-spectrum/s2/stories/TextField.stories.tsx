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

import {Button, Form, TextArea, TextField} from '../src';
import {Content, Footer, Heading, Text} from '../src/Content';
import {ContextualHelp} from '../src/ContextualHelp';
import {Link} from '../src/Link';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {table: {category: 'Events'}}
  },
  title: 'TextField'
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

export const ContextualHelpExample = (args: any) => (
  <TextField 
    {...args}
    contextualHelp={
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>
          <Text>
            Segments identify who your visitors are, what devices and services they
            use, where they navigated from, and much more.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://experienceleague.adobe.com/en/docs/experience-manager-65/content/sites/administering/personalization/campaign-segmentation"
            target="_blank">Learn more about segments</Link>
        </Footer>
      </ContextualHelp>
    } />
);

ContextualHelpExample.args = {
  label: 'Segment'
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
