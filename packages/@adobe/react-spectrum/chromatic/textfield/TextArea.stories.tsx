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
import {TextArea} from '../../src/textfield/TextArea';

export default {
  title: 'TextArea',
  parameters: {
    chromaticProvider: {locales: ['en-US', 'ar-AE']}
  },
  excludeStories: ['render']
} as Meta<typeof TextArea>;

export type TextAreaStory = StoryObj<typeof TextArea>;

export const Default: TextAreaStory = {
  render: () => render()
};
export const ValueTestControlled: TextAreaStory = {
  render: () => render({value: 'Test'}),
  name: 'value: Test (controlled)'
};

export const ValidationStateInvalid: TextAreaStory = {
  render: () => render({validationState: 'invalid'}),
  name: 'validationState: invalid'
};

export const ValidationStateValid: TextAreaStory = {
  render: () => render({validationState: 'valid'}),
  name: 'validationState: valid'
};

export const IsReadOnlyTrue: TextAreaStory = {
  render: () => render({isReadOnly: true}),
  name: 'isReadOnly: true'
};

export const IsReadOnlyTrueValueReadOnlyValue: TextAreaStory = {
  render: () => render({value: 'Read only value', isReadOnly: true}),
  name: 'isReadOnly: true, value: read only value'
};

export const IsRequiredTrue: TextAreaStory = {
  render: () => render({isRequired: true}),
  name: 'isRequired: true'
};

export const IsRequiredTrueNecessityIndicatorLabel: TextAreaStory = {
  render: () => render({isRequired: true, necessityIndicator: 'label'}, false),
  name: 'isRequired: true, necessityIndicator: label'
};

export const IsRequiredFalseNecessityIndicatorLabel: TextAreaStory = {
  render: () => render({isRequired: false, necessityIndicator: 'label'}, false),
  name: 'isRequired: false, necessityIndicator: label'
};

export const IconInfo: TextAreaStory = {
  render: () => render({icon: <Info />}),
  name: 'icon: Info'
};

export const IconInfoValidationStateInvalid: TextAreaStory = {
  render: () => render({icon: <Info />, validationState: 'invalid'}),
  name: 'icon: Info, validationState: invalid'
};

export const LabelAlignEnd: TextAreaStory = {
  render: () => render({labelAlign: 'end'}, false),
  name: 'labelAlign: end'
};

export const LabelPositionSide: TextAreaStory = {
  render: () => render({labelPosition: 'side'}, false),
  name: 'labelPosition: side'
};

export const LabelAlignEndLabelPositionSide: TextAreaStory = {
  render: () => render({labelAlign: 'end', labelPosition: 'side'}, false),
  name: 'labelAlign: end, labelPosition: side'
};

export const NoVisibleLabel: TextAreaStory = {
  render: () => render({label: null, 'aria-label': 'Street address'}, false),
  name: 'no visible label'
};

export const CustomWidth: TextAreaStory = {
  render: () => render({icon: <Info />, validationState: 'invalid', width: 275}),
  name: 'custom width'
};

export const CustomHeight: TextAreaStory = {
  render: () => render({icon: <Info />, validationState: 'invalid', height: 350}),
  name: 'custom height'
};

export const _ContextualHelp: TextAreaStory = {
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

export const ContextualHelpLabelAlignEnd: TextAreaStory = {
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

export const ContextualHelpLabelPositionSide: TextAreaStory = {
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
      <TextArea label="Default" placeholder="React" {...props} />
      <TextArea label="Quiet" placeholder="React" isQuiet {...props} />
      {disabled && (
        <>
          <TextArea label="Disabled" placeholder="React" isDisabled {...props} />
          <TextArea label="Quiet + Disabled" placeholder="React" isQuiet isDisabled {...props} />
        </>
      )}
    </Flex>
  );
}
