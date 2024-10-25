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

import {fireEvent, screen, testSSR, within} from '@react-spectrum/test-utils-internal';

describe('ListBox SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {ListBox, ListBoxItem} from '../';

      function Test() {
        let [show, setShow] = React.useState(false);
        return (
          <>
            <button onClick={() => setShow(true)}>Show</button>
            <ListBox aria-label="Listbox">
              <ListBoxItem id="1">Left</ListBoxItem>
              <ListBoxItem id="2">Middle</ListBoxItem>
              {show && <ListBoxItem id="4">Extra</ListBoxItem>}
              <ListBoxItem id="3">Right</ListBoxItem>
            </ListBox>
          </>
        );
      }

      <React.StrictMode>
        <Test />
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let options = screen.getAllByRole('option');
      expect(options.map(o => o.textContent)).toEqual(['Left', 'Middle', 'Right']);
    });

    // Assert that hydrated UI matches what we expect.
    let button = screen.getByRole('button');
    let options = screen.getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(['Left', 'Middle', 'Right']);

    // And that it updates correctly.
    fireEvent.click(button);
    options = screen.getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(['Left', 'Middle', 'Extra', 'Right']);
  });

  it('should render with sections', async function () {
    await testSSR(__filename, `
      import {ListBox, ListBoxSection, ListBoxItem, Header} from '../';

      <React.StrictMode>
        <ListBox aria-label="Listbox">
          <ListBoxSection>
            <Header>Veggies</Header>
            <ListBoxItem id="lettuce">Lettuce</ListBoxItem>
            <ListBoxItem id="tomato">Tomato</ListBoxItem>
            <ListBoxItem id="onion">Onion</ListBoxItem>
          </ListBoxSection>
          <ListBoxSection>
            <Header>Protein</Header>
            <ListBoxItem id="ham">Ham</ListBoxItem>
            <ListBoxItem id="tuna">Tuna</ListBoxItem>
            <ListBoxItem id="tofu">Tofu</ListBoxItem>
          </ListBoxSection>
        </ListBox>
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let groups = screen.getAllByRole('group');
      expect(groups.map(g => document.getElementById(g.getAttribute('aria-labelledby')).textContent)).toEqual(['Veggies', 'Protein']);
      let options = within(groups[0]).getAllByRole('option');
      expect(options.map(o => o.textContent)).toEqual(['Lettuce', 'Tomato', 'Onion']);
      options = within(groups[1]).getAllByRole('option');
      expect(options.map(o => o.textContent)).toEqual(['Ham', 'Tuna', 'Tofu']);
    });

    // Assert that hydrated UI matches what we expect.
    let groups = screen.getAllByRole('group');
    expect(groups.map(g => document.getElementById(g.getAttribute('aria-labelledby')).textContent)).toEqual(['Veggies', 'Protein']);
    let options = within(groups[0]).getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(['Lettuce', 'Tomato', 'Onion']);
    options = within(groups[1]).getAllByRole('option');
    expect(options.map(o => o.textContent)).toEqual(['Ham', 'Tuna', 'Tofu']);
  });
});
