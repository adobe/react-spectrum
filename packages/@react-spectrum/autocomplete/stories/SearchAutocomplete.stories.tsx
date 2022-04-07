
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
import {Flex} from '@react-spectrum/layout';
import {Item, SearchAutocomplete} from '@react-spectrum/autocomplete';
import {mergeProps} from '@react-aria/utils';
import {Meta} from '@storybook/react';
import React from 'react';
import {SpectrumSearchAutocompleteProps} from '@react-types/autocomplete';

const StoryFn = ({storyFn}) => storyFn();

const meta: Meta<SpectrumSearchAutocompleteProps<{}>> = {
  title: 'SearchAutocomplete',
  component: SearchAutocomplete,
  decorators: [storyFn => <StoryFn storyFn={storyFn} />]
};

export default meta;

let options = [
  {id: 1, name: 'Aerospace'},
  {id: 2, name: 'Mechanical'},
  {id: 3, name: 'Civil'},
  {id: 4, name: 'Biomedical'},
  {id: 5, name: 'Nuclear'},
  {id: 6, name: 'Industrial'},
  {id: 7, name: 'Chemical'},
  {id: 8, name: 'Agricultural'},
  {id: 9, name: 'Electrical'}
];

let actions = {
  onOpenChange: action('onOpenChange'),
  onInputChange: action('onInputChange'),
  onBlur: action('onBlur'),
  onFocus: action('onFocus'),
  onChange: action('onChange'),
  onSubmit: action('onSubmit')
};

function Default(props) {
  return (
    <SearchAutocomplete label="Search with Autocomplete" {...mergeProps(props, actions)}>
      <Item>Aerospace</Item>
      <Item>Mechanical</Item>
      <Item>Civil</Item>
      <Item>Biomedical</Item>
      <Item>Nuclear</Item>
      <Item>Industrial</Item>
      <Item>Chemical</Item>
      <Item>Agricultural</Item>
      <Item>Electrical</Item>
    </SearchAutocomplete>
  );
}

function Dynamic(props) {
  return (
    <SearchAutocomplete defaultItems={options} label="Search with Autocomplete" {...mergeProps(props, actions)}>
      {(item: any) => <Item>{item.name}</Item>}
    </SearchAutocomplete>
  );
}

function Mapped(props) {
  return (
    <SearchAutocomplete label="Search with Autocomplete" {...mergeProps(props, actions)}>
      {options.map((item) => (
        <Item key={item.id}>
          {item.name}
        </Item>
      ))}
    </SearchAutocomplete>
  );
}

function CustomOnSubmit(props) {
  let [searchTerm, setSearchTerm] = React.useState('');

  let onSubmit = (value, key) => {
    if (value) {
      setSearchTerm(value);
    } else if (key) {
      setSearchTerm(options.find(o => o.id === key).name);
    }
  };

  return (
    <Flex direction="column">
      <SearchAutocomplete defaultItems={options} label="Search with Autocomplete" {...mergeProps(props, actions, {onSubmit})}>
        {(item: any) => <Item>{item.name}</Item>}
      </SearchAutocomplete>
      <div>
        Search results for: {searchTerm}
      </div>
    </Flex>
  );
}

export const Static = (props) => <Default {...props} />;
Static.storyName = 'static items';

export const DynamicItems = (props) => <Dynamic {...props} />;
DynamicItems.storyName = 'dynamic items';

export const NoItems = (props) =>  <Dynamic {...props} defaultItems={[]} />;
NoItems.storyName = 'no items';

export const MappedItems = (props) => <Mapped {...props} />;
MappedItems.storyName = 'with mapped items';

export const MenuTriggerFocus = (props) => <Default {...props} menuTrigger="focus" />;
MenuTriggerFocus.storyName = 'menuTrigger: focus';

export const MenuTriggerManual = (props) => <Default {...props} menuTrigger="manual" />;
MenuTriggerManual.storyName = 'menuTrigger: manual';

export const isQuiet = (props) => <Default {...props} isQuiet />;
isQuiet.storyName = 'isQuiet';

export const isDisabled = (props) => <Default {...props} isDisabled />;
isDisabled.storyName = 'isDisabled';

export const isReadOnly = (props) => <Default {...props} isReadOnly value="Read only" />;
isReadOnly.storyName = 'isReadOnly';

export const labelAlignEnd = (props) => <Default {...props} labelAlign="end" />;
labelAlignEnd.storyName = 'labelPosition: top, labelAlign: end';

export const labelPositionSide = (props) => <Default {...props} labelPosition="side" />;
labelPositionSide.storyName = 'labelPosition: side';

export const noVisibleLabel = (props) =>  <Default {...props} label={undefined} aria-label="Search Autocomplete" />;
noVisibleLabel.storyName = 'No visible label';

export const noVisibleLabelIsQuiet = (props) => <Default {...props} label={undefined} aria-label="Search Autocomplete" isQuiet />;
noVisibleLabelIsQuiet.storyName = 'No visible label, isQuiet';

export const isRequired = (props) => <Default {...props} isRequired />;
isRequired.storyName = 'isRequired';

export const isRequiredNecessityIndicatorLabel = (props) => <Default {...props} isRequired necessityIndicator="label"  />;
isRequiredNecessityIndicatorLabel.storyName = 'isRequired, necessityIndicator: label';

export const validationStateInvalid = (props) => <Default {...props} validationState="invalid" />;
validationStateInvalid.storyName = 'validationState: invalid';

export const validationStateValid = (props) => <Default {...props} validationState="invalid" />;
validationStateValid.storyName = 'validationState: valid';

export const validationStateInvalidIsQuiet = (props) => <Default {...props} validationState="invalid" isQuiet />;
validationStateInvalidIsQuiet.storyName = 'validationState: invalid, isQuiet';

export const validationStateValidIsQuiet = (props) => <Default {...props} validationState="valid" isQuiet />;
validationStateValidIsQuiet.storyName = 'validationState: valid, isQuiet';

export const placeholder = (props) => <Default {...props} placeholder="Search for an item..." />;
placeholder.storyName = 'placeholder';

export const autoFocus = (props) => <Default {...props} autoFocus />;
autoFocus.storyName = 'autoFocus: true';

export const directionTop = (props) => <Default {...props} direction="top" />;
directionTop.storyName = 'direction: top';

export const customWidth500 = (props) => <Default {...props} width="size-500" />;
customWidth500.storyName = 'custom width: size-500';

export const customWidth3000 = (props) => <Default {...props} width="size-3000'" />;
customWidth3000.storyName = 'custom width: size-3000';

export const customWidth6000 = (props) => <Default {...props} width="size-6000" />;
customWidth6000.storyName = 'custom width: size-6000';

export const customOnSubmit = (props) => <CustomOnSubmit {...props} />;
customOnSubmit.storyName = 'custom onSubmit';
