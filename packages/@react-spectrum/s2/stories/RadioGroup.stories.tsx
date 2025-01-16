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

import {
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Link,
  Radio,
  RadioGroup,
  Text
} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onChange: {table: {category: 'Events'}}
  },
  title: 'RadioGroup'
};

export default meta;

export const Example = (args: any) => (
  <RadioGroup {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="football" isDisabled>Football</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: 'Favorite sport'
};

export const LongLabel = (args: any) => (
  <RadioGroup styles={style({maxWidth: 128})} {...args}>
    <Radio value="longLabel">Radio with very long label so we can see wrapping</Radio>
  </RadioGroup>
);

LongLabel.parameters = {
  docs: {
    disable: true
  }
};

export const ErrorAndDescription = (args: any) => (
  <RadioGroup {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="football" isDisabled>Football</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

ErrorAndDescription.args = {
  label: 'Favorite sport',
  description: 'A long description to test help text wrapping.',
  errorMessage: 'A long error message to test help text wrapping. Only shows when invalid is set which makes it red too!'
};

ErrorAndDescription.parameters = {
  docs: {
    disable: true
  }
};

export const ContextualHelpExample = (args: any) => (
  <RadioGroup
    {...args}
    contextualHelp={
      <ContextualHelp>
        <Heading>Sports</Heading>
        <Content>
          <Text>
            Social games we paly to have fun and stay healthy.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://en.wikipedia.org/wiki/Sport"
            target="_blank">Learn more about sports</Link>
        </Footer>
      </ContextualHelp>
    }>
    <Radio isDisabled value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="football">Football</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

ContextualHelpExample.args = {
  label: 'Favorite sports'
};
