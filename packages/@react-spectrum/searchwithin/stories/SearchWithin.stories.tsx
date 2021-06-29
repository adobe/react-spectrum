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

import {Item, Picker} from '../../picker';
import React from 'react';
import {SearchField} from '../../searchfield';
import {SearchWithin, SpectrumSearchWithinProps} from '../';
import {storiesOf} from '@storybook/react';

storiesOf('SearchWithin', module)
  .add(
    'Default',
    () => render({})
  ).add(
    'isDisabled',
    () => render({isDisabled: true})
  ).add(
    'isRequired',
    () => render({isRequired: true})
  );

function render(props: Omit<SpectrumSearchWithinProps, 'children'> = {}) {
  return (
    <SearchWithin label="Search" {...props}>
      <SearchField placeholder="Search" />
      <Picker defaultSelectedKey="all">
        <Item key="all">All</Item>
        <Item key="campaigns">Campaigns</Item>
        <Item key="audiences">Audiences</Item>
        <Item key="tags">Tags</Item>
      </Picker>
    </SearchWithin>
  );
}
