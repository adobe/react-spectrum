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
import {Meta, StoryFn} from '@storybook/react';
import {Radio, RadioGroup} from '../src';
import React from 'react';
import {View} from '@react-spectrum/view';

export default {
  title: 'RadioGroup'
} as Meta<typeof RadioGroup>;

export type RadioGroupStory = StoryFn<typeof RadioGroup>;

export const ControlledDragons: RadioGroupStory = () => render({value: 'dragons'});

ControlledDragons.story = {
  name: 'controlled: dragons'
};

export const LabelAlignEnd: RadioGroupStory = () => renderLabelPositions({labelAlign: 'end', value: 'dragons'});

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const LabelPositionSide: RadioGroupStory = () =>
  renderLabelPositions({labelPosition: 'side', value: 'dragons'});

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelPositionSideLabelAlignEnd: RadioGroupStory = () =>
  renderLabelPositions({labelPosition: 'side', labelAlign: 'end', value: 'dragons'});

LabelPositionSideLabelAlignEnd.story = {
  name: 'labelPosition: side, labelAlign: end'
};

export const IsDisabled: RadioGroupStory = () => render({isDisabled: true, value: 'dragons'});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsRequired: RadioGroupStory = () => render({isRequired: true, value: 'dragons'});

IsRequired.story = {
  name: 'isRequired'
};

export const IsReadOnly: RadioGroupStory = () => render({isReadOnly: true, value: 'dragons'});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const IsEmphasized: RadioGroupStory = () => render({isEmphasized: true, value: 'dragons'});

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const ValidationStateInvalid: RadioGroupStory = () =>
  render({isInvalid: true, value: 'dragons'});

ValidationStateInvalid.story = {
  name: 'validationState: "invalid"'
};

export const NoVisibleLabel: RadioGroupStory = () =>
  render({label: null, 'aria-label': 'Favorite pet', value: 'dragons'});

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const LongRadioLabel: RadioGroupStory = () => renderLongLabel({value: 'dragons'});

LongRadioLabel.story = {
  name: 'long radio label'
};

export const ShowErrorIcon: RadioGroupStory = () =>
  render({isInvalid: true, errorMessage: 'Error message.', showErrorIcon: true});

ShowErrorIcon.story = {
  name: 'show error icon'
};

export const _ContextualHelp: RadioGroupStory = (args) =>
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

// do not supply a name, let it be uniquely generated, otherwise controlled won't work when many are rendered to the chromatic story
function render(props, radioProps = [{}, {}, {}]) {
  return (
    <RadioGroup label="Favorite pet" {...props}>
      <Radio value="dogs" {...radioProps[0]}>
        Dogs
      </Radio>
      <Radio value="cats" {...radioProps[1]}>
        Cats
      </Radio>
      <Radio value="dragons" {...radioProps[2]}>
        Dragons
      </Radio>
    </RadioGroup>
  );
}

function renderLabelPositions(props, radioProps = [{}, {}, {}]) {
  return (
    <>
      <RadioGroup label="Favorite pet" {...props}>
        <Radio value="dogs" {...radioProps[0]}>
          Dogs
        </Radio>
        <Radio value="cats" {...radioProps[1]}>
          Cats
        </Radio>
        <Radio value="dragons" {...radioProps[2]}>
          Dragons
        </Radio>
      </RadioGroup>
      <RadioGroup label="Favorite pet" orientation="horizontal" {...props}>
        <Radio value="dogs" {...radioProps[0]}>
          Dogs
        </Radio>
        <Radio value="cats" {...radioProps[1]}>
          Cats
        </Radio>
        <Radio value="dragons" {...radioProps[2]}>
          Dragons
        </Radio>
      </RadioGroup>
    </>
  );
}

function renderLongLabel(props, radioProps = [{}, {}, {}]) {
  return (
    <View width="size-3000">
      <RadioGroup aria-label="Favorite pet" {...props}>
        <Radio value="dogs" {...radioProps[0]}>
          Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs
          Dogs Dogs Dogs Dogs Dogs
        </Radio>
        <Radio value="cats" {...radioProps[1]}>
          Cats
        </Radio>
        <Radio value="dragons" {...radioProps[2]}>
          Dragons
        </Radio>
      </RadioGroup>
    </View>
  );
}
