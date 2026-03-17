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

import {act as originalAct, renderHook as originalRenderHook, render} from '@testing-library/react';
import {Provider, ProviderProps} from '@react-spectrum/provider';
import React from 'react';
import {StrictModeWrapper} from './StrictModeWrapper';
import {theme} from '@react-spectrum/theme-default';

export {act, fireEvent, within, screen, waitFor, getAllByRole, createEvent, waitForElementToBeRemoved} from '@testing-library/react';

function customRender(ui: Parameters<typeof render>[0], options?: Parameters<typeof render>[1] | undefined): ReturnType<typeof render> {
  return render(ui, {wrapper: StrictModeWrapper, ...options});
}

let reactTestingLibrary = require('@testing-library/react');
// export renderHook and actHook from testing-library/react-hooks library if they don't exist in @testing-library/react
// (i.e. renderHook is only in v13+ of testing library)
export let renderHook = reactTestingLibrary.renderHook as typeof originalRenderHook;
export let actHook = reactTestingLibrary.act as typeof originalAct;
if (!renderHook) {
  let rhtl = require('@testing-library/react-hooks');
  renderHook = rhtl.renderHook;
  actHook = rhtl.act;
}

// override render method with
export {customRender as render};

export function renderv3(ui: Parameters<typeof render>[0], options?: Parameters<typeof render>[1] | undefined, providerProps?: ProviderProps | undefined): ReturnType<typeof render> {
  return render(ui, {
    wrapper: (props: React.PropsWithChildren) => (
      <Provider
        theme={theme}
        {...providerProps}>
        <StrictModeWrapper {...props} />
      </Provider>
    ),
    ...options
  });
}
