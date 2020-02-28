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

import {cleanup, render, waitForDomChange} from '@testing-library/react';
import {Item} from '@react-spectrum/tree';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import {SideNav} from '../src';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import {SideNav as V2SideNav, SideNavItem as V2SideNavItem} from '@react/react-spectrum/SideNav';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

function renderComponent(Component, props) {
  if (Component === V2SideNav) {
    return render(
      <V2SideNav {...props}>
        <V2SideNavItem>Foo</V2SideNavItem >
        <V2SideNavItem>Bar</V2SideNavItem>
        <V2SideNavItem>Bob</V2SideNavItem>
        <V2SideNavItem>Alice</V2SideNavItem>
      </V2SideNav>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <SideNav {...props}>
          <Item>Foo</Item>
          <Item>Bar</Item>
          <Item>Bob</Item>
          <Item>Alice</Item>
        </SideNav>
      </Provider>
    );
  }
}

describe('SideNav', function () {
  afterEach(() => {
    cleanup();
  });

  let stub1, stub2;
  beforeAll(function () {
    stub1 = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 200);
    stub2 = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 400);
  });
  afterAll(function () {
    stub1.mockReset();
    stub2.mockReset();
  });

  it.each`
    Name           | Component
    ${'SideNav'}   | ${SideNav}
    ${'V2SideNav'} | ${V2SideNav}
  `('$Name has default behavior', async function ({Component}) {
    let {getByRole, getAllByRole, getByText} = renderComponent(Component);

    if (Component === SideNav) {
      // wait for v3 components
      await waitForDomChange();
    }

    let sideNav = getByRole('navigation');
    expect(sideNav).toBeTruthy();
    expect(sideNav.getAttribute('id')).toBeDefined();

    let sideNavList = getByRole('list');
    expect(sideNavList).toBeTruthy();
    expect(sideNav.getAttribute('id')).toBeDefined();

    let [foo, bar, bob, alice] = [
      getByText('Foo'),
      getByText('Bar'),
      getByText('Bob'),
      getByText('Alice')
    ];

    expect(foo).toBeTruthy();
    expect(bar).toBeTruthy();
    expect(bob).toBeTruthy();
    expect(alice).toBeTruthy();

    let sideNavListItems = getAllByRole('listitem');
    expect(sideNavListItems.length).toBe(4);

    let sideNavListItemLinks = getAllByRole('link');
    expect(sideNavListItemLinks.length).toBe(4);
    expect(sideNavListItemLinks[0].getAttribute('target')).toBe('_self');
  });

  it.each`
    Name           | Component
    ${'SideNav'}   | ${SideNav}
  `('$Name does not allow empty selection', async function ({Component}) {
    let spy = jest.fn();
    let {getByText} = renderComponent(Component, {onSelectionChange: spy});

    await waitForDomChange();

    let [bar, alice] = [
      getByText('Bar'),
      getByText('Alice')
    ];

    expect(bar).not.toHaveAttribute('aria-current');
    triggerPress(bar);
    expect(spy).toBeCalledTimes(1);
    expect(bar).toHaveAttribute('aria-current', 'page');
    triggerPress(bar);
    expect(spy).toBeCalledTimes(2);
    expect(bar).toHaveAttribute('aria-current', 'page');


    alice.focus();
    triggerPress(alice);
    expect(bar).not.toHaveAttribute('aria-current');
    expect(alice).toHaveAttribute('aria-current', 'page');
    expect(spy).toBeCalledTimes(3);
  });


  it.each`
    Name           | Component
    ${'SideNav'}   | ${SideNav}
  `('$Name with default key does not allow empty selection', async function ({Component}) {
    let spy = jest.fn();
    let {getByText} = renderComponent(Component, {onSelectionChange: spy, defaultSelectedKey: ['bar']});

    await waitForDomChange();

    let [bar, alice] = [
      getByText('Bar'),
      getByText('Bob')
    ];

    expect(bar).not.toHaveAttribute('aria-current');
    triggerPress(bar);
    expect(spy).toBeCalledTimes(1);
    expect(bar).toHaveAttribute('aria-current', 'page');
    triggerPress(bar);
    expect(spy).toBeCalledTimes(2);
    expect(bar).toHaveAttribute('aria-current', 'page');


    alice.focus();
    triggerPress(alice);
    expect(bar).not.toHaveAttribute('aria-current');
    expect(alice).toHaveAttribute('aria-current', 'page');
    expect(spy).toBeCalledTimes(3);
  });
});
