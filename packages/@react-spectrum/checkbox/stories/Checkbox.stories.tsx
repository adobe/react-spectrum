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

import {action} from '@storybook/addon-actions';
import {Checkbox} from '../';
import React from 'react';

export default {
  title: 'Checkbox',

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const Default = () => render();
export const DefaultSelectedTrue = () => render({defaultSelected: true});

DefaultSelectedTrue.story = {
  name: 'defaultSelected: true'
};

export const IsSelectedTrue = () => render({isSelected: true});

IsSelectedTrue.story = {
  name: 'isSelected: true'
};

export const IsSelectedFalse = () => render({isSelected: false});

IsSelectedFalse.story = {
  name: 'isSelected: false'
};

export const IsIndeterminateTrue = () => render({isIndeterminate: true});

IsIndeterminateTrue.story = {
  name: 'isIndeterminate: true'
};

export const ValidationStateInvalid = () =>
  render({validationState: 'invalid'});

ValidationStateInvalid.story = {
  name: 'validationState: "invalid"'
};

export const IsDisabledTrue = () => render({isDisabled: true});

IsDisabledTrue.story = {
  name: 'isDisabled: true'
};

export const IsEmphasizedTrue = () => render({isEmphasized: true});

IsEmphasizedTrue.story = {
  name: 'isEmphasized: true'
};

export const IsEmphasizedTrueIsIndeterminateTrue = () =>
  render({isEmphasized: true, isIndeterminate: true});

IsEmphasizedTrueIsIndeterminateTrue.story = {
  name: 'isEmphasized: true, isIndeterminate: true'
};

export const IsEmphasizedTrueValidationStateInvalid = () =>
  render({isEmphasized: true, validationState: 'invalid'});

IsEmphasizedTrueValidationStateInvalid.story = {
  name: 'isEmphasized: true, validationState: "invalid"'
};

export const IsEmphasizedTrueValidationStateInvalidIsIndeterminateTrue = () =>
  render({
    isEmphasized: true,
    validationState: 'invalid',
    isIndeterminate: true
  });

IsEmphasizedTrueValidationStateInvalidIsIndeterminateTrue.story = {
  name: 'isEmphasized: true, validationState: "invalid", isIndeterminate: true'
};

export const IsEmphasizedTrueIsDisabledTrue = () =>
  render({isEmphasized: true, isDisabled: true});

IsEmphasizedTrueIsDisabledTrue.story = {
  name: 'isEmphasized: true, isDisabled: true'
};

export const IsReadOnlyTrueIsSelectedTrue = () =>
  render({isReadOnly: true, isSelected: true});

IsReadOnlyTrueIsSelectedTrue.story = {
  name: 'isReadOnly: true, isSelected: true'
};

export const AutoFocusTrue = () => render({autoFocus: true});

AutoFocusTrue.story = {
  name: 'autoFocus: true'
};

export const CustomLabel = () => renderCustomLabel();

CustomLabel.story = {
  name: 'custom label'
};

export const LongLabel = () => (
  <Checkbox onChange={action('change')}>
    Super long checkbox label. Sample text. Arma virumque cano, Troiae qui
    primus ab oris. Italiam, fato profugus, Laviniaque venit.
  </Checkbox>
);

LongLabel.story = {
  name: 'long label'
};

export const NoLabel = () =>
  renderNoLabel({'aria-label': 'This checkbox has no visible label'});

NoLabel.story = {
  name: 'no label'
};

function render(props = {}) {
  return (
    <Checkbox onChange={action('change')} {...props}>
      Checkbox Label
    </Checkbox>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Checkbox onChange={action('change')} {...props}>
      <span>
        <i>Italicized</i> Checkbox Label
      </span>
    </Checkbox>
  );
}

function renderNoLabel(props = {}) {
  return <Checkbox onChange={action('change')} {...props} />;
}
