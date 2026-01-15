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

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button, FieldError, Form, Label, ListBox, ListBoxItem, ListBoxLoadMoreItem, Popover, Select, SelectContext, SelectStateContext, SelectValue, Text} from '../';
import React from 'react';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

let TestSelect = (props) => (
  <Select data-testid="select" data-foo="bar" {...props}>
    <Label>Favorite Animal</Label>
    <Button>
      <SelectValue />
    </Button>
    <Text slot="description">Description</Text>
    <Text slot="errorMessage">Error</Text>
    <Popover>
      <ListBox>
        <ListBoxItem id="cat">Cat</ListBoxItem>
        <ListBoxItem id="dog">Dog</ListBoxItem>
        <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
      </ListBox>
    </Popover>
  </Select>
);

describe('Select', () => {
  let user;
  let testUtilUser = new User();

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('provides slots', async () => {
    let {getByTestId} = render(<TestSelect />);
    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});

    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Select an item');
    expect(trigger).not.toHaveAttribute('data-pressed');

    expect(wrapper).toHaveAttribute('data-foo', 'bar');

    expect(trigger).toHaveAttribute('aria-labelledby');
    let label = document.getElementById(trigger.getAttribute('aria-labelledby').split(' ')[1]);
    expect(label).toHaveAttribute('class', 'react-aria-Label');
    expect(label).toHaveTextContent('Favorite Animal');

    let valueOrPlaceholder = document.getElementById(trigger.getAttribute('aria-labelledby').split(' ')[0]);
    expect(valueOrPlaceholder).toHaveAttribute('class', 'react-aria-SelectValue');
    expect(valueOrPlaceholder).toHaveTextContent('Select an item');

    expect(trigger).toHaveAttribute('aria-describedby');
    expect(trigger.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id).textContent).join(' ')).toBe('Description Error');

    await selectTester.open();

    expect(trigger).toHaveAttribute('data-pressed', 'true');
    let listbox = selectTester.listbox;
    expect(listbox).toHaveAttribute('class', 'react-aria-ListBox');
    expect(listbox.closest('.react-aria-Popover')).toBeInTheDocument();
    expect(listbox.closest('.react-aria-Popover')).toHaveAttribute('data-trigger', 'Select');

    let options = selectTester.options();
    expect(options).toHaveLength(3);

    await user.click(options[1]);
    expect(trigger).toHaveTextContent('Dog');
  });

  it('should support slot', () => {
    let {getByTestId} = render(
      <SelectContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestSelect slot="test" />
      </SelectContext.Provider>
    );

    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    let trigger = selectTester.trigger;
    expect(trigger.closest('.react-aria-Select')).toHaveAttribute('slot', 'test');
    expect(trigger).toHaveAttribute('aria-label', 'test');
  });

  it('supports items with render props', () => {
    let MyItem = (props) => (
      <ListBoxItem {...props}>
        {({isSelected}) => (
          <>
            {props.children}
            {isSelected ? ' (selected)' : ''}
          </>
        )}
      </ListBoxItem>
    );

    let {getByTestId} = render(
      <Select data-testid="select" defaultSelectedKey="cat">
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox>
            <MyItem id="cat">Cat</MyItem>
            <MyItem id="dog">Dog</MyItem>
            <MyItem id="kangaroo">Kangaroo</MyItem>
          </ListBox>
        </Popover>
      </Select>
    );

    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Cat');
  });

  it('supports custom select value', () => {
    let items = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'}
    ];

    let {getByTestId} = render(
      <Select data-testid="select" defaultSelectedKey={1}>
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue>
            {({selectedItem, selectedText}) => (
              <span>{selectedItem ? `${selectedItem.id} - ${selectedText}` : ''}</span>
            )}
          </SelectValue>
        </Button>
        <Popover>
          <ListBox items={items}>
            {item => <ListBoxItem>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </Select>
    );

    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('1 - Cat');
  });

  it('supports placeholder', () => {
    let {getByTestId} = render(<TestSelect placeholder="Select an animal" />);
    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Select an animal');
  });

  it('should support empty state', async () => {
    let {getByTestId, getByRole} = render(
      <Select data-testid="select" allowsEmptyCollection>
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox aria-label="Test" renderEmptyState={() => 'No results'}>
            {[]}
          </ListBox>
        </Popover>
      </Select>
    );
    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    await selectTester.open();

    let listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('data-empty', 'true');

    let option = getByRole('option');
    expect(option).toHaveTextContent('No results');
  });

  it('should support render props', async () => {
    let {getByTestId} = render(
      <Select data-testid="select">
        {({isOpen}) => (
          <>
            <Label>Favorite Animal</Label>
            <Button>
              <SelectValue />
              <span aria-hidden>{isOpen ? 'close' : 'open'}</span>
            </Button>
            <Popover>
              <ListBox>
                <ListBoxItem>Cat</ListBoxItem>
                <ListBoxItem>Dog</ListBoxItem>
                <ListBoxItem>Kangaroo</ListBoxItem>
              </ListBox>
            </Popover>
          </>
        )}
      </Select>
    );

    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('open');

    await selectTester.open();
    expect(trigger).toHaveTextContent('close');
  });

  it('should send disabled prop to the hidden field', () => {
    render(
      <TestSelect name="select" isDisabled />
    );

    let input = document.querySelector('[name=select]');
    expect(input).toBeDisabled();
  });

  it('should render data- attributes only on the outer element', () => {
    let {getAllByTestId} = render(<TestSelect data-testid="select-test" />);
    let outerEl = getAllByTestId('select-test');
    expect(outerEl).toHaveLength(1);
    expect(outerEl[0]).toHaveClass('react-aria-Select');
  });

  it('supports validation errors', async () => {
    let {getByTestId} = render(
      <form data-testid="form">
        <Select data-testid="test-select" name="select" isRequired>
          <Label>Favorite Animal</Label>
          <Button>
            <SelectValue />
          </Button>
          <FieldError />
          <Popover>
            <ListBox>
              <ListBoxItem>Cat</ListBoxItem>
              <ListBoxItem>Dog</ListBoxItem>
              <ListBoxItem>Kangaroo</ListBoxItem>
            </ListBox>
          </Popover>
        </Select>
      </form>
    );

    let wrapper = getByTestId('test-select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});
    let trigger = selectTester.trigger;
    let select = wrapper;
    let input = document.querySelector('[name=select]');
    expect(input).toHaveAttribute('required');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(input.validity.valid).toBe(false);
    expect(select).not.toHaveAttribute('data-invalid');

    act(() => {getByTestId('form').checkValidity();});

    expect(trigger).toHaveAttribute('aria-describedby');
    expect(document.getElementById(trigger.getAttribute('aria-describedby'))).toHaveTextContent('Constraints not satisfied');
    expect(select).toHaveAttribute('data-invalid');
    expect(document.activeElement).toBe(trigger);

    await selectTester.selectOption({option: 'Cat'});
    expect(selectTester.trigger).not.toHaveAttribute('aria-describedby');
    expect(select).not.toHaveAttribute('data-invalid');
  });

  it('should support falsy (0) as a valid default value', async () => {
    let {getByRole} = render(
      <Select placeholder="pick a number">
        <Label>Pick a number</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox
            items={Array.from({length: 5}).map((_, i) => ({
              id: i,
              label: i
            }))}>
            {(item) => <ListBoxItem id={item.id} textValue={`${item.label}`}>{item.label}</ListBoxItem>}
          </ListBox>
        </Popover>
      </Select>
    );

    let button = getByRole('button');
    await user.click(button);

    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    await user.click(options[0]);

    expect(button).toHaveTextContent('0');
  });

  it('should support extra children for use with the state', async () => {
    let onChangeSpy = jest.fn();

    function SelectClearButton() {
      let state = React.useContext(SelectStateContext);
      return (
        <Button
          data-testid="clear"
          // Don't inherit behavior from Select.
          slot={null}
          style={{fontSize: 'small', marginTop: 6, padding: 4}}
          onPress={() => state?.setSelectedKey(null)}>
          Clear
        </Button>
      );
    }

    let {getByTestId} = render(
      <>
        <input data-testid="before" />
        <Select onSelectionChange={onChangeSpy}>
          <Label>Favorite Animal</Label>
          <Button data-testid="select">
            <SelectValue />
            <span aria-hidden="true">▼</span>
          </Button>
          <SelectClearButton />
          <Popover>
            <ListBox>
              <ListBoxItem id="cat">Cat</ListBoxItem>
              <ListBoxItem id="dog">Dog</ListBoxItem>
              <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
            </ListBox>
          </Popover>
        </Select>
        <input data-testid="after" />
      </>
    );

    let beforeInput = getByTestId('before');
    let afterInput = getByTestId('after');
    let wrapper = getByTestId('select');
    let clearButton = getByTestId('clear');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});

    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(selectTester.trigger);

    await user.tab();
    expect(document.activeElement).toBe(clearButton);

    await user.tab();
    expect(document.activeElement).toBe(afterInput);

    await user.tab({shift: true});
    expect(document.activeElement).toBe(clearButton);

    await user.tab({shift: true});
    expect(document.activeElement).toBe(selectTester.trigger);

    await user.tab({shift: true});
    expect(document.activeElement).toBe(beforeInput);

    await user.tab();
    await selectTester.selectOption({option: 'Dog'});

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenLastCalledWith('dog');

    await user.click(clearButton);
    expect(onChangeSpy).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).toHaveBeenLastCalledWith(null);
  });

  it('select can select an option via keyboard', async function () {
    let {getByTestId} = render(
      <TestSelect name="select" />
    );

    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper, interactionType: 'keyboard'});
    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Select an item');
    expect(trigger).not.toHaveAttribute('data-pressed');

    await selectTester.selectOption({option: 'Kangaroo'});
    expect(trigger).toHaveTextContent('Kangaroo');
  });

  it('should not apply isPressed state to button when expanded and isTriggerUpWhenOpen is true', async () => {
    let {getByRole} = render(<TestSelect isTriggerUpWhenOpen />);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    await user.click(button);
    expect(button).not.toHaveAttribute('data-pressed');
  });

  describe('typeahead', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('can select an option via typeahead', async function () {
      let {getByTestId} = render(
        <Select data-testid="select">
          <Label>Favorite Animal</Label>
          <Button>
            <SelectValue />
          </Button>
          <Text slot="description">Description</Text>
          <Text slot="errorMessage">Error</Text>
          <Popover>
            <ListBox>
              <ListBoxItem>Australian Capital Territory</ListBoxItem>
              <ListBoxItem>New South Wales</ListBoxItem>
              <ListBoxItem>Northern Territory</ListBoxItem>
              <ListBoxItem>Queensland</ListBoxItem>
              <ListBoxItem>South Australia</ListBoxItem>
              <ListBoxItem>Tasmania</ListBoxItem>
              <ListBoxItem>Victoria</ListBoxItem>
              <ListBoxItem>Western Australia</ListBoxItem>
            </ListBox>
          </Popover>
        </Select>
      );

      let wrapper = getByTestId('select');
      await user.tab();
      await user.keyboard('Northern Terr');
      let selectTester = testUtilUser.createTester('Select', {root: wrapper, interactionType: 'keyboard'});
      let trigger = selectTester.trigger;
      expect(trigger).toHaveTextContent('Northern Territory');
      expect(trigger).not.toHaveAttribute('data-pressed');
    });
  });

  it('should support autoFocus', () => {
    let {getByTestId} = render(<TestSelect autoFocus />);
    let selectTester = testUtilUser.createTester('Select', {
      root: getByTestId('select')
    });
    let trigger = selectTester.trigger;
    expect(document.activeElement).toBe(trigger);
  });

  it('should clear contexts inside popover', async () => {
    let {getByTestId} = render(
      <Select data-testid="select" defaultSelectedKey="cat">
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover data-testid="popover">
          <Label>Hello</Label>
          <Button>Yo</Button>
          <Text>hi</Text>
          <ListBox>
            <ListBoxItem id="cat">Cat</ListBoxItem>
            <ListBoxItem id="dog">Dog</ListBoxItem>
            <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
    );

    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});

    await selectTester.open();

    let popover = await getByTestId('popover');
    let label = popover.querySelector('.react-aria-Label');
    expect(label).not.toHaveAttribute('for');

    let button = popover.querySelector('.react-aria-Button');
    expect(button).not.toHaveAttribute('aria-expanded');

    let text = popover.querySelector('.react-aria-Text');
    expect(text).not.toHaveAttribute('id');
  });

  it('shouldn\'t allow the user to open the select if there are no items', async function () {
    let {getByTestId, queryByTestId, rerender} = render(
      <Select data-testid="select" defaultSelectedKey="cat">
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover data-testid="popover">
          <Label>Hello</Label>
          <Button>Yo</Button>
          <Text>hi</Text>
          <ListBox>
            {[]}
          </ListBox>
        </Popover>
      </Select>
    );

    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});
    await user.click(selectTester.trigger);

    let popover = queryByTestId('popover');
    expect(popover).toBeFalsy();

    rerender(
      <Select data-testid="select" defaultSelectedKey="cat">
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover data-testid="popover">
          <Label>Hello</Label>
          <Button>Yo</Button>
          <Text>hi</Text>
          <ListBox>
            <ListBoxLoadMoreItem isLoading>
              Loading more
            </ListBoxLoadMoreItem>
          </ListBox>
        </Popover>
      </Select>
    );

    await user.click(selectTester.trigger);
    popover = queryByTestId('popover');
    expect(popover).toBeFalsy();
  });

  it('should support form prop', () => {
    render(
      <TestSelect name="select" form="test" />
    );

    let input = document.querySelector('[name=select]');
    expect(input).toHaveAttribute('form', 'test');
  });

  it('should not submit if required and selectedKey is null', async () => {
    const onSubmit = jest.fn().mockImplementation(e => e.preventDefault());

    function Test() {
      const [selectedKey, setSelectedKey] = React.useState(null);
      return (
        <Form onSubmit={onSubmit}>
          <TestSelect
            isRequired
            name="select"
            selectedKey={selectedKey}
            onSelectionChange={setSelectedKey} />
          <Button data-testid="submit" type="submit">
            Submit
          </Button>
          <Button data-testid="clear" onPress={() => setSelectedKey(null)}>
            Reset
          </Button>
        </Form>
      );
    }

    const {getByTestId} = render(<Test />);
    const wrapper = getByTestId('select');
    const selectTester = testUtilUser.createTester('Select', {root: wrapper});
    const trigger = selectTester.trigger;
    const submit = getByTestId('submit');

    expect(trigger).toHaveTextContent('Select an item');
    await selectTester.selectOption({option: 'Cat'});
    expect(trigger).toHaveTextContent('Cat');
    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.click(getByTestId('clear'));
    expect(trigger).toHaveTextContent('Select an item');
    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[name=select]').value).toBe('');
  });

  it('should support multiple selection', async () => {
    let onChange = jest.fn();
    let {getByTestId} = render(
      <Form data-testid="form">
        <TestSelect name="select" selectionMode="multiple" onChange={onChange} />
      </Form>
    );
    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});

    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Select an item');

    await selectTester.open();

    let listbox = selectTester.listbox;
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');

    let options = selectTester.options();
    expect(options).toHaveLength(3);

    await user.click(options[0]);
    await user.click(options[1]);
    expect(trigger).toHaveTextContent('Cat and Dog');
    await selectTester.close();

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(['cat', 'dog']);

    let formData = new FormData(getByTestId('form'));
    expect(formData.getAll('select')).toEqual(['cat', 'dog']);
  });

  it('should support multiple selection form integration with many items', async () => {
    let items = [];
    for (let i = 0; i < 320; i++) {
      items.push({id: i, name: 'item' + i});
    }

    let {getByTestId} = render(
      <Form data-testid="form" onSubmit={e => e.preventDefault()}>
        <Select data-testid="select" name="select" selectionMode="multiple" isRequired>
          <Label>Select</Label>
          <Button>
            <SelectValue />
          </Button>
          <FieldError />
          <Popover>
            <ListBox items={items}>
              {item => <ListBoxItem>{item.name}</ListBoxItem>}
            </ListBox>
          </Popover>
        </Select>
        <Button data-testid="submit" type="submit">Submit</Button>
      </Form>
    );
    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});

    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Select an item');

    let submit = getByTestId('submit');
    await user.click(submit);

    let fieldError = document.querySelector('.react-aria-FieldError');
    expect(fieldError).toHaveTextContent('Constraints not satisfied');

    await selectTester.open();

    let options = selectTester.options();
    await user.click(options[0]);
    await user.click(options[1]);
    await selectTester.close();
    expect(trigger).toHaveTextContent('item0 and item1');

    let formData = new FormData(getByTestId('form'));
    expect(formData.getAll('select')).toEqual(['0', '1']);

    await user.click(submit);
    fieldError = document.querySelector('.react-aria-FieldError');
    expect(fieldError).toBe(null);
  });

  it('should support controlled multi-selection', async () => {
    let {getByTestId} = render(<TestSelect selectionMode="multiple" value={['dog', 'kangaroo']} />);

    let wrapper = getByTestId('select');
    let selectTester = testUtilUser.createTester('Select', {root: wrapper});

    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Dog and Kangaroo');

    await selectTester.open();

    let options = selectTester.options();
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
  });

  it('supports custom select value with multi-selection', async () => {
    let items = [
      {id: 1, name: 'Cat'},
      {id: 2, name: 'Dog'}
    ];

    let {getByTestId} = render(
      <Select data-testid="select" selectionMode="multiple" defaultValue={[1]}>
        <Label>Favorite Animal</Label>
        <Button>
          <SelectValue>
            {({selectedItems}) => (
              selectedItems.length === 1 ? selectedItems[0]?.name : `${selectedItems.length} selected items`
            )}
          </SelectValue>
        </Button>
        <Popover>
          <ListBox items={items}>
            {item => <ListBoxItem>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </Select>
    );

    let selectTester = testUtilUser.createTester('Select', {root: getByTestId('select')});
    let trigger = selectTester.trigger;
    expect(trigger).toHaveTextContent('Cat');

    await selectTester.selectOption({option: 'Dog'});
    expect(trigger).toHaveTextContent('2 selected items');
  });
});
