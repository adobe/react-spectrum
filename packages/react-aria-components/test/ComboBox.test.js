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

import {act} from '@testing-library/react';
import {Button, ComboBox, ComboBoxContext, FieldError, Header, Input, Label, ListBox, ListBoxItem, ListBoxLoadMoreItem, ListBoxSection, ListLayout, Popover, Text, Virtualizer} from '../';
import {fireEvent, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import React, {useState} from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

let renderEmptyState = () => {
  return  (
    <div>No results</div>
  );
};

let TestComboBox = (props) => (
  <ComboBox name="test-combobox" defaultInputValue="C" data-foo="bar" {...props}>
    <Label>Favorite Animal</Label>
    <Input />
    <Button />
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
    <Popover>
      <ListBox renderEmptyState={renderEmptyState}>
        <ListBoxItem id="1">Cat</ListBoxItem>
        <ListBoxItem id="2">Dog</ListBoxItem>
        <ListBoxItem id="3">Kangaroo</ListBoxItem>
        <ListBoxLoadMoreItem>
          loading
        </ListBoxLoadMoreItem>
      </ListBox>
    </Popover>
  </ComboBox>
);

describe('ComboBox', () => {
  let user;
  let testUtilUser = new User();
  beforeAll(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  it('provides slots', async () => {
    let {getByRole} = render(<TestComboBox />);

    let input = getByRole('combobox');
    expect(input).toHaveValue('C');

    let combobox = input.closest('.react-aria-ComboBox');
    expect(combobox).toHaveAttribute('data-foo', 'bar');

    expect(input).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(input.getAttribute('aria-labelledby').split(' ')[0]);
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Favorite Animal');

    expect(input).toHaveAttribute('aria-describedby');
    expect(input.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    let button = getByRole('button');
    await user.click(button);

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');
    expect(listbox.closest('.react-aria-Popover')).toBeInTheDocument();
    expect(listbox.closest('.react-aria-Popover')).toHaveAttribute('data-trigger', 'ComboBox');

    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);

    await user.click(options[1]);
    expect(input).toHaveValue('Dog');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ComboBoxContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestComboBox slot="test" />
      </ComboBoxContext.Provider>
    );

    let combobox = getByRole('combobox');
    expect(combobox.closest('.react-aria-ComboBox')).toHaveAttribute('slot', 'test');
    expect(combobox).toHaveAttribute('aria-label', 'test');
  });

  it('should apply isPressed state to button when expanded', async () => {
    let {getByRole} = render(<TestComboBox />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    await user.click(button);
    expect(button).toHaveAttribute('data-pressed');
  });

  it('should not apply isPressed state to button when expanded and isTriggerUpWhenOpen is true', async () => {
    let {getByRole} = render(<TestComboBox isTriggerUpWhenOpen />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    await user.click(button);
    expect(button).not.toHaveAttribute('data-pressed');
  });

  it('should support filtering sections', async () => {
    let tree = render(
      <ComboBox>
        <Label>Preferred fruit or vegetable</Label>
        <Input />
        <Button />
        <Popover>
          <ListBox>
            <ListBoxSection>
              <Header>Fruit</Header>
              <ListBoxItem id="Apple">Apple</ListBoxItem>
              <ListBoxItem id="Banana">Banana</ListBoxItem>
            </ListBoxSection>
            <ListBoxSection>
              <Header>Vegetable</Header>
              <ListBoxItem id="Cabbage">Cabbage</ListBoxItem>
              <ListBoxItem id="Broccoli">Broccoli</ListBoxItem>
            </ListBoxSection>
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    act(() => {
      comboboxTester.combobox.focus();
    });
    await user.keyboard('p');

    let groups = comboboxTester.sections;
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Fruit');

    let options = within(groups[0]).getAllByRole('option');
    expect(options).toHaveLength(1);
  });

  it('should support undefined defaultFilter', async () => {
    let tree = render(
      <ComboBox defaultFilter={undefined}>
        <Label>Preferred fruit or vegetable</Label>
        <Input />
        <Button />
        <Popover>
          <ListBox>
            <ListBoxSection>
              <Header>Fruit</Header>
              <ListBoxItem id="Apple">Apple</ListBoxItem>
              <ListBoxItem id="Banana">Banana</ListBoxItem>
            </ListBoxSection>
            <ListBoxSection>
              <Header>Vegetable</Header>
              <ListBoxItem id="Cabbage">Cabbage</ListBoxItem>
              <ListBoxItem id="Broccoli">Broccoli</ListBoxItem>
            </ListBoxSection>
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    act(() => {
      comboboxTester.combobox.focus();
    });
    await user.keyboard('p');

    let groups = comboboxTester.sections;
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(groups[0].getAttribute('aria-labelledby'))).toHaveTextContent('Fruit');

    let options = within(groups[0]).getAllByRole('option');
    expect(options).toHaveLength(1);
  });

  it('should support dynamic collections', async () => {
    let defaultItems = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'},
      {id: 3, name: 'Kangaroo'}
    ];
    let tree = render(
      <ComboBox defaultItems={defaultItems}>
        <Label>Favorite Animal</Label>
        <Input />
        <Button />
        <Text slot="description">Description</Text>
        <Text slot="errorMessage">Error</Text>
        <Popover>
          <ListBox>
            {item => <ListBoxItem>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    act(() => {
      comboboxTester.combobox.focus();
    });
    await user.keyboard('c');
    let options = comboboxTester.options();
    expect(options).toHaveLength(1);
  });

  it('should support render props', async () => {
    let {getByRole} = render(
      <ComboBox>
        {({isOpen}) => (
          <>
            <Label>Favorite Animal</Label>
            <Input />
            <Button>{isOpen ? 'close' : 'open'}</Button>
            <Popover>
              <ListBox>
                <ListBoxItem>Cat</ListBoxItem>
                <ListBoxItem>Dog</ListBoxItem>
                <ListBoxItem>Kangaroo</ListBoxItem>
              </ListBox>
            </Popover>
          </>
        )}
      </ComboBox>
    );

    let button = getByRole('button');
    expect(button).toHaveTextContent('open');

    await user.click(button);
    expect(button).toHaveTextContent('close');
  });

  it('should support formValue', () => {
    let {getByRole, rerender} = render(<TestComboBox name="test" selectedKey="2" />);
    let input = getByRole('combobox');
    expect(input).not.toHaveAttribute('name');
    expect(input).toHaveValue('Dog');
    let hiddenInput = document.querySelector('input[type=hidden]');
    expect(hiddenInput).toHaveAttribute('name', 'test');
    expect(hiddenInput).toHaveValue('2');

    rerender(<TestComboBox name="test" formValue="text" selectedKey="2" />);
    expect(input).toHaveAttribute('name', 'test');
    expect(document.querySelector('input[type=hidden]')).toBeNull();
  });

  it('should support form reset', async () => {
    const tree = render(
      <form>
        <ComboBox defaultSelectedKey="2" name="combobox">
          <Label>Favorite Animal</Label>
          <Input />
          <Button />
          <FieldError />
          <Popover>
            <ListBox>
              <ListBoxItem id="1">Cat</ListBoxItem>
              <ListBoxItem id="2">Dog</ListBoxItem>
              <ListBoxItem id="3">Kangaroo</ListBoxItem>
            </ListBox>
          </Popover>
        </ComboBox>
        <input type="reset" />
      </form>
    );
  
    const comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    const combobox = comboboxTester.combobox;
  
    expect(combobox).toHaveValue('Dog');
    await comboboxTester.open();
  
    const options = comboboxTester.options();
    await user.click(options[0]);
    expect(combobox).toHaveValue('Cat');
  
    await user.click(document.querySelector('input[type="reset"]'));
    expect(combobox).toHaveValue('Dog');
    expect(document.querySelector('input[name=combobox]')).toHaveValue('2');
  });

  it('should render data- attributes on outer element', () => {
    let {getAllByTestId} = render(
      <TestComboBox data-testid="combo-box" />
    );
    let outerEl = getAllByTestId('combo-box');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-ComboBox');
  });

  it('should support validation errors', async () => {
    let tree = render(
      <form data-testid="form">
        <ComboBox isRequired>
          <Label>Favorite Animal</Label>
          <Input />
          <Button />
          <FieldError />
          <Popover>
            <ListBox>
              <ListBoxItem id="1">Cat</ListBoxItem>
              <ListBoxItem id="2">Dog</ListBoxItem>
              <ListBoxItem id="3">Kangaroo</ListBoxItem>
            </ListBox>
          </Popover>
        </ComboBox>
      </form>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    let combobox = comboboxTester.combobox;

    expect(combobox).toHaveAttribute('required');
    expect(combobox).not.toHaveAttribute('aria-required');
    expect(combobox).not.toHaveAttribute('aria-describedby');
    expect(combobox.validity.valid).toBe(false);
    expect(combobox).not.toHaveAttribute('data-invalid');

    act(() => {tree.getByTestId('form').checkValidity();});

    expect(document.activeElement).toBe(combobox);
    expect(combobox).toHaveAttribute('aria-describedby');
    expect(document.getElementById(combobox.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
    let comboboxWrapper = combobox.closest('.react-aria-ComboBox');
    expect(comboboxWrapper).toHaveAttribute('data-invalid');

    act(() => {
      comboboxTester.combobox.focus();
    });
    await user.keyboard('C');

    let options = comboboxTester.options();
    await user.click(options[0]);

    expect(combobox).toHaveAttribute('aria-describedby');
    expect(combobox.validity.valid).toBe(true);

    await user.tab();
    expect(combobox).not.toHaveAttribute('aria-describedby');
    expect(combobox).not.toHaveAttribute('data-invalid');
  });

  it('should close on scroll', async () => {
    let {getByRole} = render(<TestComboBox />);

    let button = getByRole('button');
    await user.click(button);
    let listbox = getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    fireEvent.scroll(document.body);
    expect(listbox).not.toBeInTheDocument();
  });

  it('should not close on input scrolling for cursor placement', async () => {
    let {getByRole} = render(<TestComboBox />);

    let input = getByRole('combobox');
    let button = getByRole('button');
    await user.click(button);
    let listbox = getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(input).toHaveFocus();
    fireEvent.scroll(input); // simulate what happens when the text is long and overflows
    expect(listbox).toBeInTheDocument();
  });

  it('should not open the menu when isReadOnly', async () => {
    let {getByRole, queryByRole} = render(<TestComboBox isReadOnly menuTrigger="focus" />);

    let input = getByRole('combobox');
    await user.click(input);

    expect(queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should support virtualizer', async () => {
    let items = [];
    for (let i = 0; i < 50; i++) {
      items.push({id: i, name: 'Item ' + i});
    }

    jest.restoreAllMocks(); // don't mock scrollTop for this test
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 100);

    let tree = render(
      <ComboBox >
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
          <Button>
            <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
          </Button>
        </div>
        <Popover>
          <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
            <ListBox items={items}>
              {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
            </ListBox>
          </Virtualizer>
        </Popover>
      </ComboBox>
    );


    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    expect(comboboxTester.listbox).toBeFalsy();
    comboboxTester.setInteractionType('mouse');
    await comboboxTester.open();

    expect(comboboxTester.options()).toHaveLength(7);
  });

  it('should clear contexts inside popover', async () => {
    let tree = render(
      <ComboBox>
        <Label>Preferred fruit or vegetable</Label>
        <Input />
        <Button />
        <Popover data-testid="popover">
          <Label>Hello</Label>
          <Button>Yo</Button>
          <Input />
          <Text>hi</Text>
          <ListBox>
            <ListBoxItem id="cat">Cat</ListBoxItem>
            <ListBoxItem id="dog">Dog</ListBoxItem>
            <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let selectTester = testUtilUser.createTester('Select', {root: tree.container});

    await selectTester.open();

    let popover = await tree.getByTestId('popover');
    let label = popover.querySelector('.react-aria-Label');
    expect(label).not.toHaveAttribute('for');

    let button = popover.querySelector('.react-aria-Button');
    expect(button).not.toHaveAttribute('aria-expanded');

    let input = popover.querySelector('.react-aria-Input');
    expect(input).not.toHaveAttribute('role');

    let text = popover.querySelector('.react-aria-Text');
    expect(text).not.toHaveAttribute('id');
  });

  it('should support form prop', () => {
    let {getByRole} = render(<TestComboBox form="test" />);
    let input = getByRole('combobox');
    expect(input).toHaveAttribute('form', 'test');
  });

  it('should render empty state even when there is a loader provided and allowsEmptyCollection is true', async () => {
    let tree = render(<TestComboBox allowsEmptyCollection />);

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    act(() => {
      comboboxTester.combobox.focus();
    });
    await user.keyboard('p');

    let options = comboboxTester.options();
    expect(options).toHaveLength(1);
    expect(comboboxTester.listbox).toBeTruthy();
    expect(options[0]).toHaveTextContent('No results');
  });

  it.each(['keyboard', 'mouse'])('should support onAction with %s', async (interactionType) => {
    let onAction = jest.fn();
    function WithCreateOption() {
      let [inputValue, setInputValue] = useState('');

      return (
        <ComboBox
          allowsEmptyCollection
          inputValue={inputValue}
          onInputChange={setInputValue}>
          <Label style={{display: 'block'}}>Favorite Animal</Label>
          <div style={{display: 'flex'}}>
            <Input />
            <Button>
              <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
            </Button>
          </div>
          <Popover placement="bottom end">
            <ListBox>
              {inputValue.length > 0 && (
                <ListBoxItem onAction={onAction}>
                  {`Create "${inputValue}"`}
                </ListBoxItem>
              )}
              <ListBoxItem>Aardvark</ListBoxItem>
              <ListBoxItem>Cat</ListBoxItem>
              <ListBoxItem>Dog</ListBoxItem>
              <ListBoxItem>Kangaroo</ListBoxItem>
              <ListBoxItem>Panda</ListBoxItem>
              <ListBoxItem>Snake</ListBoxItem>
            </ListBox>
          </Popover>
        </ComboBox>
      );
    }

    let tree = render(<WithCreateOption />);
    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    act(() => {
      comboboxTester.combobox.focus();
    });

    await user.keyboard('L');

    let options = comboboxTester.options();
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Create "L"');

    if (interactionType === 'keyboard') {
      await user.keyboard('{ArrowDown}{Enter}');
    } else {
      await user.click(options[0]);
    }
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(comboboxTester.combobox).toHaveValue('');

    // Repeat with an option selected.
    await comboboxTester.selectOption({option: 'Cat'});

    await user.keyboard('s');

    options = comboboxTester.options();
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Create "Cats"');

    if (interactionType === 'keyboard') {
      await user.keyboard('{ArrowDown}{Enter}');
    } else {
      await user.click(options[0]);
    }
    expect(onAction).toHaveBeenCalledTimes(2);
    expect(comboboxTester.combobox).toHaveValue('Cat');
  });

  it('should not close the combobox when clicking on a section header', async () => {
    let tree = render(
      <ComboBox>
        <Label>Preferred fruit or vegetable</Label>
        <Input />
        <Button />
        <Popover>
          <ListBox>
            <ListBoxSection>
              <Header>Fruit</Header>
              <ListBoxItem id="Apple">Apple</ListBoxItem>
              <ListBoxItem id="Banana">Banana</ListBoxItem>
            </ListBoxSection>
            <ListBoxSection>
              <Header>Vegetable</Header>
              <ListBoxItem id="Cabbage">Cabbage</ListBoxItem>
              <ListBoxItem id="Broccoli">Broccoli</ListBoxItem>
            </ListBoxSection>
          </ListBox>
        </Popover>
      </ComboBox>
    );

    let comboboxTester = testUtilUser.createTester('ComboBox', {root: tree.container});
    let button = tree.getByRole('button');
    
    // Open the combobox
    await user.click(button);
    act(() => {
      jest.runAllTimers();
    });

    // Verify the listbox is open
    let listbox = tree.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(listbox).toBeVisible();

    // Find and click on a section header
    let fruitHeader = tree.getByText('Fruit');
    expect(fruitHeader).toBeInTheDocument();
    
    await user.click(fruitHeader);
    act(() => {
      jest.runAllTimers();
    });

    // Verify the listbox is still open
    listbox = tree.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(listbox).toBeVisible();

    // Verify we can still interact with options
    let options = comboboxTester.options();
    expect(options.length).toBeGreaterThan(0);
    
    // Click an option
    await user.click(options[0]);
    act(() => {
      jest.runAllTimers();
    });
    
    // Verify the combobox is closed and the value is updated
    expect(tree.queryByRole('listbox')).toBeNull();
    expect(comboboxTester.combobox).toHaveValue('Apple');
  });
});
