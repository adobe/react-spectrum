/*
 * Copyright 2024 Adobe. All rights reserved.
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

describe('Disclosure SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {DisclosureGroup, Disclosure, DisclosurePanel, Heading, Button} from '../';

      <React.StrictMode>
        <DisclosureGroup>
          <Disclosure>
            <Heading level={3}>
              <Button slot="trigger">Trigger 1</Button>
            </Heading>
            <DisclosurePanel data-testid="panel1">
              <p>Content 1</p>
            </DisclosurePanel>
          </Disclosure>
          <Disclosure>
            <Heading level={3}>
              <Button slot="trigger">Trigger 2</Button>
            </Heading>
            <DisclosurePanel data-testid="panel2">
              <p>Content 2</p>
            </DisclosurePanel>
          </Disclosure>
        </DisclosureGroup>
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let triggers = screen.getAllByRole('button');
      let panels = screen.getAllByRole('group', {hidden: true});
      expect(triggers.map(o => o.textContent)).toEqual(['Trigger 1', 'Trigger 2']);
      expect(panels.map(o => o.textContent)).toEqual(['Content 1', 'Content 2']);
    });

    // Assert that hydrated UI matches what we expect.
    let triggers = screen.getAllByRole('button');
    let panels = screen.getAllByRole('group', {hidden: true});
    expect(triggers.map(o => o.textContent)).toEqual(['Trigger 1', 'Trigger 2']);
    expect(panels.map(o => o.textContent)).toEqual(['Content 1', 'Content 2']);
  });
});
