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
import {ActionGroup} from '../';
import BookIcon from '@spectrum-icons/workflow/Book';
import Brush from '@spectrum-icons/workflow/Brush';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import CopyIcon from '@spectrum-icons/workflow/Copy';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import DocumentIcon from '@spectrum-icons/workflow/Document';
import DrawIcon from '@spectrum-icons/workflow/Draw';
import DuplicateIcon from '@spectrum-icons/workflow/Duplicate';
import {Flex} from '@react-spectrum/layout';
import Heal from '@spectrum-icons/workflow/Heal';
import InfoIcon from '@spectrum-icons/workflow/Info';
import {Item} from '@react-stately/collections';
import MoveIcon from '@spectrum-icons/workflow/MoveTo';
import PropertiesIcon from '@spectrum-icons/workflow/Properties';
import React from 'react';
import Sampler from '@spectrum-icons/workflow/Sampler';
import Select from '@spectrum-icons/workflow/Select';
import SettingsIcon from '@spectrum-icons/workflow/Settings';
import {Text} from '@react-spectrum/text';
import TextIcon from '@spectrum-icons/workflow/Text';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import VectorDraw from '@spectrum-icons/workflow/VectorDraw';
import {View} from '@react-spectrum/view';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';


const viewItems = [{children: 'Grid view', name: '1'}, {children: 'List view', name: '2'}, {children: 'Gallery view', name: '3'}];
let onSelectionChange = action('onSelectionChange');

let iconMap = {
  'Document setup': DocumentIcon,
  'Settings': SettingsIcon,
  'Grid view': ViewGridIcon,
  'List view': ViewListIcon,
  'Gallery view': ViewCardIcon,
  'Edit': DrawIcon,
  'Copy': CopyIcon,
  'Delete': DeleteIcon,
  'Properties': PropertiesIcon,
  'Info': InfoIcon,
  'Keywords': BookIcon
};

export default {
  title: 'ActionGroup',
  component: ActionGroup,
  args: {
    onAction: action('onAction'),
    onSelectionChange: s => onSelectionChange([...s])
  },
  argTypes: {
    onAction: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    disabledKeys: {
      table: {
        disable: true
      }
    },
    items: {
      table: {
        disable: true
      }
    },
    summaryIcon: {
      table: {
        disable: true
      }
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple']
    },
    isDisabled: {
      control: 'boolean'
    },
    density: {
      control: 'select',
      options: ['compact', 'regular', 'spacious']
    },
    isJustified: {
      control: 'boolean'
    },
    isQuiet: {
      control: 'boolean'
    },
    isEmphasized: {
      control: 'boolean'
    },
    disallowEmptySelection: {
      control: 'boolean'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    overflowMode: {
      control: 'select',
      options: ['wrap', 'collapse']
    },
    buttonLabelBehavior: {
      control: 'select',
      options: ['show', 'hide', 'collapse']
    }
  }
} as ComponentMeta<typeof ActionGroup>;

export type ActionGroupStory = ComponentStoryObj<typeof ActionGroup>;

export const Default: ActionGroupStory = {
  args: {items: viewItems},
  render: (args) => render(args)
};

export const FalsyKeys: ActionGroupStory = {
  render: (args) => (
    <ActionGroup {...args}>
      <Item key="add">Add</Item>
      <Item key="">Delete</Item>
      <Item key="edit">Edit</Item>
    </ActionGroup>
  )
};

export const AllKeysDisabled: ActionGroupStory = {
  ...Default,
  args: {disabledKeys: ['1', '2', '3'], items: viewItems}
};

export const SomeKeysDisabled: ActionGroupStory = {
  ...Default,
  args: {disabledKeys: ['1', '2'], items: viewItems}
};

export const StaticColorWhite: ActionGroupStory = {
  args: {staticColor: 'white', defaultSelectedKeys: ['1'], items: viewItems},
  render: (args) => (
    <View backgroundColor="static-blue-700" padding="size-1000">
      {render(args)}
    </View>
  ),
  name: 'staticColor=white'
};

export const StaticColorBlack: ActionGroupStory = {
  args: {staticColor: 'black', defaultSelectedKeys: ['1'], items: viewItems},
  render: (args) => (
    <View backgroundColor="static-yellow-400" padding="size-1000">
      {render(args)}
    </View>
  ),
  name: 'staticColor=black'
};

export const WithTooltips: ActionGroupStory = {
  args: {items: viewItems},
  render: (args) => renderTooltips(args)
};

export const Overflow: ActionGroupStory = {
  args: {disabledKeys: ['1', '5']},
  render: (args) => renderOverflow(args),
  name: 'overflowMode'
};

export const SummaryIcon: ActionGroupStory = {
  ...Overflow,
  args: {disabledKeys: ['1', '5'], summaryIcon: <TextIcon />},
  name: 'summary icon overflow'
};

export const VerticalOverflow: ActionGroupStory = {
  render: (args) => (
    <Flex direction="column">
      <p>Note: this is currently unsupported by Spectrum. Container should scroll.</p>
      <div style={{padding: '10px', resize: 'vertical', overflow: 'auto', width: 32, backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
        {renderTools({orientation: 'vertical', buttonLabelBehavior: 'hide', maxHeight: '100%', ...args})}
      </div>
    </Flex>
  ),
  name: 'special vertical overflow case'
};


function render(props) {
  return (
    <Flex gap="size-300" margin="size-100" width="100%" direction="column">
      {renderText(props)}
      {renderBoth(props)}
      {renderIcons(props)}
    </Flex>
  );
}

function renderText(props) {
  return (
    <ActionGroup {...props}>
      {(item: any) => <Item key={item.name} textValue={item.name}>{item.children}</Item>}
    </ActionGroup>
  );
}

function renderBoth(props) {
  return (
    <ActionGroup {...props}>
      {(item: any) => {
        let IconElement = iconMap[item.children];
        return (
          <Item key={item.name} textValue={item.name} aria-label={item.children}>
            <Text>{item.children}</Text>
            <IconElement />
          </Item>
        );
      }}
    </ActionGroup>
  );
}

function renderIcons(props) {
  return (
    <ActionGroup {...props}>
      {(item: any) => {
        let IconElement = iconMap[item.children];
        return (
          <Item key={item.name} textValue={item.name} aria-label={item.children}>
            <IconElement />
          </Item>
        );
      }}
    </ActionGroup>
  );
}

function renderTooltips(props) {
  return (
    <ActionGroup {...props}>
      {(item: any) => {
        let IconElement = iconMap[item.children];
        return (
          <TooltipTrigger>
            <Item key={item.name} textValue={item.children} aria-label={item.children}>
              <IconElement />
            </Item>
            <Tooltip>{item.children}</Tooltip>
          </TooltipTrigger>
        );
      }}
    </ActionGroup>
  );
}

function renderOverflow(props) {
  return (
    <div style={{padding: '10px', resize: 'both', overflow: 'auto', width: 250, backgroundColor: 'var(--spectrum-global-color-gray-50)'}}>
      <ActionGroup {...props} summaryIcon={<TextIcon />} maxHeight="100%">
        <Item key="1" data-testid="edit">
          <DrawIcon />
          <Text>Edit</Text>
        </Item>
        <Item key="2" data-testid="copy">
          <CopyIcon />
          <Text>Copy</Text>
        </Item>
        <Item key="3" data-testid="delete">
          <DeleteIcon />
          <Text>Delete</Text>
        </Item>
        <Item key="4" data-testid="move">
          <MoveIcon />
          <Text>Move</Text>
        </Item>
        <Item key="5" data-testid="duplicate">
          <DuplicateIcon />
          <Text>Duplicate</Text>
        </Item>
      </ActionGroup>
    </div>
  );
}

function renderTools(props = {}) {
  return (
    <ActionGroup
      aria-label="Tools"
      overflowMode="collapse"
      selectionMode="single"
      disallowEmptySelection
      defaultSelectedKeys={['select']}
      onSelectionChange={action('onSelectionChange')}
      buttonLabelBehavior="hide"
      isEmphasized
      isQuiet
      {...props}>
      <Item key="select">
        <Select />
        <Text>Select</Text>
      </Item>
      <Item key="text">
        <TextIcon />
        <Text>Text</Text>
      </Item>
      <Item key="heal">
        <Heal />
        <Text>Heal</Text>
      </Item>
      <Item key="brush">
        <Brush />
        <Text>Brush</Text>
      </Item>
      <Item key="pen">
        <VectorDraw />
        <Text>Pen</Text>
      </Item>
      <Item key="eyedropper">
        <Sampler />
        <Text>Eye dropper</Text>
      </Item>
    </ActionGroup>
  );
}
