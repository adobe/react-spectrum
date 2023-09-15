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
import {Button, Text, Toolbar, ToolbarContext} from '../';
import {I18nProvider} from '@react-aria/i18n';
import {pointerMap} from '@react-spectrum/test-utils';
import React, {createRef} from 'react';
import userEvent from '@testing-library/user-event';

describe('Toolbar', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('renders', async () => {
    let ref = createRef<HTMLDivElement>();
    render(
      <Toolbar ref={ref}>
        <Button key="alignleft">
          <Text>Align left</Text>
        </Button>
        <Button key="aligncenter">
          <Text>Align center</Text>
        </Button>
        <Button key="alignright">
          <Text>Align right</Text>
        </Button>
      </Toolbar>
    );

    let toolbar = screen.getByRole('toolbar');
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(toolbar).toHaveAttribute('class', 'react-aria-Toolbar');
    expect(ref.current).toBe(toolbar);
  });

  it('renders a custom classname and data-attributes', async () => {
    render(
      <Toolbar className="test" data-testid="foo">
        <Button key="alignleft">
          <Text>Align left</Text>
        </Button>
        <Button key="aligncenter">
          <Text>Align center</Text>
        </Button>
        <Button key="alignright">
          <Text>Align right</Text>
        </Button>
      </Toolbar>
    );

    let toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('class', 'test');
    expect(toolbar).toHaveAttribute('data-testid', 'foo');
  });

  it('supports slots', async () => {
    render(
      <ToolbarContext.Provider value={{slots: {test: {'aria-label': 'test label'}}}}>
        <Toolbar slot="test">
          <Button key="alignleft">
            <Text>Align left</Text>
          </Button>
          <Button key="aligncenter">
            <Text>Align center</Text>
          </Button>
          <Button key="alignright">
            <Text>Align right</Text>
          </Button>
        </Toolbar>
      </ToolbarContext.Provider>
    );

    let toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('slot', 'test');
    expect(toolbar).toHaveAttribute('aria-label', 'test label');
  });

  it('support render props', async () => {
    render(
      <Toolbar>
        {({orientation}) => (
          <div data-testid="foo" data-test={orientation}>
            <Button key="alignleft">
              <Text>Align left</Text>
            </Button>
            <Button key="aligncenter">
              <Text>Align center</Text>
            </Button>
            <Button key="alignright">
              <Text>Align right</Text>
            </Button>
          </div>
        )}
      </Toolbar>
    );

    let toolbar = screen.getByTestId('foo');
    expect(toolbar).toHaveAttribute('data-test', 'horizontal');
  });

  it('renders dividers', async () => {
    const {rerender} = render(
      <Toolbar>
        <Button key="alignleft">
          <Text>Align left</Text>
        </Button>
        <hr />
        <Button key="aligncenter">
          <Text>Align center</Text>
        </Button>
        <hr />
        <Button key="alignright">
          <Text>Align right</Text>
        </Button>
      </Toolbar>
    );

    expect(screen.getAllByRole('separator')).toHaveLength(2);

    rerender(
      <Toolbar orientation="vertical">
        <Button>
          <Text>Align left</Text>
        </Button>
        <hr />
        <Button>
          <Text>Align center</Text>
        </Button>
        <hr />
        <Button>
          <Text>Align right</Text>
        </Button>
      </Toolbar>
    );
    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });

  it('sets aria-label', async () => {
    render(
      <>
        <span id="toolbar-label">Toolbar aria-labelledby</span>

        <Toolbar aria-label="Toolbar aria-label">
          <Button>
            <Text>Align Left</Text>
          </Button>
        </Toolbar>
        <Toolbar aria-label="Toolbar aria-label 2" aria-labelledby="toolbar-id">
          <Button>
            <Text>Align Right</Text>
          </Button>
        </Toolbar>
      </>
    );

    expect(screen.getByLabelText('Toolbar aria-label')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByLabelText('Toolbar aria-label 2')).not.toHaveAttribute('aria-labelledby');
  });

  it('supports keyboard navigation', async() => {
    render(
      <>
        <Button>Before</Button>
        <Toolbar>
          <div aria-label="Align text">
            <Button key="alignleft">
              <Text>Align left</Text>
            </Button>
            <Button key="aligncenter">
              <Text>Align center</Text>
            </Button>
            <Button key="alignright">
              <Text>Align right</Text>
            </Button>
          </div>
          <hr />
          <div aria-label="Zoom">
            <Button key="zoomin">
              <Text>Zoom in</Text>
            </Button>
            <Button key="zoomout">
              <Text>Zoom out</Text>
            </Button>
          </div>
        </Toolbar>
        <Button>After</Button>
      </>
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

    // Right and down arrow keys navigate to next action buttons
    await user.keyboard('{ArrowRight}');
    expect(alignCenter).toHaveFocus();
    await user.keyboard('{ArrowDown}');
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

    // Left and up arrow keys navigate to previous action buttons
    await user.keyboard('{ArrowLeft}');
    expect(alignCenter).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(alignLeft).toHaveFocus();

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

  it('supports RTL', async () => {
    render(
      <I18nProvider locale="he-IL">
        <Button>Before</Button>
        <Toolbar>
          <div aria-label="Align text">
            <Button key="alignleft">
              <Text>Align left</Text>
            </Button>
            <Button key="aligncenter">
              <Text>Align center</Text>
            </Button>
            <Button key="alignright">
              <Text>Align right</Text>
            </Button>
          </div>
          <hr />
          <div aria-label="Zoom">
            <Button key="zoomin">
              <Text>Zoom in</Text>
            </Button>
            <Button key="zoomout">
              <Text>Zoom out</Text>
            </Button>
          </div>
        </Toolbar>
        <Button>After</Button>
      </I18nProvider>
    );

    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Align left'})).toHaveFocus();

    // Left and up arrow keys navigate to next action buttons
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', {name: 'Align center'})).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', {name: 'Align right'})).toHaveFocus();

    // Right and down arrow keys navigate to previous action buttons
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', {name: 'Align center'})).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', {name: 'Align left'})).toHaveFocus();
  });
});
