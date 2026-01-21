/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Provider, type ProviderProps} from '../../src';
import React, {ReactElement} from 'react';
import {render as vitestBrowserRender} from 'vitest-browser-react';

export interface S2RenderOptions {
  /**
   * Options to pass to the Provider.
   */
  providerOptions?: Omit<ProviderProps, 'children'>
}

/**
 * Custom render function that wraps components in the S2 Provider.
 * Uses vitest-browser-react for browser mode testing.
 */
export async function render(
  ui: ReactElement,
  options: S2RenderOptions = {}
) {
  const {providerOptions = {}} = options;
  const {locale = 'en-US', colorScheme = 'light', ...restProviderOptions} = providerOptions;

  function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <Provider locale={locale} colorScheme={colorScheme} {...restProviderOptions}>
        {children}
      </Provider>
    );
  }

  return await vitestBrowserRender(<Wrapper>{ui}</Wrapper>);
}
