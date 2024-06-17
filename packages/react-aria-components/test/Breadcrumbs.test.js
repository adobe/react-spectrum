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

import {Breadcrumb, Breadcrumbs, BreadcrumbsContext, Link} from 'react-aria-components';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

let renderBreadcrumbs = (breadcrumbsProps, itemProps) => render(
  <Breadcrumbs {...breadcrumbsProps}>
    <Breadcrumb {...itemProps}><Link href="/">Home</Link></Breadcrumb>
    <Breadcrumb {...itemProps}><Link href="/react-aria">React Aria</Link></Breadcrumb>
    <Breadcrumb {...itemProps}><Link>useBreadcrumbs</Link></Breadcrumb>
  </Breadcrumbs>
);

describe('Breadcrumbs', () => {
  it('should render with default class', () => {
    let {getByRole, getAllByRole} = renderBreadcrumbs();
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveClass('react-aria-Breadcrumbs');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('react-aria-Breadcrumb');
    }

    let links = getAllByRole('link');
    expect(links[0]).toHaveAttribute('class', 'react-aria-Link');
    expect(links[0]).not.toHaveAttribute('aria-current');
    expect(links[2]).toHaveAttribute('aria-current', 'page');
  });

  it('should render with custom class', () => {
    let {getByRole, getAllByRole} = renderBreadcrumbs({className: 'breadcrumbs'}, {className: 'item'});
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveClass('breadcrumbs');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderBreadcrumbs({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let breadcrumbs = getByRole('list');
    expect(breadcrumbs).toHaveAttribute('data-foo', 'bar');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <BreadcrumbsContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Breadcrumbs slot="test">
          <Breadcrumb><Link>Test</Link></Breadcrumb>
        </Breadcrumbs>
      </BreadcrumbsContext.Provider>
    );

    let breadcrumbs = getByRole('list');
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
        {(item) => <Breadcrumb>{item.name}</Breadcrumb>}
      </Breadcrumbs>
    );

    expect(getAllByRole('listitem').map((it) => it.textContent)).toEqual(['Item 1', 'Item 2', 'Item 3']);
  });

  it('should support refs', () => {
    let breadcrumbsRef = React.createRef();
    let breadcrumbRef = React.createRef();
    let {getByRole} = render(
      <Breadcrumbs ref={breadcrumbsRef}>
        <Breadcrumb ref={breadcrumbRef}><Link>Test</Link></Breadcrumb>
      </Breadcrumbs>
    );

    let breadcrumbs = getByRole('list');
    expect(breadcrumbsRef.current).toBe(breadcrumbs);

    let item = getByRole('listitem');
    expect(breadcrumbRef.current).toBe(item);
  });

  it('should support render props', () => {
    let items = [
      {id: 1, name: 'Item 1'},
      {id: 2, name: 'Item 2'},
      {id: 3, name: 'Item 3'}
    ];

    let {getAllByRole} = render(
      <Breadcrumbs items={items}>
        {(item) => <Breadcrumb>{({isCurrent}) => isCurrent ? 'Current' : item.name}</Breadcrumb>}
      </Breadcrumbs>
    );

    expect(getAllByRole('listitem').map((it) => it.textContent)).toEqual(['Item 1', 'Item 2', 'Current']);
  });
});
