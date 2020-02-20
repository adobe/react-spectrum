import {cleanup, render, waitForDomChange} from '@testing-library/react';
import {Item, Section} from '@react-spectrum/tree';
import React from 'react';
import {SideNav} from '../src';
import {triggerPress} from '@react-spectrum/test-utils';
import {SideNav as V2SideNav, SideNavItem as V2SideNavItem} from '@react/react-spectrum/SideNav';

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
        <Component {...props} items={flatItems} itemKey="name">
          {item => <ComponentItem>{item.name}</ComponentItem>}
        </Component>
      );
    case 'V2SideNav':
    case 'SideNavStatic':
      return render(
        <Component {...props} >
          <ComponentItem>Foo</ComponentItem>
          <ComponentItem>Bar</ComponentItem>
          <ComponentItem>Bob</ComponentItem>
          <ComponentItem>Alice</ComponentItem>
        </Component>
      );
    case 'SideNavWithSections':
      return render(
        <Component {...props} items={withSection} itemKey="name">
          {item => (
            <ComponentSection items={item.children} title={item.name}>
              {item => <ComponentItem>{item.name}</ComponentItem>}
            </ComponentSection>
          )}
        </Component>
      );
    case 'SideNavStaticWithSections':
      return render(
        <Component {...props} >
          <ComponentSection title="Section 1">
            <ComponentItem>Foo</ComponentItem>
            <ComponentItem>Bar</ComponentItem>
          </ComponentSection>
          <ComponentSection title="Section 2">
            <ComponentItem>Bob</ComponentItem>
            <ComponentItem>Alice</ComponentItem>
          </ComponentSection>
        </Component>
      );
    default:
      return null;
  }
}

describe('SideNav', function () {
  afterEach(cleanup);

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
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
    ${'V2SideNav'}                 | ${V2SideNav} | ${V2SideNavItem} | ${V2SideNavItem}
  `('$Name has default behavior', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByRole, getAllByRole, getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem);

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
    Name           | Component    | ComponentSection       | ComponentItem | props
    ${'SideNav'}   | ${SideNav}   | ${Section}             | ${Item}       | ${{UNSAFE_className: 'test-class'}}
    ${'V2SideNav'} | ${V2SideNav} | ${V2SideNavItem} | ${V2SideNavItem}}   | ${{className: 'test-class'}}
  `('$Name can pass className', async function ({Name, Component, ComponentSection, ComponentItem, props}) {
    let {getByRole} = renderComponent(Name, Component, ComponentSection, ComponentItem, props);

    if (Component === SideNav) {
      // wait for v3 components
      await waitForDomChange();
    }

    let sideNav = getByRole('navigation');
    expect(sideNav).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  // omitting v2 component
  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNav'}                   | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStatic'}             | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can select an item', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let spy = jest.fn();
    let {getByText} = renderComponent(Name, Component, ComponentSection, ComponentItem, {onSelectionChange: spy});

    await waitForDomChange();

    let [foo, bar, bob, alice] = [
      getByText('Foo'),
      getByText('Bar'),
      getByText('Bob'),
      getByText('Alice')
    ];

    bar.focus();
    triggerPress(bar);
  
    expect(foo).not.toHaveAttribute('aria-current');
    expect(foo).toHaveAttribute('tabindex', '-1');
    expect(bar).toHaveAttribute('aria-current', 'page');
    expect(bar).toHaveAttribute('tabindex', '0');
    expect(bob).not.toHaveAttribute('aria-current');
    expect(bob).toHaveAttribute('tabindex', '-1');
    expect(alice).not.toHaveAttribute('aria-current');
    expect(alice).toHaveAttribute('tabindex', '-1');

    expect(spy).toBeCalledTimes(1);

    alice.focus();
    triggerPress(alice);

    expect(foo).not.toHaveAttribute('aria-current');
    expect(foo).toHaveAttribute('tabindex', '-1');
    expect(bar).not.toHaveAttribute('aria-current');
    expect(bar).toHaveAttribute('tabindex', '-1');
    expect(bob).not.toHaveAttribute('aria-current');
    expect(bob).toHaveAttribute('tabindex', '-1');
    expect(alice).toHaveAttribute('aria-current', 'page');
    expect(alice).toHaveAttribute('tabindex', '0');

    expect(spy).toBeCalledTimes(2);
  });

  it.each`
    Name                           | Component    | ComponentSection | ComponentItem
    ${'SideNavWithSections'}       | ${SideNav}   | ${Section}       | ${Item}
    ${'SideNavStaticWithSections'} | ${SideNav}   | ${Section}       | ${Item}
  `('$Name can render sections', async function ({Name, Component, ComponentSection, ComponentItem}) {
    let {getByText, getAllByRole} = renderComponent(Name, Component, ComponentSection, ComponentItem);

    await waitForDomChange();

    let [section1, section2] = [
      getByText('Section 1'),
      getByText('Section 2')
    ];

    expect(section1).toBeTruthy();
    expect(section2).toBeTruthy();

    expect(getAllByRole('link').length).toBe(4);
    expect(getAllByRole('presentation').length).toBe(6);
  });
});
