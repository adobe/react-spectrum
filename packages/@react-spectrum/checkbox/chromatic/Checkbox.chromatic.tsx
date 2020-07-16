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
import {storiesOf} from '@storybook/react';
import {View} from "@react-spectrum/view";

storiesOf('Checkbox', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'validationState: "invalid"',
    () => render({validationState: 'invalid'})
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
    'isEmphasized: true, validationState: "invalid"',
    () => render({isEmphasized: true, validationState: 'invalid'})
  )
  .add(
    'isEmphasized: true, isDisabled: true',
    () => render({isEmphasized: true, isDisabled: true})
  )
  .add(
    'isReadOnly: true',
    () => render({isReadOnly: true})
  )
  .add(
    'custom label',
    () => renderCustomLabel()
  )
  .add(
    'long label',
    () => (
      <View width="size-2000">
        <Checkbox>
          Super long checkbox label. Sample text. Arma virumque cano, Troiae qui primus ab oris.
        </Checkbox>
      </View>
    )
  )
  .add(
    'no label',
    () => renderNoLabel({'aria-label': 'This checkbox has no visible label'})
  );

// need selected + indeterminate because there is a sibling selector `checked + ...` so being careful
function render(props = {}) {
  return (
    <>
      <Checkbox
        {...props}>
        Label
      </Checkbox>
      <Checkbox
        isSelected
        {...props}>
        Selected Label
      </Checkbox>
      <Checkbox
        isIndeterminate
        {...props}>
        Indeterminate Label
      </Checkbox>
      <Checkbox
        isSelected
        isIndeterminate
        {...props}>
        Selected Indeterminate Label
      </Checkbox>
    </>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <>
      <Checkbox
        {...props}>
        <span><i>Italicized</i> Checkbox Label</span>
      </Checkbox>
      <Checkbox
        isSelected
        {...props}>
        <span><i>Italicized</i> and Selected Checkbox Label</span>
      </Checkbox>
    </>
  );
}

function renderNoLabel(props = {}) {
  return (
    <>
      <Checkbox {...props} />
      <Checkbox isSelected {...props} />
    </>
  );
}
