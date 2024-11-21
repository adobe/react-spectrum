/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import {StrictModeWrapper} from './StrictModeWrapper';
import {theme} from '@react-spectrum/theme-default';

let reactTestingLibrary = require('@testing-library/react');

// export everything
export * from '@testing-library/react';

// export renderHook and actHook from testing-library/react-hooks library if they don't exist in @testing-library/react
// (i.e. renderHook is only in v13+ of testing library)
export let renderHook = reactTestingLibrary.renderHook;
export let actHook = reactTestingLibrary.act;
if (!renderHook) {
  let rhtl = require('@testing-library/react-hooks');
  renderHook = rhtl.renderHook;
  actHook = rhtl.act;
}

function customRender(ui, options) {
  return render(ui, {wrapper: StrictModeWrapper, ...options});
}

// override render method with
export {customRender as render};

export function renderv3(ui, options, providerProps) {
  return render(ui, {wrapper: (props) => <Provider theme={theme} {...providerProps}><StrictModeWrapper {...props} /></Provider>, ...options});
}
