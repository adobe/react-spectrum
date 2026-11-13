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

import {act, render} from '@react-spectrum/test-utils-internal';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {ListLayout, ListLayoutOptions} from 'react-stately/useVirtualizerState';
import React from 'react';
import {Virtualizer} from '../src/Virtualizer';

const mockItemRender = jest.fn();

jest.mock('react-aria/src/virtualizer/useVirtualizerItem', () => {
  const actual = jest.requireActual('react-aria/src/virtualizer/useVirtualizerItem');
  return {
    ...actual,
    useVirtualizerItem: options => {
      mockItemRender();
      return actual.useVirtualizerItem(options);
    }
  };
});

let items = Array.from({length: 50}, (_, i) => ({id: i, name: `Item ${i}`}));

function renderListBox(layoutOptions: ListLayoutOptions, container?: HTMLElement) {
  let listBox = (className: string) => (
    <Virtualizer layout={ListLayout} layoutOptions={layoutOptions}>
      <ListBox aria-label="Test" className={className} items={items}>
        {item => <ListBoxItem>{item.name}</ListBoxItem>}
      </ListBox>
    </Virtualizer>
  );

  let tree = render(listBox('a'), {container});
  return {...tree, rerenderListBox: () => tree.rerender(listBox('b'))};
}

describe('Virtualizer', () => {
  beforeEach(() => {
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not re-render items with a known size when the ListBox re-renders', () => {
    let {getAllByRole, rerenderListBox} = renderListBox({rowHeight: 25});
    expect(getAllByRole('option').length).toBeGreaterThan(0);

    mockItemRender.mockClear();
    rerenderListBox();
    expect(mockItemRender).not.toHaveBeenCalled();
  });

  it('re-renders items with an estimated size so they are measured once visible', () => {
    jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 40);
    jest.spyOn(window.HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => 100);

    // Render hidden so that the initial measurement is skipped.
    let container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);
    let {getAllByRole, rerenderListBox} = renderListBox({estimatedRowHeight: 25}, container);
    let item = getAllByRole('option', {hidden: true})[0].parentElement!;
    expect(item).toHaveStyle({height: '25px'});

    // Show it without changing the layout, then re-render.
    container.style.display = '';
    act(() => rerenderListBox());
    expect(item).toHaveStyle({height: '40px'});
  });
});
