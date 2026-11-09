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
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {render} from './TimeField.stories';
import {TimeField} from '../../src/datepicker/TimeField';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/TimeField/styling',
  decorators: [BlockDecorator]
} as Meta<typeof TimeField>;

export type TimeFieldStory = StoryObj<typeof TimeField>;

export const IsQuiet: TimeFieldStory = {
  render: () => render({isQuiet: true}),
  name: 'isQuiet'
};

export const LabelPositionSide: TimeFieldStory = {
  render: () => render({labelPosition: 'side'}),
  name: 'labelPosition: side'
};

export const LabelAlignEnd: TimeFieldStory = {
  render: () => render({labelPosition: 'top', labelAlign: 'end'}),
  name: 'labelAlign: end'
};

export const Required: TimeFieldStory = {
  render: () => render({isRequired: true}),
  name: 'required'
};

export const RequiredWithLabel: TimeFieldStory = {
  render: () => render({isRequired: true, necessityIndicator: 'label'}),
  name: 'required with label'
};

export const Optional: TimeFieldStory = {
  render: () => render({necessityIndicator: 'label'}),
  name: 'optional'
};

export const NoVisibleLabel: TimeFieldStory = {
  render: () => render({'aria-label': 'Time', label: null}),
  name: 'no visible label'
};

export const QuietNoVisibleLabel: TimeFieldStory = {
  render: () => render({isQuiet: true, 'aria-label': 'Time', label: null}),
  name: 'quiet no visible label'
};

export const CustomWidth: TimeFieldStory = {
  render: () => render({width: 'size-3000'}),
  name: 'custom width'
};

export const QuietCustomWidth: TimeFieldStory = {
  render: () => render({isQuiet: true, width: 'size-3000'}),
  name: 'quiet custom width'
};

export const CustomWidthNoVisibleLabel: TimeFieldStory = {
  render: () => render({width: 'size-3000', label: null, 'aria-label': 'Time'}),
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide: TimeFieldStory = {
  render: () => render({width: 'size-3000', labelPosition: 'side'}),
  name: 'custom width, labelPosition=side'
};

export const Description: TimeFieldStory = {
  render: () => render({description: 'Help text'}),
  name: 'description'
};

export const ErrorMessage: TimeFieldStory = {
  render: () =>
    render({errorMessage: 'Time must be between 9 AM and 5 PM', validationState: 'invalid'}),
  name: 'errorMessage'
};

export const _ContextualHelp: TimeFieldStory = {
  render: () =>
    render({
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
