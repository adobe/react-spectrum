/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, screen} from '@testing-library/react';
import {
  ActionButton,
  ActionGroup,
  defaultTheme,
  Divider,
  Item,
  Provider,
  Text
} from '@adobe/react-spectrum';
import {pointerMap} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {Toolbar} from '../stories/Toolbar.stories';
import userEvent from '@testing-library/user-event';

describe('Toolbar', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('renders action buttons for items with keys and children', async () => {
    render(
      <Provider theme={defaultTheme}>
        <Toolbar>
          <ActionGroup>
            <Item key="alignleft">
              <Text>Align left</Text>
            </Item>
            <Item key="aligncenter">
              <Text>Align center</Text>
            </Item>
            <Item key="alignright">
              <Text>Align right</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
      </Provider>
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders dividers', async () => {
    const {rerender} = render(
      <Provider theme={defaultTheme}>
        <Toolbar>
          <ActionGroup>
            <Item key="alignleft">
              <Text>Align left</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup>
            <Item key="aligncenter">
              <Text>Align center</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup>
            <Item key="alignright">
              <Text>Align right</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
      </Provider>
    );

    expect(screen.getAllByRole('separator')).toHaveLength(2);
    screen.getAllByRole('separator').forEach((separator) => {
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });

    rerender(
      <Provider theme={defaultTheme}>
        <Toolbar orientation="vertical">
          <ActionGroup>
            <Item key="alignleft">
              <Text>Align left</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup>
            <Item key="aligncenter">
              <Text>Align center</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup>
            <Item key="alignright">
              <Text>Align right</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
      </Provider>
    );

    screen.getAllByRole('separator').forEach((separator) => {
      expect(separator).not.toHaveAttribute('aria-orientation');
    });
  });

  it('sets aria-label', async () => {
    render(
      <Provider theme={defaultTheme}>
        <span id="toolbar-label">Toolbar aria-labelledby</span>

        <Toolbar aria-label="Toolbar aria-label">
          <ActionGroup>
            <Item key="alignleft">
              <Text>Alight Left</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
        <Toolbar aria-label="Toolbar aria-label 2" aria-labelledby="toolbar-id">
          <ActionGroup>
            <Item key="alignleft">
              <Text>Align Right</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
      </Provider>
    );

    expect(screen.getByLabelText('Toolbar aria-label')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByLabelText('Toolbar aria-label 2')).not.toHaveAttribute('aria-labelledby');
  });

  it('support actions and selection', async () => {
    let onAction = jest.fn();
    let onSelectionChange = jest.fn();
    render(
      <Provider theme={defaultTheme}>
        <Toolbar aria-label="Actions">
          <ActionGroup onAction={onAction}>
            <Item key="alignleft" data-testid="alignLeft">
              <Text>Alight Left</Text>
            </Item>
            <Item key="alignright">
              <Text>Align Right</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup onSelectionChange={onSelectionChange} selectionMode="single">
            <Item key="list">
              <Text>List</Text>
            </Item>
            <Item key="grid" data-testid="grid">
              <Text>Grid</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
      </Provider>
    );
    const alignleftButton = screen.getByTestId('alignLeft');
    const gridButton = screen.getByTestId('grid');

    await user.tab();
    expect(alignleftButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenLastCalledWith('alignleft');
    onAction.mockReset();

    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    expect(gridButton).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onAction).not.toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation', async() => {
    render(
      <Provider theme={defaultTheme}>
        <ActionButton>Before</ActionButton>
        <Toolbar>
          <ActionGroup aria-label="Align text">
            <Item key="alignleft">
              <Text>Align left</Text>
            </Item>
            <Item key="aligncenter">
              <Text>Align center</Text>
            </Item>
            <Item key="alignright">
              <Text>Align right</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup aria-label="Zoom">
            <Item key="zoomin">
              <Text>Zoom in</Text>
            </Item>
            <Item key="zoomout">
              <Text>Zoom out</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
        <ActionButton>After</ActionButton>
      </Provider>
    );

    const before = screen.getByRole('button', {name: 'Before'});
    const alignLeft = screen.getByRole('button', {name: 'Align left'});
    const alignCenter = screen.getByRole('button', {name: 'Align center'});
    const alignRight = screen.getByRole('button', {name: 'Align right'});
    const zoomIn = screen.getByRole('button', {name: 'Zoom in'});
    const zoomOut = screen.getByRole('button', {name: 'Zoom out'});
    const after = screen.getByRole('button', {name: 'After'});

    await user.tab();

    // Tab enters the toolbar
    await user.tab();
    expect(alignLeft).toHaveFocus();

    // Right arrow key navigates to next action buttons
    await user.keyboard('{ArrowRight}');
    expect(alignCenter).toHaveFocus();
    // Down arrow key is controlled by the child component and can wrap
    await user.keyboard('{ArrowDown}');
    expect(alignRight).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(alignLeft).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(alignRight).toHaveFocus();

    // Arrow keys navigate across dividers to other action groups
    await user.keyboard('{ArrowRight}');
    expect(zoomIn).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(alignRight).toHaveFocus();

    // Tab exits and shift-tab re-enters the toolbar at the last focused action button
    // Using await user.tab() doesn't work here because jsdom doesn't take over tabbing
    // out of the toolbar correctly once focusFirst() or focusLast() is called.
    // As a workaround, we have to manually fire keyDown and keyUp events to validate
    // the 'Tab' case of onKeyDown, then manually focus the before and after buttons.
    await user.tab();
    act(() => {
      after.focus();
    });
    expect(after).toHaveFocus();

    await user.tab({shift: true});
    expect(alignRight).toHaveFocus();

    await user.tab({shift: true});
    act(() => {
      before.focus();
    });
    expect(before).toHaveFocus();

    await user.tab();
    expect(alignRight).toHaveFocus();

    // Left arrow key navigates to previous action buttons
    await user.keyboard('{ArrowLeft}');
    expect(alignCenter).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    // Blurring then tabbing re-enters toolbar at the last focused action button
    fireEvent.blur(alignLeft);
    act(() => {
      before.focus();
    });
    await user.tab();
    expect(alignLeft).toHaveFocus();

    // Arrow keys do not wrap across collection
    await user.keyboard('{ArrowLeft}');
    expect(alignLeft).toHaveFocus();
    await user.click(zoomOut);
    await user.keyboard('{ArrowRight}');
    expect(zoomOut).toHaveFocus();

    // Other keys don't affect focus
    await user.keyboard('{Enter}');
    expect(zoomOut).toHaveFocus();
  });

  it('supports keyboard navigation with orientation vertical', async () => {
    render(
      <Provider theme={defaultTheme}>
        <ActionButton>Before</ActionButton>
        <Toolbar orientation="vertical">
          <ActionGroup aria-label="Align text">
            <Item key="alignleft">
              <Text>Align left</Text>
            </Item>
            <Item key="aligncenter">
              <Text>Align center</Text>
            </Item>
            <Item key="alignright">
              <Text>Align right</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup aria-label="Zoom">
            <Item key="zoomin">
              <Text>Zoom in</Text>
            </Item>
            <Item key="zoomout">
              <Text>Zoom out</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
        <ActionButton>After</ActionButton>
      </Provider>
    );

    const before = screen.getByRole('button', {name: 'Before'});
    const alignLeft = screen.getByRole('button', {name: 'Align left'});
    const alignCenter = screen.getByRole('button', {name: 'Align center'});
    const alignRight = screen.getByRole('button', {name: 'Align right'});
    const zoomIn = screen.getByRole('button', {name: 'Zoom in'});
    const zoomOut = screen.getByRole('button', {name: 'Zoom out'});
    const after = screen.getByRole('button', {name: 'After'});

    await user.tab();

    // Tab enters the toolbar
    await user.tab();
    expect(alignLeft).toHaveFocus();

    // Down arrow key navigates to next action buttons
    await user.keyboard('{ArrowDown}');
    expect(alignCenter).toHaveFocus();
    // Right arrow key is controlled by child and can wrap
    await user.keyboard('{ArrowRight}');
    expect(alignRight).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(alignLeft).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(alignRight).toHaveFocus();

    // Arrow keys navigate across dividers to other action groups
    await user.keyboard('{ArrowDown}');
    expect(zoomIn).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(alignRight).toHaveFocus();

    // Tab exits and shift-tab re-enters the toolbar at the last focused action button
    // Using await user.tab() doesn't work here because jsdom doesn't take over tabbing
    // out of the toolbar correctly once focusFirst() or focusLast() is called.
    // As a workaround, we have to manually fire keyDown and keyUp events to validate
    // the 'Tab' case of onKeyDown, then manually focus the before and after buttons.
    await user.tab();
    act(() => {
      after.focus();
    });
    expect(after).toHaveFocus();

    await user.tab({shift: true});
    expect(alignRight).toHaveFocus();

    await user.tab({shift: true});
    act(() => {
      before.focus();
    });
    expect(before).toHaveFocus();

    await user.tab();
    expect(alignRight).toHaveFocus();

    // Up arrow key navigates to previous action buttons
    await user.keyboard('{ArrowUp}');
    expect(alignCenter).toHaveFocus();

    // Blurring then tabbing re-enters toolbar at the last focused action button
    fireEvent.blur(alignLeft);
    act(() => {
      before.focus();
    });
    await user.tab();
    expect(alignLeft).toHaveFocus();

    // Arrow keys do not wrap across collection
    await user.keyboard('{ArrowUp}');
    expect(alignLeft).toHaveFocus();
    await user.click(zoomOut);
    await user.keyboard('{ArrowDown}');
    expect(zoomOut).toHaveFocus();

    // Other keys don't affect focus
    await user.keyboard('{Enter}');
    expect(zoomOut).toHaveFocus();
  });

  it('supports RTL', async () => {
    render(
      <Provider theme={defaultTheme} locale="he-IL">
        <ActionButton>Before</ActionButton>
        <Toolbar>
          <ActionGroup aria-label="Align text">
            <Item key="alignleft">
              <Text>Align left</Text>
            </Item>
            <Item key="aligncenter">
              <Text>Align center</Text>
            </Item>
            <Item key="alignright">
              <Text>Align right</Text>
            </Item>
          </ActionGroup>
          <Divider />
          <ActionGroup aria-label="Zoom">
            <Item key="zoomin">
              <Text>Zoom in</Text>
            </Item>
            <Item key="zoomout">
              <Text>Zoom out</Text>
            </Item>
          </ActionGroup>
        </Toolbar>
        <ActionButton>After</ActionButton>
      </Provider>
    );

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Align left'})).toHaveFocus();

    // Left arrow key navigates to next action buttons
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', {name: 'Align center'})).toHaveFocus();
    // Up/Down still go the same direction
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', {name: 'Align left'})).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', {name: 'Align center'})).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    // Right arrow key navigates to previous action buttons
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', {name: 'Align center'})).toHaveFocus();
  });
});
