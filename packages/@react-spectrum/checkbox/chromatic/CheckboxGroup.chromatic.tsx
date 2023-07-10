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

export default {
  title: 'CheckboxGroup'
};

export const Default = () => render();
export const DefaultValueDragons = () => render({defaultValue: ['dragons']});

DefaultValueDragons.story = {
  name: 'defaultValue: dragons'
};

export const LabelPositionSide = () => render({labelPosition: 'side'});

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelAlignEnd = () => render({labelAlign: 'end'});

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const Horizontal = () => render({orientation: 'horizontal'});

Horizontal.story = {
  name: 'horizontal'
};

export const HorizontalLabelPositionSide = () =>
  render({orientation: 'horizontal', labelPosition: 'side'});

HorizontalLabelPositionSide.story = {
  name: 'horizontal, labelPosition: side'
};

export const HorizontalLabelAlignEnd = () =>
  render({orientation: 'horizontal', labelAlign: 'end'});

HorizontalLabelAlignEnd.story = {
  name: 'horizontal, labelAlign: end'
};

export const IsDisabled = () => render({isDisabled: true});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsDisabledOnOneCheckbox = () => render({}, [{}, {isDisabled: true}, {}]);

IsDisabledOnOneCheckbox.story = {
  name: 'isDisabled on one checkbox'
};

export const IsDisabledTwoCheckboxesAndOneChecked = () =>
  render({defaultValue: ['dragons']}, [{}, {isDisabled: true}, {isDisabled: true}]);

IsDisabledTwoCheckboxesAndOneChecked.story = {
  name: 'isDisabled two checkboxes and one checked'
};

export const IsEmphasizedIsDisabledTwoCheckboxesAndOneChecked = () =>
  render({isEmphasized: true, defaultValue: ['dragons']}, [
    {},
    {isDisabled: true},
    {isDisabled: true}
  ]);

IsEmphasizedIsDisabledTwoCheckboxesAndOneChecked.story = {
  name: 'isEmphasized, isDisabled two checkboxes and one checked'
};

export const IsDisabledOnOneCheckboxHorizontal = () =>
  render({orientation: 'horizontal'}, [{}, {isDisabled: true}, {}]);

IsDisabledOnOneCheckboxHorizontal.story = {
  name: 'isDisabled on one checkbox horizontal'
};

export const IsRequired = () => render({isRequired: true});

IsRequired.story = {
  name: 'isRequired'
};

export const IsRequiredNecessityIndicatorLabel = () =>
  render({isRequired: true, necessityIndicator: 'label'});

IsRequiredNecessityIndicatorLabel.story = {
  name: 'isRequired, necessityIndicator: label'
};

export const NecessityIndicatorLabelLabelPositionSide = () =>
  render({necessityIndicator: 'label', labelPosition: 'side'});

NecessityIndicatorLabelLabelPositionSide.story = {
  name: 'necessityIndicator: label, labelPosition: side'
};

export const IsReadOnly = () => render({isReadOnly: true});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const IsEmphasized = () => render({isEmphasized: true});

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const ValidationStateInvalid = () => render({validationState: 'invalid'});

ValidationStateInvalid.story = {
  name: 'validationState: "invalid"'
};

export const ValidationStateInvalidOnOneCheckbox = () =>
  render({}, [{}, {validationState: 'invalid'}, {}]);

ValidationStateInvalidOnOneCheckbox.story = {
  name: 'validationState: "invalid" on one checkbox'
};

export const WithDescription = () => render({description: 'Please select some pets.'});

WithDescription.story = {
  name: 'with description'
};

export const WithErrorMessage = () =>
  render({
    errorMessage: 'Please select a valid combination of pets.',
    validationState: 'invalid'
  });

WithErrorMessage.story = {
  name: 'with error message'
};

export const WithErrorMessageAndErrorIcon = () =>
  render({
    errorMessage: 'Please select a valid combination of pets.',
    validationState: 'invalid',
    showErrorIcon: true
  });

WithErrorMessageAndErrorIcon.story = {
  name: 'with error message and error icon'
};

export const _ContextualHelp = (args) =>
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

export const NoVisibleLabel = () => render({label: null, 'aria-label': 'Pets'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const AutoFocusOnOneCheckbox = () => render({}, [{}, {autoFocus: true}, {}]);

AutoFocusOnOneCheckbox.story = {
  name: 'autoFocus on one checkbox'
};

export const FormName = () => render({name: 'pets'});

FormName.story = {
  name: 'form name'
};

export const ShowErrorIcon = () =>
  render({validationState: 'invalid', errorMessage: 'Error message.', showErrorIcon: true});

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
