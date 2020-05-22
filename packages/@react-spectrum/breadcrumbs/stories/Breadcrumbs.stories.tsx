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
import {Breadcrumbs} from '../';
import {Item} from '@react-stately/collections';
import React from 'react';
import {storiesOf} from '@storybook/react';

let styles = {
  width: '100vw'
};
const CenterDecorator = storyFn => <div style={styles}><div>{storyFn()}</div></div>;

storiesOf('Breadcrumbs', module)
  .addDecorator(CenterDecorator)
  .addParameters({providerSwitcher: {status: 'negative'}})
  .add(
    'Default (with 3 items)',
    () => render()
  )
  .add(
    'Default (with 7 items)',
    () => renderMany({})
  )
  .add(
    'size: S',
    () => render({size: 'S'})
  )
  .add(
    'size: L',
    () => render({size: 'L'})
  )
  .add(
    'maxVisibleItems: 4',
    () => renderMany({maxVisibleItems: 4})
  )
  .add(
    'maxVisibleItems: 4, showRoot: true',
    () => renderMany({maxVisibleItems: 4, showRoot: true})
  )
  .add(
    'maxVisibleItems: auto',
    () => renderMany({maxVisibleItems: 'auto'})
  )
  .add(
    'collapsed, maxVisibleItems: auto',
    () => (
      <div style={{width: '100px'}}>
        {renderMany({maxVisibleItems: 'auto'})}
      </div>
    )
  )
  .add(
    'collapsed, maxVisibleItems: auto, size: L',
    () => (
      <div style={{width: '100px'}}>
        {renderMany({maxVisibleItems: 'auto', size: 'L'})}
      </div>
    )
  )
  .add(
    'maxVisibleItems: auto, showRoot: true',
    () => renderMany({maxVisibleItems: 'auto', showRoot: true})
  )
  .add(
    'maxVisibleItems: auto, size: L',
    () => renderMany({maxVisibleItems: 'auto', size: 'L'})
  )
  .add(
    'maxVisibleItems: auto, size: L, showRoot: true',
    () => renderMany({maxVisibleItems: 'auto', size: 'L', showRoot: true})
  )
  .add(
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isDisabled: true, size: L',
    () => render({isDisabled: true, size: 'L'})
  )
  .add(
    'isDisabled: true, maxVisibleItems: 4',
    () => renderMany({isDisabled: true, maxVisibleItems: 4})
  )
  .add(
    'isHeading: true',
    () => render({isHeading: true})
  )
  .add(
    'isHeading: true, size: L',
    () => render({isHeading: true, size: 'L'})
  );

function render(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item uniqueKey="Folder 1">The quick brown fox jumps over</Item>
      <Item uniqueKey="Folder 2">My Documents</Item>
      <Item uniqueKey="Folder 3">Kangaroos jump high</Item>
    </Breadcrumbs>
  );
}

function renderMany(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item uniqueKey="Folder 1">The quick brown fox jumps over</Item>
      <Item uniqueKey="Folder 2">My Documents</Item>
      <Item uniqueKey="Folder 3">Kangaroos jump high</Item>
      <Item uniqueKey="Folder 4">Koalas are very cute</Item>
      <Item uniqueKey="Folder 5">Wombat's noses</Item>
      <Item uniqueKey="Folder 6">Wattle trees</Item>
      <Item uniqueKey="Folder 7">April 7</Item>
    </Breadcrumbs>
  );
}
