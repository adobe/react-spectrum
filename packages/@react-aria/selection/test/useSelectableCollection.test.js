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

import {fireEvent, render} from '@testing-library/react';
import {Item} from '@react-stately/collections';
import {List} from '../stories/List';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('useSelectableCollection', () => {
  beforeEach(() => {
    jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 750);
  });
  it('can navigate without replacing the selection in multiple selection selectOnFocus', () => {
    let {getAllByRole} = render(
      <List selectionMode="multiple" selectionBehavior="replace">
        <Item>Paco de Lucia</Item>
        <Item>Vicente Amigo</Item>
        <Item>Gerardo Nunez</Item>
      </List>
    );
    let options = getAllByRole('option');
    expect(options[0]).not.toHaveAttribute('aria-selected');
    userEvent.tab();
    fireEvent.keyDown(document.activeElement, {key: ' '});
    fireEvent.keyUp(document.activeElement, {key: ' '});
    expect(document.activeElement).toBe(options[0]);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).not.toHaveAttribute('aria-selected');
    expect(options[2]).not.toHaveAttribute('aria-selected');
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', ctrlKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', ctrlKey: true});
    expect(document.activeElement).toBe(options[1]);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).not.toHaveAttribute('aria-selected');
    expect(options[2]).not.toHaveAttribute('aria-selected');
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', ctrlKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', ctrlKey: true});
    expect(document.activeElement).toBe(options[2]);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).not.toHaveAttribute('aria-selected');
    expect(options[2]).not.toHaveAttribute('aria-selected');
    fireEvent.keyDown(document.activeElement, {key: ' '});
    fireEvent.keyUp(document.activeElement, {key: ' '});
    expect(options[0]).not.toHaveAttribute('aria-selected');
    expect(options[1]).not.toHaveAttribute('aria-selected');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('uses toggle mode in mobile', () => {
    jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 600);
    let {getAllByRole} = render(
      <List selectionMode="multiple" selectionBehavior="replace">
        <Item>Paco de Lucia</Item>
        <Item>Vicente Amigo</Item>
        <Item>Gerardo Nunez</Item>
      </List>
    );
    let options = getAllByRole('option');
    expect(options[0]).not.toHaveAttribute('aria-selected');
    fireEvent.touchStart(options[0], {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
    fireEvent.touchEnd(options[0], {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).not.toHaveAttribute('aria-selected');
    expect(options[2]).not.toHaveAttribute('aria-selected');
    fireEvent.touchStart(options[2], {targetTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
    fireEvent.touchEnd(options[2], {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).not.toHaveAttribute('aria-selected');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });
});
