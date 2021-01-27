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

jest.mock('@react-aria/live-announcer');
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {announce} from '@react-aria/live-announcer';
import {Button} from '@react-spectrum/button';
import {ComboBox, Item, Section} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import {typeText} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

let onSelectionChange = jest.fn();
let onOpenChange = jest.fn();
let onInputChange = jest.fn();
let outerBlur = jest.fn();
let onFocus = jest.fn();
let onBlur = jest.fn();

let defaultProps = {
  label: 'Test',
  placeholder: 'Select a topic...',
  onSelectionChange,
  onOpenChange,
  onInputChange,
  onFocus,
  onBlur
};

const ExampleComboBox = React.forwardRef((props = {}, ref) => (
  <Provider theme={theme}>
    <ComboBox {...defaultProps} {...props} ref={ref}>
      <Item key="1">One</Item>
      <Item key="2">Two</Item>
      <Item key="3">Three</Item>
    </ComboBox>
  </Provider>
  ));

function renderComboBox(props = {}) {
  return render(<ExampleComboBox {...props} />);
}

function renderSectionComboBox(props = {}) {
  return render(
    <Provider theme={theme}>
      <ComboBox {...defaultProps} {...props}>
        <Section title="Section One" key="section 1">
          <Item key="1">One</Item>
          <Item key="2">Two</Item>
          <Item key="3">Three</Item>
        </Section>
        <Section title="Section Two" key="section 2">
          <Item key="4">Four</Item>
          <Item key="5">Five</Item>
          <Item key="6">Six</Item>
        </Section>
      </ComboBox>
    </Provider>
  );
}

function testComboBoxOpen(combobox, button, listbox, focusedItemIndex) {
  let buttonId = button.id;
  let comboboxLabelledBy = combobox.getAttribute('aria-labelledby');

  expect(listbox).toBeVisible();
  expect(listbox).toHaveAttribute('aria-label', 'Suggestions');
  expect(listbox).toHaveAttribute('aria-labelledby', `${comboboxLabelledBy} ${listbox.id}`);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(button).toHaveAttribute('aria-controls', listbox.id);
  expect(button).toHaveAttribute('aria-label', 'Show suggestions');
  expect(button).toHaveAttribute('aria-labelledby', `${comboboxLabelledBy} ${buttonId}`);
  expect(combobox).toHaveAttribute('aria-controls', listbox.id);
  expect(combobox).toHaveAttribute('aria-expanded', 'true');

  let items = within(listbox).getAllByRole('option');
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent('One');
  expect(items[1]).toHaveTextContent('Two');
  expect(items[2]).toHaveTextContent('Three');

  expect(listbox).not.toHaveAttribute('tabIndex');
  for (let item of items) {
    expect(item).not.toHaveAttribute('tabIndex');
  }

  expect(document.activeElement).toBe(combobox);

  if (typeof focusedItemIndex === 'undefined') {
    expect(combobox).not.toHaveAttribute('aria-activedescendant');

    act(() => {
      fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      jest.runAllTimers();
    });

    expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
  } else {
    expect(combobox).toHaveAttribute('aria-activedescendant', items[focusedItemIndex].id);
  }
}

describe('ComboBox', function () {
  beforeAll(function () {
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(cb, 0));
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  it('renders correctly', function () {
    let {getAllByText, getByRole} = renderComboBox();

    let combobox = getByRole('combobox');
    expect(combobox).toHaveAttribute('placeholder', 'Select a topic...');
    expect(combobox).toHaveAttribute('autoCorrect', 'off');
    expect(combobox).toHaveAttribute('spellCheck', 'false');
    expect(combobox).toHaveAttribute('autoComplete', 'off');

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox'); // i think we really want 'listbox'?

    let label = getAllByText('Test')[0];
    expect(label).toBeVisible();
  });

  it('can be disabled', function () {
    let {getByRole} = renderComboBox({isDisabled: true});

    let combobox = getByRole('combobox');
    typeText(combobox, 'One');
    act(() => {
      jest.runAllTimers();
    });

    expect(() => getByRole('listbox')).toThrow();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onFocus).not.toHaveBeenCalled();

    act(() => {
      fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      jest.runAllTimers();
    });

    expect(() => getByRole('listbox')).toThrow();
    expect(onOpenChange).not.toHaveBeenCalled();

    let button = getByRole('button');
    act(() => {
      triggerPress(button);
      jest.runAllTimers();
    });

    expect(() => getByRole('listbox')).toThrow();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onInputChange).not.toHaveBeenCalled();
  });

  it('can be readonly', function () {
    let {getByRole} = renderComboBox({isReadOnly: true, defaultInputValue: 'Blargh'});

    let combobox = getByRole('combobox');
    typeText(combobox, 'One');
    act(() => {
      jest.runAllTimers();
    });

    expect(() => getByRole('listbox')).toThrow();
    expect(combobox.value).toBe('Blargh');
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalled();

    act(() => {
      fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      jest.runAllTimers();
    });

    expect(() => getByRole('listbox')).toThrow();
    expect(onOpenChange).not.toHaveBeenCalled();

    let button = getByRole('button');
    act(() => {
      triggerPress(button);
      jest.runAllTimers();
    });

    expect(() => getByRole('listbox')).toThrow();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onInputChange).not.toHaveBeenCalled();
  });

  it('features default behavior of completionMode suggest and menuTrigger input', function () {
    let {getByRole} = renderComboBox();

    let combobox = getByRole('combobox');
    expect(combobox).not.toHaveAttribute('aria-controls');
    expect(combobox).not.toHaveAttribute('aria-activedescendant');
    expect(combobox).toHaveAttribute('aria-autocomplete', 'list');

    typeText(combobox, 'On');
    act(() => {
      jest.runAllTimers();
    });

    let listbox = getByRole('listbox');

    let items = within(listbox).getAllByRole('option');
    expect(items).toHaveLength(1);

    expect(combobox.value).toBe('On');
    expect(items[0]).toHaveTextContent('One');
    expect(combobox).toHaveAttribute('aria-controls', listbox.id);
    expect(combobox).not.toHaveAttribute('aria-activedescendant');

    act(() => {
      fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      jest.runAllTimers();
    });

    expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
  });

  describe('refs', function () {
    it('attaches a ref to the label wrapper', function () {
      let ref = React.createRef();
      let {getByText} = renderComboBox({ref});

      expect(ref.current.UNSAFE_getDOMNode()).toBe(getByText('Test').parentElement);
    });

    it('attaches a ref to the combobox wrapper if no label', function () {
      let ref = React.createRef();
      let {getByRole} = renderComboBox({ref, label: null, 'aria-label': 'test'});

      expect(ref.current.UNSAFE_getDOMNode()).toBe(getByRole('combobox').parentElement.parentElement);
    });

    it('calling focus() on the ref focuses the input field', function () {
      let ref = React.createRef();
      let {getByRole} = renderComboBox({ref});

      act(() => {ref.current.focus();});
      expect(document.activeElement).toBe(getByRole('combobox'));
    });
  });

  describe('opening', function () {
    describe('menuTrigger = focus', function () {
      it('opens menu when combobox is focused', function () {
        let {getByRole} = renderComboBox({menuTrigger: 'focus'});

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        act(() => {
          combobox.focus();
          jest.runAllTimers();
        });
        expect(onOpenChange).toHaveBeenLastCalledWith(true);

        let listbox = getByRole('listbox');
        expect(onOpenChange).toBeCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        testComboBoxOpen(combobox, button, listbox);
      });
    });

    describe('via isOpen and defaultOpen', function () {
      it('has a controlled open state via isOpen', function () {
        let {getByRole} = renderComboBox({isOpen: true});

        let combobox = getByRole('combobox');
        act(() => {
          combobox.focus();
          jest.runAllTimers();
        });

        expect(combobox).toHaveAttribute('aria-expanded', 'true');
        expect(combobox).toHaveAttribute('aria-controls');

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(onOpenChange).toBeCalledTimes(0);

        fireEvent.keyDown(combobox, {key: 'Escape'});
        act(() => {
          jest.runAllTimers();
        });

        expect(listbox).toBeVisible();
        expect(onOpenChange).toBeCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(false);

        expect(combobox).toHaveAttribute('aria-expanded', 'true');
        expect(combobox).toHaveAttribute('aria-controls');
      });

      it('has an uncontrolled open state via defaultOpen', function () {
        let {getByRole} = renderComboBox({defaultOpen: true});

        let combobox = getByRole('combobox');
        act(() => {
          combobox.focus();
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(onOpenChange).toBeCalledTimes(0);

        fireEvent.keyDown(combobox, {key: 'Escape'});
        act(() => {
          jest.runAllTimers();
        });

        expect(listbox).not.toBeInTheDocument();
        expect(onOpenChange).toBeCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(false);

        expect(combobox).toHaveAttribute('aria-expanded', 'false');
        expect(combobox).not.toHaveAttribute('aria-controls');
      });
    });

    describe('button click', function () {
      it('keeps focus within the textfield after opening the menu', function () {
        let {getByRole} = renderComboBox();

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        expect(() => getByRole('listbox')).toThrow();

        act(() => {
          combobox.focus();
          triggerPress(button);
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeTruthy();
        expect(document.activeElement).toBe(combobox);

        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(() => getByRole('listbox')).toThrow();
      });

      it('doesn\'t focus first item if there are items loaded', function () {
        let {getByRole} = renderComboBox();

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(onOpenChange).toHaveBeenCalledWith(true);

        let listbox = getByRole('listbox');
        testComboBoxOpen(combobox, button, listbox);
      });

      it('opens for touch', () => {
        let {getByRole} = renderComboBox({});

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        expect(document.activeElement).not.toBe(combobox);

        act(() => {
          fireEvent.touchStart(button, {targetTouches: [{identifier: 1}]});
          fireEvent.touchEnd(button, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(combobox);
        let listbox = getByRole('listbox');
        expect(listbox).toBeTruthy();
        expect(document.activeElement).toBe(combobox);

        act(() => {
          fireEvent.touchStart(button, {targetTouches: [{identifier: 1}]});
          fireEvent.touchEnd(button, {changedTouches: [{identifier: 1, clientX: 0, clientY: 0}]});
          jest.runAllTimers();
        });

        expect(() => getByRole('listbox')).toThrow();
      });

      it('resets the focused item when re-opening the menu', function () {
        let {getByRole} = renderComboBox({});

        let button = getByRole('button');
        let combobox = getByRole('combobox');

        act(() => {
          combobox.focus();
          triggerPress(button);
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        let items = within(listbox).getAllByRole('option');
        expect(combobox).not.toHaveAttribute('aria-activedescendant');

        act(() => {
          userEvent.click(items[0]);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('One');

        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        listbox = getByRole('listbox');
        expect(combobox).not.toHaveAttribute('aria-activedescendant');
      });
    });

    describe('keyboard input', function () {
      it('opens the menu on down arrow press', function () {
        let {getByRole} = renderComboBox();

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        act(() => {combobox.focus();});
        expect(() => getByRole('listbox')).toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
          fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(onOpenChange).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        testComboBoxOpen(combobox, button, listbox, 0);
      });

      it('opens the menu on up arrow press', function () {
        let {getByRole} = renderComboBox();

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        act(() => {combobox.focus();});
        expect(() => getByRole('listbox')).toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();

        act(() => {
          fireEvent.keyDown(combobox, {key: 'ArrowUp', code: 38, charCode: 38});
          fireEvent.keyUp(combobox, {key: 'ArrowUp', code: 38, charCode: 38});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(onOpenChange).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        testComboBoxOpen(combobox, button, listbox, 2);
      });

      it('opens the menu on user typing', function () {
        let {getByRole} = renderComboBox();

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        act(() => {combobox.focus();});
        expect(() => getByRole('listbox')).toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();

        typeText(combobox, 'Two');
        act(() => {
          jest.runAllTimers();
        });

        expect(onOpenChange).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(button).toHaveAttribute('aria-controls', listbox.id);
        expect(combobox).toHaveAttribute('aria-controls', listbox.id);
        expect(combobox).toHaveAttribute('aria-expanded', 'true');

        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent('Two');

        expect(document.activeElement).toBe(combobox);
        expect(combobox).not.toHaveAttribute('aria-activedescendant');
        expect(onSelectionChange).not.toHaveBeenCalled();
      });

      it('doesn\'t select an item on matching input if it is a disabled key', function () {
        let {getByRole} = renderComboBox({disabledKeys: ['2']});
        let combobox = getByRole('combobox');
        act(() => {combobox.focus();});
        expect(onOpenChange).not.toHaveBeenCalled();
        typeText(combobox, 'Two');

        act(() => {
          jest.runAllTimers();
        });

        expect(onOpenChange).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();

        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent('Two');

        expect(document.activeElement).toBe(combobox);
        expect(combobox).not.toHaveAttribute('aria-activedescendant');
        expect(onSelectionChange).not.toHaveBeenCalled();
      });

      it('closes the menu if there are no matching items', function () {
        let {getByRole} = renderComboBox();

        let button = getByRole('button');
        let combobox = getByRole('combobox');
        expect(onOpenChange).not.toHaveBeenCalled();
        act(() => {combobox.focus();});
        typeText(combobox, 'One');
        act(() => jest.runAllTimers());

        expect(onOpenChange).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);

        let listbox = getByRole('listbox');
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);

        typeText(combobox, 'z');
        act(() => jest.runAllTimers());
        expect(() => getByRole('listbox')).toThrow();
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).not.toHaveAttribute('aria-controls');
        expect(combobox).not.toHaveAttribute('aria-controls');
        expect(combobox).toHaveAttribute('aria-expanded', 'false');
      });

      it('doesn\'t open the menu on user typing if menuTrigger=manual', function () {
        let {getByRole} = renderComboBox({menuTrigger: 'manual'});

        let combobox = getByRole('combobox');
        // Need to focus and skip click so combobox doesn't open for virtual click
        act(() => combobox.focus());
        typeText(combobox, 'One', {skipClick: true});
        act(() => {
          jest.runAllTimers();
        });

        expect(() => getByRole('listbox')).toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();

        let button = getByRole('button');
        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(onOpenChange).toHaveBeenCalledTimes(1);
        expect(onOpenChange).toHaveBeenCalledWith(true);

        let listbox = getByRole('listbox');
        expect(listbox).toBeTruthy();
      });

      it('doesn\'t open the menu if no items match', function () {
        let {getByRole} = renderComboBox();

        let combobox = getByRole('combobox');
        act(() => combobox.focus());
        typeText(combobox, 'X', {skipClick: true});
        act(() => {
          jest.runAllTimers();
        });

        expect(() => getByRole('listbox')).toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();
      });

      it('doesn\'t open the menu if both isOpen and inputValue are controlled', function () {
        let {getByRole} = renderComboBox({isOpen: false, inputValue: ''});

        let combobox = getByRole('combobox');
        act(() => combobox.focus());
        typeText(combobox, 'One', {skipClick: true});
        act(() => {
          jest.runAllTimers();
        });

        expect(() => getByRole('listbox')).toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();
      });

      it('doesn\'t close the menu when there are no matching items if isOpen and items are controlled', function () {
        let Test = (props) => (
          <Provider theme={theme}>
            <ComboBox label="Combobox" {...props}>
              {item => <Item>{item.name}</Item>}
            </ComboBox>
          </Provider>
        );

        let {getByRole, rerender} = render(
          <Test isOpen items={[{id: 1, name: 'One'}]} />
        );

        act(() => {
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);

        rerender(<Test isOpen items={[]} />);

        act(() => {
          jest.runAllTimers();
        });

        act(() => jest.runAllTimers());
        expect(() => getByRole('listbox')).not.toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();
      });

      it('doesn\'t close the menu on selection isOpen and selectedKey are controlled', function () {
        let {getByRole} = render(<ExampleComboBox isOpen selectedKey="1" />);

        let combobox = getByRole('combobox');
        act(() => {
          combobox.focus();
          fireEvent.change(combobox, {target: {value: ''}});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(3);

        act(() => {
          triggerPress(items[1]);
          jest.runAllTimers();
        });

        expect(() => getByRole('listbox')).not.toThrow();
        expect(onOpenChange).not.toHaveBeenCalled();
      });
    });
  });
  describe('showing menu', function () {
    it('doesn\'t moves to selected key', function () {
      let {getByRole} = renderComboBox({selectedKey: '2'});

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');

      let items = within(listbox).getAllByRole('option');

      expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
      expect(items[0]).toHaveTextContent('Two');
    });

    it('keeps the menu open if the user clears the input field if menuTrigger = focus', function () {
      let {getByRole} = renderComboBox({menuTrigger: 'focus'});

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      typeText(combobox, 'Two');
      act(() => {
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(listbox).toBeVisible();
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', listbox.id);
      expect(combobox).toHaveAttribute('aria-controls', listbox.id);
      expect(combobox).toHaveAttribute('aria-expanded', 'true');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
    });

    it('allows the user to navigate the menu via arrow keys', function () {
      let {getByRole} = renderComboBox();

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');

      expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[1].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowUp', code: 38, charCode: 38});
        fireEvent.keyUp(combobox, {key: 'ArrowUp', code: 38, charCode: 38});
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
    });

    it('allows the user to select an item via Enter', function () {
      let {getByRole} = renderComboBox();

      let button = getByRole('button');
      let combobox = getByRole('combobox');
      expect(combobox.value).toBe('');
      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');

      expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'Enter', code: 13, charCode: 13});
        fireEvent.keyUp(combobox, {key: 'Enter', code: 13, charCode: 13});
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(combobox.value).toBe('One');
      expect(onSelectionChange).toHaveBeenCalledWith('1');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it('closes menu and resets selected key if allowsCustomValue=true and no item is focused', function () {
      let {getByRole, rerender} = render(<ExampleComboBox allowsCustomValue selectedKey="2" />);

      let combobox = getByRole('combobox');
      act(() => combobox.focus());
      act(() => {
        fireEvent.change(combobox, {target: {value: 'On'}});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeTruthy();

      expect(document.activeElement).toBe(combobox);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');

      act(() => {
        fireEvent.keyDown(combobox, {key: 'Enter', code: 13, charCode: 13});
        fireEvent.keyUp(combobox, {key: 'Enter', code: 13, charCode: 13});
        jest.runAllTimers();
      });

      // ComboBox menu doesn't close here since selectedKey is controlled and hasn't changed
      expect(() => getByRole('listbox')).not.toThrow();
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(null);
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      // Update the selectedKey prop, which triggers closing the menu.
      rerender(<ExampleComboBox allowsCustomValue selectedKey="1" />);

      act(() => {
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(null);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('doesn\'t focus the first key if the previously focused key is filtered out of the list', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, 'O');
      act(() => {
        jest.runAllTimers();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(2);
      expect(combobox).toHaveAttribute('aria-activedescendant', items[1].id);
      expect(items[1].textContent).toBe('Two');

      typeText(combobox, 'n');
      act(() => {
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(combobox.value).toBe('On');
      expect(items).toHaveLength(1);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
      expect(items[0].textContent).toBe('One');
    });

    it('closes menu when pressing Enter on an already selected item', function () {
      let {getByRole} = renderComboBox({selectedKey: '2'});

      let combobox = getByRole('combobox');
      act(() => combobox.focus());
      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeTruthy();

      act(() => {
        fireEvent.keyDown(combobox, {key: 'Enter', code: 13, charCode: 13});
        fireEvent.keyUp(combobox, {key: 'Enter', code: 13, charCode: 13});
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('does not close the menu on selection if isOpen is controlled', function () {
      let {getByRole} = renderComboBox({isOpen: true});

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');

      act(() => {
        triggerPress(items[1]);
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).not.toThrow();
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('2');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe('typing in the textfield', function () {
    it('can be uncontrolled', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" onOpenChange={onOpenChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
        </Provider>
      );

      let combobox = getByRole('combobox');
      typeText(combobox, 'Bul');

      expect(onOpenChange).toHaveBeenCalled();
    });

    it('can be controlled', function () {
      let {getByRole} = renderComboBox({inputValue: 'blah'});

      let combobox = getByRole('combobox');
      expect(combobox.value).toBe('blah');
      typeText(combobox, 'a');

      expect(combobox.value).toBe('blah');
      expect(onInputChange).toBeCalledTimes(1);
      expect(onInputChange).toHaveBeenCalledWith('blaha');
    });

    it('can select by mouse', function () {
      let onSelectionChange = jest.fn();
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" onOpenChange={onOpenChange} onSelectionChange={onSelectionChange}>
            <Item key="1">Cheer</Item>
            <Item key="2">Cheerio</Item>
            <Item key="3">Cheeriest</Item>
          </ComboBox>
        </Provider>
      );

      let combobox = getByRole('combobox');
      typeText(combobox, 'Che');

      act(() => {
        jest.runAllTimers();
      });

      expect(onOpenChange).toHaveBeenCalled();

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      act(() => {
        triggerPress(items[1]);
        jest.runAllTimers();
      });
      expect(onSelectionChange).toHaveBeenCalledWith('2');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it('filters combobox items using contains strategy', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, 'o');

      act(() => {
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      expect(combobox).toHaveAttribute('aria-controls', listbox.id);

      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
    });

    it('should not match any items if input is just a space', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, ' ');

      act(() => {
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
    });

    it('doesn\'t focus the first item in combobox menu if you completely clear your textfield and menuTrigger = focus', function () {
      let {getByRole} = renderComboBox({menuTrigger: 'focus'});

      let combobox = getByRole('combobox');
      typeText(combobox, 'o');
      act(() => {
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();

      let items = within(listbox).getAllByRole('option');
      expect(combobox).not.toHaveAttribute('aria-activedescendant');

      act(() => {
        userEvent.clear(combobox);
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(listbox).toBeVisible();
      expect(items).toHaveLength(3);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
    });

    it('doesn\'t closes the menu if you completely clear your textfield and menuTrigger != focus', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, 'o');

      act(() => {
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
    });

    it('clears prior item focus when input no longer matches existing value if allowsCustomValue is true', function () {
      let {getByRole} = renderComboBox({allowsCustomValue: true});
      let combobox = getByRole('combobox');
      // Change input value to something matching a combobox value
      act(() => {
        combobox.focus();
        fireEvent.change(combobox, {target: {value: 'Two'}});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      expect(listbox).toBeVisible();
      expect(items).toHaveLength(1);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
      expect(items[0].textContent).toBe('Two');

      // Change input text to something that doesn't match any combobox items but still shows the menu
      act(() => {
        combobox.focus();
        fireEvent.change(combobox, {target: {value: 'Tw'}});
        jest.runAllTimers();
      });

      // check that no item is focused in the menu
      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(listbox).toBeVisible();
      expect(items).toHaveLength(1);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
      expect(items[0].textContent).toBe('Two');
    });

    it('should close the menu when no items match', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, 'O');

      act(() => {
        jest.runAllTimers();
      });

      expect(getByRole('listbox')).toBeVisible();
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);

      typeText(combobox, 'x');

      act(() => {
        combobox.focus();
        fireEvent.change(combobox, {target: {value: 'x'}});
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should clear the focused item when typing', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, 'w');

      act(() => {
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown'});
        fireEvent.keyUp(combobox, {key: 'ArrowDown'});
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      typeText(combobox, 'o');

      items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);
      expect(combobox).not.toHaveAttribute('aria-activedescendant');
    });
  });

  describe('blur', function () {
    it('closes and commits selection on tab', function () {
      let {queryByRole, getAllByRole, getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" onOpenChange={onOpenChange} onInputChange={onInputChange} onSelectionChange={onSelectionChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Focus move</Button>
        </Provider>
      );

      let button = getAllByRole('button')[0];
      let secondaryButton = getAllByRole('button')[1];
      let combobox = getByRole('combobox');
      act(() => {
        userEvent.click(button);
        jest.runAllTimers();
      });
      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });
      act(() => {
        userEvent.tab();
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(secondaryButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSelectionChange).toHaveBeenCalledWith('1');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onInputChange).toHaveBeenCalledWith('Bulbasaur');
      expect(queryByRole('listbox')).toBeFalsy();
    });

    it('closes and commits custom value', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" allowsCustomValue selectedKey="2" onOpenChange={onOpenChange} onSelectionChange={onSelectionChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(onSelectionChange).not.toHaveBeenCalled();
      act(() => {
        userEvent.click(combobox);
        jest.runAllTimers();
      });
      act(() => {
        fireEvent.change(combobox, {target: {value: 'Bulba'}});
        jest.runAllTimers();
        combobox.blur();
        jest.runAllTimers();
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(null);

      expect(() => getByRole('listbox')).toThrow();
    });

    it('clears the input field if value doesn\'t match a combobox option and no item is focused (menuTrigger=manual case)', function () {
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" menuTrigger="manual" onOpenChange={onOpenChange} onSelectionChange={onSelectionChange} onInputChange={onInputChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Focus move</Button>
        </Provider>
      );

      let combobox = getByRole('combobox');
      let secondaryButton = getAllByRole('button')[1];

      // Need to focus and skip click so combobox doesn't open for virtual click
      act(() => combobox.focus());
      typeText(combobox, 'Charm', {skipClick: true});
      act(() => {
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(combobox.value).toBe('Charm');

      act(() => {
        userEvent.tab();
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(secondaryButton);
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onInputChange).toHaveBeenCalledWith('');
      expect(combobox.value).toBe('');
    });

    it('clears the input field if value matches a disabled combobox option', function () {
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" disabledKeys={['3']} onOpenChange={onOpenChange} onSelectionChange={onSelectionChange} onInputChange={onInputChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Focus move</Button>
        </Provider>
      );

      let combobox = getByRole('combobox');
      let secondaryButton = getAllByRole('button')[1];

      typeText(combobox, 'Charmander');

      act(() => {
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('Charmander');

      act(() => {
        userEvent.tab();
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(secondaryButton);
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onInputChange).toHaveBeenCalledWith('');
      expect(combobox.value).toBe('');
    });

    it('input field doesn\'t lose focus when user mouse downs on a menu item', function () {
      let {getByRole} = renderComboBox({});
      let combobox = getByRole('combobox');
      let button = getByRole('button');

      act(() => {
        combobox.focus();
        triggerPress(button);
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(combobox);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');

      act(() => {
        fireEvent.mouseDown(items[0]);
        jest.runAllTimers();
      });

      expect(onInputChange).not.toHaveBeenCalled();
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      expect(combobox.value).toBe('');
      expect(document.activeElement).toBe(combobox);
      expect(listbox).toBeVisible();

      act(() => {
        fireEvent.mouseUp(items[0]);
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('One');
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onInputChange).toHaveBeenCalledWith('One');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('1');
      expect(document.activeElement).toBe(combobox);
      expect(onBlur).not.toBeCalled();
    });

    it('tab and shift tab move focus away from the combobox and select the focused item', function () {
      let {getByRole, getAllByRole} = render(
        <Provider theme={theme}>
          <Button variant="secondary">Shift tab move</Button>
          <ComboBox label="Test" onSelectionChange={onSelectionChange} onInputChange={onInputChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
          <Button variant="secondary">Tab move</Button>
        </Provider>
      );

      let combobox = getByRole('combobox');
      let shiftTabButton = getAllByRole('button')[0];
      let comboboxButton = getAllByRole('button')[1];
      let tabButton = getAllByRole('button')[2];
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onInputChange).not.toHaveBeenCalled();
      expect(combobox.value).toBe('');

      act(() => {
        combobox.focus();
        triggerPress(comboboxButton);
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(combobox);
      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let items = within(listbox).getAllByRole('option');
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
      expect(items[0]).toHaveTextContent('Bulbasaur');

      act(() => {
        userEvent.tab();
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(onInputChange).toHaveBeenLastCalledWith('Bulbasaur');
      expect(onSelectionChange).toHaveBeenLastCalledWith('1');
      expect(combobox.value).toBe('Bulbasaur');
      expect(document.activeElement).toBe(tabButton);

      act(() => {
        combobox.focus();
        fireEvent.change(combobox, {target: {value: 'B'}});
        jest.runAllTimers();
      });

      expect(onInputChange).toHaveBeenLastCalledWith('B');
      expect(combobox.value).toBe('B');
      expect(document.activeElement).toBe(combobox);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      items = within(listbox).getAllByRole('option');
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
      expect(items[0]).toHaveTextContent('Bulbasaur');

      act(() => {
        userEvent.tab({shift: true});
        jest.runAllTimers();
      });

      expect(onInputChange).toHaveBeenLastCalledWith('Bulbasaur');
      expect(onSelectionChange).toHaveBeenLastCalledWith('1');
      expect(combobox.value).toBe('Bulbasaur');
      expect(() => getByRole('listbox')).toThrow();
      expect(document.activeElement).toBe(shiftTabButton);
    });

    it('doesn\'t select the focused item on blur', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <ComboBox label="Test" onSelectionChange={onSelectionChange} onInputChange={onInputChange}>
            <Item key="1">Bulbasaur</Item>
            <Item key="2">Squirtle</Item>
            <Item key="3">Charmander</Item>
          </ComboBox>
        </Provider>
      );

      let combobox = getByRole('combobox');
      let comboboxButton = getByRole('button');
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(onInputChange).not.toHaveBeenCalled();
      expect(combobox.value).toBe('');

      act(() => {
        combobox.focus();
        userEvent.click(comboboxButton);
        jest.runAllTimers();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });

      expect(document.activeElement).toBe(combobox);
      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);
      expect(items[0]).toHaveTextContent('Bulbasaur');

      act(() => {
        combobox.blur();
        jest.runAllTimers();
      });

      expect(() => getByRole('listbox')).toThrow();
      expect(onInputChange).not.toHaveBeenCalled();
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(combobox.value).toBe('');
    });

    it('propagates blur event outside of the component', function () {
      let {getByRole} = render(
        <Provider theme={theme}>
          <div onBlur={outerBlur}>
            <ComboBox label="Test" autoFocus onBlur={onBlur}>
              <Item key="1">Bulbasaur</Item>
              <Item key="2">Squirtle</Item>
              <Item key="3">Charmander</Item>
            </ComboBox>
            <Button variant="primary">Second focus</Button>
          </div>
        </Provider>
      );

      let combobox = getByRole('combobox');
      expect(document.activeElement).toBe(combobox);

      expect(onBlur).toHaveBeenCalledTimes(0);
      expect(outerBlur).toHaveBeenCalledTimes(0);

      act(() => {
        userEvent.tab();
      });

      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(outerBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('clears selection', function () {
    it('if user deletes all text in input (uncontrolled)', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      let button = getByRole('button');
      typeText(combobox, 'o');

      act(() => {
        jest.runAllTimers();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'Enter', code: 13, charCode: 13});
        fireEvent.keyUp(combobox, {key: 'Enter', code: 13, charCode: 13});
        jest.runAllTimers();
        triggerPress(button);
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('1');
      items = within(listbox).getAllByRole('option');
      expect(items[0]).toHaveTextContent('One');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenCalledWith(null);
      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(items[0]).toHaveTextContent('One');
      expect(items[0]).not.toHaveAttribute('aria-selected', 'true');
    });

    it('when inputValue is controlled', function () {
      let {getByRole, rerender} = render(<ExampleComboBox inputValue="Two" defaultSelectedKey="2" />);

      let combobox = getByRole('combobox');
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      expect(combobox).toHaveAttribute('value', 'Two');

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items[0]).toHaveTextContent('Two');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onInputChange).toHaveBeenCalledWith('');
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(combobox).toHaveAttribute('value', 'Two');

      rerender(<ExampleComboBox inputValue="" />);

      expect(combobox).toHaveAttribute('value', '');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(null);
      listbox = getByRole('listbox');
      items = within(listbox).getAllByRole('option');
      expect(items[0]).toHaveTextContent('One');
      expect(items[0]).not.toHaveAttribute('aria-selected', 'true');
    });

    it('doesn\'t happen if user deletes all text in input (controlled)', function () {
      let {getByRole} = renderComboBox({selectedKey: '2'});

      let combobox = getByRole('combobox');
      act(() => {
        combobox.focus();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items[0]).toHaveTextContent('Two');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(null);

      listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      items = within(listbox).getAllByRole('option');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('does not fire onSelectionChange if both inputValue and selectedKey are controlled', function () {
      let {getByRole, rerender} = render(<ExampleComboBox inputValue="Two" selectedKey="2" />);

      let combobox = getByRole('combobox');
      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onInputChange).toHaveBeenCalledWith('');
      expect(onSelectionChange).not.toHaveBeenCalled();

      // Re-render to trigger update.
      rerender(<ExampleComboBox inputValue="" selectedKey={null} />);

      // onInputChange should not have been called again based on the selectedKey prop change.
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled combobox', function () {
    describe('controlled by both selectedKey and inputValue', function () {
      it('does not update state', function () {
        let {getByRole} = renderComboBox({selectedKey: '2', inputValue: 'T'});
        let combobox = getByRole('combobox');
        let button = getByRole('button');

        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('T');
        typeText(combobox, 'w');

        act(() => {
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('T');
        expect(onInputChange).toHaveBeenCalledTimes(1);
        expect(onInputChange).toHaveBeenCalledWith('Tw');
        expect(onSelectionChange).not.toHaveBeenCalled();

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('Two');
        expect(items[0]).toHaveAttribute('aria-selected', 'true');

        act(() => {
          userEvent.click(items[1]);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('T');
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenLastCalledWith('3');

        // onInputChange is NOT called here in case the user decides not to update the selectedKey.
        // User should manually update inputValue themselves if they'd like it to change.
        expect(onInputChange).toHaveBeenCalledTimes(1);

        expect(listbox).toBeVisible();
        items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveAttribute('aria-selected', 'true');
      });

      it('updates when selectedKey and inputValue change', function () {
        let {getByRole, rerender} = render(<ExampleComboBox selectedKey="2" inputValue="Two" />);
        let combobox = getByRole('combobox');
        expect(combobox.value).toBe('Two');

        rerender(<ExampleComboBox selectedKey="1" inputValue="One" />);
        expect(combobox.value).toBe('One');

        rerender(<ExampleComboBox selectedKey={null} inputValue="" />);
        expect(combobox.value).toBe('');
      });

      it('does not update inputValue when only selectedKey changes', function () {
        let {getByRole, rerender} = render(<ExampleComboBox selectedKey="2" inputValue="Two" />);
        let combobox = getByRole('combobox');
        expect(combobox.value).toBe('Two');

        rerender(<ExampleComboBox selectedKey="1" inputValue="Two" />);
        expect(combobox.value).toBe('Two');

        rerender(<ExampleComboBox selectedKey={null} inputValue="Two" />);
        expect(combobox.value).toBe('Two');
      });

      it('closes when selecting an item', function () {
        let {getByRole, rerender} = render(<ExampleComboBox selectedKey="2" inputValue="T" />);
        let combobox = getByRole('combobox');
        let button = getByRole('button');
        expect(combobox.value).toBe('T');

        act(() => {
          combobox.focus();
          triggerPress(button);
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(2);

        act(() => {
          userEvent.click(items[1]);
          rerender(<ExampleComboBox selectedKey="3" inputValue="Three" />);
        });

        act(() => {
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('Three');
        expect(() => getByRole('listbox')).toThrow();
      });
    });

    describe('controlled by selectedKey', function () {
      it('updates inputValue state but not selectedKey', function () {
        let {getByRole} = renderComboBox({selectedKey: '2'});
        let combobox = getByRole('combobox');
        let button = getByRole('button');

        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('Two');
        expect(onInputChange).toHaveBeenLastCalledWith('Two');

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent('Two');
        expect(items[0]).toHaveAttribute('aria-selected', 'true');

        act(() => {
          fireEvent.change(combobox, {target: {value: 'Th'}});
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('Th');
        expect(onInputChange).toHaveBeenLastCalledWith('Th');
        expect(onSelectionChange).not.toHaveBeenCalled();

        items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent('Three');
        expect(items[0]).toHaveAttribute('aria-selected', 'false');

        act(() => {
          userEvent.click(items[0]);
          jest.runAllTimers();
        });

        // Does not update inputValue unless selectedKey prop changes
        expect(combobox.value).toBe('Th');
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith('3');
      });

      it('updates the input field when selectedKey prop changes', function () {
        let {getByRole, rerender} = render(<ExampleComboBox selectedKey="2" />);
        let combobox = getByRole('combobox');
        expect(combobox.value).toBe('Two');
        expect(onInputChange).toHaveBeenLastCalledWith('Two');

        rerender(<ExampleComboBox selectedKey="1" />);
        expect(combobox.value).toBe('One');
        expect(onInputChange).toHaveBeenLastCalledWith('One');

        rerender(<ExampleComboBox selectedKey={null} />);
        expect(combobox.value).toBe('');
        expect(onInputChange).toHaveBeenLastCalledWith('');
      });
    });

    describe('controlled by inputValue', function () {
      it('updates selectedKey but not not inputValue', function () {
        let {getByRole} = renderComboBox({defaultSelectedKey: '3', inputValue: 'T'});
        let combobox = getByRole('combobox');
        let button = getByRole('button');

        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('T');

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('Two');
        expect(items[1]).toHaveTextContent('Three');
        expect(items[1]).toHaveAttribute('aria-selected', 'true');

        typeText(combobox, 'w');

        act(() => {
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('T');
        expect(onInputChange).toHaveBeenLastCalledWith('Tw');
        expect(onSelectionChange).not.toHaveBeenCalled();

        act(() => {
          userEvent.click(items[0]);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('T');
        expect(onInputChange).toHaveBeenLastCalledWith('Two');
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith('2');

        items = within(listbox).getAllByRole('option');
        expect(items[0]).toHaveTextContent('Two');
        expect(items[0]).toHaveAttribute('aria-selected', 'true');
      });

      it('updates the input field when inputValue prop changes', function () {
        let {getByRole, rerender} = render(<ExampleComboBox inputValue="T" />);
        let combobox = getByRole('combobox');
        expect(combobox.value).toBe('T');

        rerender(<ExampleComboBox inputValue="Tw" />);
        expect(combobox.value).toBe('Tw');
      });
    });

    describe('custom filter', function () {
      it('does not apply default filtering if controlled items are provided', () => {
        let customFilterItems = [
          {name: 'The first item', id: '1'},
          {name: 'The second item', id: '2'},
          {name: 'The third item', id: '3'}
        ];

        let {getByRole} = render(
          <Provider theme={theme}>
            <ComboBox items={customFilterItems} label="Combobox">
              {(item) => <Item>{item.name}</Item>}
            </ComboBox>
          </Provider>
        );

        act(() => {
          jest.runAllTimers();
        });

        let combobox = getByRole('combobox');
        let button = getByRole('button');

        act(() => {
          triggerPress(button);
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('');

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(3);

        typeText(combobox, 'second');
        act(() => {
          jest.runAllTimers();
        });

        expect(combobox.value).toBe('second');
        items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(3);
      });

      it('updates items with custom filter onInputChange', () => {
        let customFilterItems = [
          {name: 'The first item', id: '1'},
          {name: 'The second item', id: '2'},
          {name: 'The third item', id: '3'}
        ];

        let CustomFilterComboBox = () => {
          let [list, setList] = React.useState(customFilterItems);
          let onInputChange = (value) => {
            setList(customFilterItems.filter(item => item.name.includes(value)));
          };

          return (
            <ComboBox items={list} label="Combobox" onInputChange={onInputChange}>
              {(item) => <Item>{item.name}</Item>}
            </ComboBox>
          );
        };
        let {getByRole} = render(
          <Provider theme={theme}>
            <CustomFilterComboBox />
          </Provider>
        );

        let combobox = getByRole('combobox');
        typeText(combobox, 'second');
        act(() => {
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        let items = within(listbox).getAllByRole('option');
        expect(items).toHaveLength(1);
      });
    });
  });

  describe('uncontrolled combobox', function () {
    it('should update both input value and selected item freely', function () {
      let {getByRole} = renderComboBox();
      let combobox = getByRole('combobox');
      let button = getByRole('button');
      expect(combobox.value).toBe('');

      act(() => {
        combobox.focus();
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(3);
      typeText(combobox, 'Two');

      act(() => {
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('Two');
      expect(onInputChange).toHaveBeenCalledTimes(3);
      expect(onInputChange).toHaveBeenCalledWith('Two');
      expect(onSelectionChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('');
      expect(onInputChange).toHaveBeenCalledTimes(4);
      expect(onInputChange).toHaveBeenCalledWith('');
      expect(onSelectionChange).not.toHaveBeenCalled();

      listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      items = within(listbox).getAllByRole('option');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[1]).not.toHaveAttribute('aria-selected', 'true');

      act(() => {
        triggerPress(items[0]);
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('One');
      expect(() => getByRole('listbox')).toThrow();
      expect(onInputChange).toHaveBeenCalledTimes(5);
      expect(onInputChange).toHaveBeenCalledWith('One');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('1');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      items = within(listbox).getAllByRole('option');
      expect(items[0]).toHaveTextContent('One');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');

      // Reset selection
      act(() => {
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('');
      expect(onInputChange).toHaveBeenCalledTimes(6);
      expect(onInputChange).toHaveBeenCalledWith('');
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenCalledWith(null);
    });

    it('supports defaultSelectedKey and defaultInputValue (matching)', function () {
      let {getByRole} = renderComboBox({defaultSelectedKey: '2', defaultInputValue: 'Two'});
      let combobox = getByRole('combobox');
      let button = getByRole('button');
      expect(combobox.value).toBe('Two');

      act(() => {
        combobox.focus();
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('Two');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('should keep defaultInputValue if it doesn\'t match defaultSelectedKey', function () {
      let {getByRole} = renderComboBox({defaultSelectedKey: '2', defaultInputValue: 'One'});
      let combobox = getByRole('combobox');
      expect(combobox.value).toBe('One');

      act(() => {
        combobox.focus();
        fireEvent.change(combobox, {target: {value: ''}});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(3);

      act(() => {
        triggerPress(items[2]);
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('Three');
    });

    it('defaultInputValue should not set selected item', function () {
      let {getByRole} = renderComboBox({defaultInputValue: 'Two'});
      let combobox = getByRole('combobox');
      let button = getByRole('button');
      expect(combobox.value).toBe('Two');

      act(() => {
        combobox.focus();
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('Two');
      expect(items[0]).toHaveAttribute('aria-selected', 'false');
    });

    it('defaultSelectedKey should set input value', function () {
      let {getByRole} = renderComboBox({defaultSelectedKey: '2'});
      let combobox = getByRole('combobox');
      let button = getByRole('button');
      expect(combobox.value).toBe('Two');

      act(() => {
        combobox.focus();
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('Two');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('combobox with sections', function () {
    it('supports rendering sections', function () {
      let {getByRole, getByText} = renderSectionComboBox();

      let combobox = getByRole('combobox');
      let button = getByRole('button');
      act(() => {
        combobox.focus();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();

      let items = within(listbox).getAllByRole('option');
      let groups = within(listbox).getAllByRole('group');
      expect(items).toHaveLength(6);
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveAttribute('aria-labelledby', getByText('Section One').id);
      expect(getByText('Section One')).toHaveAttribute('aria-hidden', 'true');
      expect(groups[1]).toHaveAttribute('aria-labelledby', getByText('Section Two').id);
      expect(getByText('Section Two')).toHaveAttribute('aria-hidden', 'true');
      expect(document.activeElement).toBe(combobox);
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      expect(items[0]).toHaveAttribute('aria-labelledby', within(items[0]).getByText('One').id);
      expect(groups[0]).toContainElement(items[0]);
      expect(items[1]).toHaveAttribute('aria-labelledby', within(items[1]).getByText('Two').id);
      expect(groups[0]).toContainElement(items[1]);
      expect(items[2]).toHaveAttribute('aria-labelledby', within(items[2]).getByText('Three').id);
      expect(groups[0]).toContainElement(items[2]);
      expect(items[3]).toHaveAttribute('aria-labelledby', within(items[3]).getByText('Four').id);
      expect(groups[1]).toContainElement(items[3]);
      expect(items[4]).toHaveAttribute('aria-labelledby', within(items[4]).getByText('Five').id);
      expect(groups[1]).toContainElement(items[4]);
      expect(items[5]).toHaveAttribute('aria-labelledby', within(items[5]).getByText('Six').id);
      expect(groups[1]).toContainElement(items[5]);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[3].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'Enter', code: 13, charCode: 13});
        fireEvent.keyUp(combobox, {key: 'Enter', code: 13, charCode: 13});
        jest.runAllTimers();
      });

      expect(combobox.value).toBe('Four');
      expect(() => getByRole('listbox')).toThrow();
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onInputChange).toHaveBeenCalledWith('Four');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('4');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      listbox = getByRole('listbox');
      expect(listbox).toBeVisible();

      items = within(listbox).getAllByRole('option');
      groups = within(listbox).getAllByRole('group');
      expect(items).toHaveLength(1);
      expect(groups).toHaveLength(1);
      expect(items[0]).toHaveTextContent('Four');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
      expect(groups[0]).toContainElement(items[0]);
      expect(groups[0]).toHaveAttribute('aria-labelledby', getByText('Section Two').id);
      expect(() => getByText('Section One')).toThrow();
    });

    it('sections are not valid selectable values', function () {
      let {getByRole} = renderSectionComboBox({selectedKey: 'section 1'});

      let combobox = getByRole('combobox');
      let button = getByRole('button');
      expect(combobox.value).toBe('');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();

      let groups = within(listbox).getAllByRole('group');
      expect(groups[0]).not.toHaveAttribute('aria-selected');

      expect(() => within(listbox).getAllByRole('img')).toThrow();
    });
  });

  it('should have aria-invalid when validationState="invalid"', function () {
    let {getByRole} = renderComboBox({validationState: 'invalid'});
    let combobox = getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-invalid', 'true');
  });

  describe('mobile combobox', function () {
    beforeEach(() => {
      jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 600);
    });

    afterEach(() => {
      jest.runAllTimers();
      jest.clearAllMocks();
    });

    function testComboBoxTrayOpen(input, tray, listbox, focusedItemIndex) {
      expect(tray).toBeVisible();

      let dialog = within(tray).getByRole('dialog');
      expect(input).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-labelledby', input.getAttribute('aria-labelledby'));

      expect(input).toHaveAttribute('role', 'searchbox');
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).toHaveAttribute('aria-controls', listbox.id);
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');

      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('One');
      expect(items[1]).toHaveTextContent('Two');
      expect(items[2]).toHaveTextContent('Three');

      expect(document.activeElement).toBe(input);

      if (typeof focusedItemIndex === 'undefined') {
        expect(input).not.toHaveAttribute('aria-activedescendant');

        act(() => {
          fireEvent.keyDown(input, {key: 'ArrowDown', code: 40, charCode: 40});
          fireEvent.keyUp(input, {key: 'ArrowDown', code: 40, charCode: 40});
          jest.runAllTimers();
        });

        expect(input).toHaveAttribute('aria-activedescendant', items[0].id);
      } else {
        expect(input).toHaveAttribute('aria-activedescendant', items[focusedItemIndex].id);
      }
    }

    it('should render a button to open the tray', function () {
      let {getByRole, getByText} = renderComboBox({});
      let button = getByRole('button');

      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText(defaultProps.placeholder).id}`);
    });

    it('button should be labelled by external label', function () {
      let {getByRole, getByText} = renderComboBox({selectedKey: '2', label: null, 'aria-labelledby': 'label-id'});
      let button = getByRole('button');

      expect(button).toHaveAttribute('aria-labelledby', `label-id ${getByText('Two').id}`);
    });

    it('button should be labelled by aria-label', function () {
      let {getByRole, getByText} = renderComboBox({selectedKey: '2', label: null, 'aria-label': 'Label'});
      let button = getByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Label');
      expect(button).toHaveAttribute('aria-labelledby', `${button.id} ${getByText('Two').id}`);
    });

    it('button should be labelled by external label and builtin label', function () {
      let {getByRole, getByText} = renderComboBox({selectedKey: '2', 'aria-labelledby': 'label-id'});
      let button = getByRole('button');

      expect(button).toHaveAttribute('aria-labelledby', `label-id ${getByText('Test').id} ${getByText('Two').id}`);
    });

    it('opening the tray autofocuses the tray input', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      expect(button).toHaveAttribute('aria-expanded', 'true');

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');

      let trayInput = within(tray).getByRole('searchbox');
      testComboBoxTrayOpen(trayInput, tray, listbox);
    });

    it('closing the tray autofocuses the button', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();

      let input = within(tray).getByRole('searchbox');

      act(() => {
        fireEvent.keyDown(input, {key: 'Escape', code: 27, charCode: 27});
        fireEvent.keyUp(input, {key: 'Escape', code: 27, charCode: 27});
        jest.runAllTimers();
      });

      expect(() => getByTestId('tray')).toThrow();
      expect(document.activeElement).toBe(button);
    });

    it('height of the tray remains fixed even if the number of items changes', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();

      let items = within(tray).getAllByRole('option');
      expect(items.length).toBe(3);

      let trayInput = within(tray).getByRole('searchbox');
      // Save the height style for comparison later
      let style = tray.getAttribute('style');
      typeText(trayInput, 'One');

      act(() => {
        jest.runAllTimers();
      });

      items = within(tray).getAllByRole('option');
      expect(items.length).toBe(1);
      tray = getByTestId('tray');
      expect(tray.getAttribute('style')).toBe(style);
    });

    it('up/down arrows still traverse the items in the tray', function () {
      let {getByRole, getByTestId} = renderComboBox();

      let button = getByRole('button');
      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();

      let input = within(tray).getByRole('searchbox');
      expect(document.activeElement).toBe(input);

      act(() => {
        fireEvent.keyDown(input, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(input, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let listbox = getByRole('listbox');
      testComboBoxTrayOpen(input, tray, listbox, 0);

      act(() => {
        fireEvent.keyDown(input, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(input, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let items = within(tray).getAllByRole('option');

      expect(input).toHaveAttribute('aria-activedescendant', items[1].id);

      act(() => {
        fireEvent.keyDown(input, {key: 'ArrowUp', code: 38, charCode: 38});
        fireEvent.keyUp(input, {key: 'ArrowUp', code: 38, charCode: 38});
        jest.runAllTimers();
      });

      expect(input).toHaveAttribute('aria-activedescendant', items[0].id);
    });

    it('user can filter the menu options by typing in the tray input', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');
      let trayInput = within(tray).getByRole('searchbox');

      testComboBoxTrayOpen(trayInput, tray, listbox);
      typeText(trayInput, 'r');

      act(() => {
        jest.runAllTimers();
      });

      let items = within(tray).getAllByRole('option');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toBe('Three');

      act(() => {
        fireEvent.change(trayInput, {target: {value: ''}});
        jest.runAllTimers();
      });

      items = within(tray).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(items[0].textContent).toBe('One');
      expect(items[1].textContent).toBe('Two');
      expect(items[2].textContent).toBe('Three');
    });

    it('tray input can be cleared using a clear button', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');
      let trayInput = within(tray).getByRole('searchbox');

      expect(() => within(tray).getByLabelText('Clear')).toThrow();

      testComboBoxTrayOpen(trayInput, tray, listbox);
      typeText(trayInput, 'r');

      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(trayInput);
      expect(trayInput.value).toBe('r');

      let clearButton = within(tray).getByLabelText('Clear');
      expect(clearButton.tagName).toBe('DIV');
      expect(clearButton).not.toHaveAttribute('tabIndex');
      act(() => {
        triggerPress(clearButton);
      });

      expect(document.activeElement).toBe(trayInput);
      expect(trayInput.value).toBe('');
    });

    it('"No results" placeholder is shown if user types something that doesnt match any of the available options', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');

      let trayInput = within(tray).getByRole('searchbox');
      testComboBoxTrayOpen(trayInput, tray, listbox);
      typeText(trayInput, 'blah');

      act(() => {
        jest.runAllTimers();
      });

      // check that tray is still visible and placeholder text exists
      expect(tray).toBeVisible();
      let items = within(tray).getAllByRole('option');
      expect(items.length).toBe(1);

      let placeholderText = within(items[0]).getByText('No results');
      expect(placeholderText).toBeVisible();


      act(() => {
        fireEvent.change(trayInput, {target: {value: ''}});
        jest.runAllTimers();
      });

      items = within(tray).getAllByRole('option');
      expect(items.length).toBe(3);
      expect(() => within(tray).getByText('No results')).toThrow();
    });

    it('user can select options by pressing them', function () {
      let {getByRole, getByText, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');
      let trayInput = within(tray).getByRole('searchbox');
      testComboBoxTrayOpen(trayInput, tray, listbox);

      let items = within(tray).getAllByRole('option');

      act(() => {
        triggerPress(items[1]);
        jest.runAllTimers();
      });

      expect(onInputChange).toHaveBeenCalledWith('Two');
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('2');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(() => getByTestId('tray')).toThrow();
      expect(button).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Two').id}`);

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      tray = getByTestId('tray');
      expect(tray).toBeVisible();
      trayInput = within(tray).getByRole('searchbox');
      items = within(tray).getAllByRole('option');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toBe('Two');
      expect(trayInput).not.toHaveAttribute('aria-activedescendant');
      expect(trayInput.value).toBe('Two');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('user can select options by focusing them and hitting enter', function () {
      let {getByRole, getByText, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');

      let trayInput = within(tray).getByRole('searchbox');

      act(() => {
        fireEvent.keyDown(trayInput, {key: 'ArrowUp', code: 38, charCode: 38});
        fireEvent.keyUp(trayInput, {key: 'ArrowUp', code: 38, charCode: 38});
        jest.runAllTimers();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      testComboBoxTrayOpen(trayInput, tray, listbox, 2);

      act(() => {
        fireEvent.keyDown(trayInput, {key: 'Enter', code: 13, charCode: 13});
        fireEvent.keyUp(trayInput, {key: 'Enter', code: 13, charCode: 13});
        jest.runAllTimers();
      });

      expect(onInputChange).toHaveBeenCalledWith('Three');
      expect(onInputChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('3');
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(() => getByTestId('tray')).toThrow();
      expect(button).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Three').id}`);

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      tray = getByTestId('tray');
      expect(tray).toBeVisible();
      trayInput = within(tray).getByRole('searchbox');
      let items = within(tray).getAllByRole('option');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toBe('Three');
      expect(trayInput).not.toHaveAttribute('aria-activedescendant');
      expect(trayInput.value).toBe('Three');
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('input is blurred when the user scrolls the listbox with touch', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');

      let trayInput = within(tray).getByRole('searchbox');

      act(() => {
        trayInput.focus();
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(trayInput);

      act(() => {
        fireEvent.touchStart(listbox);
        fireEvent.scroll(listbox);
        jest.runAllTimers();
      });

      expect(document.activeElement).not.toBe(trayInput);
    });

    it('value of the button mirrors the tray input', function () {
      let {getByRole, getByText, getByTestId} = renderComboBox({allowsCustomValue: true});
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let trayInput = within(tray).getByRole('searchbox');
      expect(document.activeElement).toBe(trayInput);

      typeText(trayInput, 'Bleh');
      act(() => {
        jest.runAllTimers();
      });

      expect(trayInput.value).toBe('Bleh');
      expect(onInputChange).toHaveBeenCalledWith('Bleh');
      expect(onInputChange).toHaveBeenCalledTimes(4);

      act(() => {
        fireEvent.keyDown(trayInput, {key: 'Escape', code: 27, charCode: 27});
        fireEvent.keyUp(trayInput, {key: 'Escape', code: 27, charCode: 27});
        jest.runAllTimers();
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(() => getByTestId('tray')).toThrow();
      expect(document.activeElement).toBe(button);
      expect(button).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Bleh').id}`);
    });

    it('label of the tray input should match label of button', function () {
      let {getByRole, getByTestId, getByText} = renderComboBox({selectedKey: '2'});
      let button = getByRole('button');
      let label = getByText(defaultProps.label);

      expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${getByText('Two').id}`);

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let trayInput = within(tray).getByRole('searchbox');
      let trayInputLabel = within(tray).getByText(defaultProps.label);
      expect(trayInput).toHaveAttribute('aria-labelledby', trayInputLabel.id);
    });

    it('tray input should recieve the same aria-labelledby as the button if an external label is provided', function () {
      let {getByRole, getByTestId, getByText} = render(
        <Provider theme={theme}>
          <label id="test-label" htmlFor="test-id">Combobox</label>
          <ComboBox id="test-id" aria-labelledby="test-label" selectedKey="one">
            <Item key="one">Item One</Item>
          </ComboBox>
        </Provider>
      );

      let button = getByRole('button');
      let label = getByText('Combobox');

      expect(button).toHaveAttribute('aria-labelledby', `${label.id} ${getByText('Item One').id}`);

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let listbox = getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Suggestions');
      expect(listbox).toHaveAttribute('aria-labelledby', `${label.id} ${listbox.id}`);
      let trayInput = within(tray).getByRole('searchbox');
      expect(trayInput).toHaveAttribute('aria-labelledby', label.id);
    });

    it('user can open the tray even if there aren\'t any items to show', function () {
      let {getByRole, getByTestId} = renderComboBox({inputValue: 'blah'});
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();

      let items = within(tray).getAllByRole('option');
      expect(items.length).toBe(1);

      let placeholderText = within(items[0]).getByText('No results');
      expect(placeholderText).toBeVisible();
    });

    it('combobox tray remains open on blur', function () {
      let {getByRole, getByTestId} = renderComboBox({defaultInputValue: 'Blah'});
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let trayInput = within(tray).getByRole('searchbox');
      expect(trayInput.value).toBe('Blah');

      act(() => {
        trayInput.blur();
        jest.runAllTimers();
      });

      tray = getByTestId('tray');
      expect(tray).toBeVisible();
      expect(trayInput.value).toBe('Blah'); // does not reset on blur
    });

    it('combobox tray can be closed using the dismiss buttons', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let dismissButtons = within(tray).getAllByRole('button');
      expect(dismissButtons.length).toBe(2);
      expect(dismissButtons[0]).toHaveAttribute('aria-label', 'Dismiss');
      expect(dismissButtons[1]).toHaveAttribute('aria-label', 'Dismiss');

      act(() => {
        triggerPress(dismissButtons[0]);
        jest.runAllTimers();
      });

      expect(() => getByTestId('tray')).toThrow();
    });

    it('combobox tray doesn\'t close when tray input is virtually clicked', function () {
      let {getByRole, getByTestId} = renderComboBox();
      let button = getByRole('button');

      act(() => {
        triggerPress(button);
        jest.runAllTimers();
      });

      let tray = getByTestId('tray');
      expect(tray).toBeVisible();
      let trayInput = within(tray).getByRole('searchbox');

      jest.spyOn(trayInput, 'getBoundingClientRect').mockImplementation(() => ({
        left: 100,
        top: 100,
        width: 100,
        height: 50
      }));

      // virtual click on the exact center
      act(() => {
        fireEvent.touchEnd(trayInput, {
          changedTouches: [{
            clientX: 150,
            clientY: 125
          }]
        });

        jest.runAllTimers();
      });

      expect(() => getByTestId('tray')).not.toThrow();
    });

    it('should focus the button when clicking on the label', function () {
      let {getByRole, getByText} = renderComboBox();
      let label = getByText('Test');
      let button = getByRole('button');

      act(() => {
        userEvent.click(label);
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(button);
    });

    it('should include invalid in label when validationState="invalid"', function () {
      let {getByRole, getByText, getByLabelText} = renderComboBox({validationState: 'invalid', selectedKey: '2'});
      let button = getByRole('button');
      expect(button).toHaveAttribute('aria-labelledby', `${getByText('Test').id} ${getByText('Two').id} ${getByLabelText('(invalid)').id}`);
    });

    describe('refs', function () {
      it('attaches a ref to the label wrapper', function () {
        let ref = React.createRef();
        let {getByText} = renderComboBox({ref});

        expect(ref.current.UNSAFE_getDOMNode()).toBe(getByText('Test').parentElement);
      });

      it('attaches a ref to the button if no label', function () {
        let ref = React.createRef();
        let {getByRole} = renderComboBox({ref, label: null, 'aria-label': 'test'});

        expect(ref.current.UNSAFE_getDOMNode()).toBe(getByRole('button'));
      });

      it('calling focus() on the ref focuses the button', function () {
        let ref = React.createRef();
        let {getByRole} = renderComboBox({ref});

        act(() => {ref.current.focus();});
        expect(document.activeElement).toBe(getByRole('button'));
      });
    });
  });

  describe('accessibility', function () {
    beforeAll(function () {
      jest.spyOn(window.screen, 'width', 'get').mockImplementation(() => 1024);
    });

    afterAll(function () {
      jest.restoreAllMocks();
    });
    // NVDA workaround so that letters are read out when user presses left/right arrow to navigate through what they typed
    it('clears aria-activedescendant when user presses left/right arrow (NVDA fix)', function () {
      let {getByRole} = renderComboBox();

      let combobox = getByRole('combobox');
      typeText(combobox, 'One');
      act(() => {
        jest.runAllTimers();
      });
      let listbox = getByRole('listbox');
      expect(listbox).toBeVisible();
      expect(combobox).toHaveAttribute('aria-controls', listbox.id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      let items = within(listbox).getAllByRole('option');
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('One');
      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowLeft', code: 37, charCode: 37});
        fireEvent.keyUp(combobox, {key: 'ArrowLeft', code: 37, charCode: 37});
        jest.runAllTimers();
      });

      expect(combobox).not.toHaveAttribute('aria-activedescendant');

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
        jest.runAllTimers();
      });

      expect(combobox).toHaveAttribute('aria-activedescendant', items[0].id);

      act(() => {
        fireEvent.keyDown(combobox, {key: 'ArrowRight', code: 39, charCode: 39});
        fireEvent.keyUp(combobox, {key: 'ArrowRight', code: 39, charCode: 39});
        jest.runAllTimers();
      });

      expect(combobox).not.toHaveAttribute('aria-activedescendant');
    });

    describe('announcements', function () {
      // Live announcer is (mostly) only used on apple devices for VoiceOver.
      // Mock navigator.platform so we take that codepath.
      let platformMock;
      beforeEach(() => {
        platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
      });

      afterEach(() => {
        platformMock.mockRestore();
      });

      describe('keyboard navigating', function () {
        it('should announce items when navigating with the arrow keys', function () {
          let {getByRole} = renderComboBox();
          let combobox = getByRole('combobox');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('One');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('Two');
        });

        it('should announce when navigating to the selected item', function () {
          let {getByRole} = renderComboBox({selectedKey: '2'});
          let combobox = getByRole('combobox');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
            fireEvent.keyUp(combobox, {key: 'ArrowDown', code: 40, charCode: 40});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('Two, selected');
        });

        it('should announce when navigating into a section with multiple items', function () {
          let {getByRole} = renderSectionComboBox();
          let combobox = getByRole('combobox');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('Entered group Section One, with 3 options. One');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('Two');
        });

        it('should announce when navigating into a section with a single item', function () {
          let {getByRole} = renderSectionComboBox({inputValue: 'Two'});
          let combobox = getByRole('combobox');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('Entered group Section One, with 1 option. Two');
        });

        it('should announce when navigating into a section with a selected item', function () {
          let {getByRole} = renderSectionComboBox({selectedKey: '2'});
          let combobox = getByRole('combobox');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('Entered group Section One, with 1 option. Two, selected');
        });
      });

      describe('filtering', function () {
        it('should announce the number of options available when filtering', function () {
          let {getByRole} = renderComboBox();
          let combobox = getByRole('combobox');

          typeText(combobox, 'o');
          act(() => {
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('2 options available.');

          typeText(combobox, 'n');
          act(() => {
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('1 option available.');
        });

        it('should announce the number of options available when opening the menu', function () {
          let {getByRole} = renderComboBox();
          let button = getByRole('button');

          act(() => {
            triggerPress(button);
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenCalledWith('3 options available.');
        });
      });

      describe('selection', function () {
        it('should announce when a selection occurs', function () {
          let {getByRole} = renderComboBox();
          let combobox = getByRole('combobox');

          act(() => {
            combobox.focus();
            fireEvent.keyDown(combobox, {key: 'ArrowDown'});
            fireEvent.keyUp(combobox, {key: 'ArrowDown'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('One');

          act(() => {
            fireEvent.keyDown(combobox, {key: 'Enter'});
            fireEvent.keyUp(combobox, {key: 'Enter'});
            jest.runAllTimers();
          });

          expect(announce).toHaveBeenLastCalledWith('One, selected');
        });
      });
    });

    describe('hiding surrounding content', function () {
      it('should hide elements outside the combobox with aria-hidden', function () {
        let {getByRole, getAllByRole} = render(
          <>
            <input type="checkbox" />
            <ExampleComboBox />
            <input type="checkbox" />
          </>
        );

        let outside = getAllByRole('checkbox');
        let combobox = getByRole('combobox');
        let button = getByRole('button');

        expect(outside).toHaveLength(2);

        act(() => {
          combobox.focus();
          fireEvent.keyDown(combobox, {key: 'ArrowDown'});
          fireEvent.keyUp(combobox, {key: 'ArrowDown'});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(button).toHaveAttribute('aria-hidden', 'true');
        expect(outside[0]).toHaveAttribute('aria-hidden', 'true');
        expect(outside[1]).toHaveAttribute('aria-hidden', 'true');

        expect(() => getAllByRole('checkbox')).toThrow();
        expect(getByRole('combobox')).toBeVisible();
      });

      it('should not traverse into a hidden container', function () {
        let {getByRole, getAllByRole} = render(
          <>
            <div>
              <input type="checkbox" />
            </div>
            <ExampleComboBox />
            <input type="checkbox" />
          </>
        );

        let outside = getAllByRole('checkbox');
        let combobox = getByRole('combobox');
        let button = getByRole('button');

        expect(outside).toHaveLength(2);

        act(() => {
          combobox.focus();
          fireEvent.keyDown(combobox, {key: 'ArrowDown'});
          fireEvent.keyUp(combobox, {key: 'ArrowDown'});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(button).toHaveAttribute('aria-hidden', 'true');
        expect(outside[0].parentElement).toHaveAttribute('aria-hidden', 'true');
        expect(outside[0]).not.toHaveAttribute('aria-hidden', 'true');
        expect(outside[1]).toHaveAttribute('aria-hidden', 'true');

        expect(() => getAllByRole('checkbox')).toThrow();
        expect(getByRole('combobox')).toBeVisible();
      });

      it('should not hide the live announcer element', function () {
        let platformMock = jest.spyOn(navigator, 'platform', 'get').mockImplementation(() => 'MacIntel');
        let {getByRole} = render(<ExampleComboBox />);

        // Use the real live announcer implementation just for this one test
        let {announce: realAnnounce} = jest.requireActual('@react-aria/live-announcer');
        announce.mockImplementationOnce(realAnnounce);

        let combobox = getByRole('combobox');

        act(() => {
          combobox.focus();
          fireEvent.keyDown(combobox, {key: 'ArrowDown'});
          fireEvent.keyUp(combobox, {key: 'ArrowDown'});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(screen.getAllByRole('log')).toHaveLength(2);
        platformMock.mockRestore();
      });

      it('should handle when a new element is added outside while open', async function () {
        let Test = (props) => (
          <div>
            {props.show && <input type="checkbox" />}
            <ExampleComboBox />
            {props.show && <input type="checkbox" />}
          </div>
        );

        let {getByRole, getAllByRole, rerender} = render(<Test />);

        let combobox = getByRole('combobox');
        let button = getByRole('button');

        act(() => {
          combobox.focus();
          fireEvent.keyDown(combobox, {key: 'ArrowDown'});
          fireEvent.keyUp(combobox, {key: 'ArrowDown'});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(button).toHaveAttribute('aria-hidden', 'true');

        rerender(<Test show />);

        await waitFor(() => expect(() => getAllByRole('checkbox')).toThrow());
        expect(getByRole('combobox')).toBeVisible();
        expect(getByRole('listbox')).toBeVisible();

        let outside = getAllByRole('checkbox', {hidden: true});
        expect(outside[0]).toHaveAttribute('aria-hidden', 'true');
        expect(outside[1]).toHaveAttribute('aria-hidden', 'true');
      });

      it('should handle when a new element is added to an already hidden container', async function () {
        let Test = (props) => (
          <div>
            <div data-testid="test">
              {props.show && <input type="checkbox" />}
            </div>
            <ExampleComboBox />
            {props.show && <input type="checkbox" />}
          </div>
        );

        let {getByRole, getAllByRole, getByTestId, rerender} = render(<Test />);

        let combobox = getByRole('combobox');
        let button = getByRole('button');
        let outer = getByTestId('test');

        act(() => {
          combobox.focus();
          fireEvent.keyDown(combobox, {key: 'ArrowDown'});
          fireEvent.keyUp(combobox, {key: 'ArrowDown'});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        expect(listbox).toBeVisible();
        expect(button).toHaveAttribute('aria-hidden', 'true');
        expect(outer).toHaveAttribute('aria-hidden', 'true');

        rerender(<Test show />);

        await waitFor(() => expect(() => getAllByRole('checkbox')).toThrow());
        expect(getByRole('combobox')).toBeVisible();
        expect(getByRole('listbox')).toBeVisible();

        let outside = getAllByRole('checkbox', {hidden: true});
        expect(outer).toHaveAttribute('aria-hidden', 'true');
        expect(outside[0]).not.toHaveAttribute('aria-hidden');
        expect(outside[1]).toHaveAttribute('aria-hidden', 'true');
      });

      it('should handle when a new element is added inside the listbox', async function () {
        let Test = (props) => (
          <div>
            <input type="checkbox" />
            <Provider theme={theme}>
              <ComboBox label="Combobox" {...props}>
                {item => <Item>{item.name}</Item>}
              </ComboBox>
            </Provider>
            <input type="checkbox" />
          </div>
        );

        let {getByRole, getAllByRole, rerender} = render(
          <Test items={[{id: 1, name: 'One'}]} />
        );

        let combobox = getByRole('combobox');

        act(() => {
          combobox.focus();
          fireEvent.keyDown(combobox, {key: 'ArrowDown'});
          fireEvent.keyUp(combobox, {key: 'ArrowDown'});
          jest.runAllTimers();
        });

        let listbox = getByRole('listbox');
        let options = within(listbox).getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(() => getAllByRole('checkbox')).toThrow();

        rerender(<Test items={[{id: 1, name: 'One'}, {id: 2, name: 'Two'}]} />);

        // Wait for mutation observer tick
        await Promise.resolve();

        options = within(listbox).getAllByRole('option');
        expect(options).toHaveLength(2);

        expect(() => getAllByRole('checkbox')).toThrow();
        expect(getByRole('combobox')).toBeVisible();
        expect(getByRole('listbox')).toBeVisible();
      });
    });
  });
});
