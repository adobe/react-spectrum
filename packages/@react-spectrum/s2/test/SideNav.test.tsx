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
import {ActionMenu} from '../src/ActionMenu';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import {MenuItem} from '../src/Menu';
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

function SideNavExample(props: Partial<SideNavProps<unknown>>) {
  let {selectedRoute = '/files', ...rest} = props;
  return (
    <SideNav aria-label="Test sidenav" selectedRoute={selectedRoute} {...rest}>
      <SideNavItem id="files" href="/files" textValue="Your files">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Your files</Text>
            <Folder />
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="libraries" href="/libraries" textValue="Your libraries">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Your libraries</Text>
          </SideNavItemLink>
        </SideNavItemContent>
        <SideNavItem id="projects-1" href="/projects-1" textValue="Projects 1">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects 1</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem id="projects-2" href="/projects-2" textValue="Projects 2">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects 2</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
    </SideNav>
  );
}

// A controlled wrapper mirroring how SideNav is used with a router: activating a link is
// intercepted by RouterProvider, and the navigated href becomes the controlled selectedRoute.
function RoutedSideNavExample(props: Partial<SideNavProps<unknown>>) {
  let [selectedRoute, setSelectedRoute] = React.useState('/files');
  return (
    <RouterProvider navigate={setSelectedRoute}>
      <SideNavExample {...props} selectedRoute={selectedRoute} />
    </RouterProvider>
  );
}

// libraries > Projects 1 > Projects 1A
function DeepSideNavExample(props: Partial<SideNavProps<unknown>>) {
  let {selectedRoute = '/libraries', ...rest} = props;
  return (
    <SideNav aria-label="Test sidenav" selectedRoute={selectedRoute} {...rest}>
      <SideNavItem id="libraries" href="/libraries" textValue="Your libraries">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Your libraries</Text>
          </SideNavItemLink>
        </SideNavItemContent>
        <SideNavItem id="projects-1" href="/projects-1" textValue="Projects 1">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Projects 1</Text>
            </SideNavItemLink>
          </SideNavItemContent>
          <SideNavItem id="projects-1A" href="/projects-1A" textValue="Projects 1A">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Projects 1A</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
      </SideNavItem>
    </SideNav>
  );
}

// An item with no href and no link, but with a secondary action (ActionMenu). Focus should stay
// on the row rather than jumping into the ActionMenu trigger.
function NoLinkActionMenuSideNavExample(props: Partial<SideNavProps<unknown>>) {
  let {selectedRoute = '/files', ...rest} = props;
  return (
    <SideNav aria-label="Test sidenav" selectedRoute={selectedRoute} {...rest}>
      <SideNavItem id="files" href="/files" textValue="Your files">
        <SideNavItemContent>
          <SideNavItemLink>
            <Text>Your files</Text>
          </SideNavItemLink>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="section" textValue="Section">
        <SideNavItemContent>
          <Text>Section</Text>
          <ActionMenu>
            <MenuItem id="edit">
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </SideNavItemContent>
        <SideNavItem id="section-2" href="/section-2" textValue="Section 2">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Section 2</Text>
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
    expect(librariesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();
  });

  it('marks the link matching selectedRoute with aria-current="page"', () => {
    let {getByRole, rerender} = render(<SideNavExample selectedRoute="/files" />);

    expect(getByRole('link', {name: 'Your files'})).toHaveAttribute('aria-current', 'page');
    expect(getByRole('link', {name: 'Your libraries'})).not.toHaveAttribute('aria-current');

    // Changing the selected route moves aria-current.
    rerender(<SideNavExample selectedRoute="/libraries" />);
    expect(getByRole('link', {name: 'Your files'})).not.toHaveAttribute('aria-current');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveAttribute('aria-current', 'page');
  });

  it('updates aria-current when navigating via the router', async () => {
    let {getByRole} = render(<RoutedSideNavExample />);

    expect(getByRole('link', {name: 'Your files'})).toHaveAttribute('aria-current', 'page');

    // Activating another link navigates, which updates the controlled selectedRoute.
    await user.click(getByRole('link', {name: 'Your libraries'}));
    expect(getByRole('link', {name: 'Your files'})).not.toHaveAttribute('aria-current');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveAttribute('aria-current', 'page');
  });

  it('moves the focused key to the selectedRoute item, even nested farther down', () => {
    // Projects 2 is nested under (an expanded) Your libraries — farther down and visible.
    let {getByRole} = render(
      <SideNavExample defaultExpandedKeys={['libraries']} selectedRoute="/projects-2" />
    );
    act(() => {
      jest.runAllTimers();
    });

    // Focusing the tree moves focus to its focused key. That key was set from selectedRoute, so
    // focus lands on Projects 2 rather than the first item.
    act(() => {
      getByRole('treegrid').focus();
    });
    expect(getByRole('link', {name: 'Projects 2'})).toHaveFocus();
  });

  it('arrow left from a deep leaf steps to parent, collapses it, then moves to the grandparent', async () => {
    let {getByRole, queryByRole} = render(
      <DeepSideNavExample
        defaultExpandedKeys={['libraries', 'projects-1']}
        selectedRoute="/projects-1A"
      />
    );
    act(() => {
      jest.runAllTimers();
    });

    // Focus starts on the deepest leaf (synced from selectedRoute).
    act(() => {
      getByRole('treegrid').focus();
    });
    expect(getByRole('link', {name: 'Projects 1A'})).toHaveFocus();

    // 1st ArrowLeft: leaf has nothing to collapse, so focus moves up to its parent.
    await user.keyboard('{ArrowLeft}');
    expect(getByRole('link', {name: 'Projects 1'})).toHaveFocus();
    expect(getByRole('row', {name: 'Projects 1'})).toHaveAttribute('aria-expanded', 'true');

    // 2nd ArrowLeft: the parent is expanded, so it collapses; focus stays on it.
    await user.keyboard('{ArrowLeft}');
    expect(getByRole('row', {name: 'Projects 1'})).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1A'})).toBeNull();
    expect(getByRole('link', {name: 'Projects 1'})).toHaveFocus();

    // 3rd ArrowLeft: the parent is now collapsed, so focus moves up to the grandparent.
    await user.keyboard('{ArrowLeft}');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveFocus();
  });

  it('keeps focus on the row (not the ActionMenu) for an item with no href/link', async () => {
    let {getByRole} = render(<NoLinkActionMenuSideNavExample />);
    act(() => {
      jest.runAllTimers();
    });

    // Tab lands on the first item's link, ArrowDown moves to the link-less "Section" row.
    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    act(() => {
      jest.runAllTimers();
    });

    // Focus stays on the row itself; it does not jump into the ActionMenu trigger.
    let sectionRow = getByRole('row', {name: 'Section'});
    expect(sectionRow).toHaveFocus();
    expect(within(sectionRow).getByRole('button', {name: 'More actions'})).not.toHaveFocus();
  });

  it("clicking on a category item's content expands the category", async () => {
    let {getByRole} = render(<NoLinkActionMenuSideNavExample />);
    let sectionRow = getByRole('row', {name: 'Section'});

    await user.click(within(sectionRow).getByText('Section'));
    expect(sectionRow).toHaveAttribute('aria-expanded', 'true');
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

    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledWith('/files', undefined);
  });

  it('takes one tab to leave the sidenav from a link', async () => {
    let {getByRole} = render(
      <>
        <SideNavExample />
        <input type="text" />
      </>
    );

    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();

    await user.tab();
    expect(getByRole('textbox')).toHaveFocus();
  });

  it('takes one shift tab to leave the sidenav from a link', async () => {
    let {getByRole} = render(
      <>
        <input type="text" />
        <SideNavExample />
      </>
    );

    await user.tab();
    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();

    await user.tab({shift: true});
    expect(getByRole('textbox')).toHaveFocus();
  });
});
