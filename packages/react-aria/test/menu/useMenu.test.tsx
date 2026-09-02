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

import {AriaMenuProps, useMenu} from '../../src/menu/useMenu';
import {getChildNodes} from 'react-stately/private/collections/getChildNodes';
import {Item} from 'react-stately/Item';
import {Key} from '@react-types/shared';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {Section} from 'react-stately/Section';
import {TreeState, useTreeState} from 'react-stately/useTreeState';
import {useMenuItem} from '../../src/menu/useMenuItem';
import userEvent from '@testing-library/user-event';

function Menu<T extends object>(props: AriaMenuProps<T> & {onSelect: () => void}) {
  // Create menu state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = React.useRef(null);
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul {...menuProps} ref={ref}>
      {[...state.collection].map(item => (
        <MenuItem key={item.key} item={item} state={state} onAction={props.onSelect} />
      ))}
    </ul>
  );
}

function MenuItem({item, state, onAction}) {
  // Get props for the menu item element
  let ref = React.useRef(null);
  let {menuItemProps, isSelected} = useMenuItem({key: item.key, onAction}, state, ref);

  return (
    <li {...menuItemProps} ref={ref}>
      {item.rendered}
      {isSelected && <span aria-hidden="true">✅</span>}
    </li>
  );
}

interface VirtualizedMenuItemProps<T> {
  item: {key: Key; rendered: React.ReactNode; index?: number};
  state: TreeState<T>;
  onAction?: (key: Key) => void;
}

function VirtualizedMenuItem<T>({item, state, onAction}: VirtualizedMenuItemProps<T>) {
  let ref = React.useRef(null);
  let {menuItemProps} = useMenuItem({key: item.key, onAction, isVirtualized: true}, state, ref);

  return (
    <li {...menuItemProps} ref={ref}>
      {item.rendered}
    </li>
  );
}

function VirtualizedMenu<T extends object>(props: AriaMenuProps<T>) {
  let state = useTreeState(props);
  let ref = React.useRef(null);
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul {...menuProps} ref={ref}>
      {[...state.collection].map(item => (
        <VirtualizedMenuItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}

function VirtualizedMenuWithSections<T extends object>(props: AriaMenuProps<T>) {
  let state = useTreeState(props);
  let ref = React.useRef(null);
  let {menuProps} = useMenu(props, state, ref);

  return (
    <ul {...menuProps} ref={ref}>
      {[...state.collection].map(node => {
        if (node.type === 'section') {
          let headingId = `heading-${node.key}`;
          return (
            <div key={node.key} role="presentation">
              {node.rendered && (
                <span id={headingId} role="presentation">
                  {node.rendered}
                </span>
              )}
              <div role="group" aria-labelledby={headingId}>
                {[...getChildNodes(node, state.collection)].map(item => (
                  <VirtualizedMenuItem key={item.key} item={item} state={state} />
                ))}
              </div>
            </div>
          );
        }
        return <VirtualizedMenuItem key={node.key} item={node} state={state} />;
      })}
    </ul>
  );
}

describe('useMenuTrigger', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {});

  it('calls an onAction passed directly to useMenuItem', async () => {
    let onSelect = jest.fn();
    let {getAllByRole} = render(
      <Menu onSelect={onSelect} aria-label={'test menu'}>
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </Menu>
    );
    let items = getAllByRole('menuitem');
    await user.click(items[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('useMenuItem with isVirtualized', function () {
  it('sets correct aria-posinset (1-based) for virtualized menu items', () => {
    let {getAllByRole} = render(
      <VirtualizedMenu aria-label="test menu">
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </VirtualizedMenu>
    );

    let items = getAllByRole('menuitem');
    // aria-posinset should be 1-based (1, 2, 3), not 0-based (0, 1, 2)
    expect(items[0]).toHaveAttribute('aria-posinset', '1');
    expect(items[1]).toHaveAttribute('aria-posinset', '2');
    expect(items[2]).toHaveAttribute('aria-posinset', '3');
  });

  it('sets correct aria-setsize for virtualized menu items', () => {
    let {getAllByRole} = render(
      <VirtualizedMenu aria-label="test menu">
        <Item key="1">One</Item>
        <Item key="2">Two</Item>
        <Item key="3">Three</Item>
      </VirtualizedMenu>
    );

    let items = getAllByRole('menuitem');
    // aria-setsize should match the total number of items
    expect(items[0]).toHaveAttribute('aria-setsize', '3');
    expect(items[1]).toHaveAttribute('aria-setsize', '3');
    expect(items[2]).toHaveAttribute('aria-setsize', '3');
  });

  it('sets global aria-posinset across sections', () => {
    let {getAllByRole, getAllByRole: getAllByRole2} = render(
      <VirtualizedMenuWithSections aria-label="test menu">
        <Section title="Group 1">
          <Item key="1">One</Item>
          <Item key="2">Two</Item>
        </Section>
        <Section title="Group 2">
          <Item key="3">Three</Item>
          <Item key="4">Four</Item>
        </Section>
      </VirtualizedMenuWithSections>
    );

    // The sections must actually render as groups, mirroring the real
    // sectioned menu structure, so this test locks the real DOM shape.
    let groups = getAllByRole2('group');
    expect(groups).toHaveLength(2);
    // Each group is labelled by its section heading, which is present in the DOM.
    for (let group of groups) {
      let labelledBy = group.getAttribute('aria-labelledby');
      expect(labelledBy).not.toBeNull();
      let heading = document.getElementById(labelledBy!);
      expect(heading).not.toBeNull();
      expect(heading!.textContent).toMatch(/^Group [12]$/);
    }

    // aria-posinset should be global (1..4) and match aria-setsize, not restart
    // per section (which would report 1..2 for both groups).
    let items = getAllByRole('menuitem');
    expect(items[0]).toHaveAttribute('aria-posinset', '1');
    expect(items[1]).toHaveAttribute('aria-posinset', '2');
    expect(items[2]).toHaveAttribute('aria-posinset', '3');
    expect(items[3]).toHaveAttribute('aria-posinset', '4');
    expect(items[0]).toHaveAttribute('aria-setsize', '4');
    expect(items[3]).toHaveAttribute('aria-setsize', '4');
  });
});
