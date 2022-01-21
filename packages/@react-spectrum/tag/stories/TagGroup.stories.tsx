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
import Audio from '@spectrum-icons/workflow/Audio';
import {Icon} from '@react-spectrum/icon';
import {Item} from '@react-stately/collections';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TagGroup} from '../src';
import {Text} from '@react-spectrum/text';

storiesOf('TagGroup', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'disabledKeys',
    () => render({
      disabledKeys: ['1']
    }))
  .add('icons', () => (
    <TagGroup aria-label="tag group" items={[{key: '1', label: 'Cool Tag 1'}, {key: '2', label: 'Cool Tag 2'}]}>
      {item => (
        <Item key={item.key} textValue={item.label}>
          <Icon>
            <Audio />
          </Icon>
          <Text>{item.label}</Text>
        </Item>
      )}
    </TagGroup>
  ))
  .add(
    'isDisabled',
    () => render({
      isDisabled: true
    }))
  .add(
    'onRemove',
    () => render({
      isRemovable: true,
      onRemove: action('onRemove')
    })
  )
  .add(
    'onRemove + disabledKeys',
    () => render({
      disabledKeys: ['2'],
      isRemovable: true,
      onRemove: action('onRemove')
    })
  )
  .add(
    'onRemove + isDisabled',
    () => render({
      isDisabled: true,
      isRemovable: true,
      onRemove: action('onRemove')
    })
  )
  .add(
    'using items prop',
    () => (
      <TagGroup aria-label="tag group" items={[{key: '1', label: 'Cool Tag 1'}, {key: '2', label: 'Cool Tag 2'}]}>
        {item =>
          <Item key={item.key} textValue={item.label}><Text>{item.label}</Text></Item>
        }
      </TagGroup>
    )
  )
  .add(
    'with announcing',
    () => (
      <WithAnnouncing />
    )
  );

function render(props: any = {}) {
  return (
    <TagGroup {...props} aria-label="tag group">
      <Item key="1">Cool Tag 1</Item>
      <Item key="2">Cool Tag 2</Item>
      <Item key="3">Cool Tag 3</Item>
    </TagGroup>
  );
}

function WithAnnouncing() {
  let tags = ['Testing tag', 'Other testing label'];

  return (
    <React.Fragment>
      <TagGroup aria-label="tag group">
        {tags.map((t, index) => <Item key={index}>{t}</Item>)}
      </TagGroup>
    </React.Fragment>
  );
}
