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
import {BreadcrumbItem, Breadcrumbs} from '../';
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
    'onPress',
    () => renderPress({})
  )
  .add(
    'maxVisibleItems: 4',
    () => renderPress({})
  )
  .add(
    'maxVisibleItems: 4, showRoot: true',
    () => renderPress({showRoot: true})
  )
  .add(
    'maxVisibleItems: auto',
    () => renderPress({maxVisibleItems: 'auto'})
  )
  .add(
    'collapsed, maxVisibleItems: auto',
    () => (
      <div style={{width: '100px'}}>
        {renderPress({maxVisibleItems: 'auto'})}
      </div>
    )
  )
  .add(
    'maxVisibleItems: auto, showRoot: true',
    () => renderPress({maxVisibleItems: 'auto', showRoot: true})
  )
  .add(
    'maxVisibleItems: auto, size: L',
    () => renderPress({maxVisibleItems: 'auto', size: 'L'})
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
    'isHeading: true',
    () => render({isHeading: true})
  )
  .add(
    'isHeading: true, size: L',
    () => render({isHeading: true, size: 'L'})
  );

function render(props = {}) {
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem>Folder 1</BreadcrumbItem>
      <BreadcrumbItem>Folder 2</BreadcrumbItem>
      <BreadcrumbItem>Folder 3</BreadcrumbItem>
    </Breadcrumbs>
  );
}

function renderPress(props = {}) {
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem onPress={action('press Folder 1')}>Folder 1</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 2')}>Folder 2</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 3')}>Folder 3</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 4')}>Folder 4</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 5')}>Folder 5</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 6')}>Folder 6</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 7')}>Folder 7</BreadcrumbItem>
    </Breadcrumbs>
  );
}
