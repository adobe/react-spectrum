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

import {Checkbox, CheckboxGroup, SpectrumCheckboxGroupProps} from '..';
import {Content, ContextualHelp, Heading} from '@adobe/react-spectrum';
import React from 'react';
import {StoryFn} from '@storybook/react';

export default {
  title: 'CheckboxGroup'
};

export type CheckboxGroupStory = StoryFn<typeof CheckboxGroup>;

export const Default: CheckboxGroupStory = () => render();
export const DefaultValueDragons: CheckboxGroupStory = () => render({defaultValue: ['dragons']});

DefaultValueDragons.story = {
  name: 'defaultValue: dragons'
};

export const LabelPositionSide: CheckboxGroupStory = () => render({labelPosition: 'side'});

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelAlignEnd: CheckboxGroupStory = () => render({labelAlign: 'end'});

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const Horizontal: CheckboxGroupStory = () => render({orientation: 'horizontal'});

Horizontal.story = {
  name: 'horizontal'
};

export const HorizontalLabelPositionSide: CheckboxGroupStory = () =>
  render({orientation: 'horizontal', labelPosition: 'side'});

HorizontalLabelPositionSide.story = {
  name: 'horizontal, labelPosition: side'
};

export const HorizontalLabelAlignEnd: CheckboxGroupStory = () =>
  render({orientation: 'horizontal', labelAlign: 'end'});

HorizontalLabelAlignEnd.story = {
  name: 'horizontal, labelAlign: end'
};

export const IsDisabled: CheckboxGroupStory = () => render({isDisabled: true});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsDisabledOnOneCheckbox: CheckboxGroupStory = () => render({}, [{}, {isDisabled: true}, {}]);

IsDisabledOnOneCheckbox.story = {
  name: 'isDisabled on one checkbox'
};

export const IsDisabledTwoCheckboxesAndOneChecked: CheckboxGroupStory = () =>
  render({defaultValue: ['dragons']}, [{}, {isDisabled: true}, {isDisabled: true}]);

IsDisabledTwoCheckboxesAndOneChecked.story = {
  name: 'isDisabled two checkboxes and one checked'
};

export const IsEmphasizedIsDisabledTwoCheckboxesAndOneChecked: CheckboxGroupStory = () =>
  render({isEmphasized: true, defaultValue: ['dragons']}, [
    {},
    {isDisabled: true},
    {isDisabled: true}
  ]);

IsEmphasizedIsDisabledTwoCheckboxesAndOneChecked.story = {
  name: 'isEmphasized, isDisabled two checkboxes and one checked'
};

export const IsDisabledOnOneCheckboxHorizontal: CheckboxGroupStory = () =>
  render({orientation: 'horizontal'}, [{}, {isDisabled: true}, {}]);

IsDisabledOnOneCheckboxHorizontal.story = {
  name: 'isDisabled on one checkbox horizontal'
};

export const IsRequired: CheckboxGroupStory = () => render({isRequired: true});

IsRequired.story = {
  name: 'isRequired'
};

export const IsRequiredNecessityIndicatorLabel: CheckboxGroupStory = () =>
  render({isRequired: true, necessityIndicator: 'label'});

IsRequiredNecessityIndicatorLabel.story = {
  name: 'isRequired, necessityIndicator: label'
};

export const NecessityIndicatorLabelLabelPositionSide: CheckboxGroupStory = () =>
  render({necessityIndicator: 'label', labelPosition: 'side'});

NecessityIndicatorLabelLabelPositionSide.story = {
  name: 'necessityIndicator: label, labelPosition: side'
};

export const IsReadOnly: CheckboxGroupStory = () => render({isReadOnly: true});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const IsEmphasized: CheckboxGroupStory = () => render({isEmphasized: true});

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const ValidationStateInvalid: CheckboxGroupStory = () => render({isInvalid: true});

ValidationStateInvalid.story = {
  name: 'validationState: "invalid"'
};

export const ValidationStateInvalidOnOneCheckbox: CheckboxGroupStory = () =>
  render({}, [{}, {isInvalid: true}, {}]);

ValidationStateInvalidOnOneCheckbox.story = {
  name: 'validationState: "invalid" on one checkbox'
};

export const WithDescription: CheckboxGroupStory = () => render({description: 'Please select some pets.'});

WithDescription.story = {
  name: 'with description'
};

export const WithErrorMessage: CheckboxGroupStory = () =>
  render({
    errorMessage: 'Please select a valid combination of pets.',
    isInvalid: true
  });

WithErrorMessage.story = {
  name: 'with error message'
};

export const WithErrorMessageAndErrorIcon: CheckboxGroupStory = () =>
  render({
    errorMessage: 'Please select a valid combination of pets.',
    isInvalid: true,
    showErrorIcon: true
  });

WithErrorMessageAndErrorIcon.story = {
  name: 'with error message and error icon'
};

export const _ContextualHelp: CheckboxGroupStory = (args) =>
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
  });

_ContextualHelp.story = {
  name: 'contextual help'
};

export const NoVisibleLabel: CheckboxGroupStory = () => render({label: null, 'aria-label': 'Pets'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const AutoFocusOnOneCheckbox: CheckboxGroupStory = () => render({}, [{}, {autoFocus: true}, {}]);

AutoFocusOnOneCheckbox.story = {
  name: 'autoFocus on one checkbox'
};

export const FormName: CheckboxGroupStory = () => render({name: 'pets'});

FormName.story = {
  name: 'form name'
};

export const ShowErrorIcon: CheckboxGroupStory = () =>
  render({isInvalid: true, errorMessage: 'Error message.', showErrorIcon: true});

ShowErrorIcon.story = {
  name: 'show error icon'
};

function render(props: Omit<SpectrumCheckboxGroupProps, 'children'> = {}, checkboxProps: any[] = []) {
  return (
    <CheckboxGroup label="Pets" {...props}>
      <Checkbox value="dogs" {...checkboxProps[0]}>Dogs</Checkbox>
      <Checkbox value="cats" {...checkboxProps[1]}>Cats</Checkbox>
      <Checkbox value="dragons" {...checkboxProps[2]}>Dragons</Checkbox>
    </CheckboxGroup>
  );
}
