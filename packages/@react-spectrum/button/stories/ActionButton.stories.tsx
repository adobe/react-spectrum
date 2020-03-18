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
import {ActionButton} from '../';
import Add from '@spectrum-icons/workflow/Add';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';

storiesOf('Button/ActionButton', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'default',
    () => render()
  )
  .add(
    'icon',
    () => (
      <div>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
          <Add />
          <Text>Default</Text>
        </ActionButton>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isDisabled>
          <Text>Disabled</Text>
          <Add />
        </ActionButton>
      </div>
    )
  )
  .add(
    'icon only',
    () => (
      <div>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
          <Add />
        </ActionButton>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}
          isDisabled>
          <Add />
        </ActionButton>
      </div>
    )
  )
  .add(
    'holdAffordance',
    () => render({holdAffordance: true})
  )
  .add(
    'selected',
    () => render({isSelected: true})
  )
  .add(
    'selected, isEmphasized',
    () => render({isEmphasized: true, isSelected: true})
  )
  .add(
    'quiet,',
    () => render({isQuiet: true})
  )
  .add(
    'quiet, selected',
    () => render({isQuiet: true, isSelected: true})
  )
  .add(
    'quiet, isEmphasized',
    () => render({isQuiet: true, isEmphasized: true})
  )
  .add(
    'quiet, selected, isEmphasized',
    () => render({isQuiet: true, isEmphasized: true, isSelected: true})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  );

function render(props = {}) {
  return (
    <div>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        {...props}>
        Default
      </ActionButton>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        isDisabled
        {...props}>
        Disabled
      </ActionButton>
    </div>
  );
}
