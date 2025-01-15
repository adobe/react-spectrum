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

import {Content, Footer, Heading, Text} from '../src/Content';
import {ContextualHelp} from '../src/ContextualHelp';
import {Link} from '../src/Link';
import type {Meta} from '@storybook/react';
import {RangeSlider} from '../src';

const meta: Meta<typeof RangeSlider> = {
  component: RangeSlider,
  parameters: {
    layout: 'centered',
    controls: {exclude: ['onChange']}
  },
  tags: ['autodocs'],
  argTypes: {
    onChangeEnd: {table: {category: 'Events'}}
  },
  title: 'RangeSlider'
};

export default meta;

export const Example = (args: any) => <RangeSlider {...args} />;

Example.args = {
  label: 'Range',
  defaultValue: {
    start: 30,
    end: 60
  }
};

export const ContextualHelpExample = (args: any) => (
  <RangeSlider
    {...args}
    contextualHelp={
      <ContextualHelp>
        <Heading>What is a ice cream?</Heading>
        <Content>
          <Text>
            A combination of sugar, eggs, milk, and cream is cooked to make
            a custard base. Then, flavorings are added, and this flavored
            mixture is carefully churned and frozen to make ice cream.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://en.wikipedia.org/wiki/Ice_cream"
            target="_blank">Learn more about ice cream</Link>
        </Footer>
      </ContextualHelp>
    } />
);

ContextualHelpExample.args = {
  label: 'Range',
  defaultValue: {
    start: 30,
    end: 60
  }
};
