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

import {act, fireEvent, installPointerEvent, mockClickDefault, pointerMap, render, setupIntersectionObserverMock, within} from '@react-spectrum/test-utils-internal';
import {
  Button,
  Collection,
  Dialog,
  DialogTrigger,
  DropIndicator,
  Header, Heading,
  ListBox,
  ListBoxContext,
  ListBoxItem,
  ListBoxSection,
  ListLayout,
  Modal,
  Text,
  useDragAndDrop,
  Virtualizer
} from '../';
import {ListBoxLoadMoreItem} from '../src/ListBox';
import React, {useEffect, useState} from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

let TestListBox = ({listBoxProps, itemProps}) => (
  <ListBox aria-label="Test" {...listBoxProps}>
    <ListBoxItem {...itemProps} id="cat">Cat</ListBoxItem>
    <ListBoxItem {...itemProps} id="dog">Dog</ListBoxItem>
    <ListBoxItem {...itemProps} id="kangaroo">Kangaroo</ListBoxItem>
  </ListBox>
);

let DraggableListBox = (props) => {
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
    ...props
  });

  return (
    <ListBox aria-label="Test" dragAndDropHooks={dragAndDropHooks} {...props}>
      <ListBoxItem id="cat">Cat</ListBoxItem>
      <ListBoxItem id="dog">Dog</ListBoxItem>
      <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
    </ListBox>
  );
};

let renderListbox = (listBoxProps, itemProps) => render(<TestListBox {...{listBoxProps, itemProps}} />);
let keyPress = (key) => {
  fireEvent.keyDown(document.activeElement, {key});
  fireEvent.keyUp(document.activeElement, {key});
};

describe('ListBox', () => {
  let user;
  let testUtilUser = new User();
  let onSelectionChange = jest.fn();

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockImplementation(() => 0);
    jest.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockImplementation(() => 0);
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
    jest.restoreAllMocks();
  });

  it('should have the base set of aria and data attributes', () => {
    let {getByRole} = render(
      <ListBox aria-label="Animals">
        <ListBoxItem id="cat">Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
        <ListBoxSection>
          <Header>Fish</Header>
          <ListBoxItem id="salmon">Salmon</ListBoxItem>
          <ListBoxItem id="tuna">Tuna</ListBoxItem>
          <ListBoxItem id="cod">Cod</ListBoxItem>
        </ListBoxSection>
      </ListBox>
    );

    let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox')});
    expect(listboxTester.listbox).toHaveAttribute('data-rac');
    let sections = listboxTester.sections;
    for (let section of sections) {
      expect(section).toHaveAttribute('data-rac');
    }

    let options = listboxTester.options();
    for (let option of options) {
      expect(option).toHaveAttribute('data-rac');
    }
  });

  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderListbox();
    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');

    for (let option of getAllByRole('option')) {
      expect(option).toHaveAttribute('class', 'react-aria-ListBoxItem');
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

  it('should support aria-label on the listbox items', () => {
    let {getAllByRole} = renderListbox({}, {'aria-label': 'test'});

    for (let option of getAllByRole('option')) {
      expect(option).toHaveAttribute('aria-label', 'test');
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
        <ListBoxSection ref={sectionRef}>
          <ListBoxItem ref={itemRef}>Cat</ListBoxItem>
        </ListBoxSection>
      </ListBox>
    );
    expect(listBoxRef.current).toBeInstanceOf(HTMLElement);
    expect(sectionRef.current).toBeInstanceOf(HTMLElement);
    expect(itemRef.current).toBeInstanceOf(HTMLElement);
  });

  it('should support slots', () => {
    let {getByRole} = render(
      <ListBox aria-label="Sandwich contents" selectionMode="multiple">
        <ListBoxItem textValue="Read">
          <Text slot="label">Read</Text>
          <Text slot="description">Read only</Text>
        </ListBoxItem>
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
        <ListBoxSection data-test-prop="test-section-1">
          <Header>Veggies</Header>
          <ListBoxItem id="lettuce">Lettuce</ListBoxItem>
          <ListBoxItem id="tomato">Tomato</ListBoxItem>
          <ListBoxItem id="onion">Onion</ListBoxItem>
        </ListBoxSection>
        <ListBoxSection data-test-prop="test-section-2" aria-label="Protein">
          <ListBoxItem id="ham">Ham</ListBoxItem>
          <ListBoxItem id="tuna">Tuna</ListBoxItem>
          <ListBoxItem id="tofu">Tofu</ListBoxItem>
        </ListBoxSection>
      </ListBox>
    );

    let groups = getAllByRole('group');
    expect(groups).toHaveLength(2);

    expect(groups[0]).toHaveClass('react-aria-ListBoxSection');
    expect(groups[1]).toHaveClass('react-aria-ListBoxSection');

    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Veggies');
    expect(groups[1].getAttribute('aria-label')).toEqual('Protein');

    expect(groups[0]).toHaveAttribute('data-test-prop', 'test-section-1');
    expect(groups[1]).toHaveAttribute('data-test-prop', 'test-section-2');
  });

  it('should support dynamic collections', () => {
    let options = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'}
    ];

    let {getAllByRole, rerender} = render(
      <ListBox aria-label="Animals" items={options}>
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
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
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
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
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
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
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
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
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
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
        {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
      </ListBox>
    );

    expect(getAllByRole('option').map(o => o.textContent)).toEqual(['Cat', 'Kangaroo', 'Mouse']);
  });

  it('should update collection when descendants update', () => {
    let setShowTwo;
    let setItemText;
    function Child() {
      let [showTwo, _setShowTwo] = useState(false);
      let [itemText, _setItemText] = useState('One');
      useEffect(() => {
        setItemText = _setItemText;
        setShowTwo = _setShowTwo;
      }, [_setItemText, _setShowTwo]);
      return (
        <>
          <ListBoxItem id={1}>{itemText}</ListBoxItem>
          {showTwo && <ListBoxItem id={2}>Two</ListBoxItem>}
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

  it('should update collection when moving item to a different section', () => {
    let {getAllByRole, rerender} = render(
      <ListBox aria-label="Test">
        <ListBoxSection id="veggies">
          <Header>Veggies</Header>
          <ListBoxItem key="lettuce" id="lettuce">Lettuce</ListBoxItem>
          <ListBoxItem key="tomato" id="tomato">Tomato</ListBoxItem>
          <ListBoxItem key="onion" id="onion">Onion</ListBoxItem>
        </ListBoxSection>
        <ListBoxSection id="meats">
          <Header>Meats</Header>
          <ListBoxItem key="ham" id="ham">Ham</ListBoxItem>
          <ListBoxItem key="tuna" id="tuna">Tuna</ListBoxItem>
          <ListBoxItem key="tofu" id="tofu">Tofu</ListBoxItem>
        </ListBoxSection>
      </ListBox>
    );

    let sections = getAllByRole('group');
    let items = within(sections[0]).getAllByRole('option');
    expect(items).toHaveLength(3);
    items = within(sections[1]).getAllByRole('option');
    expect(items).toHaveLength(3);

    rerender(
      <ListBox aria-label="Test">
        <ListBoxSection id="veggies">
          <Header>Veggies</Header>
          <ListBoxItem key="lettuce" id="lettuce">Lettuce</ListBoxItem>
          <ListBoxItem key="tomato" id="tomato">Tomato</ListBoxItem>
          <ListBoxItem key="onion" id="onion">Onion</ListBoxItem>
          <ListBoxItem key="ham" id="ham">Ham</ListBoxItem>
        </ListBoxSection>
        <ListBoxSection id="meats">
          <Header>Meats</Header>
          <ListBoxItem key="tuna" id="tuna">Tuna</ListBoxItem>
          <ListBoxItem key="tofu" id="tofu">Tofu</ListBoxItem>
        </ListBoxSection>
      </ListBox>
    );

    sections = getAllByRole('group');
    items = within(sections[0]).getAllByRole('option');
    expect(items).toHaveLength(4);
    items = within(sections[1]).getAllByRole('option');
    expect(items).toHaveLength(2);
  });

  it('should support autoFocus', () => {
    let {getByRole} = renderListbox({autoFocus: true});
    let listbox = getByRole('listbox');
    expect(document.activeElement).toBe(listbox);
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getAllByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart: hoverStartSpy, onHoverEnd: hoverEndSpy, onHoverChange: hoverChangeSpy});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');

    await user.hover(option);
    expect(option).toHaveAttribute('data-hovered', 'true');
    expect(option).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(option);
    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should not show hover state when item is not interactive', async () => {
    let onHoverStart = jest.fn();
    let onHoverChange = jest.fn();
    let onHoverEnd = jest.fn();
    let {getAllByRole} = renderListbox({}, {className: ({isHovered}) => isHovered ? 'hover' : '', onHoverStart, onHoverEnd, onHoverChange});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();

    await user.hover(option);
    expect(option).not.toHaveAttribute('data-hovered');
    expect(option).not.toHaveClass('hover');
    expect(onHoverStart).not.toHaveBeenCalled();
    expect(onHoverChange).not.toHaveBeenCalled();
    expect(onHoverEnd).not.toHaveBeenCalled();
  });

  it('should support focus ring', async () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple', shouldFocusOnHover: true}, {className: ({isFocusVisible}) => isFocusVisible ? 'focus' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-focus-visible');
    expect(option).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(option);
    expect(option).toHaveAttribute('data-focus-visible', 'true');
    expect(option).toHaveClass('focus');
    expect(option).not.toHaveAttribute('data-hovered');

    fireEvent.keyDown(option, {key: 'ArrowDown'});
    fireEvent.keyUp(option, {key: 'ArrowDown'});
    expect(option).not.toHaveAttribute('data-focus-visible');
    expect(option).not.toHaveClass('focus');
  });

  it('should support press state', async () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');

    await user.pointer({target: option, keys: '[MouseLeft>]'});
    expect(option).toHaveAttribute('data-pressed', 'true');
    expect(option).toHaveClass('pressed');

    await user.pointer({target: option, keys: '[/MouseLeft]'});
    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');
  });

  it('should not show press state when not interactive', async () => {
    let {getAllByRole} = renderListbox({}, {className: ({isPressed}) => isPressed ? 'pressed' : ''});
    let option = getAllByRole('option')[0];

    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');

    await user.pointer({target: option, keys: '[MouseLeft>]'});
    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');

    await user.pointer({target: option, keys: '[/MouseLeft]'});
    expect(option).not.toHaveAttribute('data-pressed');
    expect(option).not.toHaveClass('pressed');
  });

  it('should support selection state', async () => {
    let {getByRole} = renderListbox({selectionMode: 'multiple'}, {className: ({isSelected}) => isSelected ? 'selected' : ''});

    let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox')});
    let option = listboxTester.options()[0];
    expect(option).not.toHaveAttribute('aria-selected', 'true');
    expect(option).not.toHaveClass('selected');

    await listboxTester.toggleOptionSelection({option});
    expect(option).toHaveAttribute('aria-selected', 'true');
    expect(option).toHaveClass('selected');

    await listboxTester.toggleOptionSelection({option});
    expect(option).not.toHaveAttribute('aria-selected', 'true');
    expect(option).not.toHaveClass('selected');
  });

  it('should support disabled state', () => {
    let {getAllByRole} = renderListbox({selectionMode: 'multiple', disabledKeys: ['cat']}, {className: ({isDisabled}) => isDisabled ? 'disabled' : ''});
    let option = getAllByRole('option')[0];

    expect(option).toHaveAttribute('aria-disabled', 'true');
    expect(option).toHaveClass('disabled');
  });

  it('should support isDisabled prop on items', async () => {
    let {getAllByRole} = render(
      <ListBox aria-label="Test">
        <ListBoxItem id="cat">Cat</ListBoxItem>
        <ListBoxItem id="dog" isDisabled>Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
      </ListBox>
    );

    let items = getAllByRole('option');
    expect(items[1]).toHaveAttribute('aria-disabled', 'true');

    await user.tab();
    expect(document.activeElement).toBe(items[0]);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[2]);
  });

  it.each`
    interactionType
    ${'mouse'}
    ${'keyboard'}
    ${'touch'}
  `('should support onAction, interactionType: $interactionType ', async ({interactionType}) => {
    let onAction = jest.fn();
    let {getByRole} = render(
      <ListBox aria-label="Test">
        <ListBoxItem id="cat" onAction={onAction}>Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
      </ListBox>
    );
    let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox')});

    let options = listboxTester.options();
    await listboxTester.triggerOptionAction({option: options[0], interactionType});
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should trigger onAction on double click if selectionBehavior="replace"', async () => {
    let onAction = jest.fn();
    let {getByRole} = render(
      <ListBox aria-label="Test" selectionMode="multiple" selectionBehavior="replace" onAction={onAction}>
        <ListBoxItem id="cat">Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
      </ListBox>
    );
    let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox')});

    let options = listboxTester.options();
    await listboxTester.triggerOptionAction({option: options[0]});
    let selectedOptions = listboxTester.selectedOptions;
    expect(selectedOptions).toHaveLength(1);
    expect(onAction).not.toHaveBeenCalled();

    await listboxTester.triggerOptionAction({option: options[1], needsDoubleClick: true});
    selectedOptions = listboxTester.selectedOptions;
    expect(selectedOptions).toHaveLength(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  describe('selectionBehavior="replace"', () => {
    // Required for proper touch detection
    installPointerEvent();
    describe.each(['mouse', 'keyboard', 'touch'])('%s', (type) => {
      it('should perform selection with single selection', async () => {
        let {getByRole} = renderListbox({selectionMode: 'single', selectionBehavior: 'replace', onSelectionChange});
        let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox'), interactionType: type});
        let options = listboxTester.options();

        expect(onSelectionChange).toHaveBeenCalledTimes(0);
        let option2 = options[2];
        await listboxTester.toggleOptionSelection({option: 'Kangaroo', selectionBehavior: 'replace'});
        expect(option2).toHaveAttribute('aria-selected', 'true');
        expect(option2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          // Called twice because initial focus will select the first keyboard focused row
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
        expect(listboxTester.selectedOptions).toHaveLength(1);
        expect(listboxTester.selectedOptions[0]).toBe(option2);

        let option1 = options[1];
        await listboxTester.toggleOptionSelection({option: option1, selectionBehavior: 'replace'});
        expect(option1).toHaveAttribute('aria-selected', 'true');
        expect(option1).toHaveAttribute('data-selected', 'true');
        expect(option2).toHaveAttribute('aria-selected', 'false');
        expect(option2).not.toHaveAttribute('data-selected');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['dog']));
        expect(listboxTester.selectedOptions).toHaveLength(1);
        expect(listboxTester.selectedOptions[0]).toBe(option1);

        await listboxTester.toggleOptionSelection({option: option1, selectionBehavior: 'replace'});
        expect(option1).toHaveAttribute('aria-selected', 'false');
        expect(option1).not.toHaveAttribute('data-selected');
        expect(option2).toHaveAttribute('aria-selected', 'false');
        expect(option2).not.toHaveAttribute('data-selected');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(4);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set([]));
        expect(listboxTester.selectedOptions).toHaveLength(0);
      });

      it('should perform toggle selection in highlight mode when using modifier keys', async () => {
        let {getByRole} = renderListbox({selectionMode: 'multiple', selectionBehavior: 'replace', onSelectionChange});
        let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox'), interactionType: type});
        let options = listboxTester.options();

        let option2 = options[2];
        await listboxTester.toggleOptionSelection({option: 'Kangaroo', selectionBehavior: 'replace'});
        expect(option2).toHaveAttribute('aria-selected', 'true');
        expect(option2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          // Called twice because initial focus will select the first keyboard focused row, meaning we have two items selected
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['cat', 'kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(2);
          expect(listboxTester.selectedOptions[1]).toBe(option2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(1);
          expect(listboxTester.selectedOptions[0]).toBe(option2);
        }

        let option1 = options[1];
        await listboxTester.toggleOptionSelection({option: option1, selectionBehavior: 'replace'});
        expect(option1).toHaveAttribute('aria-selected', 'true');
        expect(option1).toHaveAttribute('data-selected', 'true');
        expect(option2).toHaveAttribute('aria-selected', 'true');
        expect(option2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['cat', 'dog', 'kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(3);
          expect(listboxTester.selectedOptions[1]).toBe(option1);
          expect(listboxTester.selectedOptions[2]).toBe(option2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['dog', 'kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(2);
          expect(listboxTester.selectedOptions[0]).toBe(option1);
          expect(listboxTester.selectedOptions[1]).toBe(option2);
        }

        // With modifier key, you should be able to deselect on press of the same row
        await listboxTester.toggleOptionSelection({option: option1, selectionBehavior: 'replace'});
        expect(option1).toHaveAttribute('aria-selected', 'false');
        expect(option1).not.toHaveAttribute('data-selected');
        expect(option2).toHaveAttribute('aria-selected', 'true');
        expect(option2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          expect(onSelectionChange).toHaveBeenCalledTimes(4);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['cat', 'kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(2);
          expect(listboxTester.selectedOptions[1]).toBe(option2);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(1);
          expect(listboxTester.selectedOptions[0]).toBe(option2);
        }
      });

      it('should perform replace selection in highlight mode when not using modifier keys', async () => {
        let {getByRole} = renderListbox({selectionMode: 'multiple', selectionBehavior: 'replace', onSelectionChange});
        let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox'), interactionType: type});
        let options = listboxTester.options();

        let option2 = options[2];
        await listboxTester.toggleOptionSelection({option: 'Kangaroo'});
        expect(option2).toHaveAttribute('aria-selected', 'true');
        expect(option2).toHaveAttribute('data-selected', 'true');
        if (type === 'keyboard') {
          // Called multiple times since selection changes on option focus as we arrow down to the target option
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
        } else {
          expect(onSelectionChange).toHaveBeenCalledTimes(1);
        }
        expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['kangaroo']));
        expect(listboxTester.selectedOptions).toHaveLength(1);
        expect(listboxTester.selectedOptions[0]).toBe(option2);

        let option1 = options[1];
        await listboxTester.toggleOptionSelection({option: option1});
        if (type !== 'touch') {
          expect(option1).toHaveAttribute('aria-selected', 'true');
          expect(option1).toHaveAttribute('data-selected', 'true');
          expect(option2).toHaveAttribute('aria-selected', 'false');
          expect(option2).not.toHaveAttribute('data-selected');
          if (type === 'keyboard') {
            expect(onSelectionChange).toHaveBeenCalledTimes(4);
          } else {
            expect(onSelectionChange).toHaveBeenCalledTimes(2);
          }
          expect(new Set(onSelectionChange.mock.calls.at(-1)[0])).toEqual(new Set(['dog']));
          expect(listboxTester.selectedOptions).toHaveLength(1);
          expect(listboxTester.selectedOptions[0]).toBe(option1);
          // pressing without modifier keys won't deselect the row
          await listboxTester.toggleOptionSelection({option: option1});
          expect(option1).toHaveAttribute('aria-selected', 'true');
          expect(option1).toHaveAttribute('data-selected', 'true');
          if (type === 'keyboard') {
            expect(onSelectionChange).toHaveBeenCalledTimes(4);
          } else {
            expect(onSelectionChange).toHaveBeenCalledTimes(2);
          }
          expect(listboxTester.selectedOptions).toHaveLength(1);
        } else {
          // touch always behaves as toggle
          expect(option1).toHaveAttribute('aria-selected', 'true');
          expect(option1).toHaveAttribute('data-selected', 'true');
          expect(option2).toHaveAttribute('aria-selected', 'true');
          expect(option2).toHaveAttribute('data-selected', 'true');
          expect(onSelectionChange).toHaveBeenCalledTimes(2);
          expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['dog', 'kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(2);
          expect(listboxTester.selectedOptions[0]).toBe(option1);

          await listboxTester.toggleOptionSelection({option: option1});
          expect(option1).toHaveAttribute('aria-selected', 'false');
          expect(option1).not.toHaveAttribute('data-selected');
          expect(onSelectionChange).toHaveBeenCalledTimes(3);
          expect(new Set(onSelectionChange.mock.calls[2][0])).toEqual(new Set(['kangaroo']));
          expect(listboxTester.selectedOptions).toHaveLength(1);
          expect(listboxTester.selectedOptions[0]).toBe(option2);
        }
      });
    });
  });

  describe('with pointer events', () => {
    installPointerEvent();
    it('should trigger selection on long press if both onAction and selection exist (touch only)', async () => {
      let onAction = jest.fn();
      let {getByRole} = render(
        <ListBox aria-label="Test" selectionMode="multiple" selectionBehavior="toggle" onAction={onAction}>
          <ListBoxItem id="cat">Cat</ListBoxItem>
          <ListBoxItem id="dog">Dog</ListBoxItem>
          <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
        </ListBox>
      );
      let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox'), advanceTimer: jest.advanceTimersByTime, interactionType: 'touch'});

      await listboxTester.toggleOptionSelection({option: listboxTester.options()[0]});
      expect(listboxTester.selectedOptions).toHaveLength(0);
      expect(onAction).toHaveBeenCalledTimes(1);

      await listboxTester.toggleOptionSelection({option: listboxTester.options()[0], needsLongPress: true});
      expect(listboxTester.selectedOptions).toHaveLength(1);
      expect(listboxTester.selectedOptions[0]).toBe(listboxTester.options()[0]);
      expect(onAction).toHaveBeenCalledTimes(1);

      await listboxTester.toggleOptionSelection({option: listboxTester.options()[1]});
      expect(listboxTester.selectedOptions).toHaveLength(2);
      expect(listboxTester.selectedOptions[1]).toBe(listboxTester.options()[1]);
    });
  });

  it('should support onAction on list and list items', async () => {
    let onAction = jest.fn();
    let itemAction = jest.fn();
    let {getAllByRole} = render(
      <ListBox aria-label="Test" onAction={onAction}>
        <ListBoxItem id="cat" onAction={itemAction}>Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
      </ListBox>
    );
    let items = getAllByRole('option');
    await user.click(items[0]);
    expect(onAction).toHaveBeenCalledWith('cat');
    expect(itemAction).toHaveBeenCalledTimes(1);
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

  it('should support horizontal orientation', async () => {
    let {getAllByRole} = renderListbox({orientation: 'horizontal'});
    let options = getAllByRole('option');

    await user.tab();
    expect(document.activeElement).toBe(options[0]);

    keyPress('ArrowRight');
    expect(document.activeElement).toBe(options[1]);

    keyPress('ArrowRight');
    expect(document.activeElement).toBe(options[2]);

    keyPress('ArrowLeft');
    expect(document.activeElement).toBe(options[1]);
  });

  it('should support grid layout', async () => {
    let {getAllByRole} = renderListbox({layout: 'grid'});
    let options = getAllByRole('option');

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.getAttribute('role') === 'listbox') {
        return {top: 0, left: 0, bottom: 200, right: 200, width: 200, height: 200};
      } else {
        let index = [...this.parentElement.children].indexOf(this);
        return {top: Math.floor(index / 2) * 40, left: index % 2 ? 100 : 0, bottom: Math.floor(index / 2) * 40 + 40, right: index % 2 ? 200 : 100, width: 100, height: 40};
      }
    });

    await user.tab();
    expect(document.activeElement).toBe(options[0]);

    keyPress('ArrowDown');
    expect(document.activeElement).toBe(options[2]);

    keyPress('ArrowLeft');
    expect(document.activeElement).toBe(options[1]);

    keyPress('ArrowLeft');
    expect(document.activeElement).toBe(options[0]);

    keyPress('ArrowRight');
    expect(document.activeElement).toBe(options[1]);
  });

  it('should not throw TypeError at boundaries of vertical grid layout when keyboard navigating (up/down)', async () => {
    /**
     * The following ListBox is roughly in this shape:
     *
     * -------------------
     * | 1,1 | 1,2 | 1,3 |
     * -------------------
     * | 2,1 | 2,2 | 2,3 |
     * -------------------
     * | 3,1 | 3,2 | 3,3 |
     * -------------------
     */
    let {getAllByRole} = render(
      <ListBox layout="grid" aria-label="Test">
        <ListBoxItem>1,1</ListBoxItem>
        <ListBoxItem>1,2</ListBoxItem>
        <ListBoxItem>1,3</ListBoxItem>
        <ListBoxItem>2,1</ListBoxItem>
        <ListBoxItem>2,2</ListBoxItem>
        <ListBoxItem>2,3</ListBoxItem>
        <ListBoxItem>3,1</ListBoxItem>
        <ListBoxItem>3,2</ListBoxItem>
        <ListBoxItem>3,3</ListBoxItem>
      </ListBox>);
    let options = getAllByRole('option');

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.getAttribute('role') === 'listbox') {
        return {top: 0, left: 0, bottom: 200, right: 300, width: 300, height: 200};
      } else {
        let index = [...this.parentElement.children].indexOf(this);
        return {top: Math.floor(index / 3) * 40, left: (index % 3) * 100, bottom: Math.floor(index / 3) * 40 + 40, right: (index % 3) * 100 + 100, width: 100, height: 40};
      }
    });

    await user.tab();
    expect(document.activeElement).toBe(options[0]);  // 1,1

    keyPress('ArrowDown');
    expect(document.activeElement).toBe(options[3]);  // 2,1

    keyPress('ArrowDown');  // the end reached
    expect(document.activeElement).toBe(options[6]);  // 3,1

    keyPress('ArrowDown');  // shouldn't throw when pressed one more time at the boundary.
    expect(document.activeElement).toBe(options[6]);  // 3,1

    keyPress('ArrowUp');
    expect(document.activeElement).toBe(options[3]);  // 2,1

    keyPress('ArrowUp');  // the end reached
    expect(document.activeElement).toBe(options[0]);  // 1,1

    keyPress('ArrowUp');  // shouldn't throw when pressed one more time at the boundary.
    expect(document.activeElement).toBe(options[0]);  // 1,1
  });

  it('should support horizontal grid layout', async () => {
    let {getAllByRole} = renderListbox({layout: 'grid', orientation: 'horizontal'});
    let options = getAllByRole('option');

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.getAttribute('role') === 'listbox') {
        return {top: 0, left: 0, bottom: 200, right: 200, width: 200, height: 200};
      } else {
        let index = [...this.parentElement.children].indexOf(this);
        return {top: (index % 2) * 40, left: index < 2 ? 0 : 100, bottom: (index % 2) * 40 + 40, right: index < 2 ? 100 : 200, width: 100, height: 40};
      }
    });

    await user.tab();
    expect(document.activeElement).toBe(options[0]);

    keyPress('ArrowRight');
    expect(document.activeElement).toBe(options[2]);

    keyPress('ArrowUp');
    expect(document.activeElement).toBe(options[1]);

    keyPress('ArrowUp');
    expect(document.activeElement).toBe(options[0]);

    keyPress('ArrowDown');
    expect(document.activeElement).toBe(options[1]);
  });

  it('should not throw TypeError at boundaries of horizontal grid layout when keyboard navigating (left/right)', async () => {
    /**
     * The following ListBox is roughly in this shape:
     *
     * -------------------
     * | 1,1 | 2,1 | 3,1 |
     * -------------------
     * | 1,2 | 2,2 | 3,2 |
     * -------------------
     * | 1,3 | 3,2 | 3,3 |
     * -------------------
     */
    let {getAllByRole} = render(
      <ListBox layout="grid" orientation="horizontal" aria-label="Test">
        <ListBoxItem>1,1</ListBoxItem>
        <ListBoxItem>1,2</ListBoxItem>
        <ListBoxItem>1,3</ListBoxItem>
        <ListBoxItem>2,1</ListBoxItem>
        <ListBoxItem>2,2</ListBoxItem>
        <ListBoxItem>2,3</ListBoxItem>
        <ListBoxItem>3,1</ListBoxItem>
        <ListBoxItem>3,2</ListBoxItem>
        <ListBoxItem>3,3</ListBoxItem>
      </ListBox>);
    let options = getAllByRole('option');

    jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.getAttribute('role') === 'listbox') {
        return {top: 0, left: 0, bottom: 200, right: 300, width: 300, height: 200};
      } else {
        let index = [...this.parentElement.children].indexOf(this);
        return {top: (index % 3) * 40, left: Math.floor(index / 3) * 100, bottom: (index % 3) * 40 + 40, right: Math.floor(index / 3) * 100 + 100, width: 100, height: 40};
      }
    });

    await user.tab();
    expect(document.activeElement).toBe(options[0]);  // 1,1

    keyPress('ArrowRight');
    expect(document.activeElement).toBe(options[3]);  // 2,1

    keyPress('ArrowRight');  // the end reached
    expect(document.activeElement).toBe(options[6]);  // 3,1

    keyPress('ArrowRight');  // shouldn't throw when pressed one more time at the boundary.
    expect(document.activeElement).toBe(options[6]);  // 3,1

    keyPress('ArrowLeft');
    expect(document.activeElement).toBe(options[3]);  // 2,1

    keyPress('ArrowLeft');  // the end reached
    expect(document.activeElement).toBe(options[0]);  // 1,1

    keyPress('ArrowLeft');  // shouldn't throw when pressed one more time at the boundary.
    expect(document.activeElement).toBe(options[0]);  // 1,1
  });

  it('should support onScroll', () => {
    let onScroll = jest.fn();
    let {getByRole} = renderListbox({onScroll});
    let listbox = getByRole('listbox');
    fireEvent.scroll(listbox);
    expect(onScroll).toHaveBeenCalled();
  });

  it('should support virtualizer', async () => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push({id: i, name: 'Item ' + i});
    }

    jest.restoreAllMocks(); // don't mock scrollTop for this test
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);

    let {getByRole, getAllByRole} = render(
      <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
        <ListBox aria-label="Test" items={items}>
          {item => <ListBoxItem>{item.name}</ListBoxItem>}
        </ListBox>
      </Virtualizer>
    );

    let options = getAllByRole('option');
    expect(options).toHaveLength(7);
    expect(options.map(r => r.textContent)).toEqual(['Item 0', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6']);
    for (let option of options) {
      expect(option).toHaveAttribute('aria-setsize', '50');
      expect(option).toHaveAttribute('aria-posinset');
    }

    let listbox = getByRole('listbox');
    listbox.scrollTop = 200;
    fireEvent.scroll(listbox);

    options = getAllByRole('option');
    expect(options).toHaveLength(8);
    expect(options.map(r => r.textContent)).toEqual(['Item 7', 'Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12', 'Item 13', 'Item 14']);

    await user.tab();
    await user.keyboard('{End}');

    options = getAllByRole('option');
    expect(options).toHaveLength(9);
    expect(options.map(r => r.textContent)).toEqual(['Item 7', 'Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12', 'Item 13', 'Item 14', 'Item 49']);
  });

  it('should prevent Esc from clearing selection if escapeKeyBehavior is "none"', async () => {
    let {getByRole} = renderListbox({selectionMode: 'multiple', escapeKeyBehavior: 'none'});

    let listboxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox')});
    let option = listboxTester.options()[0];
    expect(option).not.toHaveAttribute('aria-selected', 'true');
    expect(option).not.toHaveClass('selected');

    await listboxTester.toggleOptionSelection({option});
    expect(option).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Escape}');
    expect(option).toHaveAttribute('aria-selected', 'true');
  });

  describe('drag and drop', () => {
    it('should support draggable items', () => {
      let {getAllByRole} = render(<DraggableListBox />);
      let options = getAllByRole('option');
      expect(options[0]).toHaveAttribute('draggable');
    });

    it('should render drop indicators', () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableListBox onReorder={onReorder} renderDropIndicator={(target) => <DropIndicator target={target}>Test</DropIndicator>} />);
      let option = getAllByRole('option')[0];
      fireEvent.keyDown(option, {key: 'Enter'});
      fireEvent.keyUp(option, {key: 'Enter'});
      act(() => jest.runAllTimers());

      let options = getAllByRole('option');
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(options[0]).toHaveAttribute('data-drop-target', 'true');
      expect(options[0]).toHaveAttribute('aria-label', 'Insert before Cat');
      expect(options[0]).toHaveTextContent('Test');
      expect(options[1]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(options[1]).not.toHaveAttribute('data-drop-target');
      expect(options[1]).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(options[2]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(options[2]).not.toHaveAttribute('data-drop-target');
      expect(options[2]).toHaveAttribute('aria-label', 'Insert between Dog and Kangaroo');
      expect(options[3]).toHaveAttribute('class', 'react-aria-DropIndicator');
      expect(options[3]).not.toHaveAttribute('data-drop-target');
      expect(options[3]).toHaveAttribute('aria-label', 'Insert after Kangaroo');

      fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});

      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Cat and Dog');
      expect(options[0]).not.toHaveAttribute('data-drop-target', 'true');
      expect(options[1]).toHaveAttribute('data-drop-target', 'true');

      fireEvent.keyDown(document.activeElement, {key: 'Enter'});
      fireEvent.keyUp(document.activeElement, {key: 'Enter'});
      act(() => jest.runAllTimers());

      expect(onReorder).toHaveBeenCalledTimes(1);
    });

    it('should support dropping on options', () => {
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
      let options = within(listboxes[1]).getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveAttribute('data-drop-target', 'true');
      expect(options[1]).not.toHaveAttribute('data-drop-target');
      expect(options[2]).not.toHaveAttribute('data-drop-target');

      expect(document.activeElement).toBe(options[0]);

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

    it('should support horizontal orientation', async () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableListBox onReorder={onReorder} orientation="horizontal" />);
      let options = getAllByRole('option');

      await user.tab();
      expect(document.activeElement).toBe(options[0]);
      keyPress('Enter');
      act(() => jest.runAllTimers());

      options = getAllByRole('option');
      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Cat and Dog');

      keyPress('ArrowRight');
      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Dog and Kangaroo');

      keyPress('Escape');
      act(() => jest.runAllTimers());
    });

    it('should support grid layout', async () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableListBox onReorder={onReorder} layout="grid" />);
      let options = getAllByRole('option');

      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
        if (this.getAttribute('role') === 'listbox') {
          return {top: 0, left: 0, bottom: 200, right: 200, width: 200, height: 200};
        } else {
          let index = [...this.parentElement.children].filter(c => c.hasAttribute('data-key')).indexOf(this);
          return {top: Math.floor(index / 2) * 40, left: index % 2 ? 100 : 0, bottom: Math.floor(index / 2) * 40 + 40, right: index % 2 ? 200 : 100, width: 100, height: 40};
        }
      });

      await user.tab();
      expect(document.activeElement).toBe(options[0]);
      keyPress('Enter');
      act(() => jest.runAllTimers());

      options = getAllByRole('option');
      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Cat and Dog');

      keyPress('ArrowDown');
      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Kangaroo');

      keyPress('Escape');
      act(() => jest.runAllTimers());
    });

    it('should support horizontal grid layout', async () => {
      let onReorder = jest.fn();
      let {getAllByRole} = render(<DraggableListBox onReorder={onReorder} layout="grid" orientation="horizontal" />);
      let options = getAllByRole('option');

      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
        if (this.getAttribute('role') === 'listbox') {
          return {top: 0, left: 0, bottom: 200, right: 200, width: 200, height: 200};
        } else {
          let index = [...this.parentElement.children].filter(c => c.hasAttribute('data-key')).indexOf(this);
          return {top: (index % 2) * 40, left: index < 2 ? 0 : 100, bottom: (index % 2) * 40 + 40, right: index < 2 ? 100 : 200, width: 100, height: 40};
        }
      });

      await user.tab();
      expect(document.activeElement).toBe(options[0]);
      keyPress('Enter');
      act(() => jest.runAllTimers());

      options = getAllByRole('option');
      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert between Cat and Dog');

      keyPress('ArrowRight');
      expect(document.activeElement).toHaveAttribute('aria-label', 'Insert after Kangaroo');

      keyPress('Escape');
      act(() => jest.runAllTimers());
    });

    it('should support onAction with drag and drop in virtualized list', async () => {
      let items = [];
      for (let i = 0; i < 20; i++) {
        items.push({id: i, name: 'Item ' + i});
      }

      jest.restoreAllMocks();
      jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
      jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);

      let onAction = jest.fn();
      let onReorder = jest.fn();

      function VirtualizedDraggableListBox() {
        let {dragAndDropHooks} = useDragAndDrop({
          getItems: (keys) => [...keys].map((key) => ({'text/plain': key})),
          onReorder,
          renderDropIndicator: (target) => <DropIndicator target={target}>Drop</DropIndicator>
        });

        return (
          <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
            <ListBox
              aria-label="Test"
              dragAndDropHooks={dragAndDropHooks}
              onAction={onAction}
              items={items}>
              {item => <ListBoxItem>{item.name}</ListBoxItem>}
            </ListBox>
          </Virtualizer>
        );
      }

      let {getAllByRole} = render(<VirtualizedDraggableListBox />);
      let options = getAllByRole('option');

      // Focus first item
      await user.tab();
      expect(document.activeElement).toBe(options[0]);

      // Pressing Enter should trigger onAction, and not start drag
      keyPress('Enter');
      act(() => jest.runAllTimers());
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith(0);
      expect(onReorder).not.toHaveBeenCalled();

      // Should not be in drag mode
      options = getAllByRole('option');
      expect(options.filter(opt => opt.classList.contains('react-aria-DropIndicator'))).toHaveLength(0);

      // Now test that Alt+Enter starts drag mode
      expect(document.activeElement).toBe(options[0]);
      fireEvent.keyDown(document.activeElement, {key: 'Enter', altKey: true});
      fireEvent.keyUp(document.activeElement, {key: 'Enter', altKey: true});
      act(() => jest.runAllTimers());

      // Verify we're in drag mode
      options = getAllByRole('option');
      let dropIndicators = options.filter(opt => opt.classList.contains('react-aria-DropIndicator'));
      expect(dropIndicators.length).toBeGreaterThan(0);
      expect(document.activeElement).toHaveAttribute('aria-label');
      expect(document.activeElement.getAttribute('aria-label')).toContain('Insert');

      // onAction should not have been called again
      expect(onAction).toHaveBeenCalledTimes(1);

      // Complete the drop
      keyPress('ArrowDown');
      expect(document.activeElement.getAttribute('aria-label')).toContain('Insert');
      keyPress('Enter');
      act(() => jest.runAllTimers());

      expect(onReorder).toHaveBeenCalledTimes(1);
      
      // Verify we're no longer in drag mode
      options = getAllByRole('option');
      expect(options.filter(opt => opt.classList.contains('react-aria-DropIndicator'))).toHaveLength(0);
    });
  });

  describe('inside modals', () => {
    it('should clear selection on first Escape, then allow the modal to close on the second Escape', async () => {
      let onOpenChange = jest.fn();
      let {getAllByRole, getByRole} = render(
        <DialogTrigger onOpenChange={onOpenChange}>
          <Button>Open Dialog</Button>
          <Modal>
            <Dialog>
              <form>
                <Heading slot="title">Sign up</Heading>
                <ListBox aria-label="Test" selectionMode="multiple">
                  <ListBoxItem id="cat">Cat</ListBoxItem>
                  <ListBoxItem id="dog">Dog</ListBoxItem>
                  <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
                </ListBox>
              </form>
            </Dialog>
          </Modal>
        </DialogTrigger>
      );
      await user.tab();
      expect(document.activeElement).toBe(getByRole('button'));
      await user.keyboard('{Enter}');
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      let options = getAllByRole('option');

      await user.tab();
      expect(document.activeElement).toBe(options[0]);
      await user.keyboard('{Enter}');

      expect(options[0]).toHaveAttribute('aria-selected', 'true');

      keyPress('Escape');

      expect(options[0]).toBeInTheDocument();
      expect(options[0]).toHaveAttribute('aria-selected', 'false');

      keyPress('Escape');
      expect(options[0]).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('links', function () {
    describe.each(['mouse', 'keyboard'])('%s', (type) => {
      let trigger = async (item) => {
        if (type === 'mouse') {
          await user.click(item);
        } else {
          fireEvent.keyDown(item, {key: 'Enter'});
          fireEvent.keyUp(item, {key: 'Enter'});
        }
      };

      it('should support links with selectionMode="none"', async function () {
        let {getAllByRole} = render(
          <ListBox aria-label="listbox">
            <ListBoxItem href="https://google.com">One</ListBoxItem>
            <ListBoxItem href="https://adobe.com">Two</ListBoxItem>
          </ListBox>
        );

        let items = getAllByRole('option');
        for (let item of items) {
          expect(item.tagName).toBe('A');
          expect(item).toHaveAttribute('href');
        }

        let onClick = mockClickDefault();
        await trigger(items[0]);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
      });

      it.each(['single', 'multiple'])('should support links with selectionMode="%s"', async function (selectionMode) {
        let {getAllByRole} = render(
          <ListBox aria-label="listbox" selectionMode={selectionMode}>
            <ListBoxItem href="https://google.com">One</ListBoxItem>
            <ListBoxItem href="https://adobe.com">Two</ListBoxItem>
          </ListBox>
        );

        let items = getAllByRole('option');
        for (let item of items) {
          expect(item.tagName).toBe('A');
          expect(item).toHaveAttribute('href');
        }

        let onClick = mockClickDefault();
        await trigger(items[0]);
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
        expect(items[0]).not.toHaveAttribute('aria-selected', 'true');

        await trigger(items[1]);
        expect(onClick).toHaveBeenCalledTimes(2);
        expect(onClick.mock.calls[1][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[1][0].target.href).toBe('https://adobe.com/');
        expect(items[1]).not.toHaveAttribute('aria-selected', 'true');
      });

      it.each(['single', 'multiple'])('should support links with selectionMode="%s" selectionBehavior="replace"', async function (selectionMode) {
        let {getAllByRole} = render(
          <ListBox aria-label="listbox" selectionMode={selectionMode} selectionBehavior="replace">
            <ListBoxItem href="https://google.com">One</ListBoxItem>
            <ListBoxItem href="https://adobe.com">Two</ListBoxItem>
          </ListBox>
        );

        let items = getAllByRole('option');
        for (let item of items) {
          expect(item.tagName).toBe('A');
          expect(item).toHaveAttribute('href');
        }

        let onClick = mockClickDefault();
        if (type === 'mouse') {
          await user.click(items[0]);
        } else {
          fireEvent.keyDown(items[0], {key: ' '});
          fireEvent.keyUp(items[0], {key: ' '});
        }
        expect(onClick).not.toHaveBeenCalled();
        expect(items[0]).toHaveAttribute('aria-selected', 'true');

        if (type === 'mouse') {
          await user.dblClick(items[0], {pointerType: 'mouse'});
        } else {
          fireEvent.keyDown(items[0], {key: 'Enter'});
          fireEvent.keyUp(items[0], {key: 'Enter'});
        }
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0].target).toBeInstanceOf(HTMLAnchorElement);
        expect(onClick.mock.calls[0][0].target.href).toBe('https://google.com/');
      });
    });
  });

  const FalsyExample = () => (
    <ListBox aria-label="Test" selectionMode="multiple" selectionBehavior="replace">
      <ListBoxItem id="0">Item 0</ListBoxItem>
      <ListBoxItem id="1">Item 1</ListBoxItem>
      <ListBoxItem id="2">Item 2</ListBoxItem>
    </ListBox>
  );

  describe('selection with falsy keys', () => {
    describe('keyboard', () => {
      it('should deselect item 0 when navigating back in replace selection mode', async () => {
        let {getAllByRole} = render(<FalsyExample />);

        let items = getAllByRole('option');

        await user.click(items[1]);
        expect(items[1]).toHaveAttribute('aria-selected', 'true');

        // Hold Shift and press ArrowUp to select item 0
        await user.keyboard('{Shift>}{ArrowUp}{/Shift}');

        expect(items[0]).toHaveAttribute('aria-selected', 'true');
        expect(items[1]).toHaveAttribute('aria-selected', 'true');
        expect(items[2]).toHaveAttribute('aria-selected', 'false');

        // Hold Shift and press ArrowDown to navigate back to item 1
        await user.keyboard('{Shift>}{ArrowDown}{/Shift}');

        expect(items[0]).toHaveAttribute('aria-selected', 'false');
        expect(items[1]).toHaveAttribute('aria-selected', 'true');
        expect(items[2]).toHaveAttribute('aria-selected', 'false');
      });

      it('should correctly handle starting selection at item 0 and extending to item 2', async () => {
        let {getAllByRole} = render(<FalsyExample />);

        let items = getAllByRole('option');

        await user.click(items[0]);
        expect(items[0]).toHaveAttribute('aria-selected', 'true');

        // Hold Shift and press ArrowDown to select item 1
        await user.keyboard('{Shift>}{ArrowDown}{/Shift}');

        expect(items[0]).toHaveAttribute('aria-selected', 'true');
        expect(items[1]).toHaveAttribute('aria-selected', 'true');
        expect(items[2]).toHaveAttribute('aria-selected', 'false');

        // Hold Shift and press ArrowDown to select item 2
        await user.keyboard('{Shift>}{ArrowDown}{/Shift}');

        expect(items[0]).toHaveAttribute('aria-selected', 'true');
        expect(items[1]).toHaveAttribute('aria-selected', 'true');
        expect(items[2]).toHaveAttribute('aria-selected', 'true');
      });
    });

    describe('mouse', () => {
      it('should deselect item 0 when clicking another item in replace selection mode', async () => {
        let {getAllByRole} = render(<FalsyExample />);

        let items = getAllByRole('option');

        await user.click(items[1]);
        expect(items[1]).toHaveAttribute('aria-selected', 'true');

        await user.click(items[0]);
        expect(items[0]).toHaveAttribute('aria-selected', 'true');
        expect(items[1]).toHaveAttribute('aria-selected', 'false');

        await user.click(items[1]);
        expect(items[1]).toHaveAttribute('aria-selected', 'true');
        expect(items[0]).toHaveAttribute('aria-selected', 'false');
      });

      it('should correctly handle mouse selection starting at item 0 and extending to item 2', async () => {
        let {getAllByRole} = render(<FalsyExample />);

        let items = getAllByRole('option');

        await user.click(items[0]);
        expect(items[0]).toHaveAttribute('aria-selected', 'true');

        await user.click(items[2]);
        expect(items[0]).toHaveAttribute('aria-selected', 'false');
        expect(items[2]).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('shouldSelectOnPressUp', () => {
    it('should select an item on pressing down when shouldSelectOnPressUp is not provided', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = renderListbox({selectionMode: 'single', onSelectionChange});
      let items = getAllByRole('option');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(1);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });

    it('should select an item on pressing down when shouldSelectOnPressUp is false', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = renderListbox({selectionMode: 'single', onSelectionChange, shouldSelectOnPressUp: false});
      let items = getAllByRole('option');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(1);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });

    it('should select an item on pressing up when shouldSelectOnPressUp is true', async () => {
      let onSelectionChange = jest.fn();
      let {getAllByRole} = renderListbox({selectionMode: 'single', onSelectionChange, shouldSelectOnPressUp: true});
      let items = getAllByRole('option');

      await user.pointer({target: items[0], keys: '[MouseLeft>]'});
      expect(onSelectionChange).toBeCalledTimes(0);

      await user.pointer({target: items[0], keys: '[/MouseLeft]'});
      expect(onSelectionChange).toBeCalledTimes(1);
    });
  });

  describe('shouldFocusOnHover', () => {
    it('should focus options on hovering with shouldFocusOnHover', async () => {
      let {getAllByRole} = renderListbox({shouldFocusOnHover: true});
      let options = getAllByRole('option');
      let option1 = options[0];
      let option2 = options[1];

      expect(option1).not.toHaveFocus();
      expect(option2).not.toHaveFocus();

      await user.hover(option1);
      expect(option1).toHaveFocus();

      keyPress('ArrowDown');
      expect(option1).not.toHaveFocus();
      expect(option2).toHaveFocus();
    });

    it.each([false, undefined])('should not focus options on hovering when shouldFocusOnHover is not true', async (shouldFocusOnHover) => {
      let {getAllByRole} = renderListbox({shouldFocusOnHover});
      let option = getAllByRole('option')[0];

      expect(option).not.toHaveFocus();

      await user.hover(option);
      expect(option).not.toHaveFocus();
    });
  });

  describe('async loading', () => {
    let items = [
      {name: 'Foo'},
      {name: 'Bar'},
      {name: 'Baz'}
    ];
    let renderEmptyState = () => {
      return (
        <div>empty state</div>
      );
    };
    let AsyncListbox = (props) => {
      let {items, isLoading, onLoadMore, ...listBoxProps} = props;
      return (
        <ListBox
          {...listBoxProps}
          aria-label="async listbox"
          renderEmptyState={() => renderEmptyState()}>
          <Collection items={items}>
            {(item) => (
              <ListBoxItem id={item.name}>{item.name}</ListBoxItem>
            )}
          </Collection>
          <ListBoxLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore}>
            Loading...
          </ListBoxLoadMoreItem>
        </ListBox>
      );
    };

    let onLoadMore = jest.fn();
    let observe = jest.fn();
    afterEach(() => {
      jest.runAllTimers();
      jest.clearAllMocks();
    });

    it('should render the loading element when loading', async () => {
      let tree = render(<AsyncListbox isLoading items={items} />);

      let listboxTester = testUtilUser.createTester('ListBox', {root: tree.getByRole('listbox')});
      let options = listboxTester.options();
      expect(options).toHaveLength(4);
      let loaderRow = options[3];
      expect(loaderRow).toHaveTextContent('Loading...');

      let sentinel = tree.getByTestId('loadMoreSentinel');
      expect(sentinel.parentElement).toHaveAttribute('inert');
    });

    it('should render the sentinel but not the loading indicator when not loading', async () => {
      let tree = render(<AsyncListbox items={items} />);

      let listboxTester = testUtilUser.createTester('ListBox', {root: tree.getByRole('listbox')});
      let options = listboxTester.options();
      expect(options).toHaveLength(3);
      expect(tree.queryByText('Loading...')).toBeFalsy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();
    });

    it('should properly render the renderEmptyState if listbox is empty', async () => {
      let tree = render(<AsyncListbox items={[]} />);

      let listboxTester = testUtilUser.createTester('ListBox', {root: tree.getByRole('listbox')});
      let options = listboxTester.options();
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('empty state');
      expect(tree.queryByText('Loading...')).toBeFalsy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();

      // Even if the listbox is empty, providing isLoading will render the loader
      tree.rerender(<AsyncListbox items={[]} isLoading />);
      options = listboxTester.options();
      expect(options).toHaveLength(2);
      expect(options[1]).toHaveTextContent('empty state');
      expect(tree.queryByText('Loading...')).toBeTruthy();
      expect(tree.getByTestId('loadMoreSentinel')).toBeInTheDocument();
    });

    it('should only fire loadMore when intersection is detected regardless of loading state', async () => {
      let observer = setupIntersectionObserverMock({
        observe
      });

      let tree = render(<AsyncListbox items={items} onLoadMore={onLoadMore} isLoading />);
      let sentinel = tree.getByTestId('loadMoreSentinel');
      expect(observe).toHaveBeenLastCalledWith(sentinel);
      expect(onLoadMore).toHaveBeenCalledTimes(0);

      act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      observe.mockClear();

      tree.rerender(<AsyncListbox items={items} onLoadMore={onLoadMore} />);
      expect(observe).toHaveBeenLastCalledWith(sentinel);
      expect(onLoadMore).toHaveBeenCalledTimes(1);

      act(() => {observer.instance.triggerCallback([{isIntersecting: true}]);});
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    describe('virtualized', () => {
      let items = [];
      for (let i = 0; i < 50; i++) {
        items.push({name: 'Foo' + i});
      }
      let clientWidth, clientHeight;

      beforeAll(() => {
        clientWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
        clientHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);
      });

      afterEach(() => {
        act(() => {jest.runAllTimers();});
      });

      afterAll(() => {
        clientWidth.mockReset();
        clientHeight.mockReset();
      });

      function VirtualizedAsyncListbox(props) {
        let {items, isLoading, onLoadMore, ...listBoxProps} = props;
        return (
          <Virtualizer
            layout={ListLayout}
            layoutOptions={{
              rowHeight: 25,
              loaderHeight: 30
            }}>
            <ListBox
              {...listBoxProps}
              aria-label="async virtualized listbox"
              renderEmptyState={() => renderEmptyState()}>
              <Collection items={items}>
                {(item) => (
                  <ListBoxItem id={item.name}>{item.name}</ListBoxItem>
                )}
              </Collection>
              <ListBoxLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore}>
                Loading...
              </ListBoxLoadMoreItem>
            </ListBox>
          </Virtualizer>
        );
      };

      it('should always render the sentinel even when virtualized', () => {
        let tree = render(<VirtualizedAsyncListbox isLoading items={items} />);
        let listboxTester = testUtilUser.createTester('ListBox', {root: tree.getByRole('listbox')});
        let options = listboxTester.options();
        expect(options).toHaveLength(8);
        let loaderRow = options[7];
        expect(loaderRow).toHaveTextContent('Loading...');
        expect(loaderRow).not.toHaveAttribute('aria-posinset');
        expect(loaderRow).not.toHaveAttribute('aria-setSize');
        let loaderParentStyles = loaderRow.parentElement.style;

        // 50 items * 25px = 1250
        expect(loaderParentStyles.top).toBe('1250px');
        expect(loaderParentStyles.height).toBe('30px');

        let sentinel = within(loaderRow.parentElement).getByTestId('loadMoreSentinel');
        expect(sentinel.parentElement).toHaveAttribute('inert');
      });

      // TODO: for some reason this tree renders empty if ran with the above test...
      // Even if the above test doesn't do anything within it, the below tree won't render with content until the above test
      // is fully commented out (aka even the it(...))
      // It thinks that the contextSize is 0 and never updates
      it.skip('should not reserve room for the loader if isLoading is false', () => {
        let tree = render(<VirtualizedAsyncListbox items={items} />);
        let listboxTester = testUtilUser.createTester('ListBox', {root: tree.getByRole('listbox')});
        let options = listboxTester.options();
        expect(options).toHaveLength(7);
        expect(within(listboxTester.listbox).queryByText('Loading...')).toBeFalsy();

        let sentinel = within(listboxTester.listbox).getByTestId('loadMoreSentinel');
        let sentinelParentStyles = sentinel.parentElement.parentElement.style;
        expect(sentinelParentStyles.top).toBe('1250px');
        expect(sentinelParentStyles.height).toBe('0px');
        expect(sentinel.parentElement).toHaveAttribute('inert');

        tree.rerender(<VirtualizedAsyncListbox items={[]} />);
        options = listboxTester.options();
        expect(options).toHaveLength(1);
        let emptyStateRow = options[0];
        expect(emptyStateRow).toHaveTextContent('empty state');
        expect(within(listboxTester.listbox).queryByText('Loading...')).toBeFalsy();

        sentinel = within(listboxTester.listbox).getByTestId('loadMoreSentinel');
        sentinelParentStyles = sentinel.parentElement.parentElement.style;
        expect(sentinelParentStyles.top).toBe('0px');
        expect(sentinelParentStyles.height).toBe('0px');

        // Setting isLoading will render the loader even if the list is empty.
        tree.rerender(<VirtualizedAsyncListbox items={[]} isLoading />);
        options = listboxTester.options();
        expect(options).toHaveLength(2);
        emptyStateRow = options[1];
        expect(emptyStateRow).toHaveTextContent('empty state');

        let loadingRow = options[0];
        expect(loadingRow).toHaveTextContent('Loading...');

        sentinel = within(listboxTester.listbox).getByTestId('loadMoreSentinel');
        sentinelParentStyles = sentinel.parentElement.parentElement.style;
        expect(sentinelParentStyles.top).toBe('0px');
        expect(sentinelParentStyles.height).toBe('30px');
      });
    });
  });

  describe('press events', () => {
    it.each`
      interactionType
      ${'mouse'}
      ${'keyboard'}
    `('should support press events on items when using $interactionType', async function ({interactionType}) {
      let onAction = jest.fn();
      let onPressStart = jest.fn();
      let onPressEnd = jest.fn();
      let onPress = jest.fn();
      let onClick = jest.fn();
      let {getByRole} = renderListbox({}, {onAction, onPressStart, onPressEnd, onPress, onClick});
      let listBoxTester = testUtilUser.createTester('ListBox', {root: getByRole('listbox')});
      await listBoxTester.triggerOptionAction({option: 1, interactionType});

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onPressStart).toHaveBeenCalledTimes(1);
      expect(onPressEnd).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
