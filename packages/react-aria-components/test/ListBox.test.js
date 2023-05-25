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

import {act, fireEvent, render, within} from '@react-spectrum/test-utils';
import {Header, Item, ListBox, ListBoxContext, Section, Text, useDragAndDrop} from '../';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

let TestListBox = ({listBoxProps, itemProps}) => (
  <ListBox aria-label="Test" {...listBoxProps}>
    <Item {...itemProps} id="cat">Cat</Item>
    <Item {...itemProps} id="dog">Dog</Item>
    <Item {...itemProps} id="kangaroo">Kangaroo</Item>
  </ListBox>
);

let DraggableListBox = (props) => {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
    ...props
  });

  return (
    <ListBox aria-label="Test" dragAndDropHooks={dragAndDropHooks}>
      <Item id="cat">Cat</Item>
      <Item id="dog">Dog</Item>
      <Item id="kangaroo">Kangaroo</Item>
    </ListBox>
  );
};

let renderListbox = (listBoxProps, itemProps) => render(<TestListBox {...{listBoxProps, itemProps}} />);

describe('ListBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderListbox();
    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');

    for (let option of getAllByRole('option')) {
      expect(option).toHaveAttribute('class', 'react-aria-Item');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderListbox({className: 'listbox'}, {className: 'item'});
    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'listbox');

    for (let option of getAllByRole('option')) {
      expect(option).toHaveAttribute('class', 'item');
    }
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderListbox({'data-foo': 'bar'}, {'data-bar': 'foo'});
    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('data-foo', 'bar');

    for (let option of getAllByRole('option')) {
      expect(option).toHaveAttribute('data-bar', 'foo');
    }
  });

  it('should support the slot prop', () => {
    let {getByRole} = render(
      <ListBoxContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestListBox listBoxProps={{slot: 'test', 'aria-label': undefined}} />
      </ListBoxContext.Provider>
    );

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('slot', 'test');
    expect(listbox).toHaveAttribute('aria-label', 'test');
  });

  it('should support refs', () => {
    let listBoxRef = React.createRef();
    let sectionRef = React.createRef();
    let itemRef = React.createRef();
    render(
      <ListBox aria-label="Test" ref={listBoxRef}>
        <Section ref={sectionRef}>
          <Item ref={itemRef}>Cat</Item>
        </Section>
      </ListBox>
    );
    expect(listBoxRef.current).toBeInstanceOf(HTMLElement);
    expect(sectionRef.current).toBeInstanceOf(HTMLElement);
    expect(itemRef.current).toBeInstanceOf(HTMLElement);
  });

  it('should support slots', () => {
    let {getByRole} = render(
      <ListBox aria-label="Sandwich contents" selectionMode="multiple">
        <Item textValue="Read">
          <Text slot="label">Read</Text>
          <Text slot="description">Read only</Text>
        </Item>
      </ListBox>
    );

    let option = getByRole('option');
    expect(option).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(option.getAttribute('aria-labelledby'))).toHaveTextContent('Read');
    expect(option).toHaveAttribute('aria-describedby');
    expect(document.getElementById(option.getAttribute('aria-describedby'))).toHaveTextContent('Read only');
  });

  it('should support sections', () => {
    let {getAllByRole} = render(
      <ListBox aria-label="Sandwich contents" selectionMode="multiple">
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
      </ListBox>
    );

    let groups = getAllByRole('group');
    expect(groups).toHaveLength(2);

    expect(groups[0]).toHaveClass('react-aria-Section');
    expect(groups[1]).toHaveClass('react-aria-Section');

    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Veggies');
  });

  it('should support dynamic collections', () => {
    let options = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'}
    ];

    let {getAllByRole, rerender} = render(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Dog']);

    options = [
      options[0],
      options[1],
      {id: 3, name: 'Mouse'}
    ];
    rerender(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Dog', 'Mouse']);

    options = [
      options[0],
      {id: 4, name: 'Kangaroo'},
      options[1],
      options[2]
    ];
    rerender(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Kangaroo', 'Dog', 'Mouse']);

    options = [
      options[0],
      options[1],
      {id: 2, name: 'Doggy'},
      options[3]
    ];
    rerender(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Kangaroo', 'Doggy', 'Mouse']);

    options = [
      options[0],
      options[1],
      options[3],
      options[2]
    ];
    rerender(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Kangaroo', 'Mouse', 'Doggy']);

    options = [
      options[0],
      options[1],
      options[2]
    ];
    rerender(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Kangaroo', 'Mouse']);
  });

  it('should update collection when descendants update', () => {
    let setShowTwo;
    let setItemText;
    function Child() {
      let [showTwo, _setShowTwo] = useState(false);
      setShowTwo = _setShowTwo;
      let [itemText, _setItemText] = useState('One');
      setItemText = _setItemText;
      return (
        <>
          <Item id={1}>{itemText}</Item>
          {showTwo && <Item id={2}>Two</Item>}
        </>
      );
    }

    let {getAllByRole} = render(
      <ListBox aria-label="Example">
        <Child />
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['One']);

    act(() => setShowTwo(true));
    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['One', 'Two']);

    act(() => setShowTwo(false));
    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['One']);

    act(() => setItemText('Hi'));
    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Hi']);
  });

  it('should support hover', () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');

    userEvent.hover(option);
    expect(option).toHaveAttribute('data-hovered', 'true');
    expect(option).toHaveClass('hover');

    userEvent.unhover(option);
    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');
  });

  it('should not show hover state when item is not interactive', () => {
    let {getAllByRole} = renderListbox({}, {className: ({isHovered}) => isHovered ? 'hover' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');

    userEvent.hover(option);
    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');
  });

  it('should support focus ring', () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-focus-visible');
    expect(option).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(option);
    expect(option).toHaveAttribute('data-focus-visible', 'true');
    expect(option).toHaveClass('focus');

    fireEvent.keyDown(option, {key: 'ArrowDown'});
    fireEvent.keyUp(option, {key: 'ArrowDown'});
    expect(option).not.toHaveAttribute('data-focus-visible');
    expect(option).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');

    fireEvent.mouseDown(option);
    expect(option).toHaveAttribute('data-pressed', 'true');
    expect(option).toHaveClass('pressed');

    fireEvent.mouseUp(option);
    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');
  });

  it('should not show press state when not interactive', () => {
    let {getAllByRole} = renderListbox({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');

    fireEvent.mouseDown(option);
    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');

    fireEvent.mouseUp(option);
    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');
  });

  it('should support selection state', () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isSelected}) => isSelected ? 'selected' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('aria-selected', 'true');
    expect(option).not.toHaveClass('selected');

    userEvent.click(option);
    expect(option).toHaveAttribute('aria-selected', 'true');
    expect(option).toHaveClass('selected');

    userEvent.click(option);
    expect(option).not.toHaveAttribute('aria-selected', 'true');
    expect(option).not.toHaveClass('selected');
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple', disabledKeys: ['cat']}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let option = getAllByRole('option')[0];

    expect(option).toHaveAttribute('aria-disabled', 'true');
    expect(option).toHaveClass('disabled');
  });

  it('should support empty state', () => {
    let {getByRole} = render(
      <ListBox aria-label="Test" renderEmptyState={() => 'No results'}>
        {[]}
      </ListBox>
    );
    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('data-empty', 'true');

    let option = getByRole('option');
    expect(option).toHaveTextContent('No results');
  });

  describe('drag and drop', () => {
    it('should support draggable items', () => {
      let {getAllByRole} = render(<DraggableListBox />);
      let options = getAllByRole('option');
      expect(options[0]).toHaveAttribute('draggable');
    });

    it('should render drop indicators', () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableListBox onReorder={onReorder} />);
      let option = getAllByRole('option')[0];
      fireEvent.keyDown(option, {key: 'Enter'});
      fireEvent.keyUp(option, {key: 'Enter'});
      act(() => jest.runAllTimers());

      let rows = getAllByRole('option');
      expect(rows).toHaveLength(4);
      expect(rows[0]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[0]).toHaveAttribute('data-drop-target', 'true');
      expect(rows[0]).toHaveAttribute('aria-label', 'Insert before Cat');
      expect(rows[1]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[1]).not.toHaveAttribute('data-drop-target');
      expect(rows[1]).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(rows[2]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[2]).not.toHaveAttribute('data-drop-target');
      expect(rows[2]).toHaveAttribute('aria-label', 'Insert between Dog and Kangaroo');
      expect(rows[3]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(rows[3]).not.toHaveAttribute('data-drop-target');
      expect(rows[3]).toHaveAttribute('aria-label', 'Insert after Kangaroo');

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});

      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(rows[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(rows[1]).toHaveAttribute('data-drop-target', 'true');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onReorder).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on rows', () => {
      let onItemDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableListBox />
        <DraggableListBox onItemDrop={onItemDrop} />
      </>);

      let option = getAllByRole('option')[0];
      fireEvent.keyDown(option, {key: 'Enter'});
      fireEvent.keyUp(option, {key: 'Enter'});
      act(() => jest.runAllTimers());

      let listboxes = getAllByRole('listbox');
      let rows = within(listboxes[1]).getAllByRole('option');
      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveAttribute('data-drop-target', 'true');
      expect(rows[1]).not.toHaveAttribute('data-drop-target');
      expect(rows[2]).not.toHaveAttribute('data-drop-target');

      expect(document.activeElement).toBe(rows[0]);

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onItemDrop).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on the root', () => {
      let onRootDrop = jest.fn();
      let {getAllByRole} = render(<>
        <DraggableListBox />
        <DraggableListBox onRootDrop={onRootDrop} />
      </>);

      let option = getAllByRole('option')[0];
      fireEvent.keyDown(option, {key: 'Enter'});
      fireEvent.keyUp(option, {key: 'Enter'});
      act(() => jest.runAllTimers());

      let listboxes = getAllByRole('listbox');
      expect(document.activeElement).toBe(listboxes[1]);
      expect(listboxes[1]).toHaveAttribute('data-drop-target', 'true');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onRootDrop).toHaveBeenCalledTimes(1);
    });
  });
});
