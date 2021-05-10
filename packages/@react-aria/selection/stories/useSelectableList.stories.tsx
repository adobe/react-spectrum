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

import {Item} from '@react-stately/collections';
import {List} from './List';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('useSelectableList', module)
  .add(
    'example',
    () => render()
  );

function render() {
  return (
    <>
      <div>
        <h4>Single selection</h4>
        <ol>
          <li>Select the first item by clicking on it</li>
          <li>press arrow down</li>
          <li>Second item is selected ✓</li>
        </ol>
        <List selectionMode="single" disallowEmptySelection>
          <Item>Paco de Lucia</Item>
          <Item>Vicente Amigo</Item>
          <Item>Gerardo Nunez</Item>
        </List>
      </div>
      <div>
        <h4>Multi selection</h4>
        <ol>
          <li>
            Select first and second item by clicking on them (while holding
            shift)
          </li>
          <li>Press arrow down</li>
          <li>
            Third item is just focused. selection is unchanged, even though{' '}
            <code>selectOnFocus</code> is true ❌
          </li>
        </ol>
        <List selectionMode="multiple" disallowEmptySelection>
          <Item>Paco de Lucia</Item>
          <Item>Vicente Amigo</Item>
          <Item>Gerardo Nunez</Item>
        </List>
      </div>
      <div>
        <h4>Native multi selection</h4>
        <ol>
          <li>
            Select first and second item by clicking on them (while holding
            shift)
          </li>
          <li>Press arrow down</li>
          <li>Third item is selected ✓</li>
        </ol>
        <select multiple>
          <option>Paco de Lucia</option>
          <option>Vicente Amigo</option>
          <option>Gerardo Nunez</option>
        </select>
      </div>
    </>
  );
}
