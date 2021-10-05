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
import React from 'react';
import {Switch} from '../';

export default {
  title: 'Switch',

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

export const IsDisabledTrue = () => render({isDisabled: true});

IsDisabledTrue.story = {
  name: 'isDisabled: true'
};

export const IsEmphasizedTrue = () => render({isEmphasized: true});

IsEmphasizedTrue.story = {
  name: 'isEmphasized: true'
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
  <Switch onChange={action('change')}>
    Super long checkbox label. Sample text. Arma virumque cano, Troiae qui
    primus ab oris. Italiam, fato profugus, Laviniaque venit.
  </Switch>
);

LongLabel.story = {
  name: 'long label'
};

export const NoLabel = () =>
  renderNoLabel({'aria-label': 'This switch has no visible label'});

NoLabel.story = {
  name: 'no label'
};

function render(props = {}) {
  return (
    <Switch onChange={action('change')} {...props}>
      Switch Label
    </Switch>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Switch onChange={action('change')} {...props}>
      <span>
        <i>Italicized</i> Switch Label
      </span>
    </Switch>
  );
}

function renderNoLabel(props = {}) {
  return <Switch onChange={action('change')} {...props} />;
}
