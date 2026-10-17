/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('Breadcrumbs SSR', function () {
  it('should render without errors', async function () {
    let serverOptions;
    await testSSR(
      __filename,
      `
      import {Breadcrumbs, Breadcrumb} from '../exports/index.ts';

      <React.StrictMode>
        <Breadcrumbs>
          <Breadcrumb>One</Breadcrumb>
          <Breadcrumb>Two</Breadcrumb>
          <Breadcrumb>Three</Breadcrumb>
        </Breadcrumbs>
      </React.StrictMode>
    `,
      () => {
        // Assert that server rendered stuff into the HTML.
        serverOptions = screen.getAllByRole('listitem');
        expect(serverOptions.map(o => o.textContent)).toEqual(['One', 'Two', 'Three']);
      }
    );

    // Assert that hydrated UI matches what we expect.
    let hydratedOptions = screen.getAllByRole('listitem');
    expect(hydratedOptions.map(o => o.textContent)).toEqual(['One', 'Two', 'Three']);

    // Assert that hydration reuses the server-rendered DOM nodes.
    for (let i = 0; i < hydratedOptions.length; i++) {
      expect(hydratedOptions[i]).toBe(serverOptions[i]);
    }
  });
});
