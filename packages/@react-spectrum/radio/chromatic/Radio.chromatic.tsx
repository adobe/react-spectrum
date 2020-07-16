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
import {Provider} from '@react-spectrum/provider';
import {Radio, RadioGroup} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {View} from "@react-spectrum/view";

storiesOf('RadioGroup', module)
  .add(
    'controlled: dragons',
    () => render({value: 'dragons'})
  )
  .add(
    'labelAlign: end',
    () => renderLabelPositions({labelAlign: 'end', value: 'dragons'})
  )
  .add(
    'labelPosition: side',
    () => renderLabelPositions({labelPosition: 'side', value: 'dragons'})
  )
  .add(
    'labelPosition: side, labelAlign: end',
    () => renderLabelPositions({labelPosition: 'side', labelAlign: 'end', value: 'dragons'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: 'dragons'})
  )
  // don't need to test singular disabled, unit tests should catch that
  .add(
    'isRequired',
    () => render({isRequired: true, value: 'dragons'})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: 'dragons'})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true, value: 'dragons'})
  )
  .add(
    'validationState: "invalid"',
    () => render({validationState: 'invalid', value: 'dragons'})
  )
  .add(
    'no visible label',
    () => render({label: null, 'aria-label': 'Favorite pet', value: 'dragons'})
  )
  .add(
    'long radio label',
    () => renderLongLabel({value: 'dragons'})
  );

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
          Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs
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
