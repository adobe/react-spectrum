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

import {action} from '@storybook/addon-actions';
import {
  Avatar,
  Content,
  ContextualHelp,
  Footer,
  Heading,
  Image,
  Link,
  Tag,
  TagGroup,
  Text
} from '../src';
import type {Meta} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof TagGroup<any>> = {
  component: TagGroup,
  parameters: {
    layout: 'centered'
  },
  args: {
    onRemove: undefined,
    selectionMode: 'single'
  },
  argTypes: {
    onRemove: {
      control: {type: 'boolean'}
    },
    onSelectionChange: {table: {category: 'Events'}}
  },
  tags: ['autodocs'],
  title: 'TagGroup'
};

export default meta;

export let Example = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }
    return (
      <div style={{width: 320, resize: 'horizontal', overflow: 'hidden', padding: 4}}>
        <TagGroup {...args}>
          <Tag id="chocolate">Chocolate</Tag>
          <Tag>Mint</Tag>
          <Tag>Strawberry</Tag>
          <Tag>Vanilla</Tag>
          <Tag>Cookie dough</Tag>
          <Tag>Rose</Tag>
          <Tag>Nutella</Tag>
          <Tag>Pistachio</Tag>
          <Tag>Oreo</Tag>
          <Tag>Caramel</Tag>
          <Tag>Peanut butter</Tag>
          <Tag>Cinnamon</Tag>
          <Tag>Cardamom</Tag>
          <Tag>Licorice</Tag>
          <Tag>Marshmallow</Tag>
          <Tag>Coffee</Tag>
          <Tag>Toffee</Tag>
          <Tag>Bubblegum</Tag>
          <Tag>Peach</Tag>
          <Tag>Raspberry</Tag>
          <Tag>Strawberry</Tag>
          <Tag>Blackberry</Tag>
        </TagGroup>
      </div>
    );
  },
  args: {
    label: 'Ice cream flavor',
    errorMessage: 'You must love ice cream',
    description: 'Pick a flavor'
  }
};

interface ITagItem {
  name: string,
  id: string
}
let items: Array<ITagItem> = [
  {name: 'Chocolate', id: 'chocolate'},
  {name: 'Mint', id: 'mint'},
  {name: 'Strawberry', id: 'strawberry'},
  {name: 'Vanilla', id: 'vanilla'},
  {name: 'Coffee', id: 'coffee'}
];
export let Dynamic = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }
    return (
      <div style={{width: 320, resize: 'horizontal', overflow: 'hidden', padding: 4}}>
        <TagGroup {...args} items={items}>
          {(item: ITagItem) => <Tag>{item.name}</Tag>}
        </TagGroup>
      </div>
    );
  },
  args: {
    'aria-label': 'Ice cream flavor',
    errorMessage: 'You must love ice cream',
    description: 'Pick a flavor'
  }
};

const SRC_URL_1 =
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';

export let Disabled = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }

    return (
      <TagGroup {...args} disabledKeys={new Set(['mint', 'vanilla'])} styles={style({width: 320})}>
        <Tag id="chocolate" textValue="chocolate"><NewIcon /><Text>Chocolate</Text></Tag>
        <Tag id="mint">Mint</Tag>
        <Tag id="strawberry">
          <Avatar alt="default adobe" src={SRC_URL_1} />
          <Text>
            Strawberry
          </Text>
        </Tag>
        <Tag id="vanilla">Vanilla</Tag>
        <Tag id="coffee">
          <Image
            src="https://random.dog/1a0535a6-ca89-4059-9b3a-04a554c0587b.jpg"
            alt="Shiba Inu with glasses" />
          <Text>
            Coffee
          </Text>
        </Tag>
      </TagGroup>
    );
  },
  args: {
    label: 'Ice cream flavor'
  }
};

function renderEmptyState() {
  return (
    <span>
      No categories. <Link href="https://react-spectrum.adobe.com/">Click here</Link> to add some.
    </span>
  );
}
export let Empty = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }

    return (
      <TagGroup {...args} renderEmptyState={renderEmptyState} />
    );
  },
  args: {
    label: 'Ice cream flavor'
  }
};
export let DefaultEmpty = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }

    return (
      <TagGroup {...args} />
    );
  },
  args: {
    label: 'Ice cream flavor'
  }
};

export let Links = {
  render: (args: any) => {
    return (
      <TagGroup {...args} disabledKeys={new Set(['google'])}>
        <Tag id="adobe" href="https://adobe.com">Adobe</Tag>
        <Tag id="google">Google</Tag>
        <Tag id="apple" href="https://apple.com">Apple</Tag>
      </TagGroup>
    );
  },
  args: {
    label: 'Tags as links',
    selectionMode: 'none'
  }
};

export const ContextualHelpExample = {
  render: (args: any) => {
    if (args.onRemove) {
      args.onRemove = action('remove');
    }
    return (
      <TagGroup
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
        }>
        <Tag>Chocolate</Tag>
        <Tag>Mint</Tag>
        <Tag>Strawberry</Tag>
        <Tag>Vanilla</Tag>
      </TagGroup>
    );
  },
  args: {
    label: 'Ice cream flavor'
  }
};
