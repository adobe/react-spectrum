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

import {Breadcrumbs, BreadcrumbsContext, Item, Link} from 'react-aria-components';
import React from 'react';
import {render} from '@react-spectrum/test-utils';

let renderBreadcrumbs = (breadcrumbsProps, itemProps) => render(
  <Breadcrumbs {...breadcrumbsProps}>
    <Item {...itemProps}><Link><a href="/">Home</a></Link></Item>
    <Item {...itemProps}><Link><a href="/react-aria">React Aria</a></Link></Item>
    <Item {...itemProps}><Link>useBreadcrumbs</Link></Item>
  </Breadcrumbs>
);

describe('Breadcrumbs', () => {
  it('should render with default class', () => {
    let {getByRole, getAllByRole} = renderBreadcrumbs();
    let breadcrumbs = getByRole('navigation');
    expect(breadcrumbs).toHaveClass('react-aria-Breadcrumbs');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('react-aria-Item');
    }

    let links = getAllByRole('link');
    expect(links[0]).toHaveAttribute('class', 'react-aria-Link');
    expect(links[0]).not.toHaveAttribute('aria-current');
    expect(links[2]).toHaveAttribute('aria-current', 'page');
  });

  it('should render with custom class', () => {
    let {getByRole, getAllByRole} = renderBreadcrumbs({className: 'breadcrumbs'}, {className: 'item'});
    let breadcrumbs = getByRole('navigation');
    expect(breadcrumbs).toHaveClass('breadcrumbs');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderBreadcrumbs({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let breadcrumbs = getByRole('navigation');
    expect(breadcrumbs).toHaveAttribute('data-foo', 'bar');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <BreadcrumbsContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Breadcrumbs slot="test">
          <Item><Link>Test</Link></Item>
        </Breadcrumbs>
      </BreadcrumbsContext.Provider>
    );

    let breadcrumbs = getByRole('navigation');
    expect(breadcrumbs).toHaveAttribute('slot', 'test');
    expect(breadcrumbs).toHaveAttribute('aria-label', 'test');
  });

  it('should support dynamic collections', () => {
    let items = [
      {id: 1, name: 'Item 1'},
      {id: 2, name: 'Item 2'},
      {id: 3, name: 'Item 3'}
    ];

    let {getAllByRole} = render(
      <Breadcrumbs items={items}>
        {(item) => <Item>{item.name}</Item>}
      </Breadcrumbs>
    );
    
    expect(getAllByRole('listitem').map((it) => it.textContent)).toEqual(['Item 1', 'Item 2', 'Item 3']);
  });
});
