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
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Flex} from '@react-spectrum/layout';
import {Item, Picker, Section} from '../';
import Paste from '@spectrum-icons/workflow/Paste';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';

let flatOptions = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'},
  {name: 'Danni'},
  {name: 'Devon'},
  {name: 'Ross'},
  {name: 'Puppy'},
  {name: 'Doggo'},
  {name: 'Floof'}
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


storiesOf('Picker', module)
  .add(
    'default',
    () => (
      <Picker label="Test" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'sections',
    () => (
      <Picker label="Test" onSelectionChange={action('selectionChange')}>
        <Section title="Animals">
          <Item>Aardvark</Item>
          <Item>Kangaroo</Item>
          <Item>Snake</Item>
        </Section>
        <Section title="People">
          <Item>Danni</Item>
          <Item>Devon</Item>
          <Item>Ross</Item>
        </Section>
      </Picker>
    )
  )
  .add(
    'dynamic',
    () => (
      <Picker label="Test" items={flatOptions} itemKey="name" onSelectionChange={action('selectionChange')}>
        {item => <Item>{item.name}</Item>}
      </Picker>
    )
  )
  .add(
    'dynamic with sections',
    () => (
      <Picker label="Test" items={withSection} itemKey="name" onSelectionChange={action('selectionChange')}>
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item>{item.name}</Item>}
          </Section>
        )}
      </Picker>
    )
  )
  .add(
    'isDisabled',
    () => (
      <Picker label="Test" isDisabled onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'labelAlign: end',
    () => (
      <Picker label="Test" labelAlign="end" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'labelPosition: side',
    () => (
      <Picker label="Test" labelPosition="side" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isRequired',
    () => (
      <Picker label="Test" isRequired onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isRequired, necessityIndicator: label',
    () => (
      <Picker label="Test" isRequired necessityIndicator="label" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'optional, necessityIndicator: label',
    () => (
      <Picker label="Test" necessityIndicator="label" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'validationState: invalid',
    () => (
      <Picker label="Test" validationState="invalid" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet',
    () => (
      <Picker isQuiet label="Test" onSelectionChange={action('selectionChange')}>
        <Item>One hundred</Item>
        <Item>Two thousand and twelve</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, isDisabled',
    () => (
      <Picker label="Test" isQuiet isDisabled onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two million</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, labelAlign: end',
    () => (
      <Picker label="Test" isQuiet labelAlign="end" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two dollary-doos</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, labelPosition: side',
    () => (
      <Picker label="Test" isQuiet labelPosition="side" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, isRequired',
    () => (
      <Picker label="Test" isQuiet isRequired onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, isRequired, necessityIndicator: label',
    () => (
      <Picker label="Test" isQuiet isRequired necessityIndicator="label" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, optional, necessityIndicator: label',
    () => (
      <Picker label="Test" isQuiet necessityIndicator="label" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, validationState: invalid',
    () => (
      <Picker label="Test" isQuiet validationState="invalid" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'complex items',
    () => (
      <Picker label="Test" onSelectionChange={action('selectionChange')}>
        <Section title="Section 1">
          <Item textValue="Copy">
            <Copy size="S" />
            <Text>Copy</Text>
          </Item>
          <Item textValue="Cut">
            <Cut size="S" />
            <Text>Cut</Text>
          </Item>
          <Item textValue="Paste">
            <Paste size="S" />
            <Text>Paste</Text>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item textValue="Puppy">
            <AlignLeft size="S" />
            <Text>Puppy</Text>
            <Text slot="description">Puppy description super long as well geez</Text>
          </Item>
          <Item textValue="Doggo with really really really long long long text">
            <AlignCenter size="S" />
            <Text>Doggo with really really really long long long text</Text>
          </Item>
          <Item textValue="Floof">
            <AlignRight size="S" />
            <Text>Floof</Text>
          </Item>
        </Section>
      </Picker>
    )
  )
  .add(
    'no visible label',
    () => (
      <Picker aria-label="Test" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, no visible label',
    () => (
      <Picker aria-label="Test" isQuiet onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isQuiet, align: end',
    () => (
      <Picker aria-label="Test" isQuiet align="end" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'custom widths',
    () => (
      <Flex flexDirection="column">
        <Picker label="Test" width="size-1200" onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
        <Picker label="Test" width="size-6000" onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Flex>
    )
  )
  .add(
    'custom widths, labelPosition: side',
    () => (
      <Flex flexDirection="column">
        <Picker label="Test" width="size-1200" labelPosition="side" onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
        <Picker label="Test" width="size-6000" labelPosition="side" onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Flex>
    )
  )
  .add(
    'custom menu widths',
    () => (
      <Flex flexDirection="column">
        <Picker label="Test" menuWidth="size-1000" onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
        <Picker label="Test" menuWidth="size-6000" onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Flex>
    )
  )
  .add(
    'custom menu widths, isQuiet',
    () => (
      <Flex flexDirection="column">
        <Picker label="Test" menuWidth="size-400" isQuiet onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
        <Picker label="Test" menuWidth="size-6000" isQuiet onSelectionChange={action('selectionChange')}>
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Picker>
      </Flex>
    )
  )
  .add(
    'custom menu width, align: end',
    () => (
      <Picker label="Test" menuWidth="size-6000" align="end" onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'isOpen (controlled)',
    () => (
      <Picker label="Test" isOpen onOpenChange={action('onOpenChange')} onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'defaultOpen (uncontrolled)',
    () => (
      <Picker label="Test" defaultOpen onOpenChange={action('onOpenChange')} onSelectionChange={action('selectionChange')}>
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </Picker>
    )
  )
  .add(
    'selectedKey (controlled)',
    () => (
      <Picker label="Test" selectedKey="One" onSelectionChange={action('selectionChange')}>
        <Item uniqueKey="One">One</Item>
        <Item uniqueKey="Two">Two</Item>
        <Item uniqueKey="Three">Three</Item>
      </Picker>
    )
  )
  .add(
    'defaultSelectedKey (uncontrolled)',
    () => (
      <Picker label="Test" defaultSelectedKey="One" onSelectionChange={action('selectionChange')}>
        <Item uniqueKey="One">One</Item>
        <Item uniqueKey="Two">Two</Item>
        <Item uniqueKey="Three">Three</Item>
      </Picker>
    )
  )
  .add(
    'picker closes on blur',
    () => (
      <>
        <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
          <input placeholder="Shift tab here" />
          <Picker label="Test" defaultSelectedKey="One" onSelectionChange={action('selectionChange')}>
            <Item uniqueKey="One">One</Item>
            <Item uniqueKey="Two">Two</Item>
            <Item uniqueKey="Three">Three</Item>
          </Picker>
          <input placeholder="Tab here" />
        </div>
      </>
    )
  );
