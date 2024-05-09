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

import {Content, ContextualHelp, Heading} from '@adobe/react-spectrum';
import {Flex} from '@react-spectrum/layout';
import Info from '@spectrum-icons/workflow/Info';
import React from 'react';
import {TextField} from '../';

export default {
  title: 'Textfield',
  parameters: {
    chromaticProvider: {locales: ['en-US', 'ar-AE']}
  },
  excludeStories: ['render']
};

export const Default = () => render();
export const ValueTest = () => render({value: 'Test'});

ValueTest.story = {
  name: 'value: Test'
};

export const ValidationStateInvalid = () => render({validationState: 'invalid'});

ValidationStateInvalid.story = {
  name: 'validationState: invalid'
};

export const ValidationStateValid = () => render({validationState: 'valid'});

ValidationStateValid.story = {
  name: 'validationState: valid'
};

export const IsReadOnlyTrue = () => render({isReadOnly: true});

IsReadOnlyTrue.story = {
  name: 'isReadOnly: true'
};

export const IsReadOnlyTrueWithValue = () => render({value: 'Read only value', isReadOnly: true});

IsReadOnlyTrueWithValue.story = {
  name: 'isReadOnly: true, with value'
};

export const IsRequiredTrue = () => render({isRequired: true});

IsRequiredTrue.story = {
  name: 'isRequired: true'
};

export const IsRequiredTrueNecessityIndicatorLabel = () => render({isRequired: true, necessityIndicator: 'label'}, false);

IsRequiredTrueNecessityIndicatorLabel.story = {
  name: 'isRequired: true, necessityIndicator: label'
};

export const IsRequiredFalseNecessityIndicatorLabel = () => render({isRequired: false, necessityIndicator: 'label'}, false);

IsRequiredFalseNecessityIndicatorLabel.story = {
  name: 'isRequired: false, necessityIndicator: label'
};

export const IconInfo = () => render({icon: <Info />});

IconInfo.story = {
  name: 'icon: Info'
};

export const IconInfoValidationStateInvalid = () => render({icon: <Info />, validationState: 'invalid'});

IconInfoValidationStateInvalid.story = {
  name: 'icon: Info, validationState: invalid'
};

export const LabelAlignEnd = () => render({labelAlign: 'end'}, false);

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const LabelPositionSide = () => render({labelPosition: 'side'}, false);

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelAlignEndLabelPositionSide = () => render({labelAlign: 'end', labelPosition: 'side'}, false);

LabelAlignEndLabelPositionSide.story = {
  name: 'labelAlign: end, labelPosition: side'
};

export const NoVisibleLabel = () => render({label: null, 'aria-label': 'Street address'}, false);

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const CustomWidth = () => render({icon: <Info />, validationState: 'invalid', width: 275});

CustomWidth.story = {
  name: 'custom width'
};

export const _ContextualHelp = args => render({...args, contextualHelp: (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
)}, false);

_ContextualHelp.story = {
  name: 'contextual help'
};

export const ContextualHelpLabelAlignEnd = args => render({...args, labelAlign: 'end', contextualHelp: (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
)}, false);

ContextualHelpLabelAlignEnd.story = {
  name: 'contextual help, labelAlign: end'
};

export const ContextualHelpLabelPositionSide = args => render({...args, labelPosition: 'side', contextualHelp: (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
)}, false);

ContextualHelpLabelPositionSide.story = {
  name: 'contextual help, labelPosition: side'
};

// allow some stories where disabled styles probably won't affect anything to turn that off, mostly to reduce clutter
export function render(props = {}, disabled = true) {
  return (
    <Flex gap="size-100" wrap>
      <TextField
        label="Default"
        placeholder="React"
        {...props} />
      <TextField
        label="Quiet"
        placeholder="React"
        isQuiet
        {...props} />
      {disabled && (
        <>
          <TextField
            label="Disabled"
            placeholder="React"
            isDisabled
            {...props} />
          <TextField
            label="Quiet + Disabled"
            placeholder="React"
            isQuiet
            isDisabled
            {...props} />
        </>
      )}
    </Flex>
  );
}
