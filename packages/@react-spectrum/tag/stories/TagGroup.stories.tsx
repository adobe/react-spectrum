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
import React, {useState} from 'react';
import {Tag, TagGroup} from '../src';

export default {
  title: 'TagGroup'
};

export const Default = () => render({});

Default.story = {
  name: 'default'
};

export const OnRemove = () =>
  renderWithRemovableTags({
    onRemove: action('onRemove')
  });

OnRemove.story = {
  name: 'onRemove'
};

export const IsDisabled = () =>
  render({
    isDisabled: true
  });

IsDisabled.story = {
  name: 'is Disabled'
};

export const IsReadOnly = () =>
  renderWithRemovableTags({
    isReadOnly: true
  });

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const _WithAnnouncing = () => <WithAnnouncing />;

_WithAnnouncing.story = {
  name: 'with announcing'
};

function render(props: any = {}) {
  return (
    <TagGroup {...props}>
      <Tag>Cool Tag 1</Tag>
      <Tag>Cool Tag 2</Tag>
      <Tag>Cool Tag 3</Tag>
    </TagGroup>
  );
}

function renderWithRemovableTags(props: any = {}) {
  return (
    <TagGroup {...props}>
      <Tag isRemovable>Cool Tag 1</Tag>
      <Tag isRemovable>Cool Tag 2</Tag>
      <Tag isRemovable>Cool Tag 3</Tag>
    </TagGroup>
  );
}

function WithAnnouncing() {
  let [tags, setTags] = useState(['Tag']);

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setTags([...tags, 'New Tag']);
    }
  }
  return (
    <React.Fragment>
      {/*
        // @ts-ignore */}
      <TagGroup onKeyDown={handleKeyDown}>
        {tags.map((t, index) => (
          <Tag key={index}>{t}</Tag>
        ))}
      </TagGroup>
    </React.Fragment>
  );
}
