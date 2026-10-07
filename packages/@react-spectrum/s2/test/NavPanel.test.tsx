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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {NavPanel, NavPanelProps} from '../src/NavPanel';
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

// "Files" is a top-level leaf (no children). "Libraries" is a parent with an href and a nested "Photos" leaf.
// "Favorites" is a parent with no href but with a nested "Documents" leaf.
// Items are always links. An item with an href navigates when it is activated, whether or not it has
// children and whether or not the panel is collapsed. An item without one toggles its category instead.
function NavPanelExample(
  props: NavPanelProps &
    SideNavProps<any> & {
      navigate?: (path: string) => void;
    }
) {
  let {navigate, defaultExpandedKeys, ...panelProps} = props;
  let navPanel = (
    <NavPanel aria-label="Side panel" {...panelProps}>
      <SideNav
        aria-label="Test sidenav"
        selectedRoute="/files"
        defaultExpandedKeys={defaultExpandedKeys}>
        <SideNavItem id="files" href="/files" textValue="Files">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Files</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem id="libraries" href="/libraries" textValue="Libraries">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Libraries</Text>
            </SideNavItemLink>
          </SideNavItemContent>
          <SideNavItem id="photos" href="/photos" textValue="Photos">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Photos</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
        <SideNavItem id="favorites" textValue="Favorites">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Favorites</Text>
            </SideNavItemLink>
          </SideNavItemContent>
          <SideNavItem id="documents" href="/documents" textValue="Documents">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Documents</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
      </SideNav>
    </NavPanel>
  );

  return navigate ? <RouterProvider navigate={navigate}>{navPanel}</RouterProvider> : navPanel;
}

// Expanding the panel animates its width first and only puts its contents back once that has
// finished, so nothing is reflowing while the panel is still changing size. jsdom doesn't run CSS
// transitions, so no transitionend ever arrives and NavPanel falls back to its timeout.
function finishExpanding(): void {
  act(() => {
    jest.advanceTimersByTime(250);
  });
}

describe('NavPanel', () => {
  let user: UserEvent;

  beforeAll(function () {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => {
      jest.runAllTimers();
    });
  });

  it('exposes a labelled region when an aria-label is provided', () => {
    let {getByRole} = render(<NavPanelExample />);

    // NavPanelExample passes aria-label="Side panel". The inner SideNav is labelled separately,
    // so the panel should be its own labelled landmark rather than dropping the label.
    expect(getByRole('region', {name: 'Side panel'})).toBeInTheDocument();
  });

  it('stays a plain container when no label is provided', () => {
    let {queryByRole} = render(<NavPanelExample aria-label={undefined} />);

    expect(queryByRole('region')).toBeNull();
  });

  it('collapses and expands via the provided toggle button', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole} = render(<NavPanelExample onCollapsedChange={onCollapsedChange} />);

    let toggle = getByRole('button', {name: 'Collapse side panel'});

    await user.click(toggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);

    toggle = getByRole('button', {name: 'Expand side panel'});

    await user.click(toggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    // The toggle itself flips as soon as it is pressed, ahead of the contents coming back.
    expect(getByRole('button', {name: 'Collapse side panel'})).toBeInTheDocument();

    finishExpanding();
    expect(getByRole('link', {name: 'Files'})).toBeInTheDocument();
    expect(getByRole('link', {name: 'Libraries'})).toBeInTheDocument();
  });

  it('navigates without expanding the panel when a collapsed link is clicked, with or without children', async () => {
    let navigate = jest.fn();
    let onCollapsedChange = jest.fn();
    let {getByRole} = render(
      <NavPanelExample defaultCollapsed navigate={navigate} onCollapsedChange={onCollapsedChange} />
    );

    await user.click(getByRole('link', {name: 'Files'}));
    expect(navigate).toHaveBeenLastCalledWith('/files', undefined);

    // A parent navigates the same way a leaf does rather than expanding anything.
    await user.click(getByRole('link', {name: 'Libraries'}));
    expect(navigate).toHaveBeenLastCalledWith('/libraries', undefined);

    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'false');
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it('navigates without expanding the panel when a collapsed link is activated via the keyboard', async () => {
    let navigate = jest.fn();
    let onCollapsedChange = jest.fn();
    let {getByRole} = render(
      <NavPanelExample defaultCollapsed navigate={navigate} onCollapsedChange={onCollapsedChange} />
    );

    await user.tab();
    expect(getByRole('link', {name: 'Files'})).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenLastCalledWith('/files', undefined);

    await user.keyboard('{ArrowDown}');
    expect(getByRole('link', {name: 'Libraries'})).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenLastCalledWith('/libraries', undefined);

    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'false');
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it('hides a nested child while collapsed and restores it when expanded again', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <NavPanelExample defaultExpandedKeys={['libraries']} onCollapsedChange={onCollapsedChange} />
    );

    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Photos'})).toBeInTheDocument();

    await user.click(getByRole('button', {name: 'Collapse side panel'}));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(queryByRole('link', {name: 'Photos'})).toBeNull();
    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'false');

    await user.click(getByRole('button', {name: 'Expand side panel'}));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    // The contents only come back once the panel has finished widening.
    expect(queryByRole('link', {name: 'Photos'})).toBeNull();

    finishExpanding();
    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Photos'})).toBeInTheDocument();
  });

  it('toggles the category instead of navigating when a parent with no href is clicked', async () => {
    let navigate = jest.fn();
    let {getByRole, queryByRole} = render(<NavPanelExample navigate={navigate} />);

    let favoritesLink = getByRole('link', {name: 'Favorites'});
    expect(favoritesLink).not.toHaveAttribute('href');
    let favoritesRow = getByRole('row', {name: 'Favorites'});
    expect(favoritesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Documents'})).toBeNull();

    await user.click(favoritesLink);

    expect(favoritesRow).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Documents'})).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
