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

import {Provider, ProviderProps} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import {StrictModeWrapper} from './StrictModeWrapper';
import {theme} from '@react-spectrum/theme-default';

export {renderHook, act, act as actHook, fireEvent, within, screen, waitFor} from '@testing-library/react';

function customRender(ui: Parameters<typeof render>[0], options?: Parameters<typeof render>[1] | undefined): ReturnType<typeof render> {
  return render(ui, {wrapper: StrictModeWrapper, ...options});
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
