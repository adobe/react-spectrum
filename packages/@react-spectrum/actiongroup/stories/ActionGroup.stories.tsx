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
import TagBold from '@spectrum-icons/workflow/TagBold';
import TagItalic from '@spectrum-icons/workflow/TagItalic';
import TagUnderline from '@spectrum-icons/workflow/TagUnderline';
import {Text} from '@react-spectrum/text';
import TextAlignCenter from '@spectrum-icons/workflow/TextAlignCenter';
import TextAlignJustify from '@spectrum-icons/workflow/TextAlignJustify';
import TextAlignLeft from '@spectrum-icons/workflow/TextAlignLeft';
import TextAlignRight from '@spectrum-icons/workflow/TextAlignRight';
import TextIcon from '@spectrum-icons/workflow/Text';
import TextStrikethrough from '@spectrum-icons/workflow/TextStrikethrough';
import TextStyle from '@spectrum-icons/workflow/TextStyle';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import VectorDraw from '@spectrum-icons/workflow/VectorDraw';
import {View} from '@react-spectrum/view';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';

const docItems = [
  {children: 'Document setup', name: '1'},
  {children: 'Settings', name: '2'}
];
const editItems = [
  {children: 'Edit', name: '1'},
  {children: 'Copy', name: '2'},
  {children: 'Delete', name: '3'}
];
const viewItems2 = [
  {children: 'Grid view', name: '1'},
  {children: 'List view', name: '2'}
];
const viewItems = [
  {children: 'Grid view', name: '1'},
  {children: 'List view', name: '2'},
  {children: 'Gallery view', name: '3'}
];
const dataItems = [
  {children: 'Properties', name: '1'},
  {children: 'Info', name: '2'},
  {children: 'Keywords', name: '3'}
];
let onSelectionChange = action('onSelectionChange');

let iconMap = {
  'Document setup': DocumentIcon,
  Settings: SettingsIcon,
  'Grid view': ViewGridIcon,
  'List view': ViewListIcon,
  'Gallery view': ViewCardIcon,
  Edit: DrawIcon,
  Copy: CopyIcon,
  Delete: DeleteIcon,
  Properties: PropertiesIcon,
  Info: InfoIcon,
  Keywords: BookIcon
};

export default {
  title: 'ActionGroup',

  parameters: {
    providerSwitcher: {status: 'negative'}
  }
};

export const Default = () => (
  <Flex direction="column" gap="size-200" width="100%" margin="size-100">
    <ActionGroup onAction={action('onAction')}>
      {docItems.map((itemProps) => (
        <Item key={itemProps.name} textValue={itemProps.name} {...itemProps} />
      ))}
    </ActionGroup>
    <ActionGroup onAction={action('onAction')}>
      {docItems.map((itemProps) => {
        let IconElement = iconMap[itemProps.children];
        return (
          <Item key={itemProps.name} textValue={itemProps.name}>
            <Text>{itemProps.children}</Text>
            <IconElement />
          </Item>
        );
      })}
    </ActionGroup>
    <ActionGroup onAction={action('onAction')}>
      {docItems.map((itemProps) => {
        let IconElement = iconMap[itemProps.children];
        return (
          <Item
            key={itemProps.name}
            textValue={itemProps.name}
            aria-label={itemProps.children}>
            <IconElement />
          </Item>
        );
      })}
    </ActionGroup>
  </Flex>
);

Default.story = {
  name: 'default'
};

export const WithFalsyItemKey = () => (
  <ActionGroup onAction={action('onAction')}>
    <Item key="add">Add</Item>
    <Item key="">Delete</Item>
    <Item key="edit">Edit</Item>
  </ActionGroup>
);

WithFalsyItemKey.story = {
  name: 'with falsy item key'
};

export const IsDisabled = () =>
  render({isDisabled: true, defaultSelectedKeys: ['1']}, docItems);

IsDisabled.story = {
  name: 'isDisabled'
};

export const AllKeysDisabled = () =>
  render({disabledKeys: ['1', '2']}, docItems);

AllKeysDisabled.story = {
  name: 'all keys disabled'
};

export const Compact = () =>
  render({density: 'compact', defaultSelectedKeys: ['1']}, viewItems);

Compact.story = {
  name: 'compact'
};

export const IsJustified = () =>
  render({isJustified: true, defaultSelectedKeys: ['1']}, viewItems2);

IsJustified.story = {
  name: 'isJustified'
};

export const CompactIsJustified = () =>
  render(
    {density: 'compact', isJustified: true, defaultSelectedKeys: ['1']},
    viewItems2
  );

CompactIsJustified.story = {
  name: 'compact, isJustified'
};

export const IsQuiet = () =>
  render({isQuiet: true, defaultSelectedKeys: ['1']}, editItems);

IsQuiet.story = {
  name: 'isQuiet'
};

export const CompactIsQuiet = () =>
  render(
    {density: 'compact', isQuiet: true, defaultSelectedKeys: ['1']},
    editItems
  );

CompactIsQuiet.story = {
  name: 'compact, isQuiet'
};

export const IsEmphasized = () =>
  render({isEmphasized: true, defaultSelectedKeys: ['1']}, docItems);

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const CompactIsEmphasized = () =>
  render(
    {isEmphasized: true, density: 'compact', defaultSelectedKeys: ['1']},
    viewItems
  );

CompactIsEmphasized.story = {
  name: 'compact, isEmphasized'
};

export const IsQuietIsEmphasized = () =>
  render(
    {isEmphasized: true, isQuiet: true, defaultSelectedKeys: ['1']},
    viewItems
  );

IsQuietIsEmphasized.story = {
  name: 'isQuiet, isEmphasized'
};

export const StaticColorWhite = () => (
  <View backgroundColor="static-seafoam-600" padding="size-1000">
    {render({staticColor: 'white', defaultSelectedKeys: ['1']}, viewItems)}
  </View>
);

StaticColorWhite.story = {
  name: 'staticColor=white'
};

export const StaticColorWhiteIsQuiet = () => (
  <View backgroundColor="static-seafoam-600" padding="size-1000">
    {render(
      {staticColor: 'white', isQuiet: true, defaultSelectedKeys: ['1']},
      viewItems
    )}
  </View>
);

StaticColorWhiteIsQuiet.story = {
  name: 'staticColor=white, isQuiet'
};

export const StaticColorBlack = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    {render({staticColor: 'black', defaultSelectedKeys: ['1']}, viewItems)}
  </View>
);

StaticColorBlack.story = {
  name: 'staticColor=black'
};

export const StaticColorBlackIsQuiet = () => (
  <View backgroundColor="static-yellow-400" padding="size-1000">
    {render(
      {staticColor: 'black', isQuiet: true, defaultSelectedKeys: ['1']},
      viewItems
    )}
  </View>
);

StaticColorBlackIsQuiet.story = {
  name: 'staticColor=black, isQuiet'
};

export const SelectionModeMultiple = () =>
  render(
    {selectionMode: 'multiple', defaultSelectedKeys: ['1', '2']},
    dataItems
  );

SelectionModeMultiple.story = {
  name: 'selectionMode: multiple'
};

export const SelectionModeSingleDisallowEmptySelection = () =>
  render(
    {
      selectionMode: 'single',
      disallowEmptySelection: true,
      defaultSelectedKeys: ['1']
    },
    dataItems
  );

SelectionModeSingleDisallowEmptySelection.story = {
  name: 'selectionMode: single, disallowEmptySelection'
};

export const SelectionModeMultipleIsQuiet = () =>
  render(
    {
      isQuiet: true,
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsQuiet.story = {
  name: 'selectionMode: multiple, isQuiet'
};

export const SelectionModeMultipleIsQuietCompact = () =>
  render(
    {
      isQuiet: true,
      density: 'compact',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsQuietCompact.story = {
  name: 'selectionMode: multiple, isQuiet, compact'
};

export const SelectionModeMultipleIsEmphasized = () =>
  render(
    {
      isEmphasized: true,
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasized.story = {
  name: 'selectionMode: multiple, isEmphasized'
};

export const SelectionModeMultipleIsEmphasizedCompact = () =>
  render(
    {
      isEmphasized: true,
      density: 'compact',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasizedCompact.story = {
  name: 'selectionMode: multiple, isEmphasized, compact'
};

export const SelectionModeMultipleIsEmphasizedIsQuiet = () =>
  render(
    {
      isEmphasized: true,
      isQuiet: true,
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasizedIsQuiet.story = {
  name: 'selectionMode: multiple, isEmphasized, isQuiet'
};

export const SelectionModeMultipleIsEmphasizedIsQuietCompact = () =>
  render(
    {
      isEmphasized: true,
      isQuiet: true,
      density: 'compact',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['1', '2']
    },
    dataItems
  );

SelectionModeMultipleIsEmphasizedIsQuietCompact.story = {
  name: 'selectionMode: multiple, isEmphasized, isQuiet, compact'
};

export const Vertical = () =>
  render({orientation: 'vertical', defaultSelectedKeys: ['1']}, docItems);

Vertical.story = {
  name: 'vertical'
};

export const VerticalIsJustified = () =>
  render(
    {isJustified: true, orientation: 'vertical', defaultSelectedKeys: ['1']},
    docItems
  );

VerticalIsJustified.story = {
  name: 'vertical, isJustified'
};

export const VerticalCompact = () =>
  render(
    {density: 'compact', orientation: 'vertical', defaultSelectedKeys: ['1']},
    viewItems
  );

VerticalCompact.story = {
  name: 'vertical, compact'
};

export const VerticalIsJustifiedCompact = () =>
  render(
    {
      isJustified: true,
      density: 'compact',
      orientation: 'vertical',
      defaultSelectedKeys: ['1']
    },
    viewItems
  );

VerticalIsJustifiedCompact.story = {
  name: 'vertical, isJustified, compact'
};

export const VerticalIsQuiet = () =>
  render(
    {isQuiet: true, orientation: 'vertical', defaultSelectedKeys: ['1']},
    editItems
  );

VerticalIsQuiet.story = {
  name: 'vertical, isQuiet'
};

export const VerticalIsQuietCompact = () =>
  render(
    {
      isQuiet: true,
      density: 'compact',
      orientation: 'vertical',
      defaultSelectedKeys: ['1']
    },
    viewItems
  );

VerticalIsQuietCompact.story = {
  name: 'vertical, isQuiet, compact'
};

export const DisabledKeys = () =>
  render({disabledKeys: ['1', '2'], selectionMode: 'multiple'}, dataItems);

DisabledKeys.story = {
  name: 'disabledKeys'
};

export const DynamicDefault = () => (
  <ActionGroup onAction={action('onAction')} items={viewItems}>
    {(item) => (
      <Item key={item.name} textValue={item.name}>
        {item.children}
      </Item>
    )}
  </ActionGroup>
);

DynamicDefault.story = {
  name: 'dynamic default'
};

export const DynamicSingleSelection = () => (
  <ActionGroup
    selectionMode="single"
    onSelectionChange={(s) => onSelectionChange([...s])}
    items={viewItems}>
    {(item) => (
      <Item key={item.name} textValue={item.name}>
        {item.children}
      </Item>
    )}
  </ActionGroup>
);

DynamicSingleSelection.story = {
  name: 'dynamic single selection'
};

export const WithTooltips = () => renderTooltips({});

WithTooltips.story = {
  name: 'with tooltips'
};

export const OverflowModeWrap = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      width: 250,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    <ActionGroup overflowMode="wrap" onAction={action('onAction')}>
      <Item>
        <DrawIcon />
        <Text>Edit</Text>
      </Item>
      <Item>
        <CopyIcon />
        <Text>Copy</Text>
      </Item>
      <Item>
        <DeleteIcon />
        <Text>Delete</Text>
      </Item>
      <Item>
        <MoveIcon />
        <Text>Move</Text>
      </Item>
      <Item>
        <DuplicateIcon />
        <Text>Duplicate</Text>
      </Item>
    </ActionGroup>
  </div>
);

OverflowModeWrap.story = {
  name: 'overflowMode: wrap'
};

export const OverflowModeCollapse = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      width: 250,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsible()}
    {renderCollapsible({density: 'compact'})}
    {renderCollapsible({density: 'compact', isJustified: true})}
    {renderCollapsible({isQuiet: true})}
  </div>
);

OverflowModeCollapse.story = {
  name: 'overflowMode: collapse'
};

export const ButtonLabelBehaviorHide = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      width: 250,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsible({buttonLabelBehavior: 'hide'})}
    {renderCollapsibleText({buttonLabelBehavior: 'hide'})}
  </div>
);

ButtonLabelBehaviorHide.story = {
  name: 'buttonLabelBehavior: hide'
};

export const ButtonLabelBehaviorCollapse = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      width: 500,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsible({buttonLabelBehavior: 'collapse'})}
    {renderCollapsibleText({buttonLabelBehavior: 'collapse'})}
  </div>
);

ButtonLabelBehaviorCollapse.story = {
  name: 'buttonLabelBehavior: collapse'
};

export const OverflowModeCollapseSelection = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      display: 'flex',
      gap: 10,
      width: 300,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsibleFormatting({
      density: 'compact',
      maxWidth: '50%',
      isEmphasized: true
    })}
    {renderCollapsibleAlignment({
      density: 'compact',
      maxWidth: '50%',
      isEmphasized: true
    })}
  </div>
);

OverflowModeCollapseSelection.story = {
  name: 'overflowMode: collapse, selection'
};

export const OverflowModeCollapseSummaryIcon = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      display: 'flex',
      gap: 10,
      width: 300,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsibleFormatting({
      density: 'compact',
      overflowMode: 'collapse',
      summaryIcon: <TextStyle />,
      isEmphasized: true
    })}
    {renderCollapsibleAlignment({
      density: 'compact',
      overflowMode: 'collapse',
      isEmphasized: true
    })}
  </div>
);

OverflowModeCollapseSummaryIcon.story = {
  name: 'overflowMode: collapse, summaryIcon'
};

export const OverflowModeCollapseSingleSelection = () => (
  <div
    style={{
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      display: 'flex',
      gap: 10,
      width: 300,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsibleAlignment({
      density: 'compact',
      maxWidth: '50%',
      isEmphasized: true
    })}
    {renderCollapsibleAlignment({
      density: 'compact',
      maxWidth: '50%',
      isEmphasized: true,
      buttonLabelBehavior: 'show'
    })}
    {renderCollapsibleAlignmentNoIcons({
      density: 'compact',
      maxWidth: '50%',
      isEmphasized: true,
      buttonLabelBehavior: 'show'
    })}
  </div>
);

OverflowModeCollapseSingleSelection.story = {
  name: 'overflowMode: collapse, single selection'
};

export const OrientationVerticalOverflowModeCollapse = () => (
  <div
    style={{
      padding: '10px',
      resize: 'vertical',
      overflow: 'auto',
      width: 32,
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {renderCollapsible({
      orientation: 'vertical',
      buttonLabelBehavior: 'hide',
      maxHeight: '100%',
      marginBottom: 0
    })}
  </div>
);

OrientationVerticalOverflowModeCollapse.story = {
  name: 'orientation: vertical, overflowMode: collapse'
};

export const OrientationVerticalOverflowModeCollapseSelection = () => (
  <Flex direction="column">
    <p>
      Note: this is currently unsupported by Spectrum. Container should scroll.
    </p>
    <div
      style={{
        padding: '10px',
        resize: 'vertical',
        overflow: 'auto',
        width: 32,
        backgroundColor: 'var(--spectrum-global-color-gray-50)'
      }}>
      {renderTools({
        orientation: 'vertical',
        buttonLabelBehavior: 'hide',
        maxHeight: '100%'
      })}
    </div>
  </Flex>
);

OrientationVerticalOverflowModeCollapseSelection.story = {
  name: 'orientation: vertical, overflowMode: collapse, selection'
};

function render(props, items) {
  return (
    <Flex gap="size-300" margin="size-100" width="100%" direction="column">
      {renderText(props, items)}
      {renderBoth(props, items)}
      {renderIcons(props, items)}
    </Flex>
  );
}

function renderText(props, items: any = docItems) {
  return (
    <ActionGroup
      selectionMode="single"
      onSelectionChange={(s) => onSelectionChange([...s])}
      {...props}>
      {items.map((itemProps) => (
        <Item key={itemProps.name} textValue={itemProps.name} {...itemProps} />
      ))}
    </ActionGroup>
  );
}

function renderBoth(props, items: any = docItems) {
  return (
    <ActionGroup
      selectionMode="single"
      onSelectionChange={(s) => onSelectionChange([...s])}
      {...props}>
      {items.map((itemProps) => {
        let IconElement = iconMap[itemProps.children];
        return (
          <Item
            key={itemProps.name}
            textValue={itemProps.name}
            aria-label={itemProps.children}>
            <Text>{itemProps.children}</Text>
            <IconElement />
          </Item>
        );
      })}
    </ActionGroup>
  );
}

function renderIcons(props, items: any = docItems) {
  return (
    <ActionGroup
      selectionMode="single"
      onSelectionChange={(s) => onSelectionChange([...s])}
      {...props}>
      {items.map((itemProps) => {
        let IconElement = iconMap[itemProps.children];
        return (
          <Item
            key={itemProps.name}
            textValue={itemProps.name}
            aria-label={itemProps.children}>
            <IconElement />
          </Item>
        );
      })}
    </ActionGroup>
  );
}

function renderTooltips(props, items: any = docItems) {
  return (
    <ActionGroup
      selectionMode="single"
      onSelectionChange={(s) => onSelectionChange([...s])}
      {...props}>
      {items.map((itemProps) => {
        let IconElement = iconMap[itemProps.children];
        return (
          <TooltipTrigger>
            <Item
              key={itemProps.name}
              textValue={itemProps.children}
              aria-label={itemProps.children}>
              <IconElement />
            </Item>
            <Tooltip>{itemProps.children}</Tooltip>
          </TooltipTrigger>
        );
      })}
    </ActionGroup>
  );
}

function renderCollapsible(props = {}) {
  return (
    <ActionGroup
      overflowMode="collapse"
      onAction={action('onAction')}
      marginBottom="size-250"
      {...props}>
      <Item key="edit">
        <DrawIcon />
        <Text>Edit</Text>
      </Item>
      <Item key="copy">
        <CopyIcon />
        <Text>Copy</Text>
      </Item>
      <Item key="delete">
        <Text>Delete</Text>
        <DeleteIcon />
      </Item>
      <Item key="move">
        <MoveIcon />
        <Text>Move</Text>
      </Item>
      <Item key="duplicate">
        <DuplicateIcon />
        <Text>Duplicate</Text>
      </Item>
    </ActionGroup>
  );
}

function renderCollapsibleText(props = {}) {
  return (
    <ActionGroup
      overflowMode="collapse"
      onAction={action('onAction')}
      {...props}
      marginBottom="size-250">
      <Item key="edit">Edit</Item>
      <Item key="copy">Copy</Item>
      <Item key="delete">Delete</Item>
      <Item key="move">Move</Item>
      <Item key="duplicate">Duplicate</Item>
    </ActionGroup>
  );
}

function renderCollapsibleFormatting(props = {}) {
  return (
    <ActionGroup
      aria-label="Text style"
      overflowMode="collapse"
      selectionMode="multiple"
      onSelectionChange={action('onSelectionChange')}
      buttonLabelBehavior="hide"
      {...props}>
      <Item key="bold">
        <TagBold />
        <Text>Bold</Text>
      </Item>
      <Item key="italic">
        <TagItalic />
        <Text>Italic</Text>
      </Item>
      <Item key="underline">
        <TagUnderline />
        <Text>Underline</Text>
      </Item>
      <Item key="strike">
        <TextStrikethrough />
        <Text>Strikethrough</Text>
      </Item>
    </ActionGroup>
  );
}

function renderCollapsibleAlignment(props = {}) {
  return (
    <ActionGroup
      aria-label="Text alignment"
      overflowMode="collapse"
      selectionMode="single"
      defaultSelectedKeys={['left']}
      disallowEmptySelection
      onSelectionChange={action('onSelectionChange')}
      buttonLabelBehavior="hide"
      {...props}>
      <Item key="left">
        <TextAlignLeft />
        <Text>Align Left</Text>
      </Item>
      <Item key="center">
        <TextAlignCenter />
        <Text>Align Center</Text>
      </Item>
      <Item key="right">
        <Text>Align Right</Text>
        <TextAlignRight />
      </Item>
      <Item key="justify">
        <TextAlignJustify />
        <Text>Justify</Text>
      </Item>
    </ActionGroup>
  );
}

function renderCollapsibleAlignmentNoIcons(props = {}) {
  return (
    <ActionGroup
      aria-label="Text alignment"
      overflowMode="collapse"
      selectionMode="single"
      defaultSelectedKeys={['left']}
      disallowEmptySelection
      onSelectionChange={action('onSelectionChange')}
      {...props}>
      <Item key="left">Align Left</Item>
      <Item key="center">Align Center</Item>
      <Item key="right">Align Right</Item>
      <Item key="justify">Justify</Item>
    </ActionGroup>
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
