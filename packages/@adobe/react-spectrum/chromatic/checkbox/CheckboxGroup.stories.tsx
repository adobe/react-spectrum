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

import {Checkbox} from '../../src/checkbox/Checkbox';

import {CheckboxGroup, SpectrumCheckboxGroupProps} from '../../src/checkbox/CheckboxGroup';
import {Content} from '../../src/view/Content';
import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Heading} from '../../src/text/Heading';
import React from 'react';
import {StoryObj} from '@storybook/react';

export default {
  title: 'CheckboxGroup'
};

export type CheckboxGroupStory = StoryObj<typeof CheckboxGroup>;

export const Default: CheckboxGroupStory = {
  render: () => render()
};
export const DefaultValueDragons: CheckboxGroupStory = {
  render: () => render({defaultValue: ['dragons']}),
  name: 'defaultValue: dragons'
};

export const LabelPositionSide: CheckboxGroupStory = {
  render: () => render({labelPosition: 'side'}),
  name: 'labelPosition: side'
};

export const LabelAlignEnd: CheckboxGroupStory = {
  render: () => render({labelAlign: 'end'}),
  name: 'labelAlign: end'
};

export const Horizontal: CheckboxGroupStory = {
  render: () => render({orientation: 'horizontal'}),
  name: 'horizontal'
};

export const HorizontalLabelPositionSide: CheckboxGroupStory = {
  render: () => render({orientation: 'horizontal', labelPosition: 'side'}),
  name: 'horizontal, labelPosition: side'
};

export const HorizontalLabelAlignEnd: CheckboxGroupStory = {
  render: () => render({orientation: 'horizontal', labelAlign: 'end'}),
  name: 'horizontal, labelAlign: end'
};

export const IsDisabled: CheckboxGroupStory = {
  render: () => render({isDisabled: true}),
  name: 'isDisabled'
};

export const IsDisabledOnOneCheckbox: CheckboxGroupStory = {
  render: () => render({}, [{}, {isDisabled: true}, {}]),
  name: 'isDisabled on one checkbox'
};

export const IsDisabledTwoCheckboxesAndOneChecked: CheckboxGroupStory = {
  render: () => render({defaultValue: ['dragons']}, [{}, {isDisabled: true}, {isDisabled: true}]),
  name: 'isDisabled two checkboxes and one checked'
};

export const IsEmphasizedIsDisabledTwoCheckboxesAndOneChecked: CheckboxGroupStory = {
  render: () =>
    render({isEmphasized: true, defaultValue: ['dragons']}, [
      {},
      {isDisabled: true},
      {isDisabled: true}
    ]),
  name: 'isEmphasized, isDisabled two checkboxes and one checked'
};

export const IsDisabledOnOneCheckboxHorizontal: CheckboxGroupStory = {
  render: () => render({orientation: 'horizontal'}, [{}, {isDisabled: true}, {}]),
  name: 'isDisabled on one checkbox horizontal'
};

export const IsRequired: CheckboxGroupStory = {
  render: () => render({isRequired: true}),
  name: 'isRequired'
};

export const IsRequiredNecessityIndicatorLabel: CheckboxGroupStory = {
  render: () => render({isRequired: true, necessityIndicator: 'label'}),
  name: 'isRequired, necessityIndicator: label'
};

export const NecessityIndicatorLabelLabelPositionSide: CheckboxGroupStory = {
  render: () => render({necessityIndicator: 'label', labelPosition: 'side'}),
  name: 'necessityIndicator: label, labelPosition: side'
};

export const IsReadOnly: CheckboxGroupStory = {
  render: () => render({isReadOnly: true}),
  name: 'isReadOnly'
};

export const IsEmphasized: CheckboxGroupStory = {
  render: () => render({isEmphasized: true}),
  name: 'isEmphasized'
};

export const ValidationStateInvalid: CheckboxGroupStory = {
  render: () => render({isInvalid: true}),
  name: 'validationState: "invalid"'
};

export const ValidationStateInvalidOnOneCheckbox: CheckboxGroupStory = {
  render: () => render({}, [{}, {isInvalid: true}, {}]),
  name: 'validationState: "invalid" on one checkbox'
};

export const WithDescription: CheckboxGroupStory = {
  render: () => render({description: 'Please select some pets.'}),
  name: 'with description'
};

export const WithErrorMessage: CheckboxGroupStory = {
  render: () =>
    render({
      errorMessage: 'Please select a valid combination of pets.',
      isInvalid: true
    }),
  name: 'with error message'
};

export const WithErrorMessageAndErrorIcon: CheckboxGroupStory = {
  render: () =>
    render({
      errorMessage: 'Please select a valid combination of pets.',
      isInvalid: true,
      showErrorIcon: true
    }),
  name: 'with error message and error icon'
};

export const _ContextualHelp: CheckboxGroupStory = {
  render: args =>
    render({
      ...args,
      contextualHelp: (
        <ContextualHelp>
          <Heading>What is a segment?</Heading>
          <Content>
            Segments identify who your visitors are, what devices and services they use, where they
            navigated from, and much more.
          </Content>
        </ContextualHelp>
      )
    }),
  name: 'contextual help'
};

export const NoVisibleLabel: CheckboxGroupStory = {
  render: () => render({label: null, 'aria-label': 'Pets'}),
  name: 'no visible label'
};

export const AutoFocusOnOneCheckbox: CheckboxGroupStory = {
  render: () => render({}, [{}, {autoFocus: true}, {}]),
  name: 'autoFocus on one checkbox'
};

export const FormName: CheckboxGroupStory = {
  render: () => render({name: 'pets'}),
  name: 'form name'
};

export const ShowErrorIcon: CheckboxGroupStory = {
  render: () => render({isInvalid: true, errorMessage: 'Error message.', showErrorIcon: true}),
  name: 'show error icon'
};

function render(
  props: Omit<SpectrumCheckboxGroupProps, 'children'> = {},
  checkboxProps: any[] = []
) {
  return (
    <CheckboxGroup label="Pets" {...props}>
      <Checkbox value="dogs" {...checkboxProps[0]}>
        Dogs
      </Checkbox>
      <Checkbox value="cats" {...checkboxProps[1]}>
        Cats
      </Checkbox>
      <Checkbox value="dragons" {...checkboxProps[2]}>
        Dragons
      </Checkbox>
    </CheckboxGroup>
  );
}
