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
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  argTypes: {
    onChange: {table: {category: 'Events'}}
  },
  title: 'S2 Chromatic/TextField'
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Example: Story = {
  render: (args) => <TextField {...args} />,
  args: {
    label: 'Name'
  }
};

export const Validation: Story = {
  render: (args) => (
    <Form>
      <TextField {...args} />
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    ...Example.args,
    isRequired: true
  }
};

export const ContextualHelpExample: Story = {
  render: (args) => (
    <TextField {...args} />
  ),
  args: {
    label: 'Segment',
    contextualHelp: (
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
    )
  }
};

export const TextAreaExample: StoryObj<typeof TextArea> = {
  render: (args) => <TextArea {...args} />,
  args: {
    label: 'Comment'
  }
};

export const CustomWidth: Story = {
  render: (args) => <TextField {...args} styles={style({width: 384})} />,
  args: {
    label: 'Name'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const SmallWidth: Story = {
  render: (args) => <TextField {...args} styles={style({width: 48})} />,
  args: {
    label: 'Name'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const UNSAFEWidth: Story = {
  render: (args) => <TextField {...args} UNSAFE_style={{width: 384}} />,
  args: {
    label: 'Name'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const InForm: Story = {
  render: (args) => (
    <Form>
      <TextField {...args} />
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    ...Example.args,
    isRequired: true
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const FormCustomWidth: Story = {
  render: (args) => (
    <Form styles={style({width: 384})} labelPosition={args.labelPosition}>
      <TextField {...args} />
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    ...Example.args,
    isRequired: true
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};
