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

import {Avatar, Button, ComboBox, ComboBoxItem, ComboBoxSection, Content, ContextualHelp, Footer, Form, Header, Heading, Link, Text} from '../src';
import {categorizeArgTypes, getActionArgs} from './utils';
import {ComboBoxProps} from 'react-aria-components';
import DeviceDesktopIcon from '../s2wf-icons/S2_Icon_DeviceDesktop_20_N.svg';
import DeviceTabletIcon from '../s2wf-icons/S2_Icon_DeviceTablet_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactElement, useState} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useAsyncList} from 'react-stately';

const events = ['onInputChange', 'onOpenChange', 'onSelectionChange', 'onLoadMore'];

const meta: Meta<typeof ComboBox<any>> = {
  component: ComboBox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    children: {table: {disable: true}},
    contextualHelp: {table: {disable: true}},
    placeholder: {control: {type: 'text'}}
  },
  args: {
    ...getActionArgs(events),
    placeholder: 'Select a value'
  },
  title: 'ComboBox'
};

export default meta;
type Story = StoryObj<typeof ComboBox<any>>;

export const Example: Story = {
  render: (args: ComboBoxProps<any>) => (
    <ComboBox {...args}>
      <ComboBoxItem>Chocolate</ComboBoxItem>
      <ComboBoxItem>Mint</ComboBoxItem>
      <ComboBoxItem>Strawberry</ComboBoxItem>
      <ComboBoxItem>Vanilla</ComboBoxItem>
      <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

export const Sections: Story = {
  render: (args) => (
    <ComboBox {...args}>
      <ComboBoxSection id="neopolitan">
        <Header>
          <Heading>Neopolitan flavors</Heading>
          <Text slot="description">These flavors are common</Text>
        </Header>
        <ComboBoxItem>Chocolate</ComboBoxItem>
        <ComboBoxItem>Strawberry</ComboBoxItem>
        <ComboBoxItem>Vanilla</ComboBoxItem>
      </ComboBoxSection>
      <ComboBoxSection id="other">
        <Header>
          <Heading>Others</Heading>
          <Text slot="description">These flavors are uncommon</Text>
        </Header>
        <ComboBoxItem>Mint</ComboBoxItem>
        <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
      </ComboBoxSection>
    </ComboBox>
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
    <ComboBox {...args}>
      {(item) => <ComboBoxItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</ComboBoxItem>}
    </ComboBox>
  ),
  args: {
    label: 'Favorite ice cream flavor',
    defaultItems: items
  }
};

function VirtualizedCombobox(props) {
  let items: IExampleItem[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i.toString(), label: `Item ${i}`});
  }

  return (
    <ComboBox {...props} defaultItems={items}>
      {(item) => <ComboBoxItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</ComboBoxItem>}
    </ComboBox>
  );
}

export const ManyItems: Story = {
  render: (args) => (
    <VirtualizedCombobox {...args} />
  ),
  args: {
    label: 'Many items'
  }
};

export const WithIcons: Story = {
  render: (args) => (
    <ComboBox {...args}>
      <ComboBoxItem textValue="Illustrator for iPad">
        <DeviceTabletIcon />
        <Text slot="label">Illustrator for iPad</Text>
        <Text slot="description">Share a low-res snapshot</Text>
      </ComboBoxItem>
      <ComboBoxItem textValue="Illustrator for desktop">
        <DeviceDesktopIcon />
        <Text slot="label">Illustrator for desktop</Text>
        <Text slot="description">Share a hi-res</Text>
      </ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Where to share'
  }
};

const SRC_URL_1 = 'https://i.imgur.com/xIe7Wlb.png';
const SRC_URL_2 = 'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';

export const WithAvatars: Story = {
  render: (args) => (
    <ComboBox {...args}>
      <ComboBoxItem textValue="User One">
        <Avatar slot="avatar" src={SRC_URL_1} />
        <Text slot="label">User One</Text>
        <Text slot="description">user.one@example.com</Text>
      </ComboBoxItem>
      <ComboBoxItem textValue="User Two">
        <Avatar slot="avatar" src={SRC_URL_2} />
        <Text slot="label">User Two</Text>
        <Text slot="description">user.two@example.com<br />123-456-7890</Text>
      </ComboBoxItem>
      <ComboBoxItem textValue="User Three">
        <Avatar slot="avatar" src={SRC_URL_2} />
        <Text slot="label">User Three</Text>
      </ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Share'
  }
};

export const Validation: Story = {
  render: (args) => (
    <Form>
      <ComboBox {...args}>
        {(item) => <ComboBoxItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</ComboBoxItem>}
      </ComboBox>
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    ...Dynamic.args,
    isRequired: true
  }
};

export const ContextualHelpExample: Story = {
  render: (args) => (
    <ComboBox
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
      <ComboBoxItem>Chocolate</ComboBoxItem>
      <ComboBoxItem>Mint</ComboBoxItem>
      <ComboBoxItem>Strawberry</ComboBoxItem>
      <ComboBoxItem>Vanilla</ComboBoxItem>
      <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

export const CustomWidth: Story = {
  render: (args) => (
    <ComboBox {...args} styles={style({width: 384})}>
      <ComboBoxItem>Chocolate</ComboBoxItem>
      <ComboBoxItem>Mint</ComboBoxItem>
      <ComboBoxItem>Strawberry</ComboBoxItem>
      <ComboBoxItem>Vanilla</ComboBoxItem>
      <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
    </ComboBox>
  ),
  args: Example.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const AsyncComboBox = (args: ComboBoxProps<Character> & {delay: number, label: string}): ReactElement => {
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ComboBox
      {...args}
      styles={style({marginBottom: 40})}
      items={list.items}
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}>
      {(item: Character) => <ComboBoxItem id={item.name} textValue={item.name}>{item.name}</ComboBoxItem>}
    </ComboBox>
  );
};

export type AsyncComboBoxStoryType = typeof AsyncComboBox;
export const AsyncComboBoxStory: StoryObj<AsyncComboBoxStoryType> = {
  render: AsyncComboBox,
  args: {
    ...Example.args,
    label: 'Star Wars Character Lookup',
    delay: 50
  },
  name: 'Async loading combobox',
  parameters: {
    docs: {
      source: {
        transform: () => {
          return `
let list = useAsyncList({
  async load({signal, cursor, filterText}) {
    // API call here
    ...
  }
});

return (
  <ComboBox
    items={list.items}
    inputValue={list.filterText}
    onInputChange={list.setFilterText}
    loadingState={list.loadingState}
    onLoadMore={list.loadMore}>
    {(item: Character) => <ComboBoxItem id={item.name} textValue={item.name}>{item.name}</ComboBoxItem>}
  </ComboBox>
);`;
        }
      }
    }
  }
};

export const EmptyCombobox: Story = {
  render: (args) => (
    <ComboBox {...args}>
      {[]}
    </ComboBox>
  ),
  args: Example.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};

export function WithCreateOption() {
  let [inputValue, setInputValue] = useState('');

  return (
    <ComboBox
      label="Favorite Animal"
      placeholder="Select an animal"
      inputValue={inputValue}
      onInputChange={setInputValue}>
      {inputValue.length > 0 && (
        <ComboBoxItem onAction={() => alert('hi')}>
          {`Create "${inputValue}"`}
        </ComboBoxItem>
      )}
      <ComboBoxItem>Aardvark</ComboBoxItem>
      <ComboBoxItem>Cat</ComboBoxItem>
      <ComboBoxItem>Dog</ComboBoxItem>
      <ComboBoxItem>Kangaroo</ComboBoxItem>
      <ComboBoxItem>Panda</ComboBoxItem>
      <ComboBoxItem>Snake</ComboBoxItem>
    </ComboBox>
  );
}
