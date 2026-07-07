/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import React from 'react';
import {RouterProvider} from 'react-aria-components';
import {
  SideNav,
  SideNavItem,
  SideNavItemContent,
  SideNavItemLink,
  SideNavProps
} from '../src/SideNav';
import {Text} from '../src/Content';
import userEvent, {UserEvent} from '@testing-library/user-event';

function SideNavExample(props: SideNavProps<unknown> = {}) {
  return (
    <SideNav aria-label="Test sidenav" {...props}>
      <SideNavItem id="files" textValue="Your files">
        <SideNavItemContent>
          <SideNavItemLink href="/files">
            <Text>Your files</Text>
            <Folder />
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="libraries" textValue="Your libraries">
        <SideNavItemContent>
          <SideNavItemLink href="/libraries">
            <Text>Your libraries</Text>
          </SideNavItemLink>
        </SideNavItemContent>
        <SideNavItem id="projects-1" textValue="Projects 1">
          <SideNavItemContent>
            <SideNavItemLink href="/projects-1">
              <Text>Projects 1</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem id="projects-2" textValue="Projects 2">
          <SideNavItemContent>
            <SideNavItemLink href="/projects-2">
              <Text>Projects 2</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
    </SideNav>
  );
}

describe('SideNav', () => {
  let user: UserEvent;

  beforeAll(function () {
    user = userEvent.setup({delay: null, pointerMap});
    // jsdom doesn't implement getAnimations, which the selection indicator relies on.
    Element.prototype.getAnimations = jest.fn().mockImplementation(() => []);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => {
      jest.runAllTimers();
    });
  });

  it('expands and collapses a level with the mouse', async () => {
    let onExpandedChange = jest.fn();
    let {getByRole, queryByRole} = render(<SideNavExample onExpandedChange={onExpandedChange} />);

    let librariesRow = getByRole('row', {name: 'Your libraries'});
    expect(librariesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();

    await user.click(within(librariesRow).getByRole('button'));

    expect(librariesRow).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Projects 1'})).toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(['libraries']));

    await user.click(within(librariesRow).getByRole('button'));

    expect(librariesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();
    expect(onExpandedChange).toHaveBeenLastCalledWith(new Set([]));
  });

  it('expands and collapses a level with the keyboard', async () => {
    let {getByRole, queryByRole} = render(<SideNavExample />);
    let librariesRow = getByRole('row', {name: 'Your libraries'});

    // Move focus onto the "Your libraries" link.
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveFocus();

    // Right arrow on the link opens the level.
    await user.keyboard('{ArrowRight}');
    expect(librariesRow).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Projects 1'})).toBeInTheDocument();

    // Left arrow returns focus to the row, then collapses the level.
    await user.keyboard('{ArrowLeft}');

    // TODO: should only be one arrow left?
    await user.keyboard('{ArrowLeft}');
    expect(librariesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();
  });

  it('selects an item and marks its link with aria-current="page"', async () => {
    let onSelectionChange = jest.fn();
    let {getByRole} = render(<SideNavExample onSelectionChange={onSelectionChange} />);

    let filesRow = getByRole('row', {name: 'Your files'});
    let filesLink = getByRole('link', {name: 'Your files'});
    expect(filesRow).toHaveAttribute('aria-selected', 'false');
    expect(filesLink).not.toHaveAttribute('aria-current');

    // TODO: Why didn't this trigger the link? or did it do that AND selection?
    await user.click(filesRow);
    expect(filesRow).toHaveAttribute('aria-selected', 'true');
    expect(filesLink).toHaveAttribute('aria-current', 'page');
    expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['files']));

    // Selection is single/replace, so selecting another item moves aria-current.
    let librariesRow = getByRole('row', {name: 'Your libraries'});
    await user.click(librariesRow);
    expect(filesLink).not.toHaveAttribute('aria-current');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveAttribute('aria-current', 'page');
    expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['libraries']));
  });

  it('activates the link when clicked', async () => {
    let navigate = jest.fn();
    let {getByRole} = render(
      <RouterProvider navigate={navigate}>
        <SideNavExample />
      </RouterProvider>
    );

    await user.click(getByRole('link', {name: 'Your files'}));
    expect(navigate).toHaveBeenCalledWith('/files', undefined);
  });

  it('activates the link when keyboard activated', async () => {
    let navigate = jest.fn();
    let {getByRole} = render(
      <RouterProvider navigate={navigate}>
        <SideNavExample />
      </RouterProvider>
    );

    // Tab moves focus to the first item's link.
    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledWith('/files', undefined);
  });
});
