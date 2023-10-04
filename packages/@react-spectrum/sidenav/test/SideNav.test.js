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

import {act, fireEvent, render, triggerPress, waitFor} from '@react-spectrum/test-utils';
import {Item, Section} from '@react-spectrum/tree';
import React from 'react';
import {SideNav} from '../src';

let flatItems = [
  {name: 'Foo'},
  {name: 'Bar'},
  {name: 'Bob'},
  {name: 'Alice'}
];

let withSection = [
  {name: 'Section 1', children: [
    {name: 'Foo'},
    {name: 'Bar'}
  ]},
  {name: 'Section 2', children: [
    {name: 'Bob'},
    {name: 'Alice'}
  ]}
];

function renderComponent(Name, Component, ComponentSection, ComponentItem, props = {}) {
  switch (Name) {
    case 'SideNav':
      return render(
        <Component {...props} items={flatItems}>
          {item => <ComponentItem key={item.name}>{item.name}</ComponentItem>}
        </Component>
      );
    case 'SideNavStatic':
      return render(
        <Component {...props} >
          <ComponentItem key="Foo">Foo</ComponentItem>
          <ComponentItem key="Bar">Bar</ComponentItem>
          <ComponentItem key="Bob">Bob</ComponentItem>
          <ComponentItem key="Alice">Alice</ComponentItem>
        </Component>
      );
    case 'SideNavWithSections':
      return render(
        <Component {...props} items={withSection}>
          {item => (
            <ComponentSection key={item.name} items={item.children} title={item.name}>
              {item => <ComponentItem key={item.name}>{item.name}</ComponentItem>}
            </ComponentSection>
          )}
        </Component>
      );
    case 'SideNavStaticWithSections':
      return render(
        <Component {...props} >
          <ComponentSection title="Section 1">
            <ComponentItem key="Foo">Foo</ComponentItem>
            <ComponentItem key="Bar">Bar</ComponentItem>
          </ComponentSection>
          <ComponentSection title="Section 2">
            <ComponentItem key="Bob">Bob</ComponentItem>
            <ComponentItem key="Alice">Alice</ComponentItem>
          </ComponentSection>
        </Component>
      );
    default:
      return null;
  }
}

describe.skip('SideNav', function () {
  let stub1, stub2;
  let scrollHeight;

  beforeAll(function () {
    jest.useFakeTimers();
    scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(() => 48);
    stub1 = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 200);
    stub2 = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 400);
  });
  afterAll(function () {
    stub1.mockReset();
    stub2.mockReset();
    scrollHeight.mockReset();
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name has default behavior', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getAllByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem);

    let sideNav = getByRole('navigation');
    let sideNavList = getByRole('list');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(sideNavList).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    });

    expect(sideNav).toBeTruthy();
    expect(sideNav.getAttribute('id')).toBeDefined();

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
    Name           | Component    | ComponentSection       | ComponentItem | props
    ${'SideNav'}   | ${SideNav}   | ${Section}             | ${Item}       | ${{UNSAFE_className: 'test-class'}}
  `('$Name can pass className', async function ({Name, Component, ComponentSection, ComponentItem, props}) {
    let {getByRole} = renderComponent(Name, Component, ComponentSection, ComponentItem, props);

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
    }); // wait for animation

    expect(sideNav).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can single select an item', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let spy = jest.fn();
    let {getByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {selectionMode: 'single', onSelectionChange: spy});

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let [foo, bar, bob, alice] = [
      getByText('Foo'),
      getByText('Bar'),
      getByText('Bob'),
      getByText('Alice')
    ];

    act(() => {bar.focus();});
    triggerPress(bar);

    expect(foo).not.toHaveAttribute('aria-current');
    expect(foo).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(bar);
    expect(bar).toHaveAttribute('aria-current', 'page');
    expect(bar).toHaveAttribute('tabindex', '0');
    expect(bob).not.toHaveAttribute('aria-current');
    expect(bob).toHaveAttribute('tabindex', '-1');
    expect(alice).not.toHaveAttribute('aria-current');
    expect(alice).toHaveAttribute('tabindex', '-1');

    expect(spy).toBeCalledTimes(1);

    act(() => {alice.focus();});
    triggerPress(alice);

    expect(foo).not.toHaveAttribute('aria-current');
    expect(foo).toHaveAttribute('tabindex', '-1');
    expect(bar).not.toHaveAttribute('aria-current');
    expect(bar).toHaveAttribute('tabindex', '-1');
    expect(bob).not.toHaveAttribute('aria-current');
    expect(bob).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(alice);
    expect(alice).toHaveAttribute('aria-current', 'page');
    expect(alice).toHaveAttribute('tabindex', '0');

    expect(spy).toBeCalledTimes(2);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can render sections', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByText, getByRole, getAllByRole} = renderComponent(Name, Component, ComponentSection, ComponentItem);

    let sideNav = getByRole('navigation');
    let sideNavList = getByRole('list');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(sideNavList).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let [section1, section2] = [
      getByText('Section 1'),
      getByText('Section 2')
    ];

    expect(section1).toBeTruthy();
    expect(section2).toBeTruthy();

    // contains 4 items
    expect(getAllByRole('listitem').length).toBe(4);
    // contains 2 sections
    expect(getAllByRole('group').length).toBe(2);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can focus up/down item', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getAllByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem);

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let items = getAllByRole('link');
    let selectedItem = items[0];
    act(() => {selectedItem.focus();});
    expect(selectedItem).toBe(document.activeElement);
    fireEvent.keyDown(selectedItem, {key: 'ArrowDown', code: 40, charCode: 40});
    let nextSelectedItem = items[1];
    expect(nextSelectedItem).toBe(document.activeElement);
    fireEvent.keyDown(nextSelectedItem, {key: 'ArrowUp', code: 38, charCode: 38});
    expect(selectedItem).toBe(document.activeElement);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can keep focus on first/last item', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getAllByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem);

    let sideNav = getByRole('navigation');
    let sideNavList = getByRole('list');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(sideNavList).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let items = getAllByRole('link');
    let firstItem = items[0];
    act(() => {firstItem.focus();});
    expect(firstItem).toBe(document.activeElement);
    fireEvent.keyDown(firstItem, {key: 'ArrowUp', code: 40, charCode: 40});
    let lastItem = items[items.length - 1];
    expect(lastItem).not.toBe(document.activeElement);

    act(() => {lastItem.focus();});
    expect(lastItem).toBe(document.activeElement);
    fireEvent.keyDown(lastItem, {key: 'ArrowDown', code: 38, charCode: 38});
    expect(firstItem).not.toBe(document.activeElement);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can focus first to last/last to first item', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getAllByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {shouldFocusWrap: true});

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let items = getAllByRole('link');
    let firstItem = items[0];
    act(() => {firstItem.focus();});
    expect(firstItem).toBe(document.activeElement);
    fireEvent.keyDown(firstItem, {key: 'ArrowUp', code: 40, charCode: 40});
    let lastItem = items[items.length - 1];
    expect(lastItem).toBe(document.activeElement);

    act(() => {lastItem.focus();});
    expect(lastItem).toBe(document.activeElement);
    fireEvent.keyDown(lastItem, {key: 'ArrowDown', code: 38, charCode: 38});
    expect(firstItem).toBe(document.activeElement);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name supports defaultSelectedKeys (uncontrolled)', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {selectionMode: 'single', defaultSelectedKeys: ['Bar']});

    let sideNav = getByRole('navigation');
    let sideNavList = getByRole('list');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(sideNavList).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let [foo, bar, bob, alice] = [
      getByText('Foo'),
      getByText('Bar'),
      getByText('Bob'),
      getByText('Alice')
    ];

    expect(foo).not.toHaveAttribute('aria-current');
    expect(bar).toHaveAttribute('aria-current', 'page');
    expect(bob).not.toHaveAttribute('aria-current');
    expect(alice).not.toHaveAttribute('aria-current');

    triggerPress(alice);
    expect(alice).toHaveAttribute('aria-current', 'page');
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name supports defaultSelectedKeys (controlled)', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {selectionMode: 'single', selectedKeys: ['Bar']});

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let [foo, bar, bob, alice] = [
      getByText('Foo'),
      getByText('Bar'),
      getByText('Bob'),
      getByText('Alice')
    ];

    expect(foo).not.toHaveAttribute('aria-current');
    expect(bar).toHaveAttribute('aria-current', 'page');
    expect(bob).not.toHaveAttribute('aria-current');
    expect(alice).not.toHaveAttribute('aria-current');

    triggerPress(alice);
    expect(alice).not.toHaveAttribute('aria-current', 'page');
    expect(bar).toHaveAttribute('aria-current', 'page');
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name supports disabledKeys', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let spy = jest.fn();
    let {getByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {onSelectionChange: spy, disabledKeys: ['Foo', 'Bob']});

    let sideNav = getByRole('navigation');
    let sideNavList = getByRole('list');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(sideNavList).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

    let [foo, bar, bob, alice] = [
      getByText('Foo'),
      getByText('Bar'),
      getByText('Bob'),
      getByText('Alice')
    ];

    triggerPress(foo);
    triggerPress(bob);
    expect(spy).toBeCalledTimes(0);

    expect(foo).toHaveAttribute('aria-disabled', 'true');
    expect(bar).toHaveAttribute('aria-disabled', 'false');
    expect(bob).toHaveAttribute('aria-disabled', 'true');
    expect(alice).toHaveAttribute('aria-disabled', 'false');
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name does not allow empty selection', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let spy = jest.fn();
    let {getByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {selectionMode: 'single', disallowEmptySelection: true, onSelectionChange: spy});

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

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


    act(() => {alice.focus();});
    triggerPress(alice);
    expect(bar).not.toHaveAttribute('aria-current');
    expect(alice).toHaveAttribute('aria-current', 'page');
    expect(spy).toBeCalledTimes(3);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name with default key does not allow empty selection', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let spy = jest.fn();
    let {getByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {selectionMode: 'single', disallowEmptySelection: true, onSelectionChange: spy, defaultSelectedKey: ['bar']});

    let sideNav = getByRole('navigation');
    await waitFor(() => {
      expect(sideNav).toBeVisible();
      expect(getByText('Foo')).toBeVisible();
    }); // wait for animation

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


    act(() => {alice.focus();});
    triggerPress(alice);
    expect(bar).not.toHaveAttribute('aria-current');
    expect(alice).toHaveAttribute('aria-current', 'page');
    expect(spy).toBeCalledTimes(3);
  });

});
