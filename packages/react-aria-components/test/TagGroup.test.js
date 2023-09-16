/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Label, Tag, TagGroup, TagList, Text} from '../';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestTagGroup = ({tagGroupProps, tagListProps, itemProps}) => (
  <TagGroup data-testid="group" {...tagGroupProps}>
    <Label>Test</Label>
    <TagList {...tagListProps}>
      <RemovableTag {...itemProps} id="cat">Cat</RemovableTag>
      <RemovableTag {...itemProps} id="dog">Dog</RemovableTag>
      <RemovableTag {...itemProps} id="kangaroo">Kangaroo</RemovableTag>
    </TagList>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
  </TagGroup>
);

let RemovableTag = (props) => (
  <Tag textValue={props.children} {...props}>
    {({allowsRemoving}) => (
      <>
        {props.children}
        {allowsRemoving && <Button slot="remove">x</Button>}
      </>
    )}
  </Tag>
);

let renderTagGroup = (tagGroupProps, tagListProps, itemProps) => render(<TestTagGroup {...{tagGroupProps, tagListProps, itemProps}} />);

describe('TagGroup', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('should render with default classes', () => {
    let {getByRole, getAllByRole, getByTestId} = renderTagGroup();
    let group = getByTestId('group');
    let grid = getByRole('grid');
    expect(group).toHaveAttribute('class', 'react-aria-TagGroup');
    expect(grid).toHaveAttribute('class', 'react-aria-TagList');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'react-aria-Tag');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole, getByTestId} = renderTagGroup({className: 'taggroup'}, {className: 'taglist'}, {className: 'item'});
    let group = getByTestId('group');
    let grid = getByRole('grid');
    expect(group).toHaveAttribute('class', 'taggroup');
    expect(grid).toHaveAttribute('class', 'taglist');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole, getByTestId} = renderTagGroup({'data-foo': 'bar'}, {'data-baz': 'baz'}, {'data-bar': 'foo'});
    let group = getByTestId('group');
    let grid = getByRole('grid');
    expect(group).toHaveAttribute('data-foo', 'bar');
    expect(grid).toHaveAttribute('data-baz', 'baz');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support refs', () => {
    let tagGroupRef = React.createRef();
    let tagListRef = React.createRef();
    let itemRef = React.createRef();
    render(
      <TagGroup aria-label="Test" ref={tagGroupRef}>
        <TagList ref={tagListRef}>
          <Tag ref={itemRef}>Cat</Tag>
        </TagList>
      </TagGroup>
    );
    expect(tagGroupRef.current).toBeInstanceOf(HTMLElement);
    expect(tagListRef.current).toBeInstanceOf(HTMLElement);
    expect(itemRef.current).toBeInstanceOf(HTMLElement);
  });

  it('provides slots for description and error message', () => {
    let {getByRole} = renderTagGroup();

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(grid.getAttribute('aria-labelledby'));
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Test');

    expect(grid).toHaveAttribute('aria-describedby');
    expect(grid.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');
  });

  it('should support hover', async () => {
    let {getAllByRole} = renderTagGroup({selectionMode: 'multiple'}, {}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    await user.hover(row);
    expect(row).toHaveAttribute('data-hovered', 'true');
    expect(row).toHaveClass('hover');

    await user.unhover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should not show hover state when item is not interactive', async () => {
    let {getAllByRole} = renderTagGroup({}, {}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    await user.hover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should support focus ring', async () => {
    let {getAllByRole} = renderTagGroup({selectionMode: 'multiple'}, {}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(row);
    expect(row).toHaveAttribute('data-focus-visible', 'true');
    expect(row).toHaveClass('focus');

    fireEvent.keyDown(row, {key: 'ArrowDown'});
    fireEvent.keyUp(row, {key: 'ArrowDown'});
    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderTagGroup({selectionMode: 'multiple'}, {}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).toHaveAttribute('data-pressed', 'true');
    expect(row).toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should not show press state when not interactive', () => {
    let {getAllByRole} = renderTagGroup({}, {}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseDown(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');

    fireEvent.mouseUp(row);
    expect(row).not.toHaveAttribute('data-pressed');
    expect(row).not.toHaveClass('pressed');
  });

  it('should support selection state', async () => {
    let {getAllByRole} = renderTagGroup({selectionMode: 'multiple'}, {}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');

    await user.click(row);
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).toHaveClass('selected');

    await user.click(row);
    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderTagGroup({selectionMode: 'multiple', disabledKeys: ['cat']}, {}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let row = getAllByRole('row')[0];

    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('disabled');
  });

  it('should support removing items', async () => {
    let onRemove = jest.fn();
    let {getAllByRole} = renderTagGroup({onRemove}, {}, {className: ({allowsRemoving}) => allowsRemoving ? 'removable' : ''});
    let row = getAllByRole('row')[0];

    expect(row).toHaveAttribute('data-allows-removing', 'true');
    expect(row).toHaveClass('removable');

    let button = getAllByRole('button')[0];
    expect(button).toHaveAttribute('aria-label', 'Remove');
    await user.click(button);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should support empty state', () => {
    let {getByTestId} = render(
      <TagGroup data-testid="group">
        <Label>Test</Label>
        <TagList data-testid="list" renderEmptyState={() => 'No results'}>
          {[]}
        </TagList>
      </TagGroup>
    );
    let grid = getByTestId('list');
    expect(grid).toHaveAttribute('data-empty', 'true');
    expect(grid).toHaveTextContent('No results');
  });

  describe('supports links', function () {
    describe.each(['mouse', 'keyboard'])('%s', (type) => {
      let trigger = async item => {
        if (type === 'mouse') {
          await user.click(item);
        } else {
          fireEvent.keyDown(item, {key: 'Enter'});
          fireEvent.keyUp(item, {key: 'Enter'});
        }
      };

      it.each(['none', 'single', 'multiple'])('with selectionMode = %s', async function (selectionMode) {
        let onSelectionChange = jest.fn();
        let tree = render(
          <TagGroup selectionMode={selectionMode} onSelectionChange={onSelectionChange}>
            <Label>Tags</Label>
            <TagList>
              <Tag href="https://google.com">One</Tag>
              <Tag href="https://adobe.com">Two</Tag>
              <Tag>Non link</Tag>
            </TagList>
          </TagGroup>
        );

        let items = tree.getAllByRole('row');
        expect(items).toHaveLength(3);
        expect(items[0].tagName).not.toBe('A');
        expect(items[0]).toHaveAttribute('data-href', 'https://google.com');
        expect(items[1].tagName).not.toBe('A');
        expect(items[1]).toHaveAttribute('data-href', 'https://adobe.com');
        expect(items[2]).not.toHaveAttribute('data-href');

        let onClick = jest.fn().mockImplementation(e => e.preventDefault());
        window.addEventListener('click', onClick);

        await trigger(items[1]);
        expect(onSelectionChange).not.toHaveBeenCalled();
        expect(onClick).toHaveBeenCalledTimes(1);

        if (selectionMode !== 'none') {
          await trigger(items[2]);
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
          expect(items[2]).toHaveAttribute('aria-selected', 'true');

          await trigger(items[1]);
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
          expect(onClick).toHaveBeenCalledTimes(2);

          document.removeEventListener('click', onClick);
        }
      });
    });
  });
});
