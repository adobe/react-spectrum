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

import {fireEvent, screen, testSSR, within} from '@react-spectrum/test-utils';

describe('ListBox SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {ListBox, Item} from '../';

      function Test() {
        let [show, setShow] = React.useState(false);
        return (
          <>
            <button onClick={() => setShow(true)}>Show</button>
            <ListBox aria-label="Listbox">
              <Item key="1">Left</Item>
              <Item key="2">Middle</Item>
              {show && <Item key="4">Extra</Item>}
              <Item key="3">Right</Item>
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
      import {ListBox, Section, Item, Header} from '../';

      <React.StrictMode>
        <ListBox aria-label="Listbox">
          <Section>
            <Header>Veggies</Header>
            <Item id="lettuce">Lettuce</Item>
            <Item id="tomato">Tomato</Item>
            <Item id="onion">Onion</Item>
          </Section>
          <Section>
            <Header>Protein</Header>
            <Item id="ham">Ham</Item>
            <Item id="tuna">Tuna</Item>
            <Item id="tofu">Tofu</Item>
          </Section>
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
