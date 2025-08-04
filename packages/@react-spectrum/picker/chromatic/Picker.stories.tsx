/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import {Avatar} from '@react-spectrum/avatar';
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Picker, Section} from '../';
import {Meta, StoryObj} from '@storybook/react';
import Paste from '@spectrum-icons/workflow/Paste';
import React, {JSX} from 'react';
import {SpectrumPickerProps} from '@react-types/select';

const meta: Meta<SpectrumPickerProps<object>> = {
  title: 'Picker',
  component: Picker,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['medium'], disableAnimations: true},
    // chromatic needs a bit more time than disableAnimations allows
    chromatic: {delay: 1200}
  },
  decorators: [Story => <div style={{height: '400px'}}><Story /></div>]
};

export default meta;

export type PickerStory = StoryObj<SpectrumPickerProps<object>>;

const Template = (args: SpectrumPickerProps<object>): JSX.Element => (
  <Picker {...args}>
    <Section title="Animals">
      <Item key="Aardvark">Aardvark</Item>
      <Item key="Kangaroo">Kangaroo</Item>
      <Item key="Snake">Snake</Item>
    </Section>
    <Section title="People">
      <Item key="Danni">Danni</Item>
      <Item key="Devon">Devon</Item>
      <Item key="Ross">Ross</Item>
    </Section>
  </Picker>
);

const ComplexItemsTemplate = (args: SpectrumPickerProps<object>): JSX.Element => (
  <Picker {...args}>
    <Section title="Section 1">
      <Item textValue="Copy">
        <Copy />
        <Text>Copy</Text>
      </Item>
      <Item textValue="Cut">
        <Cut />
        <Text>Cut</Text>
      </Item>
      <Item textValue="Paste">
        <Paste />
        <Text>Paste</Text>
      </Item>
    </Section>
    <Section title="Section 2">
      <Item textValue="Puppy">
        <AlignLeft />
        <Text>Puppy</Text>
        <Text slot="description">Puppy description super long as well geez</Text>
      </Item>
      <Item textValue="Doggo with really really really long long long text">
        <AlignCenter />
        <Text>Doggo with really really really long long long text</Text>
      </Item>
      <Item textValue="Floof">
        <AlignRight />
        <Text>Floof</Text>
      </Item>
      <Item textValue="User">
        <Avatar src="https://i.imgur.com/kJOwAdv.png" />
        <Text>User</Text>
      </Item>
    </Section>
  </Picker>
);
export const Default: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {label: 'Pick your favorite', isOpen: true}
};

export const Disabled: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, isDisabled: true}
};

export const LabelAlignEnd: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, labelAlign: 'end'}
};

export const LabelPositionSide: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, labelPosition: 'side'}
};

export const ValidationStateInvalid: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, isInvalid: true}
};

export const ComplexItems: PickerStory = {
  render: (args) => <ComplexItemsTemplate {...args} />,
  args: {...Default.args},
  parameters: {
    chromaticProvider: {
      express: false
    }
  }
};

export const ComplexItemsExpress: PickerStory = {
  render: (args) => <ComplexItemsTemplate {...args} />,
  args: {...Default.args},
  parameters: {
    chromaticProvider: {
      express: true
    }
  }
};

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>
      Segments identify who your visitors are, what devices and services they use, where they
      navigated from, and much more.
    </Content>
  </ContextualHelp>
);

export const _ContextualHelp: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, contextualHelp}
};

export const ContextualHelpSideLabel: PickerStory = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, contextualHelp, labelPosition: 'side'}
};
