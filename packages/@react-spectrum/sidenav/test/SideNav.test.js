import {cleanup, render, waitForElement} from '@testing-library/react';
import {Item} from '@react-spectrum/tree';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import {SideNav} from '../src';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {SideNav as V2SideNav, SideNavItem as V2SideNavItem} from '@react/react-spectrum/SideNav';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

function renderComponent(Component, props) {
  if (Component === V2SideNav) {
    return render(
      <V2SideNav>
        <V2SideNavItem>Foo</V2SideNavItem >
        <V2SideNavItem>Bar</V2SideNavItem>
        <V2SideNavItem>Bob</V2SideNavItem>
        <V2SideNavItem>Alice</V2SideNavItem>
      </V2SideNav>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <SideNav >
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

  it.each`
    Name           | Component    | props
    ${'SideNav'}   | ${SideNav}   | ${{}}
    ${'V2SideNav'} | ${V2SideNav} | ${{}}
  `('$Name has default behavior', async function ({Component}) {
    let {getByText} = renderComponent(Component);
    let item = await waitForElement(() => getByText('Foo'));
    expect(item).toBeTruthy();
  });

  it('SideNav has default aria props', async function () {
    let {getByRole} = renderComponent(SideNav);

    let sideNav = getByRole('navigation');
    expect(sideNav).toBeTruthy();
    expect(sideNav.getAttribute('id')).toBeDefined();

    let sideNavList = getByRole('list');
    expect(sideNavList).toBeTruthy();
    expect(sideNav.getAttribute('id')).toBeDefined();

    let sideNavListItem = await waitForElement(() => getByRole('listitem'));
    expect(sideNavListItem).toBeTruthy();

    let sideNavListItemLink = await waitForElement(() => getByRole('link'));
    expect(sideNavListItemLink).toBeTruthy();
    expect(sideNavListItemLink.getAttribute('target')).toBe('_self');
  });
});
