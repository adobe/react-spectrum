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

import {Checkbox, SpectrumCheckboxProps} from '../../src/checkbox/Checkbox';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import {View} from '../../src/view/View';

export default {
  title: 'Checkbox',
  excludeStories: ['Render', 'RenderCustomLabel', 'RenderNoLabel']
} as Meta<typeof Checkbox>;

export type CheckboxStory = StoryObj<typeof Checkbox>;

export const Default: CheckboxStory = {
  render: () => <Render />
};
export const ValidationStateInvalid: CheckboxStory = {
  render: () => <Render isInvalid />,
  name: 'validationState: "invalid"'
};

export const IsDisabledTrue: CheckboxStory = {
  render: () => <Render isDisabled />,
  name: 'isDisabled: true'
};

export const IsEmphasizedTrue: CheckboxStory = {
  render: () => <Render isEmphasized />,
  name: 'isEmphasized: true'
};

export const IsEmphasizedTrueValidationStateInvalid: CheckboxStory = {
  render: () => <Render isEmphasized isInvalid />,
  name: 'isEmphasized: true, validationState: "invalid"'
};

export const IsEmphasizedTrueIsDisabledTrue: CheckboxStory = {
  render: () => <Render isEmphasized isDisabled />,
  name: 'isEmphasized: true, isDisabled: true'
};

export const IsReadOnlyTrue: CheckboxStory = {
  render: () => <Render isReadOnly />,
  name: 'isReadOnly: true'
};

export const CustomLabel: CheckboxStory = {
  render: () => <RenderCustomLabel />,
  name: 'custom label'
};

export const LongLabel: CheckboxStory = {
  render: () => (
    <View width="size-2000">
      <Checkbox>
        Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris.
      </Checkbox>
    </View>
  ),
  name: 'long label'
};

export const NoLabel: CheckboxStory = {
  render: () => <RenderNoLabel aria-label="This checkbox has no visible label" />,
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
