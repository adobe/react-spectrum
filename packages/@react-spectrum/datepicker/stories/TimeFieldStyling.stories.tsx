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
import {Heading} from '@react-spectrum/text';
import React from 'react';
import {render} from './TimeField.stories';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/TimeField/styling',
  decorators: [BlockDecorator]
};

export const IsQuiet = () => render({isQuiet: true});

IsQuiet.story = {
  name: 'isQuiet'
};

export const LabelPositionSide = () => render({labelPosition: 'side'});

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelAlignEnd = () => render({labelPosition: 'top', labelAlign: 'end'});

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const Required = () => render({isRequired: true});

Required.story = {
  name: 'required'
};

export const RequiredWithLabel = () => render({isRequired: true, necessityIndicator: 'label'});

RequiredWithLabel.story = {
  name: 'required with label'
};

export const Optional = () => render({necessityIndicator: 'label'});

Optional.story = {
  name: 'optional'
};

export const NoVisibleLabel = () => render({'aria-label': 'Time', label: null});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const QuietNoVisibleLabel = () => render({isQuiet: true, 'aria-label': 'Time', label: null});

QuietNoVisibleLabel.story = {
  name: 'quiet no visible label'
};

export const CustomWidth = () => render({width: 'size-3000'});

CustomWidth.story = {
  name: 'custom width'
};

export const QuietCustomWidth = () => render({isQuiet: true, width: 'size-3000'});

QuietCustomWidth.story = {
  name: 'quiet custom width'
};

export const CustomWidthNoVisibleLabel = () => render({width: 'size-3000', label: null, 'aria-label': 'Time'});

CustomWidthNoVisibleLabel.story = {
  name: 'custom width no visible label'
};

export const CustomWidthLabelPositionSide = () => render({width: 'size-3000', labelPosition: 'side'});

CustomWidthLabelPositionSide.story = {
  name: 'custom width, labelPosition=side'
};

export const Description = () => render({description: 'Help text'});

Description.story = {
  name: 'description'
};

export const ErrorMessage = () => render({errorMessage: 'Time must be between 9 AM and 5 PM', validationState: 'invalid'});

ErrorMessage.story = {
  name: 'errorMessage'
};

export const _ContextualHelp = () => render({contextualHelp: (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
)});

_ContextualHelp.story = {
  name: 'contextual help'
};
