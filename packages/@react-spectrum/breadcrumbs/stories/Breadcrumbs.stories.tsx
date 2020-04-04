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
  width: '50vw'
};
const CenterDecorator = storyFn => <div style={styles}><div>{storyFn()}</div></div>;

storiesOf('Breadcrumbs', module)
  .addDecorator(CenterDecorator)
  .addParameters({providerSwitcher: {status: 'negative'}})
  .add(
    'Default',
    () => render({})
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
    () => renderMany({})
  )
  .add(
    'maxVisibleItems: 4, showRoot: true',
    () => renderMany({showRoot: true})
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
    () => renderMany({isDisabled: true})
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
      <Item uniqueKey="Folder 1">Vestibulum bibendum odio non</Item>
      <Item uniqueKey="Folder 2">Cras aliquet</Item>
      <Item uniqueKey="Folder 3">Quisque ut turpis</Item>
    </Breadcrumbs>
  );
}

function renderMany(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item uniqueKey="Folder 1">Vestibulum bibendum odio non</Item>
      <Item uniqueKey="Folder 2">Cras aliquet</Item>
      <Item uniqueKey="Folder 3">Quisque ut turpis</Item>
      <Item uniqueKey="Folder 4">Curabitur convallis</Item>
      <Item uniqueKey="Folder 5">Curabitur quis</Item>
      <Item uniqueKey="Folder 6">Cras fringilla</Item>
      <Item uniqueKey="Folder 7">Etiam ut</Item>
    </Breadcrumbs>
  );
}
