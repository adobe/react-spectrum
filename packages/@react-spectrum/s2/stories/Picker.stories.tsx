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
  Avatar,
  Button,
  Content,
  ContextualHelp,
  Footer,
  Form,
  Header,
  Heading,
  Link,
  Picker,
  PickerItem,
  PickerProps,
  PickerSection,
  Text
} from '../src';
import {categorizeArgTypes, getActionArgs, StaticColorDecorator} from './utils';
import DeviceDesktopIcon from '../s2wf-icons/S2_Icon_DeviceDesktop_20_N.svg';
import DeviceTabletIcon from '../s2wf-icons/S2_Icon_DeviceTablet_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactElement} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useAsyncList} from '@react-stately/data';

const events = ['onOpenChange', 'onChange', 'onLoadMore'];

const meta: Meta<typeof Picker<any>> = {
  component: Picker,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    children: {table: {disable: true}},
    contextualHelp: {table: {disable: true}},
    defaultSelectedKey: {table: {disable: true}},
    selectedKey: {table: {disable: true}}
  },
  args: {...getActionArgs(events)},
  title: 'Picker'
};

export default meta;
type Story = StoryObj<typeof Picker<any>>;

export const Example: Story = {
  render: (args) => (
    <Picker {...args}>
      <PickerItem>Chocolate</PickerItem>
      <PickerItem>Mint</PickerItem>
      <PickerItem>Strawberry</PickerItem>
      <PickerItem>Vanilla</PickerItem>
      <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
    </Picker>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

export const Sections: Story = {
  render: (args) => (
    <Picker {...args}>
      <PickerSection id="neopolitan">
        <Header>
          <Heading>Neopolitan flavors</Heading>
          <Text slot="description">These flavors are common</Text>
        </Header>
        <PickerItem>Chocolate</PickerItem>
        <PickerItem>Strawberry</PickerItem>
        <PickerItem>Vanilla</PickerItem>
      </PickerSection>
      <PickerSection id="other">
        <Header>
          <Heading>Others</Heading>
          <Text slot="description">These flavors are uncommon</Text>
        </Header>
        <PickerItem>Mint</PickerItem>
        <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
      </PickerSection>
    </Picker>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

interface IExampleItem {
  id: string,
  label: string
}
let items: IExampleItem[] = [
  {id: 'chocolate', label: 'Chocolate'},
  {id: 'strawberry', label: 'Strawberry'},
  {id: 'vanilla', label: 'Vanilla'},
  {id: 'mint', label: 'Mint'},
  {id: 'cookie-dough', label: 'Chocolate Chip Cookie Dough'}
];
export const Dynamic: Story = {
  render: (args) => (
    <Picker {...args}>
      {(item) => <PickerItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</PickerItem>}
    </Picker>
  ),
  args: {
    label: 'Favorite ice cream flavor',
    items
  }
};

export const WithIcons: Story = {
  render: (args) => (
    <Picker {...args}>
      <PickerItem textValue="Illustrator for iPad">
        <DeviceTabletIcon />
        <Text slot="label">Illustrator for iPad</Text>
        <Text slot="description">Share a low-res snapshot</Text>
      </PickerItem>
      <PickerItem textValue="Illustrator for desktop">
        <DeviceDesktopIcon />
        <Text slot="label">Illustrator for desktop</Text>
        <Text slot="description">Share a hi-res</Text>
      </PickerItem>
    </Picker>
  ),
  args: {
    label: 'Where to share'
  }
};

const SRC_URL_1 = 'https://i.imgur.com/xIe7Wlb.png';
const SRC_URL_2 = 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';

export const WithAvatars: Story = {
  render: (args) => (
    <Picker {...args}>
      <PickerItem textValue="User One">
        <Avatar slot="avatar" src={SRC_URL_1} />
        <Text>User One</Text>
        <Text slot="description">user.one@example.com</Text>
      </PickerItem>
      <PickerItem textValue="User Two">
        <Avatar slot="avatar" src={SRC_URL_2} />
        <Text>User Two</Text>
        <Text slot="description">user.two@example.com<br />123-456-7890</Text>
      </PickerItem>
      <PickerItem textValue="User Three">
        <Avatar slot="avatar" src={SRC_URL_2} />
        <Text>User Three</Text>
      </PickerItem>
    </Picker>
  ),
  args: {
    label: 'Share'
  }
};

function VirtualizedPicker(props) {
  let items: IExampleItem[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i.toString(), label: `Item ${i}`});
  }

  return (
    <Picker {...props} items={items}>
      {(item) => <PickerItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</PickerItem>}
    </Picker>
  );
}

export const ManyItems: Story = {
  render: (args) => (
    <VirtualizedPicker {...args} />
  ),
  args: {
    label: 'Many items'
  }
};

const ValidationRender = (props: PickerProps<IExampleItem>): ReactElement => (
  <Form>
    <Picker {...props}>
      {(item) => <PickerItem id={item.id} textValue={item.label}>{item.label}</PickerItem>}
    </Picker>
    <Button type="submit" variant="primary">Submit</Button>
  </Form>
);

export const Validation: StoryObj<typeof ValidationRender> = {
  render: (args) => <ValidationRender {...args} />,
  args: {
    ...Dynamic.args,
    isRequired: true
  }
};

export const CustomWidth: StoryObj<typeof Picker<any>> = {
  render: (args) => (
    <Picker {...args} styles={style({width: 384})}>
      <PickerItem>Chocolate</PickerItem>
      <PickerItem>Mint</PickerItem>
      <PickerItem>Strawberry</PickerItem>
      <PickerItem>Vanilla</PickerItem>
      <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
    </Picker>
  ),
  args: Example.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};

const ContextualHelpExampleRender = (props: PickerProps<any>): ReactElement => (
  <Picker
    {...props}
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
    <PickerItem>Chocolate</PickerItem>
    <PickerItem>Mint</PickerItem>
    <PickerItem>Strawberry</PickerItem>
    <PickerItem>Vanilla</PickerItem>
    <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
  </Picker>
);

export const ContextualHelpExample: StoryObj<typeof ContextualHelpExampleRender> = {
  render: (args) => <ContextualHelpExampleRender {...args} />,
  args: {
    label: 'Ice cream flavor'
  }
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const AsyncPicker = (args: PickerProps<Character> & {delay: number}): ReactElement => {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <Picker {...args} loadingState={list.loadingState} onLoadMore={list.loadMore} items={list.items}>
      {(item: Character) => <PickerItem id={item.name} textValue={item.name}>{item.name}</PickerItem>}
    </Picker>
  );
};

export type AsyncPickerStoryType = typeof AsyncPicker;
export const AsyncPickerStory: StoryObj<AsyncPickerStoryType> = {
  render: AsyncPicker,
  args: {
    ...Example.args,
    label: 'Star Wars Character',
    delay: 50
  },
  name: 'Async loading picker',
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
let list = useAsyncList({
  async load({signal, cursor}) {
    // API call here
    ...
  }
});

return (
  <Picker
    loadingState={list.loadingState}
    onLoadMore={list.loadMore}
    items={list.items}>
    {item => <PickerItem id={item.name} textValue={item.name}>{item.name}</PickerItem>}
  </Picker>
);`;
        }
      }
    }
  }
};
