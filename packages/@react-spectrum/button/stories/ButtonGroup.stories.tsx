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
import {ActionButton, ButtonGroup} from '../';
import Add from '@spectrum-icons/workflow/Add';
import Bell from '@spectrum-icons/workflow/Bell';
import Brush from '@spectrum-icons/workflow/Brush';
import Camera from '@spectrum-icons/workflow/Camera';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import Delete from '@spectrum-icons/workflow/Delete';
import {Item} from '@react-stately/collections';
import React from 'react';
import RegionSelect  from '@spectrum-icons/workflow/RegionSelect';
import Select  from '@spectrum-icons/workflow/Select';
import {storiesOf} from '@storybook/react';
import Undo from '@spectrum-icons/workflow/Undo';

storiesOf('ButtonGroup', module)
  .addParameters({providerSwitcher: {status: 'negative'}})
  .add(
    'default: RENDER ITEMS',
    () => renderItems(null)
  )
  .add(
    'icons',
    () => render()
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isConnected',
    () => render({isConnected: true})
  )
  .add(
    'isConected, isJustified',
    () => (
      <div style={{width: '600px'}}>
        {render({isConnected: true, isJustified: true})}
      </div>
    )
  )
  .add(
    'isConnected, isEmphasized',
    () => render({isConnected: true, isEmphasized: true})
  )
  .add(
    'selectionMode: none',
    () => render({selectionMode: 'none'})
  )
  .add(
    'selectionMode: multiple',
    () => render({selectionMode: 'multiple'})
  )
  .add(
    'selectionMode: multiple, isConnected, isEmphasized',
    () => render({isConnected: true, isEmphasized: true, selectionMode: 'multiple'})
  )
  .add(
    'orientation: vertical',
    () => render({orientation: 'vertical'})
  )
  .add(
    'icons only',
    () => render({}, toolIcons)
  )
  .add(
    'icons only, isQuiet',
    () => render({isQuiet: true}, toolIcons)
  )
  .add(
    'icons only, holdAffordance',
    () => render({}, toolIconsAffordance)
  )
  .add(
    'icons only, orientation: vertical',
    () => render({orientation: 'vertical'}, toolIcons)
  )
  .add(
    'icons only, orientation: vertical, isQuiet',
    () => render({orientation: 'vertical', isQuiet: true}, toolIcons)
  );

function renderItems(props = {}) {
  return (
    <ButtonGroup onSelectionChange={action('onSelect')} {...props}>
      <Item uniqueKey="React" >React</Item>
      <Item uniqueKey="Add" >Add</Item>
      <Item uniqueKey="Delete" >Delete</Item>
    </ButtonGroup>
  );
}

const itemsWithIcons =
  [
    {children: 'React', icon: <CheckmarkCircle />},
    {children: 'Add', icon: <Add />},
    {children: 'Delete', icon: <Delete />},
    {children: 'Bell', icon: <Bell />},
    {children: 'Camera', icon: <Camera />},
    {children: 'Undo', icon: <Undo />}
  ];

const toolIcons =
  [
    {icon: <Brush />},
    {icon: <Select />},
    {icon: <RegionSelect />}
  ];

const toolIconsAffordance =
  [
    {icon: <Brush />, holdAffordance: true},
    {icon: <Select />, holdAffordance: true},
    {icon: <RegionSelect />, holdAffordance: true}
  ];

function render(props = {}, items: any = itemsWithIcons) {
  return (
    <ButtonGroup onSelectionChange={action('onSelect')} {...props}>
      {
        items.map((itemProps, index) => (
          <ActionButton key={index} {...itemProps} />
        ))
      }
    </ButtonGroup>
  );
}
