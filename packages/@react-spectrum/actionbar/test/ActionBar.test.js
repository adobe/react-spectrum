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

jest.mock('@react-aria/live-announcer');
import {act, fireEvent, render, within} from '@testing-library/react';
import {announce} from '@react-aria/live-announcer';
import {Example} from '../stories/Example';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';

describe('ActionBar', () => {
  beforeAll(() => {
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 500);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('should open when there are selected items', () => {
    let tree = render(<Provider theme={theme}><Example /></Provider>);

    let table = tree.getByRole('grid');
    let rows = within(table).getAllByRole('row');

    expect(tree.queryByRole('toolbar')).toBeNull();
    triggerPress(rows[1]);

    expect(announce).toHaveBeenCalledWith('Actions available.');

    let toolbar = tree.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Actions');

    let buttons = within(toolbar).getAllByRole('button');
    expect(buttons).toHaveLength(5);

    expect(tree.getByText('1 selected')).toBeInTheDocument();

    let clearButton = tree.getByLabelText('Clear selection');
    expect(clearButton.tagName).toBe('BUTTON');
  });

  it('should update the selected count when selecting more items', () => {
    let tree = render(<Provider theme={theme}><Example /></Provider>);

    let table = tree.getByRole('grid');
    let rows = within(table).getAllByRole('row');

    triggerPress(rows[1]);

    let selectedCount = tree.getByText('1 selected');

    triggerPress(rows[2]);
    expect(selectedCount).toHaveTextContent('2 selected');
  });

  it('should work with select all', () => {
    let tree = render(<Provider theme={theme}><Example /></Provider>);

    let selectAll = tree.getByLabelText('Select All');
    triggerPress(selectAll);

    expect(tree.getByText('All selected')).toBeInTheDocument();
  });

  it('should close and restore focus when pressing the clear button', () => {
    let tree = render(<Provider theme={theme}><Example /></Provider>);

    let table = tree.getByRole('grid');
    let rows = within(table).getAllByRole('row');
    let checkbox = within(rows[1]).getByRole('checkbox');

    triggerPress(checkbox);
    act(() => jest.runAllTimers());
    expect(document.activeElement).toBe(checkbox);

    let clearButton = tree.getByLabelText('Clear selection');

    act(() => clearButton.focus());
    triggerPress(clearButton);
    act(() => jest.runAllTimers());

    expect(tree.queryByRole('toolbar')).toBeNull();
    expect(document.activeElement).toBe(checkbox);
  });

  it('should close when pressing the escape key', () => {
    let tree = render(<Provider theme={theme}><Example /></Provider>);

    let table = tree.getByRole('grid');
    let rows = within(table).getAllByRole('row');
    let checkbox = within(rows[1]).getByRole('checkbox');

    triggerPress(checkbox);
    act(() => jest.runAllTimers());
    expect(document.activeElement).toBe(checkbox);

    let toolbar = tree.getByRole('toolbar');
    act(() => within(toolbar).getAllByRole('button')[0].focus());

    fireEvent.keyDown(document.activeElement, {key: 'Escape'});
    fireEvent.keyUp(document.activeElement, {key: 'Escape'});
    act(() => jest.runAllTimers());

    expect(tree.queryByRole('toolbar')).toBeNull();
    expect(document.activeElement).toBe(checkbox);
  });

  it('should fire onAction when clicking on an action', () => {
    let onAction = jest.fn();
    let tree = render(<Provider theme={theme}><Example onAction={onAction} /></Provider>);

    let table = tree.getByRole('grid');
    let rows = within(table).getAllByRole('row');

    triggerPress(rows[1]);

    let toolbar = tree.getByRole('toolbar');
    triggerPress(within(toolbar).getAllByRole('button')[0]);

    expect(onAction).toHaveBeenCalledWith('edit');
  });
});
