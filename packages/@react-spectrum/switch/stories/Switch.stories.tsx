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
import {storiesOf} from '@storybook/react';
import {Switch} from '../';

storiesOf('Switch', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultSelected: true',
    () => render({defaultSelected: true})
  )
  .add(
    'isSelected: true',
    () => render({isSelected: true})
  )
  .add(
    'isSelected: false',
    () => render({isSelected: false})
  )
  .add(
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isEmphasized: true',
    () => render({isEmphasized: true})
  )
  .add(
    'isEmphasized: true, isDisabled: true',
    () => render({isEmphasized: true, isDisabled: true})
  )
  .add(
    'isReadOnly: true, isSelected: true',
    () => render({isReadOnly: true, isSelected: true})
  )
  .add(
    'autoFocus: true',
    () => render({autoFocus: true})
  )
  .add(
    'custom label',
    () => renderCustomLabel()
  )
  .add(
    'long label',
    () => (
      <Switch
        onChange={action('change')}>
        Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris. Italiam, fato profugus, Laviniaque venit.
      </Switch>
    )
  )
  .add(
    'no label',
    () => renderNoLabel({'aria-label': 'This switch has no visible label'})
  );

function render(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props}>
      Switch Label
    </Switch>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props}>
      <span><i>Italicized</i> Switch Label</span>
    </Switch>
  );
}

function renderNoLabel(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props} />
  );
}
