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
import {Radio} from '../../src/radio/Radio';
import {RadioGroup} from '../../src/radio/RadioGroup';
import React from 'react';
import {View} from '../../src/view/View';

export default {
  title: 'RadioGroup'
} as Meta<typeof RadioGroup>;

export type RadioGroupStory = StoryObj<typeof RadioGroup>;

export const ControlledDragons: RadioGroupStory = {
  render: () => render({value: 'dragons'}),
  name: 'controlled: dragons'
};

export const LabelAlignEnd: RadioGroupStory = {
  render: () => renderLabelPositions({labelAlign: 'end', value: 'dragons'}),
  name: 'labelAlign: end'
};

export const LabelPositionSide: RadioGroupStory = {
  render: () => renderLabelPositions({labelPosition: 'side', value: 'dragons'}),
  name: 'labelPosition: side'
};

export const LabelPositionSideLabelAlignEnd: RadioGroupStory = {
  render: () => renderLabelPositions({labelPosition: 'side', labelAlign: 'end', value: 'dragons'}),
  name: 'labelPosition: side, labelAlign: end'
};

export const IsDisabled: RadioGroupStory = {
  render: () => render({isDisabled: true, value: 'dragons'}),
  name: 'isDisabled'
};

export const IsRequired: RadioGroupStory = {
  render: () => render({isRequired: true, value: 'dragons'}),
  name: 'isRequired'
};

export const IsReadOnly: RadioGroupStory = {
  render: () => render({isReadOnly: true, value: 'dragons'}),
  name: 'isReadOnly'
};

export const IsEmphasized: RadioGroupStory = {
  render: () => render({isEmphasized: true, value: 'dragons'}),
  name: 'isEmphasized'
};

export const ValidationStateInvalid: RadioGroupStory = {
  render: () => render({isInvalid: true, value: 'dragons'}),
  name: 'validationState: "invalid"'
};

export const NoVisibleLabel: RadioGroupStory = {
  render: () => render({label: null, 'aria-label': 'Favorite pet', value: 'dragons'}),
  name: 'no visible label'
};

export const LongRadioLabel: RadioGroupStory = {
  render: () => renderLongLabel({value: 'dragons'}),
  name: 'long radio label'
};

export const ShowErrorIcon: RadioGroupStory = {
  render: () => render({isInvalid: true, errorMessage: 'Error message.', showErrorIcon: true}),
  name: 'show error icon'
};

export const _ContextualHelp: RadioGroupStory = {
  render: args =>
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
    }),
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
