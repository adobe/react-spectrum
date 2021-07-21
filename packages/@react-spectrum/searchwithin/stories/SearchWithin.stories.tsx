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
import {Item, Picker} from '@react-spectrum/picker';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchFieldProps} from '@react-types/searchfield';
import {SearchWithin} from '../';
import {SpectrumPickerProps} from '@react-types/select';
import {SpectrumSearchWithinProps} from '@react-types/searchwithin';

export default {
  title: 'SearchWithin'
};

function render(props: Omit<SpectrumSearchWithinProps, 'children'> = {}, searchFieldProps: SearchFieldProps = {}, pickerProps: Omit<SpectrumPickerProps<object>, 'children'> = {}) {
  return (
    <SearchWithin label="Search" {...props}>
      <SearchField placeholder="Search" {...searchFieldProps} onChange={action('change')} onSubmit={action('submit')} />
      <Picker defaultSelectedKey="all" {...pickerProps} onSelectionChange={action('selectionChange')}>
        <Item key="all">All</Item>
        <Item key="campaigns">Campaigns</Item>
        <Item key="audiences">Audiences</Item>
        <Item key="tags">Tags</Item>
      </Picker>
    </SearchWithin>
  );
}

function renderReverse(props: Omit<SpectrumSearchWithinProps, 'children'> = {}, searchFieldProps: SearchFieldProps = {}, pickerProps: Omit<SpectrumPickerProps<object>, 'children'> = {}) {
  return (
    <SearchWithin label="Search" {...props}>
      <Picker defaultSelectedKey="all" {...pickerProps} onSelectionChange={action('selectionChange')}>
        <Item key="all">All</Item>
        <Item key="campaigns">Campaigns</Item>
        <Item key="audiences">Audiences</Item>
        <Item key="tags">Tags</Item>
      </Picker>
      <SearchField placeholder="Search" {...searchFieldProps} {...searchFieldProps} onChange={action('change')} onSubmit={action('submit')} />
    </SearchWithin>
  );
}

export const Default = () => render({});

export const isDisabled = () => render({isDisabled: true});
isDisabled.storyName = 'isDisabled: true';

export const isRequired = () => render({isRequired: true});
isRequired.storyName = 'isRequired: true';

export const isRequiredNecessityIndicatorLabel = () => render({isRequired: true, necessityIndicator: 'label'});
isRequiredNecessityIndicatorLabel.storyName = 'isRequired: true, necessityIndicator \'label\' ';

export const isRequiredFalse_necessityIndicator = () => render({isRequired: false, necessityIndicator: 'label'});
isRequiredFalse_necessityIndicator.storyName = 'isRequired: false, necessityIndicator \'label\' ';

export const PickerDisabled = () => render({}, {}, {isDisabled: true});

export const CustomWidth = () => render({width: 300});

export const LabelPositionSide = () => render({labelPosition: 'side'});
LabelPositionSide.storyName = 'labelPosition: side';

export const AutoFocus = () => render({}, {autoFocus: true});

export const ReverseChildrenOrder = () => renderReverse({});
