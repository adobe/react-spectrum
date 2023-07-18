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

import {act, fireEvent, render} from '@react-spectrum/test-utils';
import {Grid} from '../stories/example';
import {Item} from '@react-stately/collections';
import React from 'react';
import {Switch} from '@react-spectrum/switch';
import userEvent from '@testing-library/user-event';

function renderGrid(props = {}) {
  return render(
    <Grid {...props}>
      <Item textValue="Item 1">
        <Switch aria-label="Switch 1" />
        <Switch aria-label="Switch 2" />
      </Item>
      <Item textValue="Item 2">
        <Switch aria-label="Switch 3" />
        <Switch aria-label="Switch 4" />
        <Switch aria-label="Switch 5" />
      </Item>
      <Item textValue="Item 3">
        <Switch aria-label="Switch 6" />
        <Switch aria-label="Switch 7" />
      </Item>
    </Grid>
  );
}

describe('useGrid', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    // run out notifications
    act(() => {jest.runAllTimers();});
  });
  it('gridFocusMode = row, cellFocusMode = cell', () => {
    let tree = renderGrid({gridFocusMode: 'row', cellFocusMode: 'cell'});

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    act(() => tree.getAllByRole('switch')[1].focus());

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);
  });

  it('gridFocusMode = row, cellFocusMode = child', () => {
    let tree = renderGrid({gridFocusMode: 'row', cellFocusMode: 'child'});

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('row')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);
  });

  it('gridFocusMode = cell, cellFocusMode = child', () => {
    let tree = renderGrid({gridFocusMode: 'cell', cellFocusMode: 'child'});

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);
  });

  it('gridFocusMode = cell, cellFocusMode = cell', () => {
    let tree = renderGrid({gridFocusMode: 'cell', cellFocusMode: 'cell'});

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tree.getAllByRole('gridcell')[0]);
  });
});
