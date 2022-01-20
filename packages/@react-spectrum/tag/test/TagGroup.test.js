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

import {act, fireEvent} from '@testing-library/react';
import {Button} from '@react-spectrum/button';
import {Item} from '@react-stately/collections';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import {TagGroup} from '../src';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

function pressKeyOnButton(key) {
  return (button) => {
    fireEvent.keyDown(button, {key});
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

  afterEach(() => {
    onRemoveSpy.mockClear();
  });

  it('provides context for Tag component', function () {
    let {container} = render(
      <TagGroup aria-label="tag group" isRemovable onRemove={onRemoveSpy}>
        <Item aria-label="Tag 1">Tag 1</Item>
        <Item aria-label="Tag 2">Tag 2</Item>
        <Item aria-label="Tag 3">Tag 3</Item>
      </TagGroup>
    );

    let tags = container.querySelectorAll('[role="gridcell"]');
    expect(tags.length).toBe(3);

    fireEvent.keyDown(tags[1], {key: 'Delete'});
    expect(onRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
   Name           | Component     | TagComponent | props
   ${'TagGroup'}  | ${TagGroup}   | ${Item}       | ${{isDisabled: true, isRemovable: true, onRemove: onRemoveSpy}}
  `('$Name can be disabled', ({Component, TagComponent, props}) => {
    let {getByText} = render(
      <Component
        {...props}
        aria-label="tag group">
        <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
      </Component>
    );
    let tag = getByText('Tag 1');
    fireEvent.keyDown(tag, {key: 'Delete', keyCode: 46});
    expect(onRemoveSpy).not.toHaveBeenCalledWith('Tag 1', expect.anything());
  });

  it.each`
   Name           | Component         | TagComponent | props
   ${'TagGroup'}  | ${TagGroup}       | ${Item}      |${{}}
  `('$Name has correct accessibility roles', ({Component, TagComponent, props}) => {
    let {container} = render(
      <Component
        {...props}
        aria-label="tag group">
        <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
      </Component>
    );

    let tagGroup = container.children[0];
    expect(tagGroup).toHaveAttribute('role', 'grid');
    let tag = tagGroup.children[0];
    expect(tag).toHaveAttribute('role', 'row');
    let tagContent = tag.children[0];
    expect(tagContent).toHaveAttribute('role', 'gridcell');
  });

  it.each`
   Name           | Component         | TagComponent | props
   ${'TagGroup'}  | ${TagGroup}       | ${Item}      |${{}}
  `('$Name has correct tab index when not disabled', ({Component, TagComponent, props}) => {
    let {getAllByRole} = render(
      <Component
        {...props}
        aria-label="tag group">
        <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
      </Component>
    );

    let tags = getAllByRole('gridcell');
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
  });

  it.each`
   Name           | Component         | TagComponent | props
   ${'TagGroup'}  | ${TagGroup}       | ${Item}      |${{isDisabled: true}}
  `('$Name has correct tab index when disabled', ({Component, TagComponent, props}) => {
    let {getAllByRole} = render(
      <Component
        {...props}
        aria-label="tag group">
        <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
      </Component>
    );

    let tags = getAllByRole('gridcell');
    expect(tags[0]).toHaveAttribute('tabIndex', '-1');
  });

  it('TagGroup allows individual tags to be disabled', function () {
    let {getByRole} = render(
      <TagGroup aria-label="tag group" disabledKeys={['3']}>
        <Item key="1" aria-label="Tag 1">Tag 1</Item>
        <Item key="2" aria-label="Tag 2">Tag 2</Item>
        <Item key="3" aria-label="Tag 3">Tag 3</Item>
      </TagGroup>
    );

    let tagGroup = getByRole('grid');
    let tagRowDisabled = tagGroup.children[2];
    let tagDisabled = tagRowDisabled.children[0];
    expect(tagDisabled).toHaveAttribute('role', 'gridcell');
    expect(tagDisabled).toHaveAttribute('tabIndex', '-1');
    let tagRowNotDisabled = tagGroup.children[0];
    let tagNotDisabled = tagRowNotDisabled.children[0];
    act(() => {tagNotDisabled.focus();});
    expect(tagNotDisabled).toHaveAttribute('role', 'gridcell');
    expect(tagNotDisabled).toHaveAttribute('tabIndex', '0');
  });

  it.each`
    Name                                                   | props                                         | orders
    ${'(left/right arrows, ltr + horizontal) TagGroup'} | ${{locale: 'de-DE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowRight, index: 1}, {action: pressArrowLeft, index: 0}, {action: pressArrowLeft, index: 0}]}
    ${'(left/right arrows, rtl + horizontal) TagGroup'} | ${{locale: 'ar-AE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowRight, index: 0}, {action: pressArrowLeft, index: 1}, {action: pressArrowLeft, index: 2}]}
    ${'(up/down arrows, ltr + horizontal) TagGroup'}    | ${{locale: 'de-DE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowDown, index: 1}, {action: pressArrowUp, index: 0}, {action: pressArrowUp, index: 0}]}
    ${'(up/down arrows, rtl + horizontal) TagGroup'}    | ${{locale: 'ar-AE'}}                          | ${[{action: () => {userEvent.tab();}, index: 0}, {action: pressArrowDown, index: 1}, {action: pressArrowUp, index: 0}, {action: pressArrowUp, index: 0}]}
  `('$Name shifts button focus in the correct direction on key press', function ({Name, props, orders}) {
    let tree = render(
      <Provider theme={theme} locale={props.locale}>
        <TagGroup aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
      </Provider>
    );

    let tags = tree.getAllByRole('gridcell');
    orders.forEach(({action, index}, i) => {
      action(document.activeElement);
      expect(document.activeElement).toBe(tags[index]);
    });
  });

  it('TagGroup allows aria-label', function () {
    let {getByRole} = render(
      <TagGroup aria-label="tag group" disabledKeys={['3']}>
        <Item key="1" aria-label="Tag 1">Tag 1</Item>
      </TagGroup>
    );

    let tagGroup = getByRole('grid');
    expect(tagGroup).toHaveAttribute('aria-label', 'tag group');
  });

  it('TagGroup allows aria-labelledby', function () {
    let {getByRole} = render(
      <TagGroup aria-labelledby="tag group" disabledKeys={['3']}>
        <Item key="1" aria-label="Tag 1">Tag 1</Item>
      </TagGroup>
    );

    let tagGroup = getByRole('grid');
    expect(tagGroup).toHaveAttribute('aria-labelledby', 'tag group');
  });

  it('TagGroup allows aria-label on Item', function () {
    let {getByRole} = render(
      <TagGroup aria-label="tag group">
        <Item key="1" aria-label="Tag 1">Tag 1</Item>
        <Item key="2" aria-label="Tag 2">Tag 2</Item>
        <Item key="3" aria-label="Tag 3">Tag 3</Item>
      </TagGroup>
    );

    let tagGroup = getByRole('grid');
    let tagRow = tagGroup.children[0];
    let tag = tagRow.children[0];
    expect(tag).toHaveAttribute('aria-label', 'Tag 1');
  });

  it('no infinite loop if all keys are disabled', function () {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <input type="text" id="foo" autoFocus />
        <TagGroup aria-label="tag group" disabledKeys={['1', '2', '3']}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
          <Item key="3" aria-label="Tag 3">Tag 3</Item>
        </TagGroup>
        <input type="text" id="bar" />
      </Provider>
    );

    let tags = getAllByRole('gridcell');
    tags.forEach((tag) => {
      expect(tag).toHaveAttribute('tabIndex', '-1');
    });
    let inputs = getAllByRole('textbox');
    expect(document.activeElement).toBe(inputs[0]);
    userEvent.tab();
    expect(document.activeElement).toBe(inputs[1]);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(inputs[0]);
  });

  it('not disabled if extraneous keys are provided', function () {
    let {getAllByRole, getByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group" disabledKeys={['foo', 'bar']}>
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    expect(tagGroup).not.toHaveAttribute('aria-disabled', 'true');
    let inputs = getAllByRole('gridcell');

    userEvent.tab();
    expect(document.activeElement).toBe(inputs[0]);
    pressArrowRight(inputs[0]);
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('should remember last focused item', function () {
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme} locale="de-DE">
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
    let inputs = getAllByRole('gridcell');
    act(() => {buttonBefore.focus();});

    userEvent.tab();
    expect(document.activeElement).toBe(inputs[0]);

    pressArrowRight(inputs[0]);
    expect(document.activeElement).toBe(inputs[1]);

    userEvent.tab();
    expect(document.activeElement).toBe(buttonAfter);

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('should be focusable from Tab', async function () {
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme} locale="de-DE">
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
    let inputs = getAllByRole('gridcell');
    act(() => {buttonBefore.focus();});
    expect(buttonBefore).toHaveFocus();
    userEvent.tab();
    expect(inputs[0]).toHaveFocus();
    userEvent.tab();
    expect(buttonAfter).toHaveFocus();
  });

  it('should be focusable from Shift + Tab', function () {
    let {getAllByRole, getByLabelText} = render(
      <Provider theme={theme} locale="de-DE">
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
    let inputs = getAllByRole('gridcell');
    act(() => {buttonAfter.focus();});
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(inputs[1]);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonBefore);
    expect(buttonBefore).toHaveFocus();
  });

  it('TagGroup should pass className, role and tabIndex', function () {
    let {getByRole} = render(
      <Provider theme={theme} locale="de-DE">
        <TagGroup aria-label="tag group">
          <Item UNSAFE_className="test-class" key="1" aria-label="Tag 1">Tag 1</Item>
        </TagGroup>
      </Provider>
    );

    let tagGroup = getByRole('grid');
    let tagRow = tagGroup.children[0];
    let tag = tagRow.children[0];
    expect(tag).not.toHaveAttribute('icon');
    expect(tag).not.toHaveAttribute('unsafe_classname');
    expect(tag).toHaveAttribute('class', expect.stringContaining('test-class'));
    expect(tag).toHaveAttribute('class', expect.stringContaining('-item'));
    expect(tag).toHaveAttribute('role', 'gridcell');
    expect(tag).toHaveAttribute('tabIndex', '0');
  });

  it('handles keyboard focus management properly', function () {
    let {getAllByRole} = render(
      <Provider theme={theme}>
        <TagGroup aria-label="tag group">
          <Item key="1" aria-label="Tag 1">Tag 1</Item>
          <Item key="2" aria-label="Tag 2">Tag 2</Item>
        </TagGroup>
      </Provider>
    );

    let tags = getAllByRole('gridcell');
    expect(tags.length).toBe(2);
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
    expect(tags[1]).toHaveAttribute('tabIndex', '0');

    act(() => tags[0].focus());
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
    expect(tags[1]).toHaveAttribute('tabIndex', '-1');

    pressArrowRight(tags[0]);
    expect(tags[0]).toHaveAttribute('tabIndex', '-1');
    expect(tags[1]).toHaveAttribute('tabIndex', '0');
  });


  // Commented out until spectrum can provide use case for these scenarios
  // it.each`
  //  Name           | Component     | TagComponent | props
  //  ${'TagGroup'}  | ${TagGroup}   | ${Item}       | ${{isReadOnly: true, isRemovable: true, onRemove: onRemoveSpy}}
  // `('$Name is read only', ({Component, TagComponent, props}) => {
  //   let {getByText} = render(
  //     <Component
  //       {...props}
  //       aria-label="tag group">
  //       <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
  //     </Component>
  //   );
  //   let tag = getByText('Tag 1');
  //   fireEvent.keyDown(tag, {key: 'Delete', keyCode: 46});
  //   expect(onRemoveSpy).not.toHaveBeenCalledWith('Tag 1', expect.anything());
  // });
  //
  // it.each`
  //  Name          | Component         | TagComponent     | props
  //  ${'Tag'}      | ${TagGroup}       | ${Item}          | ${{validationState: 'invalid'}}
  // `('$Name can be invalid', function ({Component, TagComponent, props}) {
  //   let {getByRole, debug} = render(
  //     <Component
  //       {...props}
  //       aria-label="tag group">
  //       <TagComponent aria-label="Tag 1">Tag 1</TagComponent>
  //     </Component>
  //   );
  //
  //   debug();
  //
  //   let tag = getByRole('row');
  //   expect(tag).toHaveAttribute('aria-invalid', 'true');
  // });
});

// need to add test for focus after onremove
