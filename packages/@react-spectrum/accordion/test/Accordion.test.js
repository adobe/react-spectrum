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

import {Accordion, Item} from '../src';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import {theme} from '@react-spectrum/theme-default';

let items = [
  {key: 'one', title: 'one title', children: 'one children'},
  {key: 'two', title: 'two title', children: 'two children'},
  {key: 'three', title: 'three title', children: 'three children'}
];

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <Accordion {...props} defaultExpandedKeys={['one']} items={items}>
        {item => (
          <Item key={item.key} title={item.title}>
            {item.children}
          </Item>
        )}
      </Accordion>
    </Provider>
  );
}

describe('Accordion', function () {
  it('renders properly', function () {
    let container = renderComponent();
    let accordionItems = container.getAllByRole('presentation');
    expect(items.length).toBe(3);

    for (let item of accordionItems) {
      let button = item.querySelector('button');
      expect(button).toHaveAttribute('aria-expanded');
      let isExpanded = button.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        expect(button).toHaveAttribute('aria-controls');
        let region = document.getElementById(button.getAttribute('aria-controls'));
        expect(region).toBeTruthy();
        expect(region).toHaveAttribute('aria-labelledby', button.id);
        expect(region).toHaveAttribute('role', 'region');
        expect(region).toHaveTextContent(items[0].children);
      }
    }
  });
});
