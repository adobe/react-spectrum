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

import React from 'react';
import {Switch} from '../';
import {View} from '@react-spectrum/view';

export default {
  title: 'Switch'
};

export const Default = () => render();
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

export const IsReadOnlyTrue = () => render({isReadOnly: true});

IsReadOnlyTrue.story = {
  name: 'isReadOnly: true'
};

export const CustomLabel = () => renderCustomLabel();

CustomLabel.story = {
  name: 'custom label'
};

export const LongLabel = () => (
  <View width="size-2000">
    <Switch>
      Super long switch label. Sample text. Arma virumque cano, Troiae qui primus ab oris.
    </Switch>
  </View>
);

LongLabel.story = {
  name: 'long label'
};

export const NoLabel = () => renderNoLabel({'aria-label': 'This checkbox has no visible label'});

NoLabel.story = {
  name: 'no label'
};

// need selected + indeterminate because there is a sibling selector `checked + ...` so being careful
function render(props = {}) {
  return (
    <>
      <Switch {...props}>Label</Switch>
      <Switch isSelected {...props}>
        Selected Label
      </Switch>
    </>
  );
}

function renderCustomLabel(props = {}) {
  return (
    <>
      <Switch {...props}>
        <span>
          <i>Italicized</i> Switch Label
        </span>
      </Switch>
      <Switch isSelected {...props}>
        <span>
          <i>Italicized</i> and Selected Switch Label
        </span>
      </Switch>
    </>
  );
}

function renderNoLabel(props = {}) {
  return (
    <>
      <Switch {...props} />
      <Switch isSelected {...props} />
    </>
  );
}
