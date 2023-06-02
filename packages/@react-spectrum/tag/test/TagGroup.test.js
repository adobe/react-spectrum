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

import {act, fireEvent, mockImplementation, render, triggerPress, within} from '@react-spectrum/test-utils';
import {Button} from '@react-spectrum/button';
import {chain} from '@react-aria/utils';
import {Item} from '@react-stately/collections';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {TagGroup} from '../src';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

function pressKeyOnButton(key) {
  return (button) => {
    fireEvent.keyDown(button, {key});
    fireEvent.keyUp(button, {key});
  };
}

function pressArrowRight(button) {
  return pressKeyOnButton('ArrowRight')(button);
}

function pressArrowLeft(button) {
  return pressKeyOnButton('ArrowLeft')(button);
}

function pressArrowUp(button) {
  return pressKeyOnButton('ArrowUp')(button);
}

function pressArrowDown(button) {
  return pressKeyOnButton('ArrowDown')(button);
}

describe('TagGroup', function () {
  let onRemoveSpy = jest.fn();
  let onClearSpy = jest.fn();
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
    jest.restoreAllMocks();
  });

  it('provides context for Tag component', function () {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" onRemove={onRemoveSpy}>
          <Item aria-label="Tag 1">Tag 1</Item>
          <Item aria-label="Tag 2">Tag 2</Item>
          <Item aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    expect(tags.length).toBe(3);

    fireEvent.keyDown(tags[1], {key: 'Delete'});
    fireEvent.keyUp(tags[1], {key: 'Delete'});
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility roles', () => {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup
          aria-label="tag group">
          <Item aria-label="Tag 1">Tag 1</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    expect(tagGroup).toBeInTheDocument();
    let tags = getAllByRole('row');
    let cells = getAllByRole('gridcell');
    expect(tags).toHaveLength(cells.length);
  });

  it('has correct tab index', () => {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup
          aria-label="tag group">
          <Item aria-label="Tag 1">Tag 1</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
  });

  it.each`
    Name                                                | props                                         | orders
    ${'(left/right arrows, ltr + horizontal) TagGroup'} | ${{locale: 'de-DE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowRight, index: 1}, {action: pressArrowLeft, index: 0}, {action: pressArrowLeft, index: 2}]}
    ${'(left/right arrows, rtl + horizontal) TagGroup'} | ${{locale: 'ar-AE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowLeft, index: 1}, {action: pressArrowRight, index: 0}, {action: pressArrowRight, index: 2}]}
    ${'(up/down arrows, ltr + horizontal) TagGroup'}    | ${{locale: 'de-DE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowDown, index: 1}, {action: pressArrowUp, index: 0}, {action: pressArrowUp, index: 2}]}
    ${'(up/down arrows, rtl + horizontal) TagGroup'}    | ${{locale: 'ar-AE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowUp, index: 2}, {action: pressArrowDown, index: 0}, {action: pressArrowDown, index: 1}]}
  `('$Name shifts button focus in the correct direction on key press', function ({Name, props, orders}) {
    let {getAllByRole} = render(
      <Provider theme={theme} locale={props.locale}>
        <TagGroup aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    orders.forEach(({action, index}, i) => {
      action(document.activeElement);
      expect(document.activeElement).toBe(tags[index]);
    });
  });

  it('TagGroup allows aria-label', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    expect(tagGroup).toHaveAttribute('aria-label', 'tag group');
  });

  it('TagGroup allows aria-labelledby', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-labelledby="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    expect(tagGroup).toHaveAttribute('aria-labelledby', 'tag group');
  });

  it('TagGroup allows aria-label on Item', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    let tagRow = tagGroup.children[0];
    let tag = tagRow.children[0];
    expect(tag).toHaveAttribute('aria-label', 'Tag 1');
  });

  it('should remember last focused item', function () {
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme} locale="en-US">
        <Button variant="primary" aria-label="ButtonBefore" />
        <TagGroup aria-label="tag group" disabledKeys={['foo', 'bar']}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
        </TagGroup>
        <Button variant="primary" aria-label="ButtonAfter" />
      </Provider>
    );

    let buttonBefore = getByLabelText('ButtonBefore');
    let buttonAfter = getByLabelText('ButtonAfter');
    let tags = getAllByRole('row');
    act(() => {buttonBefore.focus();});

    userEvent.tab();
    expect(document.activeElement).toBe(tags[0]);

    pressArrowRight(tags[0]);
    expect(document.activeElement).toBe(tags[1]);

    userEvent.tab();
    expect(document.activeElement).toBe(buttonAfter);

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tags[1]);
  });

  it('should be focusable from Tab', async function () {
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme} locale="en-US">
        <Button variant="primary" aria-label="ButtonBefore" />
        <TagGroup aria-label="tag group" disabledKeys={['foo', 'bar']}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
        </TagGroup>
        <Button variant="primary" aria-label="ButtonAfter" />
      </Provider>
    );

    let buttonBefore = getByLabelText('ButtonBefore');
    let buttonAfter = getByLabelText('ButtonAfter');
    let tags = getAllByRole('row');
    act(() => {buttonBefore.focus();});
    expect(buttonBefore).toHaveFocus();
    userEvent.tab();
    expect(tags[0]).toHaveFocus();
    userEvent.tab();
    expect(buttonAfter).toHaveFocus();
  });

  it('should be focusable from Shift + Tab', function () {
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme} locale="en-US">
        <Button variant="primary" aria-label="ButtonBefore" />
        <TagGroup aria-label="tag group" disabledKeys={['foo', 'bar']}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
        </TagGroup>
        <Button variant="primary" aria-label="ButtonAfter" autoFocus />
      </Provider>
    );

    let buttonBefore = getByLabelText('ButtonBefore');
    let buttonAfter = getByLabelText('ButtonAfter');
    let tags = getAllByRole('row');
    act(() => {buttonAfter.focus();});
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tags[1]);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonBefore);
    expect(buttonBefore).toHaveFocus();
  });

  it('TagGroup should pass className, role and tabIndex', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="en-US">
        <TagGroup aria-label="tag group">
          <Item UNSAFE_className="test-class" key="1" aria-label="Tag 1">Tag 1</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    let tag = tagGroup.children[0];
    expect(tag).not.toHaveAttribute('icon');
    expect(tag).not.toHaveAttribute('unsafe_classname');
    expect(tag).toHaveAttribute('class', expect.stringContaining('test-class'));
    expect(tag).toHaveAttribute('class', expect.stringContaining('spectrum-Tag'));
    expect(tag).toHaveAttribute('role', 'row');
    expect(tag).toHaveAttribute('tabIndex', '0');
  });

  it('handles keyboard focus management properly', function () {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
          <Item key="4" aria-label="Tag 4">Tag 4</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    expect(tags.length).toBe(4);
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
    expect(tags[1]).toHaveAttribute('tabIndex', '0');
    expect(tags[2]).toHaveAttribute('tabIndex', '0');
    expect(tags[3]).toHaveAttribute('tabIndex', '0');

    userEvent.tab();
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
    expect(tags[1]).toHaveAttribute('tabIndex', '-1');
    expect(tags[2]).toHaveAttribute('tabIndex', '-1');
    expect(tags[3]).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(tags[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tags[1]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(tags[0]);

    fireEvent.keyDown(document.activeElement, {key: 'End'});
    fireEvent.keyUp(document.activeElement, {key: 'End'});
    expect(document.activeElement).toBe(tags[3]);

    fireEvent.keyDown(document.activeElement, {key: 'Home'});
    fireEvent.keyUp(document.activeElement, {key: 'Home'});
    expect(document.activeElement).toBe(tags[0]);

    fireEvent.keyDown(document.activeElement, {key: 'PageDown'});
    fireEvent.keyUp(document.activeElement, {key: 'PageDown'});
    expect(document.activeElement).toBe(tags[3]);

    fireEvent.keyDown(document.activeElement, {key: 'PageUp'});
    fireEvent.keyUp(document.activeElement, {key: 'PageUp'});
    expect(document.activeElement).toBe(tags[0]);
  });

  it.each`
    Name                         | props
    ${'on `Delete` keypress'}    | ${{keyPress: 'Delete'}}
    ${'on `Backspace` keypress'} | ${{keyPress: 'Backspace'}}
  `('Remove tag $Name', function ({Name, props}) {
    let {getByText} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" onRemove={onRemoveSpy}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tag = getByText('Tag 1');
    fireEvent.keyDown(tag, {key: props.keyPress});
    fireEvent.keyUp(tag, {key: props.keyPress});
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
    expect(onRemoveSpy).toHaveBeenCalledWith(new Set(['1']));
  });

  it('Space does not trigger removal', function () {
    let {getByText} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" onRemove={onRemoveSpy}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tag = getByText('Tag 1');
    fireEvent.keyDown(tag, {key: ' '});
    fireEvent.keyUp(tag, {key: ' '});
    expect(onRemoveSpy).toHaveBeenCalledTimes(0);
  });

  it('should remove tag when remove button is clicked', function () {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" onRemove={onRemoveSpy}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    triggerPress(tags[0]);
    expect(onRemoveSpy).not.toHaveBeenCalled();

    let removeButton = within(tags[0]).getByRole('button');
    triggerPress(removeButton);
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
    expect(onRemoveSpy).toHaveBeenCalledWith(new Set(['1']));
  });

  it.each`
    Name                         | props
    ${'on `Delete` keypress'}    | ${{keyPress: 'Delete'}}
    ${'on `Backspace` keypress'} | ${{keyPress: 'Backspace'}}
  `('Can move focus after removing tag $Name', function ({Name, props}) {

    function TagGroupWithDelete(props) {
      let [items, setItems] = React.useState([
        {id: 1, label: 'Cool Tag 1'},
        {id: 2, label: 'Another cool tag'},
        {id: 3, label: 'This tag'},
        {id: 4, label: 'What tag?'},
        {id: 5, label: 'This tag is cool too'},
        {id: 6, label: 'Shy tag'}
      ]);

      let removeItem = (key) => {
        setItems(prevItems => prevItems.filter((item) => key !== item.id));
      };

      return (
        <Provider theme={theme}>
          <TagGroup items={items} aria-label="tag group" onRemove={chain(removeItem, onRemoveSpy)} {...props}>
            {item => <Item>{item.label}</Item>}
          </TagGroup>
        </Provider>
      );
    }

    let {getAllByRole} = render(
      <TagGroupWithDelete {...props} />
    );

    let tags = getAllByRole('row');
    userEvent.tab();
    expect(document.activeElement).toBe(tags[0]);
    fireEvent.keyDown(document.activeElement, {key: props.keyPress});
    fireEvent.keyUp(document.activeElement, {key: props.keyPress});
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
    expect(onRemoveSpy).toHaveBeenCalledWith(new Set([1]));
    tags = getAllByRole('row');
    expect(document.activeElement).toBe(tags[0]);
    pressArrowRight(tags[0]);
    expect(document.activeElement).toBe(tags[1]);
  });

  it.each`
    Name                         | props
    ${'on `Delete` keypress'}    | ${{keyPress: 'Delete'}}
    ${'on `Backspace` keypress'} | ${{keyPress: 'Backspace'}}
  `('Should focus container after last tag is removed $Name', function ({Name, props}) {

    function TagGroupWithDelete(props) {
      let [items, setItems] = React.useState([
        {id: 1, label: 'Cool Tag 1'},
        {id: 2, label: 'Another cool tag'}
      ]);

      let onRemove = (keys) => {
        setItems(prevItems => prevItems.filter((item) => !keys.has(item.id)));
      };

      return (
        <Provider theme={theme}>
          <TagGroup items={items} aria-label="tag group" onRemove={chain(onRemove, onRemoveSpy)} {...props}>
            {item => <Item>{item.label}</Item>}
          </TagGroup>
        </Provider>
      );
    }

    let {getAllByRole, getByRole, queryAllByRole} = render(
      <TagGroupWithDelete {...props} />
    );

    let tags = getAllByRole('row');
    let container = getByRole('grid');
    userEvent.tab();
    expect(document.activeElement).toBe(tags[0]);
    fireEvent.keyDown(document.activeElement, {key: props.keyPress});
    fireEvent.keyUp(document.activeElement, {key: props.keyPress});
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
    expect(onRemoveSpy).toHaveBeenCalledWith(new Set([1]));

    tags = getAllByRole('row');
    expect(document.activeElement).toBe(tags[0]);
    fireEvent.keyDown(document.activeElement, {key: props.keyPress});
    fireEvent.keyUp(document.activeElement, {key: props.keyPress});
    expect(onRemoveSpy).toHaveBeenCalledTimes(2);
    expect(onRemoveSpy).toHaveBeenCalledWith(new Set([2]));

    act(() => jest.runAllTimers());

    tags = queryAllByRole('row');
    expect(tags.length).toBe(0);
    expect(document.activeElement).toBe(container);
  });

  it('maxRows should limit the number of tags shown', function () {
    let offsetWidth = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementationOnce(() => ({x: 200, y: 300, width: 75, height: 32, top: 300, right: 275, bottom: 335, left: 200}))
      .mockImplementationOnce(() => ({x: 275, y: 300, width: 110, height: 32, top: 300, right: 385, bottom: 335, left: 275}))
      .mockImplementationOnce(() => ({x: 200, y: 335, width: 65, height: 32, top: 335, right: 265, bottom: 370, left: 200}))
      .mockImplementationOnce(() => ({x: 265, y: 335, width: 75, height: 32, top: 335, right: 345, bottom: 370, left: 265}))
      .mockImplementationOnce(() => ({x: 200, y: 370, width: 120, height: 32, top: 370, right: 320, bottom: 400, left: 200}))
      .mockImplementationOnce(() => ({x: 200, y: 400, width: 95, height: 32, top: 400, right: 290, bottom: 435, left: 200}))
      .mockImplementationOnce(() => ({x: 200, y: 300, width: 200, height: 128, top: 300, right: 400, bottom: 435, left: 200}))
      .mockImplementationOnce(() => ({x: 265, y: 335, width: 75, height: 32, top: 335, right: 345, bottom: 370, left: 265}));

    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <TagGroup maxRows={2} aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
          <Item key="4" aria-label="Tag 4">Tag 4</Item>
          <Item key="5" aria-label="Tag 5">Tag 5</Item>
          <Item key="6" aria-label="Tag 6">Tag 6</Item>
          <Item key="7" aria-label="Tag 7">Tag 7</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('gridcell');
    expect(tags.length).toBe(3);

    let button = getByRole('button');
    expect(button).toHaveTextContent('Show all (7)');

    userEvent.click(button);
    tags = getAllByRole('gridcell');
    expect(tags.length).toBe(7);
    expect(button).toHaveTextContent('Show less');

    userEvent.click(button);
    tags = getAllByRole('gridcell');
    expect(tags.length).toBe(3);
    expect(button).toHaveTextContent('Show all (7)');

    offsetWidth.mockReset();
  });

  it('maxRows should not show button if there is enough room to show all tags', function () {
    let offsetWidth = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementationOnce(() => ({width: 44, y: 411}))
      .mockImplementationOnce(() => ({width: 46, y: 411}))
      .mockImplementationOnce(() => ({width: 80}))
      .mockImplementationOnce(() => ({right: 432}))
      .mockImplementationOnce(() => ({right: 336}))
      .mockImplementationOnce(() => ({width: 44, y: 411}))
      .mockImplementationOnce(() => ({width: 46, y: 411}))
      .mockImplementationOnce(() => ({width: 80}))
      .mockImplementationOnce(() => ({right: 432}))
      .mockImplementationOnce(() => ({right: 336}));
    let {getAllByRole, queryAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup maxRows={2} aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('gridcell');
    expect(tags.length).toBe(2);

    let buttons = queryAllByRole('button');
    expect(buttons.length).toBe(0);

    offsetWidth.mockReset();
  });

  it('can keyboard navigate to a custom action', function () {
    let target = [HTMLDivElement.prototype, 'getBoundingClientRect'];
    let mockCalls = [
      function () {
        return {
          left: 0,
          right: 0,
          width: 0,
          y: 0
        };
      }
    ];
    mockImplementation(target, mockCalls, true);
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <TagGroup
          aria-label="tag group"
          actionLabel="Clear"
          onAction={onClearSpy}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
          <Item key="4" aria-label="Tag 4">Tag 4</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    let action = getByRole('button');
    expect(tags.length).toBe(4);
    expect(action).toHaveTextContent('Clear');

    userEvent.tab();
    expect(document.activeElement).toBe(tags[0]);

    userEvent.tab();
    expect(document.activeElement).toBe(action);

    fireEvent.keyDown(document.activeElement, {key: 'Enter'});
    fireEvent.keyUp(document.activeElement, {key: 'Enter'});
    expect(onClearSpy).toHaveBeenCalledTimes(1);
    expect(onClearSpy).toHaveBeenCalledWith();

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tags[0]);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(tags[1]);

    userEvent.tab();
    expect(document.activeElement).toBe(action);

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tags[1]);
  });

  it('can keyboard navigate to show all button and custom action', function () {
    let offsetWidth = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementationOnce(() => ({x: 200, y: 300, width: 75, height: 32, top: 300, right: 275, bottom: 335, left: 200}))
      .mockImplementationOnce(() => ({x: 275, y: 300, width: 110, height: 32, top: 300, right: 385, bottom: 335, left: 275}))
      .mockImplementationOnce(() => ({x: 200, y: 335, width: 65, height: 32, top: 335, right: 265, bottom: 370, left: 200}))
      .mockImplementationOnce(() => ({x: 265, y: 335, width: 75, height: 32, top: 335, right: 345, bottom: 370, left: 265}))
      .mockImplementationOnce(() => ({x: 200, y: 370, width: 120, height: 32, top: 370, right: 320, bottom: 400, left: 200}))
      .mockImplementationOnce(() => ({x: 200, y: 400, width: 95, height: 32, top: 400, right: 290, bottom: 435, left: 200}))
      .mockImplementationOnce(() => ({x: 200, y: 300, width: 200, height: 128, top: 300, right: 400, bottom: 435, left: 200}))
      .mockImplementationOnce(() => ({x: 265, y: 335, width: 75, height: 32, top: 335, right: 345, bottom: 370, left: 265}))
      .mockImplementationOnce(() => ({x: 200, y: 300, width: 75, height: 32, top: 300, right: 275, bottom: 335, left: 200}));
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup
          maxRows={2}
          aria-label="tag group"
          actionLabel="Clear"
          onAction={onClearSpy}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
          <Item key="4" aria-label="Tag 4">Tag 4</Item>
          <Item key="5" aria-label="Tag 5">Tag 5</Item>
          <Item key="6" aria-label="Tag 6">Tag 6</Item>
          <Item key="7" aria-label="Tag 7">Tag 7</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('row');
    let buttons = getAllByRole('button');
    expect(tags.length).toBe(1);
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent('Show all (7)');
    expect(buttons[1]).toHaveTextContent('Clear');

    userEvent.tab();
    expect(document.activeElement).toBe(tags[0]);

    userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);

    userEvent.tab();
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(document.activeElement, {key: 'Enter'});
    fireEvent.keyUp(document.activeElement, {key: 'Enter'});
    expect(onClearSpy).toHaveBeenCalledTimes(1);
    expect(onClearSpy).toHaveBeenCalledWith();

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttons[0]);

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tags[0]);

    // Ensure onAction isn't triggered when clicking a tag.
    fireEvent.mouseDown(document.activeElement, {key: 'Enter'});
    fireEvent.mouseUp(document.activeElement, {key: 'Enter'});
    expect(onClearSpy).toHaveBeenCalledTimes(1);
    expect(onClearSpy).toHaveBeenCalledWith();

    offsetWidth.mockReset();
  });

  it('action group is labelled correctly', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TagGroup
          aria-label="tag group"
          actionLabel="Clear"
          onAction={onClearSpy}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
          <Item key="4" aria-label="Tag 4">Tag 4</Item>
        </TagGroup>
      </Provider>
    );

    let actionGroup = getByRole('group');
    let tagGroup = getByRole('grid');
    expect(actionGroup).toHaveAttribute('aria-label', 'Actions');
    expect(actionGroup).toHaveAttribute('aria-labelledby', `${tagGroup.id} ${actionGroup.id}`);
  });


  it('should render empty state', async function () {
    let {getByText} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group">
          {[]}
        </TagGroup>
      </Provider>
    );
    await act(() => Promise.resolve()); // wait for MutationObserver in useHasTabbableChild or we get act warnings
    expect(getByText('None')).toBeTruthy();
  });

  it('should allow you to tab into TagGroup if empty with link', async function () {
    let renderEmptyState = () => (
      <span>No tags. <Link><a href="//react-spectrum.com">Click here</a></Link> to add some.</span>
    );
    let {getByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" renderEmptyState={renderEmptyState}>
          {[]}
        </TagGroup>
      </Provider>
    );
    await act(() => Promise.resolve());
    let link = getByRole('link');
    userEvent.tab();
    expect(document.activeElement).toBe(link);
  });

  it('should support data attributes', function () {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" data-foo="bar">
          <Item key="1" data-foo="one">Tag 1</Item>
          <Item key="2" data-foo="two">Tag 2</Item>
        </TagGroup>
      </Provider>
    );

    let group = getAllByRole('grid')[0];
    expect(group).toHaveAttribute('data-foo', 'bar');

    let tags = getAllByRole('row');
    expect(tags[0]).toHaveAttribute('data-foo', 'one');
    expect(tags[1]).toHaveAttribute('data-foo', 'two');
  });
});
