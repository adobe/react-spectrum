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
import {Group, GroupContext} from '..';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Group', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a group with default class', () => {
    let {getByRole} = render(<Group>Test</Group>);
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'react-aria-Group');
  });

  it('should render a group with custom class', () => {
    let {getByRole} = render(<Group className="test">Test</Group>);
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = render(<Group data-foo="bar">Test</Group>);
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-foo', 'bar');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <GroupContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Group slot="test">Test</Group>
      </GroupContext.Provider>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByRole} = render(<Group
      className={({isHovered}) => isHovered ? 'hover' : ''}
      onHoverStart={hoverStartSpy}
      onHoverChange={hoverChangeSpy}
      onHoverEnd={hoverEndSpy}>Test</Group>);
    let group = getByRole('group');

    expect(group).not.toHaveAttribute('data-hovered');
    expect(group).not.toHaveClass('hover');

    await user.hover(group);
    expect(group).toHaveAttribute('data-hovered', 'true');
    expect(group).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(group);
    expect(group).not.toHaveAttribute('data-hovered');
    expect(group).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should support focus ring', async () => {
    let {getByRole} = render(<Group className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>
      <input type="text" />
    </Group>);
    let group = getByRole('group');
    let input = getByRole('textbox');

    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(input);
    expect(group).toHaveAttribute('data-focus-visible', 'true');
    expect(group).toHaveClass('focus');

    await user.tab();
    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');
  });

  it('should not show focus ring when typing in pointer modality', async () => {
    let {getByRole} = render(<Group className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>
      <input type="text" />
    </Group>);
    let group = getByRole('group');
    let input = getByRole('textbox');

    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');

    await user.click(input);
    await user.keyboard('a');
    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue('a');

    expect(group).not.toHaveAttribute('data-focus-visible');
    expect(group).not.toHaveClass('focus');
  });

  it('should support disabled state', () => {
    let {getByRole} = render(<Group isDisabled className={({isDisabled}) => isDisabled ? 'disabled' : ''}>Test</Group>);
    let group = getByRole('group');

    expect(group).toHaveAttribute('data-disabled', 'true');
    expect(group).toHaveClass('disabled');
  });

  it('should support render props', async () => {
    let {getByRole} = render(<Group>{({isHovered}) => isHovered ? 'Hovered' : 'Group'}</Group>);
    let group = getByRole('group');

    expect(group).toHaveTextContent('Group');

    await user.hover(group);
    expect(group).toHaveTextContent('Hovered');

    await user.unhover(group);
    expect(group).toHaveTextContent('Group');
  });
});
