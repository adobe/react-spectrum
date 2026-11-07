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
import {DateRangePicker} from '../../src/datepicker/DateRangePicker';
import {Heading} from '../../src/text/Heading';
import {Meta, StoryObj} from '@storybook/react';
import {parseDate, toZoned} from '@internationalized/date';
import React from 'react';
import {render} from './DateRangePicker.stories';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/DateRangePicker/styling',
  decorators: [BlockDecorator]
} as Meta<typeof DateRangePicker>;

export type DateRangePickerStory = StoryObj<typeof DateRangePicker>;

export const IsQuiet: DateRangePickerStory = {
  render: () => render({isQuiet: true}),
  name: 'isQuiet'
};

export const LabelPositionSide: DateRangePickerStory = {
  render: args => render({labelPosition: 'side', ...args}),
  name: 'labelPosition: side'
};

export const LabelAlignEnd: DateRangePickerStory = {
  render: args => render({labelPosition: 'top', labelAlign: 'end', ...args}),
  name: 'labelAlign: end'
};

export const Required: DateRangePickerStory = {
  render: args => render({isRequired: true, ...args}),
  name: 'required'
};

export const RequiredWithLabel: DateRangePickerStory = {
  render: args => render({isRequired: true, necessityIndicator: 'label', ...args}),
  name: 'required with label'
};

export const Optional: DateRangePickerStory = {
  render: args => render({necessityIndicator: 'label', ...args}),
  name: 'optional'
};

export const NoVisibleLabel: DateRangePickerStory = {
  render: args => render({'aria-label': 'Date range', label: null, ...args}),
  name: 'no visible label'
};

export const QuietNoVisibleLabel: DateRangePickerStory = {
  render: args => render({isQuiet: true, 'aria-label': 'Date range', label: null, ...args}),
  name: 'quiet no visible label'
};

export const CustomWidth: DateRangePickerStory = {
  render: args => render({width: 'size-4600', ...args}),
  name: 'custom width'
};

export const QuietCustomWidth: DateRangePickerStory = {
  render: args => render({isQuiet: true, width: 'size-4600', ...args}),
  name: 'quiet custom width'
};

export const CustomWidthNoVisibleLabel: DateRangePickerStory = {
  render: args => render({width: 'size-4600', label: null, 'aria-label': 'Date range', ...args}),
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide: DateRangePickerStory = {
  render: args => render({width: 'size-4600', labelPosition: 'side', ...args}),
  name: 'custom width, labelPosition=side'
};

export const Description: DateRangePickerStory = {
  render: args => render({description: 'Help text', ...args}),
  name: 'description'
};

export const ErrorMessage: DateRangePickerStory = {
  render: args =>
    render({errorMessage: 'Dates must be after today', validationState: 'invalid', ...args}),
  name: 'errorMessage'
};

export const InvalidWithTime: DateRangePickerStory = {
  render: args =>
    render({
      validationState: 'invalid',
      granularity: 'minute',
      defaultValue: {
        start: toZoned(parseDate('2020-02-03'), 'America/New_York'),
        end: toZoned(parseDate('2020-02-12'), 'America/Los_Angeles')
      },
      ...args
    }),
  name: 'invalid with time'
};

export const _ContextualHelp: DateRangePickerStory = {
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

export const InScrollableContainer: DateRangePickerStory = {
  render: () => <div style={{height: '200vh'}}>{render({granularity: 'second'})}</div>,
  name: 'in scrollable container'
};

export const ShouldFlipFalse: DateRangePickerStory = {
  render: args => render({shouldFlip: false, ...args}),
  name: 'shouldFlip: false'
};
