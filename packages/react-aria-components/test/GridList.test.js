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

import {Checkbox, GridList, GridListContext, Item} from '../';
import {fireEvent, render, within} from '@react-spectrum/test-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestGridList = ({listBoxProps, itemProps}) => (
  <GridList aria-label="Test" {...listBoxProps}>
    <Item {...itemProps} id="cat"><Checkbox slot="selection" /> Cat</Item>
    <Item {...itemProps} id="dog"><Checkbox slot="selection" /> Dog</Item>
    <Item {...itemProps} id="kangaroo"><Checkbox slot="selection" /> Kangaroo</Item>
  </GridList>
);

let renderGridList = (listBoxProps, itemProps) => render(<TestGridList {...{listBoxProps, itemProps}} />);

describe('GridList', () => {
  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderGridList();
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'react-aria-GridList');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'react-aria-Item');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderGridList({className: 'gridlist'}, {className: 'item'});
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('class', 'gridlist');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('class', 'item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderGridList({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('data-foo', 'bar');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <GridListContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestGridList listBoxProps={{slot: 'test', 'aria-label': undefined}} />
      </GridListContext.Provider>
    );

    let grid = getByRole('grid');
    expect(grid).toHaveAttribute('slot', 'test');
    expect(grid).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    userEvent.hover(row);
    expect(row).toHaveAttribute('data-hovered', 'true');
    expect(row).toHaveClass('hover');

    userEvent.unhover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should not show hover state when item is not interactive', () => {
    let {getAllByRole} = renderGridList({}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');

    userEvent.hover(row);
    expect(row).not.toHaveAttribute('data-hovered');
    expect(row).not.toHaveClass('hover');
  });

  it('should support focus ring', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(row);
    expect(row).toHaveAttribute('data-focus-visible', 'true');
    expect(row).toHaveClass('focus');

    userEvent.tab();
    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
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
    let {getAllByRole} = renderGridList({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
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

  it('should support selection state', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple'}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let row = getAllByRole('row')[0];

    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).not.toBeChecked();

    userEvent.click(row);
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).toBeChecked();

    userEvent.click(row);
    expect(row).not.toHaveAttribute('aria-selected', 'true');
    expect(row).not.toHaveClass('selected');
    expect(within(row).getByRole('checkbox')).not.toBeChecked();
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderGridList({selectionMode: 'multiple', disabledKeys: ['cat']}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let row = getAllByRole('row')[0];

    expect(row).toHaveAttribute('aria-disabled', 'true');
    expect(row).toHaveClass('disabled');

    expect(within(row).getByRole('checkbox')).toBeDisabled();
  });
});
