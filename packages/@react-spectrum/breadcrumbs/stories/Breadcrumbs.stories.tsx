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
import {Heading} from '@react-spectrum/text';
import {Item} from '@react-stately/collections';
import React from 'react';
import {storiesOf} from '@storybook/react';

let styles = {
  width: '100vw',
  padding: '0 30px'
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
    'isMultiline',
    () => render({isMultiline: true})
  )
  .add(
    'size: S',
    () => render({size: 'S'})
  )
  .add(
    'size: S, isMultiline',
    () => render({size: 'S', isMultiline: true})
  )
  .add(
    'size: M',
    () => render({size: 'M'})
  )
  .add(
    'size: M, isMultiline',
    () => render({size: 'M', isMultiline: true})
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
      <div style={{width: '100px', border: '1px solid lightgray'}}>
        {renderMany({maxVisibleItems: 'auto'})}
      </div>
    )
  )
  .add(
    'collapsed, maxVisibleItems: auto, isMultiline',
    () => (
      <div style={{width: '100px', border: '1px solid lightgray'}}>
        {renderMany({maxVisibleItems: 'auto', isMultiline: true})}
      </div>
    )
  )
  .add(
    'maxVisibleItems: auto, showRoot: true',
    () => renderMany({maxVisibleItems: 'auto', showRoot: true})
  )
  .add(
    'maxVisibleItems: auto, isMultiline',
    () => renderMany({maxVisibleItems: 'auto', isMultiline: true})
  )
  .add(
    'maxVisibleItems: auto, isMultiline, showRoot: true',
    () => renderMany({maxVisibleItems: 'auto', isMultiline: true, showRoot: true})
  )
  .add(
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isDisabled: true, isMultiline',
    () => render({isDisabled: true, isMultiline: true})
  )
  .add(
    'isDisabled: true, maxVisibleItems: 4',
    () => renderMany({isDisabled: true, maxVisibleItems: 4})
  )
  .add(
    'last item Heading',
    () => renderHeading()
  )
  .add(
    'last item Heading, size: S',
    () => renderHeading({size: 'S'})
  )
  .add(
    'last item Heading, size: M',
    () => renderHeading({size: 'M'})
  )
  .add(
    'last item Heading, isMultiline',
    () => renderHeading({isMultiline: true})
  )
  .add(
    'last item Heading, size: S, isMultiline',
    () => renderHeading({isMultiline: true, size: 'S'})
  )
  .add(
    'last item Heading, size: M, isMultiline',
    () => renderHeading({isMultiline: true, size: 'M'})
  );

function render(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item key="Folder 1">The quick brown fox jumps over</Item>
      <Item key="Folder 2">My Documents</Item>
      <Item key="Folder 3">Kangaroos jump high</Item>
    </Breadcrumbs>
  );
}

function renderHeading(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item key="Folder 1">
        The quick brown fox jumps over
      </Item>
      <Item key="Folder 2">
        My Documents
      </Item>
      <Item key="Folder 3">
        <Heading level={1}>
          Kangaroos jump high
        </Heading>
      </Item>
    </Breadcrumbs>
  );
}

function renderMany(props = {}) {
  return (
    <Breadcrumbs {...props} onAction={action('onAction')}>
      <Item key="Folder 1">The quick brown fox jumps over</Item>
      <Item key="Folder 2">My Documents</Item>
      <Item key="Folder 3">Kangaroos jump high</Item>
      <Item key="Folder 4">Koalas are very cute</Item>
      <Item key="Folder 5">Wombat's noses</Item>
      <Item key="Folder 6">Wattle trees</Item>
      <Item key="Folder 7">April 7</Item>
    </Breadcrumbs>
  );
}
