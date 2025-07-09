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

import {Checkbox, SpectrumCheckboxProps} from '../';
import {Meta, StoryFn} from '@storybook/react';
import React, {JSX} from 'react';
import {View} from '@react-spectrum/view';

export default {
  title: 'Checkbox',
  excludeStories: ['Render', 'RenderCustomLabel', 'RenderNoLabel']
} as Meta<typeof Checkbox>;

export type CheckboxStory = StoryFn<typeof Checkbox>;

export const Default: CheckboxStory = () => <Render />;
export const ValidationStateInvalid: CheckboxStory = () => <Render isInvalid />;

ValidationStateInvalid.story = {
  name: 'validationState: "invalid"'
};

export const IsDisabledTrue: CheckboxStory = () => <Render isDisabled />;

IsDisabledTrue.story = {
  name: 'isDisabled: true'
};

export const IsEmphasizedTrue: CheckboxStory = () => <Render isEmphasized />;

IsEmphasizedTrue.story = {
  name: 'isEmphasized: true'
};

export const IsEmphasizedTrueValidationStateInvalid: CheckboxStory = () =>
  <Render isEmphasized isInvalid />;

IsEmphasizedTrueValidationStateInvalid.story = {
  name: 'isEmphasized: true, validationState: "invalid"'
};

export const IsEmphasizedTrueIsDisabledTrue: CheckboxStory = () =>
  <Render isEmphasized isDisabled />;

IsEmphasizedTrueIsDisabledTrue.story = {
  name: 'isEmphasized: true, isDisabled: true'
};

export const IsReadOnlyTrue: CheckboxStory = () => <Render isReadOnly />;

IsReadOnlyTrue.story = {
  name: 'isReadOnly: true'
};

export const CustomLabel: CheckboxStory = () => <RenderCustomLabel />;

CustomLabel.story = {
  name: 'custom label'
};

export const LongLabel: CheckboxStory = () => (
  <View width="size-2000">
    <Checkbox>
      Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris.
    </Checkbox>
  </View>
);

LongLabel.story = {
  name: 'long label'
};

export const NoLabel: CheckboxStory = () => <RenderNoLabel aria-label="This checkbox has no visible label" />;

NoLabel.story = {
  name: 'no label'
};

// need selected + indeterminate because there is a sibling selector `checked + ...` so being careful
export function Render(props: SpectrumCheckboxProps): JSX.Element {
  return (
    <>
      <Checkbox {...props}>Label</Checkbox>
      <Checkbox isSelected {...props}>
        Selected Label
      </Checkbox>
      <Checkbox isIndeterminate {...props}>
        Indeterminate Label
      </Checkbox>
      <Checkbox isSelected isIndeterminate {...props}>
        Selected Indeterminate Label
      </Checkbox>
    </>
  );
}

export function RenderCustomLabel(props: SpectrumCheckboxProps): JSX.Element {
  return (
    <>
      <Checkbox {...props}>
        <span>
          <i>Italicized</i> Checkbox Label
        </span>
      </Checkbox>
      <Checkbox isSelected {...props}>
        <span>
          <i>Italicized</i> and Selected Checkbox Label
        </span>
      </Checkbox>
    </>
  );
}

export function RenderNoLabel(props: SpectrumCheckboxProps): JSX.Element {
  return (
    <>
      <Checkbox {...props} />
      <Checkbox isSelected {...props} />
    </>
  );
}
