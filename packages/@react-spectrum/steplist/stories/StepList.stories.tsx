/*
 * Copyright 2023 Adobe. All rights reserved.
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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Item} from '@react-stately/collections';
import React from 'react';
import {SpectrumStepListProps} from '@react-types/steplist';
import {StepList} from '../';
import {useAsyncList} from '@react-stately/data';

const options = [{
  key: 'details', value: 'Details'
}, {
  key: 'select-offers', value: 'Select offers'
}, {
  key: 'fallback-offer', value: 'Fallback offer'
}, {
  key: 'summary', value: 'Summary'
}];

export default {
  title: 'StepList',
  component: StepList,
  args: {
    onSelectionChange: action('onAction')
  },
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    isEmphasized: {
      control: {
        type: 'boolean'
      }
    },
    isReadOnly: {
      control: {
        type: 'boolean'
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    orientation: {
      control: {
        type: 'inline-radio',
        options: ['horizontal', 'vertical']
      }
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['S', 'M', 'L', 'XL']
      }
    }
  }
} as ComponentMeta<typeof StepList>;

function DefaultStepList(props: SpectrumStepListProps<object>) {
  return (
    <StepList {...props}>
      {options.map((o) => <Item key={o.key}>{o.value}</Item>)}
    </StepList>
  );
}

function AsyncStepListItems(props: SpectrumStepListProps<object>) {
  type PokeMon = { name: string };
  let list = useAsyncList<PokeMon>({
    async load({signal}) {
      let res = await fetch('https://pokeapi.co/api/v2/pokemon', {signal});
      let json = await res.json();
      return {items: json.results.slice(0, 8)};
    }
  });
  return (
    <StepList {...props} items={list.items}>
      {(item: PokeMon) => <Item href="adobe.com" key={item.name}>{item.name}</Item>}
    </StepList>
  );
}

export type DefaultStory = ComponentStoryObj<typeof DefaultStepList>;
export type StepListStory = ComponentStoryObj<typeof StepList>;
export type AsyncItemsStory = ComponentStoryObj<typeof AsyncStepListItems>;

export const Default: DefaultStory = {
  render: (args) => <DefaultStepList {...args} />
};

export const Vertical: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    orientation: 'vertical'
  },
  name: 'Vertical'
};

export const IsReadOnly: DefaultStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key,
    isReadOnly: true
  },
  name: 'isReadOnly'
};

export const Disabled: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key,
    isEmphasized: true
  },
  name: 'isEmphasized'
};

export const DisabledKeys: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    defaultSelectedKey: options[1].key,
    defaultLastCompletedStep: options[1].key,
    disabledKeys: options.map(o => o.key)
  },
  name: 'disabledKeys'
};

export const SelectedKey: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    selectedKey: options[1].key
  },
  name: 'selectedKey'
};

export const AsyncItems: AsyncItemsStory = {
  render: (args) => <AsyncStepListItems {...args} />,
  name: 'Async Items'
};

export const SmallSize: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    size: 'S'
  },
  name: 'Small Size'
};

export const SmallSizeVertical: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    orientation: 'vertical',
    size: 'S'
  },
  name: 'Small Size Vertical'
};

export const LargeSize: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    size: 'L'
  },
  name: 'Large Size'
};

export const LargeSizeVertical: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    orientation: 'vertical',
    size: 'L'
  },
  name: 'Large Size Vertical'
};

export const ExtraLargeSize: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    size: 'XL'
  },
  name: 'Extra Large Size'
};

export const ExtraLargeSizeVertical: StepListStory = {
  args: {
    children: options.map((o) => <Item key={o.key}>{o.value}</Item>),
    orientation: 'vertical',
    size: 'XL'
  },
  name: 'Extra Large Size Vertical'
};
