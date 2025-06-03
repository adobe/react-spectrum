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
import {ActionButton} from '@react-spectrum/button';
import Filter from '@spectrum-icons/workflow/Filter';
import {Flex} from '@react-spectrum/layout';
import {Item, Picker} from '@react-spectrum/picker';
import React, {useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchWithin} from '../';
import {SpectrumPickerProps} from '@react-types/select';
import {SpectrumSearchFieldProps} from '@react-types/searchfield';
import {SpectrumSearchWithinProps} from '@react-types/searchwithin';

export default {
  title: 'SearchWithin'
};

interface SearchWithinProps extends Omit<SpectrumSearchWithinProps, 'children'> {
  searchFieldProps?: SpectrumSearchFieldProps,
  pickerProps?: Omit<SpectrumPickerProps<object>, 'children'>
}

function RenderSearchWithin(props: SearchWithinProps = {}) {
  let {searchFieldProps, pickerProps, ...rest} = props;
  return (
    <SearchWithin label="This is label" {...rest}>
      <SearchField {...searchFieldProps} onChange={action('change')} onSubmit={action('submit')} />
      <Picker defaultSelectedKey="all" {...pickerProps} onSelectionChange={action('selectionChange')}>
        <Item key="all">All</Item>
        <Item key="campaigns">Campaigns</Item>
        <Item key="audiences">Audiences</Item>
        <Item key="tags">Tags</Item>
        <Item key="long">This item is very long and word wraps poorly</Item>
      </Picker>
    </SearchWithin>
  );
}

function RenderReverse(props: SearchWithinProps = {}) {
  let {searchFieldProps, pickerProps, ...rest} = props;
  return (
    <SearchWithin label="Test label" {...props}>
      <Picker defaultSelectedKey="all" {...pickerProps} onSelectionChange={action('selectionChange')}>
        <Item key="all">All</Item>
        <Item key="campaigns">Campaigns</Item>
        <Item key="audiences">Audiences</Item>
        <Item key="tags">Tags</Item>
        <Item key="long">This item is very long and word wraps poorly</Item>
      </Picker>
      <SearchField {...searchFieldProps} onChange={action('change')} onSubmit={action('submit')} />
    </SearchWithin>
  );
}

function ResizeSearchWithinApp(props) {
  const [state, setState] = useState(true);

  return (
    <Flex direction="column" gap="size-200" alignItems="start">
      <div style={{width: state ? '300px' : '400px'}}>
        <SearchWithin label="Test label" {...props} width="100%">
          <SearchField onChange={action('change')} onSubmit={action('submit')} />
          <Picker defaultSelectedKey="all" onSelectionChange={action('selectionChange')}>
            <Item key="all">All</Item>
            <Item key="campaigns">Campaigns</Item>
            <Item key="audiences">Audiences</Item>
            <Item key="tags">Tags</Item>
            <Item key="long">This item is very long and word wraps poorly</Item>
          </Picker>
        </SearchWithin>
      </div>
      <ActionButton onPress={() => setState(!state)}>Toggle size</ActionButton>
    </Flex>
  );
}

export const Default = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  )
};

export const ValueControlled = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {value: 'Controlled'}
  },
  name: 'value (controlled)'
};

export const isDisabled = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    isDisabled: true
  },
  name: 'isDisabled: true'
};

export const isRequired = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    isRequired: true
  },
  name: 'isRequired: true'
};

export const isReadOnly = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {isReadOnly: true, value: 'Read Only'}
  },
  name: 'isReadOnly: true'
};

export const searchfieldDefaultValue = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {defaultValue: 'Default Value'}
  },
  name: 'Default value for Searchfield'
};

export const pickerDefaultValue = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    pickerProps: {defaultSelectedKey: 'tags'}
  },
  name: 'Default value for Picker'
};

export const isRequiredNecessityIndicatorLabel = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    isRequired: true,
    necessityIndicator: 'label'
  },
  name: 'isRequired: true, necessityIndicator "label"'
};

export const isRequiredFalse_necessityIndicator = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    isRequired: false,
    necessityIndicator: 'label'
  },
  name: 'isRequired: false, necessityIndicator "label"'
};

export const InputValidationSateInvalid = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {validationState: 'invalid'}
  },
  name: 'input validationState: invalid'
};

export const PickerValidationSateInvalid = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    pickerProps: {isInvalid: true}
  },
  name: 'picker validationState: invalid'
};

export const PickerDisabled = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    pickerProps: {isDisabled: true}
  },
  name: 'picker isDisabled: true'
};

export const CustomWidth300 = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    width: 300
  },
  name: 'Custom width: 300'
};

export const CustomWidth30 = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    width: 30
  },
  name: 'Custom width: 30'
};

export const LabelPositionSide = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    labelPosition: 'side'
  },
  name: 'labelPosition: side'
};

export const NoVisibleLabel = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    label: undefined,
    'aria-label': 'Test aria label'
  },
  name: 'no visible label'
};

export const ExternalLabel = {
  render: (args) => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <span id="foo">External label</span>
      <RenderSearchWithin {...args} />
    </div>
  ),
  args: {
    label: undefined,
    'aria-labelledby': 'foo'
  },
  name: 'external label'
};

export const AutoFocusSearchField = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {autoFocus: true}
  },
  name: 'autoFocus: true on SearchField'
};

export const AutoFocusPicker = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    pickerProps: {autoFocus: true}
  },
  name: 'autoFocus: true on Picker'
};

export const ReverseChildrenOrder = {
  render: (args) => (
    <RenderReverse {...args} />
  )
};

export const ResizeSearchWithin = {
  render: (args) => (
    <ResizeSearchWithinApp {...args} />
  )
};

export const ResizeSearchWithinNoLabel = {
  render: (args) => (
    <ResizeSearchWithinApp {...args} />
  ),
  args: {
    label: null
  }
};

export const iconFilter = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {icon: <Filter />}
  },
  name: 'icon: Filter'
};

export const iconNull = {
  render: (args) => (
    <RenderSearchWithin {...args} />
  ),
  args: {
    searchFieldProps: {icon: null}
  },
  name: 'icon: null'
};
