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

import {Content} from '../../src/view/Content';

import {ContextualHelp} from '../../src/contextualhelp/ContextualHelp';
import {Flex} from '../../src/layout/Flex';
import {Heading} from '../../src/text/Heading';
import Info from '@spectrum-icons/workflow/Info';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import {TextField} from '../../src/textfield/TextField';

export default {
  title: 'Textfield',
  parameters: {
    chromaticProvider: {locales: ['en-US', 'ar-AE']}
  },
  excludeStories: ['render']
} as Meta<typeof TextField>;

export type TextFieldStory = StoryObj<typeof TextField>;

export const Default: TextFieldStory = {
  render: () => render()
};
export const ValueTest: TextFieldStory = {
  render: () => render({value: 'Test'}),
  name: 'value: Test'
};

export const ValidationStateInvalid: TextFieldStory = {
  render: () => render({validationState: 'invalid'}),
  name: 'validationState: invalid'
};

export const ValidationStateValid: TextFieldStory = {
  render: () => render({validationState: 'valid'}),
  name: 'validationState: valid'
};

export const IsReadOnlyTrue: TextFieldStory = {
  render: () => render({isReadOnly: true}),
  name: 'isReadOnly: true'
};

export const IsReadOnlyTrueWithValue: TextFieldStory = {
  render: () => render({value: 'Read only value', isReadOnly: true}),
  name: 'isReadOnly: true, with value'
};

export const IsRequiredTrue: TextFieldStory = {
  render: () => render({isRequired: true}),
  name: 'isRequired: true'
};

export const IsRequiredTrueNecessityIndicatorLabel: TextFieldStory = {
  render: () => render({isRequired: true, necessityIndicator: 'label'}, false),
  name: 'isRequired: true, necessityIndicator: label'
};

export const IsRequiredFalseNecessityIndicatorLabel: TextFieldStory = {
  render: () => render({isRequired: false, necessityIndicator: 'label'}, false),
  name: 'isRequired: false, necessityIndicator: label'
};

export const IconInfo: TextFieldStory = {
  render: () => render({icon: <Info />}),
  name: 'icon: Info'
};

export const IconInfoValidationStateInvalid: TextFieldStory = {
  render: () => render({icon: <Info />, validationState: 'invalid'}),
  name: 'icon: Info, validationState: invalid'
};

export const LabelAlignEnd: TextFieldStory = {
  render: () => render({labelAlign: 'end'}, false),
  name: 'labelAlign: end'
};

export const LabelPositionSide: TextFieldStory = {
  render: () => render({labelPosition: 'side'}, false),
  name: 'labelPosition: side'
};

export const LabelAlignEndLabelPositionSide: TextFieldStory = {
  render: () => render({labelAlign: 'end', labelPosition: 'side'}, false),
  name: 'labelAlign: end, labelPosition: side'
};

export const NoVisibleLabel: TextFieldStory = {
  render: () => render({label: null, 'aria-label': 'Street address'}, false),
  name: 'no visible label'
};

export const CustomWidth: TextFieldStory = {
  render: () => render({icon: <Info />, validationState: 'invalid', width: 275}),
  name: 'custom width'
};

export const _ContextualHelp: TextFieldStory = {
  render: args =>
    render(
      {
        ...args,
        contextualHelp: (
          <ContextualHelp>
            <Heading>What is a segment?</Heading>
            <Content>
              Segments identify who your visitors are, what devices and services they use, where
              they navigated from, and much more.
            </Content>
          </ContextualHelp>
        )
      },
      false
    ),
  name: 'contextual help'
};

export const ContextualHelpLabelAlignEnd: TextFieldStory = {
  render: args =>
    render(
      {
        ...args,
        labelAlign: 'end',
        contextualHelp: (
          <ContextualHelp>
            <Heading>What is a segment?</Heading>
            <Content>
              Segments identify who your visitors are, what devices and services they use, where
              they navigated from, and much more.
            </Content>
          </ContextualHelp>
        )
      },
      false
    ),
  name: 'contextual help, labelAlign: end'
};

export const ContextualHelpLabelPositionSide: TextFieldStory = {
  render: args =>
    render(
      {
        ...args,
        labelPosition: 'side',
        contextualHelp: (
          <ContextualHelp>
            <Heading>What is a segment?</Heading>
            <Content>
              Segments identify who your visitors are, what devices and services they use, where
              they navigated from, and much more.
            </Content>
          </ContextualHelp>
        )
      },
      false
    ),
  name: 'contextual help, labelPosition: side'
};

// allow some stories where disabled styles probably won't affect anything to turn that off, mostly to reduce clutter
export function render(props = {}, disabled = true): JSX.Element {
  return (
    <Flex gap="size-100" wrap>
      <TextField label="Default" placeholder="React" {...props} />
      <TextField label="Quiet" placeholder="React" isQuiet {...props} />
      {disabled && (
        <>
          <TextField label="Disabled" placeholder="React" isDisabled {...props} />
          <TextField label="Quiet + Disabled" placeholder="React" isQuiet isDisabled {...props} />
        </>
      )}
    </Flex>
  );
}
