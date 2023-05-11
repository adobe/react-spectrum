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

import {Button, Header, Item, Keyboard, Menu, MenuContext, MenuTrigger, Popover, Section, Separator, Text} from '../';
import {fireEvent, render} from '@react-spectrum/test-utils';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestMenu = ({menuProps, itemProps}) => (
  <Menu aria-label="Test" {...menuProps}>
    <Item {...itemProps} id="cat">Cat</Item>
    <Item {...itemProps} id="dog">Dog</Item>
    <Item {...itemProps} id="kangaroo">Kangaroo</Item>
  </Menu>
);

let renderMenu = (menuProps, itemProps) => render(<TestMenu {...{menuProps, itemProps}} />);

describe('Menu', () => {
  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderMenu();
    let menu = getByRole('menu');
    expect(menu).toHaveAttribute('class', 'react-aria-Menu');

    for (let menuitem of getAllByRole('menuitem')) {
      expect(menuitem).toHaveAttribute('class', 'react-aria-Item');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderMenu({className: 'menu'}, {className: 'item'});
    let menu = getByRole('menu');
    expect(menu).toHaveAttribute('class', 'menu');

    for (let menuitem of getAllByRole('menuitem')) {
      expect(menuitem).toHaveAttribute('class', 'item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderMenu({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let menu = getByRole('menu');
    expect(menu).toHaveAttribute('data-foo', 'bar');

    for (let menuitem of getAllByRole('menuitem')) {
      expect(menuitem).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support the slot prop', () => {
    let {getByRole} = render(
      <MenuContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestMenu menuProps={{slot: 'test', 'aria-label': undefined}} />
      </MenuContext.Provider>
    );

    let menu = getByRole('menu');
    expect(menu).toHaveAttribute('slot', 'test');
    expect(menu).toHaveAttribute('aria-label', 'test');
  });

  it('should support slots', () => {
    let {getByRole} = render(
      <Menu aria-label="Actions">
        <Item textValue="Copy">
          <Text slot="label">Copy</Text>
          <Text slot="description">Copy the selected text</Text>
          <Keyboard>⌘C</Keyboard>
        </Item>
      </Menu>
    );

    let menuitem = getByRole('menuitem');
    expect(menuitem).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(menuitem.getAttribute('aria-labelledby'))).toHaveTextContent('Copy');
    expect(menuitem).toHaveAttribute('aria-describedby');
    expect(menuitem.getAttribute('aria-describedby').split(' ').map(o => document.getElementById(o).textContent).join(' ')).toBe('Copy the selected text ⌘C');
  });

  it('should support separators', () => {
    let {getByRole} = render(
      <Menu aria-label="Actions">
        <Item>Foo</Item>
        <Separator />
        <Item>Bar</Item>
      </Menu>
    );

    let separator = getByRole('separator');
    expect(separator).toHaveClass('react-aria-Separator');
  });

  it('should support separators with custom class names', () => {
    let {getByRole} = render(
      <Menu aria-label="Actions">
        <Item>Foo</Item>
        <Separator className="my-separator" />
        <Item>Bar</Item>
      </Menu>
    );

    let separator = getByRole('separator');
    expect(separator).toHaveClass('my-separator');
  });

  it('should support sections', () => {
    let {getAllByRole} = render(
      <Menu aria-label="Sandwich contents" selectionMode="multiple">
        <Section>
          <Header>Veggies</Header>
          <Item id="lettuce">Lettuce</Item>
          <Item id="tomato">Tomato</Item>
          <Item id="onion">Onion</Item>
        </Section>
        <Section>
          <Header>Protein</Header>
          <Item id="ham">Ham</Item>
          <Item id="tuna">Tuna</Item>
          <Item id="tofu">Tofu</Item>
        </Section>
      </Menu>
    );

    let groups = getAllByRole('group');
    expect(groups).toHaveLength(2);

    expect(groups[0]).toHaveClass('react-aria-Section');
    expect(groups[1]).toHaveClass('react-aria-Section');

    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Veggies');
  });

  it('should support dynamic collections', () => {
    let items = [
      {id: 'cat', name: 'Cat'},
      {id: 'dog', name: 'Dog'}
    ];
    
    let {getAllByRole} = render(
      <Menu aria-label="Test" items={items}>
        {(item) => <Item id={item.id}>{item.name}</Item>}
      </Menu>
    );

    expect(getAllByRole('menuitem').map((it) => it.textContent)).toEqual(['Cat', 'Dog']);
  });

  it('should support focus ring', () => {
    let {getAllByRole} = renderMenu({}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let menuitem = getAllByRole('menuitem')[0];

    expect(menuitem).not.toHaveAttribute('data-focus-visible');
    expect(menuitem).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(menuitem);
    expect(menuitem).toHaveAttribute('data-focus-visible', 'true');
    expect(menuitem).toHaveClass('focus');

    fireEvent.keyDown(menuitem, {key: 'ArrowDown'});
    fireEvent.keyUp(menuitem, {key: 'ArrowDown'});
    expect(menuitem).not.toHaveAttribute('data-focus-visible');
    expect(menuitem).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderMenu({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let menuitem = getAllByRole('menuitem')[0];

    expect(menuitem).not.toHaveAttribute('data-pressed');
    expect(menuitem).not.toHaveClass('pressed');

    fireEvent.mouseDown(menuitem);
    expect(menuitem).toHaveAttribute('data-pressed', 'true');
    expect(menuitem).toHaveClass('pressed');

    fireEvent.mouseUp(menuitem);
    expect(menuitem).not.toHaveAttribute('data-pressed');
    expect(menuitem).not.toHaveClass('pressed');
  });

  it('should support selection state', () => {
    let {getAllByRole} = renderMenu({selectionMode: 'multiple'}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let menuitem = getAllByRole('menuitemcheckbox')[0];

    expect(menuitem).not.toHaveAttribute('aria-checked', 'true');
    expect(menuitem).not.toHaveClass('selected');

    userEvent.click(menuitem);
    expect(menuitem).toHaveAttribute('aria-checked', 'true');
    expect(menuitem).toHaveClass('selected');

    userEvent.click(menuitem);
    expect(menuitem).not.toHaveAttribute('aria-checked', 'true');
    expect(menuitem).not.toHaveClass('selected');
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderMenu({disabledKeys: ['cat']}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let menuitem = getAllByRole('menuitem')[0];

    expect(menuitem).toHaveAttribute('aria-disabled', 'true');
    expect(menuitem).toHaveClass('disabled');
  });

  it('should support menu trigger', () => {
    let onAction = jest.fn();
    let {getByRole, getAllByRole} = render(
      <MenuTrigger>
        <Button aria-label="Menu">☰</Button>
        <Popover>
          <Menu onAction={onAction}>
            <Item id="open">Open</Item>
            <Item id="rename">Rename…</Item>
            <Item id="duplicate">Duplicate</Item>
            <Item id="share">Share…</Item>
            <Item id="delete">Delete…</Item>
          </Menu>
        </Popover>
      </MenuTrigger>
    );

    let button = getByRole('button');
    expect(button).not.toHaveAttribute('data-pressed');

    userEvent.click(button);
    expect(button).toHaveAttribute('data-pressed');

    let menu = getByRole('menu');
    expect(getAllByRole('menuitem')).toHaveLength(5);

    let popover = menu.closest('.react-aria-Popover');
    expect(popover).toBeInTheDocument();

    userEvent.click(getAllByRole('menuitem')[1]);
    expect(onAction).toHaveBeenLastCalledWith('rename');
  });
});
