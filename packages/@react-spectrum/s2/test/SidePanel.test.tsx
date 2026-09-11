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
import React from 'react';
import {RouterProvider} from 'react-aria-components';
import {SideNav, SideNavItem, SideNavItemContent, SideNavItemLink, SidePanel} from '../src/SideNav';
import {Text} from '../src/Content';
import userEvent, {UserEvent} from '@testing-library/user-event';

// "Files" is a top-level leaf (no children). "Libraries" is a parent with an href and a nested "Photos" leaf.
// "Favorites" is a parent with no href but with a nested "Documents" leaf.
// When the panel is collapsed, leaves stay links (and navigate immediately) while parents render as
// expanding buttons.
function SidePanelExample(props: {
  defaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  defaultExpandedKeys?: Array<string>;
  navigate?: (path: string) => void;
}) {
  let {navigate, defaultExpandedKeys, ...panelProps} = props;
  let sidePanel = (
    <SidePanel aria-label="Side panel" {...panelProps}>
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
    </SidePanel>
  );

  return navigate ? <RouterProvider navigate={navigate}>{sidePanel}</RouterProvider> : sidePanel;
}

// When collapsed, a parent item renders as a button whose accessible name combines its label with a
// hidden explanation. Helps disambiguate it from the per-item expand chevron (named "Expand <x>").
function itemButtonName(label: string): string {
  return `${label} panel collapsed, click to expand`;
}

describe('SidePanel', () => {
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

  it('collapses and expands via the provided toggle button', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample onCollapsedChange={onCollapsedChange} />
    );

    expect(getByRole('link', {name: 'Files'})).toBeInTheDocument();
    expect(getByRole('link', {name: 'Libraries'})).toBeInTheDocument();
    let toggle = getByRole('button', {name: 'Collapse side panel'});

    await user.click(toggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    // The leaf stays a link; the parent becomes an expanding button.
    expect(getByRole('link', {name: 'Files'})).toBeInTheDocument();
    expect(queryByRole('link', {name: 'Libraries'})).toBeNull();
    expect(getByRole('button', {name: itemButtonName('Libraries')})).toBeInTheDocument();
    toggle = getByRole('button', {name: 'Expand side panel'});

    await user.click(toggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(getByRole('link', {name: 'Files'})).toBeInTheDocument();
    expect(getByRole('link', {name: 'Libraries'})).toBeInTheDocument();
    expect(getByRole('button', {name: 'Collapse side panel'})).toBeInTheDocument();
  });

  it('navigates immediately when a collapsed leaf link is clicked (no children)', async () => {
    let navigate = jest.fn();
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample
        defaultCollapsed
        navigate={navigate}
        onCollapsedChange={onCollapsedChange}
      />
    );

    expect(queryByRole('button', {name: itemButtonName('Files')})).toBeNull();
    let filesLink = getByRole('link', {name: 'Files'});

    await user.click(filesLink);

    expect(navigate).toHaveBeenCalledWith('/files', undefined);
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it('expands the panel when a collapsed parent button is clicked with the mouse (has children)', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample defaultCollapsed onCollapsedChange={onCollapsedChange} />
    );

    expect(queryByRole('link', {name: 'Libraries'})).toBeNull();

    await user.click(getByRole('button', {name: itemButtonName('Libraries')}));

    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(getByRole('link', {name: 'Libraries'})).toBeInTheDocument();
  });

  it('navigates immediately when a collapsed leaf link is activated via the keyboard (no children)', async () => {
    let navigate = jest.fn();
    let onCollapsedChange = jest.fn();
    let {getByRole} = render(
      <SidePanelExample
        defaultCollapsed
        navigate={navigate}
        onCollapsedChange={onCollapsedChange}
      />
    );

    await user.tab();
    let filesLink = getByRole('link', {name: 'Files'});
    expect(filesLink).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledWith('/files', undefined);
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it('expands the panel via the keyboard and moves focus to the same item link (parent with children)', async () => {
    let {getByRole} = render(<SidePanelExample defaultCollapsed />);

    await user.tab();
    expect(getByRole('link', {name: 'Files'})).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    let librariesButton = getByRole('button', {name: itemButtonName('Libraries')});
    expect(librariesButton).toHaveFocus();

    // Activating the button expands the panel and keeps focus on the same item, now its link.
    await user.keyboard('{Enter}');
    let librariesLink = getByRole('link', {name: 'Libraries'});
    expect(librariesLink).toBeInTheDocument();
    expect(librariesLink).toHaveFocus();
  });

  it('hides a nested child while collapsed and restores it when expanded again', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample defaultExpandedKeys={['libraries']} onCollapsedChange={onCollapsedChange} />
    );

    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Photos'})).toBeInTheDocument();

    await user.click(getByRole('button', {name: 'Collapse side panel'}));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(queryByRole('link', {name: 'Photos'})).toBeNull();
    expect(queryByRole('button', {name: itemButtonName('Photos')})).toBeNull();
    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'false');

    await user.click(getByRole('button', {name: 'Expand side panel'}));
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(getByRole('row', {name: 'Libraries'})).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Photos'})).toBeInTheDocument();
  });

  it('toggles the category instead of navigating when a parent with no href is clicked (expanded panel)', async () => {
    let navigate = jest.fn();
    let {getByRole, queryByRole} = render(<SidePanelExample navigate={navigate} />);

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

  it('renders a collapsed parent with no href as an expanding button (never a link)', async () => {
    let navigate = jest.fn();
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample
        defaultCollapsed
        navigate={navigate}
        onCollapsedChange={onCollapsedChange}
      />
    );

    expect(queryByRole('link', {name: 'Favorites'})).toBeNull();
    let favoritesButton = getByRole('button', {name: itemButtonName('Favorites')});

    await user.click(favoritesButton);

    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(getByRole('link', {name: 'Favorites'})).toBeInTheDocument();
  });
});
