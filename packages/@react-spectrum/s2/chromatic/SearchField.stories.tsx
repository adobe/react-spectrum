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
  SearchField,
  Text
} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/SearchField'
};

export default meta;

export const Example = {
  render: (args: any) => <SearchField {...args} />,
  args: {
    label: 'Search'
  }
};

export const CustomWidth = {
  render: (args: any) => <SearchField {...args} styles={style({width: 256})} />,
  args: {
    label: 'Search'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const ContextualHelpExample = {
  render: (args: any) => <SearchField {...args} />,
  args: {
    label: 'Search',
    contextualHelp: (
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
    )
  }
};
