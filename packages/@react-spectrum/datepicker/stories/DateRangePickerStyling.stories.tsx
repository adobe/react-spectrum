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

import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {DateRangePicker} from '../';
import {Heading} from '@react-spectrum/text';
import {Meta, StoryFn} from '@storybook/react';
import {parseDate, toZoned} from '@internationalized/date';
import React from 'react';
import {render} from './DateRangePicker.stories';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/DateRangePicker/styling',
  decorators: [BlockDecorator]
} as Meta<typeof DateRangePicker>;

export type DateRangePickerStory = StoryFn<typeof DateRangePicker>;

export const IsQuiet: DateRangePickerStory = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const LabelPositionSide: DateRangePickerStory = (args) => render({labelPosition: 'side', ...args});

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelAlignEnd: DateRangePickerStory = (args) => render({labelPosition: 'top', labelAlign: 'end', ...args});

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const Required: DateRangePickerStory = (args) => render({isRequired: true, ...args});

Required.story = {
  name: 'required'
};

export const RequiredWithLabel: DateRangePickerStory = (args) => render({isRequired: true, necessityIndicator: 'label', ...args});

RequiredWithLabel.story = {
  name: 'required with label'
};

export const Optional: DateRangePickerStory = (args) => render({necessityIndicator: 'label', ...args});

Optional.story = {
  name: 'optional'
};

export const NoVisibleLabel: DateRangePickerStory = (args) => render({'aria-label': 'Date range', label: null, ...args});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const QuietNoVisibleLabel: DateRangePickerStory = (args) => render({isQuiet: true, 'aria-label': 'Date range', label: null, ...args});

QuietNoVisibleLabel.story = {
  name: 'quiet no visible label'
};

export const CustomWidth: DateRangePickerStory = (args) => render({width: 'size-4600', ...args});

CustomWidth.story = {
  name: 'custom width'
};

export const QuietCustomWidth: DateRangePickerStory = (args) => render({isQuiet: true, width: 'size-4600', ...args});

QuietCustomWidth.story = {
  name: 'quiet custom width'
};

export const CustomWidthNoVisibleLabel: DateRangePickerStory = (args) => render({width: 'size-4600', label: null, 'aria-label': 'Date range', ...args});

CustomWidthNoVisibleLabel.story = {
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide: DateRangePickerStory = (args) => render({width: 'size-4600', labelPosition: 'side', ...args});

CustomWidthLabelPositionSide.story = {
  name: 'custom width, labelPosition=side'
};

export const Description: DateRangePickerStory = (args) => render({description: 'Help text', ...args});

Description.story = {
  name: 'description'
};

export const ErrorMessage: DateRangePickerStory = (args) => render({errorMessage: 'Dates must be after today', validationState: 'invalid', ...args});

ErrorMessage.story = {
  name: 'errorMessage'
};

export const InvalidWithTime: DateRangePickerStory = (args) => render({validationState: 'invalid', granularity: 'minute', defaultValue: {start: toZoned(parseDate('2020-02-03'), 'America/New_York'), end: toZoned(parseDate('2020-02-12'), 'America/Los_Angeles')}, ...args});

InvalidWithTime.story = {
  name: 'invalid with time'
};

export const _ContextualHelp: DateRangePickerStory = () => render({contextualHelp: (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
)});

_ContextualHelp.story = {
  name: 'contextual help'
};

export const InScrollableContainer: DateRangePickerStory = () => (
  <div style={{height: '200vh'}}>
    {render({granularity: 'second'})}
  </div>
);

InScrollableContainer.story = {
  name: 'in scrollable container'
};

export const ShouldFlipFalse: DateRangePickerStory = (args) => render({shouldFlip: false, ...args});

ShouldFlipFalse.story = {
  name: 'shouldFlip: false'
};
