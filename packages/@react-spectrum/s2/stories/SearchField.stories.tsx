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

import {categorizeArgTypes} from './utils';
import {
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Link,
  SearchField,
  Text
} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onChange', 'onClear', 'onSubmit'])
  },
  title: 'SearchField'
};

export default meta;

export const Example = (args: any) => <SearchField {...args} />;

Example.args = {
  label: 'Search'
};

export const CustomWidth = (args: any) => <SearchField {...args} styles={style({width: 256})} />;

CustomWidth.args = {
  label: 'Search'
};
CustomWidth.parameters = {
  docs: {
    disable: true
  }
};

export const ContextualHelpExample = (args: any) => (
  <SearchField
    {...args}
    contextualHelp={
      <ContextualHelp>
        <Heading>Search tips</Heading>
        <Content>
          <Text>
            You can use modifiers like "date:" and "from:" to search by specific attributes.
          </Text>
        </Content>
        <Footer>
          <Link
            isStandalone
            href="https://react-spectrum.adobe.com/"
            target="_blank">React Spectrum</Link>
        </Footer>
      </ContextualHelp>
    } />
);

ContextualHelpExample.args = {
  label: 'Search'
};
