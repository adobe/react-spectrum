/*
 * Copyright 2021 Adobe. All rights reserved.
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
import {Item} from '@react-stately/collections';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useListBox, useOption} from '../src';
import {useListState} from '@react-stately/list';
import userEvent from '@testing-library/user-event';

function ListBox(props) {
  // Create state based on the incoming props
  let state = useListState({...props, onCellAction: props.onAction});

  // Get props for the listbox element
  let ref = React.useRef();
  let {listBoxProps, labelProps} = useListBox(props, state, ref);

  return (
    <>
      <div {...labelProps}>{props.label}</div>
      <ul
        {...listBoxProps}
        ref={ref}
        style={{
          padding: 0,
          margin: '5px 0',
          listStyle: 'none',
          border: '1px solid gray',
          maxWidth: 250
        }}>
        {[...state.collection].map(item => (
          <Option
            key={item.key}
            item={item}
            state={state} />
        ))}
      </ul>
    </>
  );
}

function Option({item, state}) {
  // Get props for the option element
  let ref = React.useRef();
  let {optionProps, isSelected} = useOption({key: item.key}, state, ref);

  // Determine whether we should show a keyboard
  // focus ring for accessibility
  let {isFocusVisible, focusProps} = useFocusRing();

  return (
    <li
      {...mergeProps(optionProps, focusProps)}
      ref={ref}
      style={{
        background: isSelected ? 'blueviolet' : 'transparent',
        color: isSelected ? 'white' : null,
        padding: '2px 5px',
        outline: isFocusVisible
          ? '2px solid orange'
          : 'none'
      }}>
      {item.rendered}
    </li>
  );
}


describe('useListBox', () => {
  beforeAll(function () {
    // @ts-ignore
    jest.useFakeTimers('modern');
  });
  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });
  describe('with pointer events', () => {
    beforeEach(() => {
      window.ontouchstart = jest.fn();
    });
    afterEach(() => {
      delete window.ontouchstart;
    });
    it('is described in touch with onAction and select how to enter selection mode', () => {
      window.ontouchstart = jest.fn();
      let onSelectionChange = jest.fn();
      let onAction = jest.fn();
      let tree = render(
        <ListBox
          label="Choose an option"
          selectionMode="multiple"
          selectionBehavior="replace"
          onAction={onAction}
          onSelectionChange={onSelectionChange}>
          <Item key="1">One</Item>
          <Item key="2">Two</Item>
          <Item key="3">Three</Item>
        </ListBox>
      );
      let listbox = tree.getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      // @ts-ignore
      userEvent.click(document.body, {pointerType: 'touch'});

      // @ts-ignore
      fireEvent.pointerDown(items[0], {pointerType: 'touch'});
      fireEvent.pointerUp(items[0], {pointerType: 'touch'});
      // onAction probably should have been called?

      fireEvent.pointerDown(items[1], {pointerType: 'touch'});
      let description = tree.getByText('Long press to enter selection mode.');
      expect(listbox).toHaveAttribute('aria-describedby', expect.stringContaining(description.id));
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onAction).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(800));

      fireEvent.pointerUp(items[1], {pointerType: 'touch'});

      // @ts-ignore
      userEvent.click(items[2], {pointerType: 'touch'});
      expect([...onSelectionChange.mock.calls[0][0]][0]).toBe('3');
      expect(onAction).not.toHaveBeenCalled();
      expect(announce).not.toHaveBeenCalled();
    });
  });
});
