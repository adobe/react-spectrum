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

import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content, View} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Flex} from '@react-spectrum/layout';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Picker, Section, SpectrumPickerProps} from '../';
import Paste from '@spectrum-icons/workflow/Paste';
import React,  {useState} from 'react';
import {useAsyncList} from '@react-stately/data';

let flatOptions = [
  {id: 1, name: 'Aardvark'},
  {id: 2, name: 'Kangaroo'},
  {id: 3, name: 'Snake'},
  {id: 4, name: 'Danni'},
  {id: 5, name: 'Devon'},
  {id: 6, name: 'Ross'},
  {id: 7, name: 'Puppy'},
  {id: 8, name: 'Doggo'},
  {id: 9, name: 'Floof'}
];

let longItemText = [
  {id: 'short', name: 'One'},
  {id: 'long', name: 'your text here long long long long'},
  {id: 'underscores', name: 'your_text_here_long_long_long_long'},
  {id: 'hypens', name: 'your-text-here-long-long-long-long'},
  {id: 'singleWord', name: 'supercalifragilisticexpialidocious'},
  {id: 'always', name: 'This item is very long and word wraps poorly'}
];

let falsyKey = [
  {id: '', name: 'None'},
  {id: 'One', name: 'One'},
  {id: 'Two', name: 'Two'},
  {id: 'Three', name: 'Three'}
];

let withSection = [
  {name: 'Animals', children: [
    {name: 'Aardvark'},
    {name: 'Kangaroo'},
    {name: 'Snake'}
  ]},
  {name: 'People', children: [
    {name: 'Danni'},
    {name: 'Devon'},
    {name: 'Ross'}
  ]}
];

export type PickerStory = ComponentStoryObj<typeof Picker>;

export default {
  title: 'Picker',
  component: Picker,
  excludeStories: [],
  args: {
    'label': 'Test',
    onSelectionChange: action('onSelectionChange'),
    onOpenChange: action('onOpenChange')
  },
  argTypes: {
    layout: {
      table: {
        disable: true
      }
    },
    children: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    onOpenChange: {
      table: {
        disable: true
      }
    },
    label: {
      control: 'text'
    },
    description: {
      control: 'text'
    },
    errorMessage: {
      control: 'text'
    },
    isDisabled: {
      control: 'boolean'
    },
    labelAlign: {
      control: 'radio',
      options: ['end', 'start']
    },
    labelPosition: {
      control: 'radio',
      options: ['side', 'top']
    },
    necessityIndicator: {
      control: 'radio',
      options: ['icon', 'label']
    },
    isRequired: {
      control: 'boolean'
    },
    validationState: {
      control: {
        type: 'radio',
        options: [null, 'valid', 'invalid']
      }
    },
    isQuiet: {
      control: 'boolean'
    },
    width: {
      control: {
        type: 'radio',
        options: [null, '100px', '480px', 'size-4600']
      }
    },
    menuWidth: {
      control: {
        type: 'radio',
        options: [null, '100px', '480px', 'size-4600']
      }
    },
    isLoading: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    },
    isOpen: {
      control: 'boolean'
    },
    defaultOpen: {
      control: 'boolean'
    }
  }
} as ComponentMeta<typeof Picker>;

export type DefaultStory = ComponentStoryObj<typeof DefaultPicker>;
export const Default: DefaultStory = {
  render: (args) => <DefaultPicker {...args} />
};

export const Disabled: DefaultStory = {
  render: (args) => <DefaultPicker {...args} disabledKeys={['Short']} />,
  name: 'disabled keys'
};

export const Sections: PickerStory = {
  args: {
    children: (
      <Section title="Animals">
        <Item key="Aardvark">Aardvark</Item>
        <Item key="Kangaroo">Kangaroo</Item>
        <Item key="Snake">Snake</Item>
      </Section>
    )
  }
};

export const Dynamic: PickerStory = {
  args: {
    children: (item: any) => <Item>{item.name}</Item>,
    items: flatOptions
  },
  name: 'dynamic'
};

export const DynamicSections: PickerStory = {
  args: {
    children: (
      (item: any) => (
        <Section key={item.name} items={item.children} title={item.name}>
          {(item: any) => <Item key={item.name}>{item.name}</Item>}
        </Section>
      )
    ),
    items: withSection
  },
  name: 'dynamic with sections'
};

export type ComplexItemsStory = ComponentStoryObj<typeof ComplexItemsPicker>;
export const ComplexItems: ComplexItemsStory = {
  render: (args) => <ComplexItemsPicker {...args} />,
  name: 'complex items'
};

export const LongItemText: PickerStory = {
  args: {
    children: (item: any) => <Item key={item.key}>{item.name}</Item>,
    items: longItemText
  },
  name: 'long item text'
};

export const FalsyKey: PickerStory = {
  args: {
    children: (item: any) => <Item key={item.key}>{item.name}</Item>,
    items: falsyKey
  },
  name: 'falsy item key'
};

export const NoLabel: PickerStory = {
  args: {
    children: (item: any) => <Item>{item.name}</Item>,
    items: flatOptions,
    'aria-label': 'Test',
    label: null
  },
  name: 'no visible label'
};

export const ContextualHelpPicker: PickerStory = {
  args: {
    children: (item: any) => <Item>{item.name}</Item>,
    items: flatOptions,
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )
  },
  name: 'contextual help'
};

export const SelectedKey: PickerStory = {
  args: {
    children: (item: any) => <Item>{item.name}</Item>,
    items: flatOptions,
    selectedKey: 7
  },
  name: 'selectedKey'
};

export const DefaultSelectedKey: PickerStory = {
  args: {
    children: (item: any) => <Item>{item.name}</Item>,
    items: flatOptions,
    defaultSelectedKey: 7
  },
  name: 'defaultSelectedKey (uncontrolled)'
};

export const Loading: PickerStory = {
  args: {
    children: (item: any) => <Item>{item.name}</Item>,
    items: [],
    isLoading: true
  },
  name: 'isLoading, no items'
};

export type AsyncLoadingStory = ComponentStoryObj<typeof AsyncLoadingExample>;
export const AsyncLoading: AsyncLoadingStory = {
  render: (args) => <AsyncLoadingExample {...args} />,
  name: 'async loading'
};

export type FocusStory = ComponentStoryObj<any>;
export const Focus: FocusStory = {
  render: (args) => (
    <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
      <label htmlFor="focus-before">Focus before</label>
      <input id="focus-before" data-testid="before" />
      <Picker {...args} label="Focus-Test" items={flatOptions} onFocus={action('focus')} onBlur={action('blur')} onKeyDown={action('keydown')} onKeyUp={action('keyup')}>
        {(item: any) => <Item>{item.name}</Item>}
      </Picker>
      <label htmlFor="focus-after">Focus after</label>
      <input id="focus-after" data-testid="after" />
    </div>
  ),
  name: 'keyboard tab focus'
};

export type ResizePickerStory = ComponentStoryObj<typeof ResizePicker>;
export const Resize: ResizePickerStory = {
  render: (args) => <ResizePicker {...args} />,
  name: 'resize'
};

export type ScrollingStory = ComponentStoryObj<any>;
export const Scrolling: ScrollingStory = {
  render: (args) => (
    <View width="300px" height="size-500" overflow="auto">
      <View width="500px">
        <Picker {...args} label="Test">
          <Item key="One">One</Item>
          <Item key="Two">Two</Item>
          <Item key="Three">Three</Item>
        </Picker>
      </View>
    </View>
  ),
  name: 'scrolling container'
};

function DefaultPicker(props: SpectrumPickerProps<object>) {
  return (
    <Picker {...props}>
      <Item key="Short">Short</Item>
      <Item key="Normal">Normal</Item>
      <Item key="This item is very long and word wraps poorly">This item is very long and word wraps poorly</Item>
    </Picker>
  );
}

function ComplexItemsPicker(props: SpectrumPickerProps<object>) {
  return (
    <Picker {...props}>
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
      </Section>
    </Picker>
  );
}

function AsyncLoadingExample(props) {
  interface Pokemon {
    name: string,
    url: string
  }

  let list = useAsyncList<Pokemon>({
    async load({signal, cursor}) {
      let res = await fetch(cursor || 'https://pokeapi.co/api/v2/pokemon', {signal});
      let json = await res.json();
      // The API is too fast sometimes, so make it take longer so we can see the spinner
      await new Promise(resolve => setTimeout(resolve, cursor ? 500 : 1000));
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <Picker {...props} label="Pick a Pokemon" items={list.items} isLoading={list.isLoading} onLoadMore={list.loadMore}>
      {(item: any) => <Item key={item.name}>{item.name}</Item>}
    </Picker>
  );
}

function ResizePicker(props) {
  const [state, setState] = useState(true);

  return (
    <Flex direction="column" gap="size-200" alignItems="start">
      <div style={{width: state ? '200px' : '300px'}}>
        <Picker {...props} label="Choose A" width="100%">
          <Item key="A1">A1</Item>
          <Item key="A2">A2</Item>
          <Item key="A3">A3</Item>
        </Picker>
      </div>
      <ActionButton onPress={() => setState(!state)}>Toggle size</ActionButton>
    </Flex>
  );
}
