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
import {SearchFieldProps} from '../../../@react-types/searchfield/src';
import {SearchWithin, SpectrumSearchWithinProps} from '../';
import {SpectrumPickerProps} from '../../../@react-types/select/src';
import {storiesOf} from '@storybook/react';

storiesOf('SearchWithin', module)
  .add(
    'Default',
    () => render({})
  ).add(
    'isDisabled: true',
    () => render({isDisabled: true})
  ).add(
    'isRequired: true',
    () => render({isRequired: true})
  ).add(
    'isRequired: true, necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'isRequired: false, necessityIndicator: label',
    () => render({isRequired: false, necessityIndicator: 'label'})
  ).add(
    'custom width',
    () => render({width: 300})
  ).add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  ).add(
    'auto focus',
    () => render({}, {autoFocus: true})
  );

function render(props: Omit<SpectrumSearchWithinProps, 'children'> = {}, searchFieldProps: SearchFieldProps = {}, pickerProps: Omit<SpectrumPickerProps<object>, 'children'> = {}) {
  return (
    <SearchWithin label="Search" {...props}>
      <SearchField placeholder="Search" {...searchFieldProps} />
      <Picker defaultSelectedKey="all" {...pickerProps}>
        <Item key="all">All</Item>
        <Item key="campaigns">Campaigns</Item>
        <Item key="audiences">Audiences</Item>
        <Item key="tags">Tags</Item>
      </Picker>
    </SearchWithin>
  );
}
