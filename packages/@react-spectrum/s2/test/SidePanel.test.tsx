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
import {SideNav, SideNavItem, SideNavItemContent, SideNavItemLink, SidePanel} from '../src/SideNav';
import {Text} from '../src/Content';
import userEvent, {UserEvent} from '@testing-library/user-event';

function SidePanelExample(props: {
  defaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
}) {
  return (
    <SidePanel aria-label="Side panel" {...props}>
      <SideNav aria-label="Test sidenav" selectedRoute="/files">
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
        </SideNavItem>
        <SideNavItem id="settings" textValue="Settings">
          <SideNavItemContent>
            <SideNavItemLink>
              <Text>Settings</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    </SidePanel>
  );
}

function NestedSidePanelExample(props: {
  defaultCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
}) {
  return (
    <SidePanel aria-label="Side panel" {...props}>
      <SideNav aria-label="Test sidenav" selectedRoute="/files" defaultExpandedKeys={['libraries']}>
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
      </SideNav>
    </SidePanel>
  );
}

// When collapsed, an item renders as a button whose accessible name combines its label with a
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
    let toggle = getByRole('button', {name: 'Collapse side panel'});

    await user.click(toggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    expect(queryByRole('link', {name: 'Files'})).toBeNull();
    expect(getByRole('button', {name: itemButtonName('Files')})).toBeInTheDocument();
    toggle = getByRole('button', {name: 'Expand side panel'});

    await user.click(toggle);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(getByRole('link', {name: 'Files'})).toBeInTheDocument();
    expect(getByRole('button', {name: 'Collapse side panel'})).toBeInTheDocument();
  });

  it('expands the panel when an item button is clicked with the mouse (item with href)', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample defaultCollapsed onCollapsedChange={onCollapsedChange} />
    );

    expect(queryByRole('link', {name: 'Files'})).toBeNull();

    await user.click(getByRole('button', {name: itemButtonName('Files')}));

    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(getByRole('link', {name: 'Files'})).toBeInTheDocument();
  });

  it('expands the panel when an item button is clicked with the mouse (item without href)', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <SidePanelExample defaultCollapsed onCollapsedChange={onCollapsedChange} />
    );

    expect(queryByRole('link', {name: 'Settings'})).toBeNull();

    await user.click(getByRole('button', {name: itemButtonName('Settings')}));

    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(getByRole('link', {name: 'Settings'})).toBeInTheDocument();
  });

  it('expands the panel via the keyboard and moves focus to the same item link (item with href)', async () => {
    let {getByRole} = render(<SidePanelExample defaultCollapsed />);

    await user.tab();
    let filesButton = getByRole('button', {name: itemButtonName('Files')});
    expect(filesButton).toHaveFocus();

    // Activating the button expands the panel; focus stays on the same item, now on its link.
    await user.keyboard('{Enter}');
    let filesLink = getByRole('link', {name: 'Files'});
    expect(filesLink).toBeInTheDocument();
    expect(filesLink).toHaveFocus();
  });

  it('hides a nested child while collapsed and restores it when expanded again', async () => {
    let onCollapsedChange = jest.fn();
    let {getByRole, queryByRole} = render(
      <NestedSidePanelExample onCollapsedChange={onCollapsedChange} />
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

  it('expands the panel via the keyboard and moves focus to the same item link (item without href)', async () => {
    let {getByRole} = render(<SidePanelExample defaultCollapsed />);

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    let settingsButton = getByRole('button', {name: itemButtonName('Settings')});
    expect(settingsButton).toHaveFocus();

    await user.keyboard('{Enter}');
    let settingsLink = getByRole('link', {name: 'Settings'});
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveFocus();
  });
});
