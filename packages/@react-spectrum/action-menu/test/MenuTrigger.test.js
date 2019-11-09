import {Button} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange, within} from '@testing-library/react';
import {Menu, MenuTrigger} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/button/test/utils'; // TODO: Move this util funct to test-utils folder (https://github.com/adobe/react-spectrum-v3/pull/32)
import V2Button from '@react/react-spectrum/Button';
import V2Dropdown from '@react/react-spectrum/Dropdown';
import {Menu as V2Menu, MenuItem as V2MenuItem} from '@react/react-spectrum/Menu';

let triggerText = 'Menu Button';
let buttonId = 'button-id';
let menuId = 'menu-id';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

function renderComponent(Component, props) {
  if (Component === V2Dropdown) {
    return render(
      <Component {...props}>
        <V2Button
          id={buttonId} 
          variant="cta">
          {triggerText}
        </V2Button>
        <V2Menu id={menuId}>
          <V2MenuItem value="foo">Foo</V2MenuItem>
          <V2MenuItem value="bar">Bar</V2MenuItem>
          <V2MenuItem value="baz">Baz</V2MenuItem>
        </V2Menu>
      </Component>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <div data-testid="scrollable">
          <Component {...props}>
            <Button id={buttonId}>
              {triggerText}
            </Button>
            <Menu id={menuId}>
              <li>Foo</li>
              <li>Bar</li>
              <li>Baz</li>
            </Menu>
          </Component>
        </div>
      </Provider>
    );
  }
}

describe('MenuTrigger', function () {
  let onOpenChange = jest.fn();
  let onOpen = jest.fn();
  let onClose = jest.fn();
  let onSelect = jest.fn();

  afterEach(() => {
    onOpenChange.mockClear();
    onOpen.mockClear();
    onClose.mockClear();
    onSelect.mockClear();
    cleanup();
  });

  function verifyMenuToggle(Component, props, triggerEvent) {
    let tree = renderComponent(Component, props);
    let triggerButton = tree.getByRole('button');

    if (Component === MenuTrigger) {
      expect(onOpenChange).toBeCalledTimes(0);
    } else {
      expect(onOpen).toBeCalledTimes(0);
      expect(onClose).toBeCalledTimes(0);
    }

    triggerEvent(triggerButton);
  
    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(menu).toHaveAttribute('aria-labelledby', buttonId);
    
    let menuItem1 = within(menu).getByText('Foo');
    let menuItem2 = within(menu).getByText('Bar');
    let menuItem3 = within(menu).getByText('Baz');
    expect(menuItem1).toBeTruthy();
    expect(menuItem2).toBeTruthy();
    expect(menuItem3).toBeTruthy();
  
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
    expect(triggerButton).toHaveAttribute('aria-controls', menuId);
  
    if (Component === MenuTrigger) {
      expect(onOpenChange).toBeCalledTimes(1);
    } else {
      expect(onOpen).toBeCalledTimes(1);
      expect(onClose).toBeCalledTimes(0);
    }
  
    triggerEvent(triggerButton);
    menu = tree.queryByRole('menu');
    expect(menu).toBeFalsy();    
    
    if (Component === MenuTrigger) {
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toBeCalledTimes(2);
    } else {
      expect(triggerButton).not.toHaveAttribute('aria-expanded');
      expect(onOpen).toBeCalledTimes(1);
      expect(onClose).toBeCalledTimes(1);
    }
  }

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{}}
  `('$Name has default behavior (button renders, menu is closed)', function ({Component}) {
    let tree = renderComponent(Component);
    let triggerButton = tree.getByRole('button');
    expect(triggerButton).toBeTruthy();
    expect(triggerButton).toHaveAttribute('aria-haspopup', 'true');
    
    let buttonText = within(triggerButton).getByText(triggerText);
    expect(buttonText).toBeTruthy();

    let menuItem = tree.queryByText('Foo');
    expect(menuItem).toBeFalsy();

    if (Component === MenuTrigger) {
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(triggerButton).toHaveAttribute('type', 'button');
    }
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose}}
  `('$Name toggles the menu display on button click', function ({Component, props}) {
    verifyMenuToggle(Component, props, (button) => triggerPress(button));
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose}}
  `('$Name can toggle the menu display via Enter key', function ({Component, props}) {
    verifyMenuToggle(Component, props, (button) => fireEvent.keyDown(button, {key: 'Enter', code: 13, charCode: 13}));
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose}}
  `('$Name can toggle the menu display via Space key', function ({Component, props}) {
    verifyMenuToggle(Component, props, (button) => fireEvent.keyDown(button, {key: ' ', code: 32, charCode: 32}));
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name can toggle the menu display via ArrowUp key', function ({Component, props}) {
    verifyMenuToggle(Component, props, (button) => fireEvent.keyDown(button, {key: 'ArrowUp', code: 38, charCode: 38}));
  });

  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
    ${'V2Dropdown'}  | ${V2Dropdown}  | ${{onOpen, onClose}}
  `('$Name can toggle the menu display via ArrowDown key', function ({Component, props}) {
    verifyMenuToggle(Component, props, (button) => fireEvent.keyDown(button, {key: 'ArrowDown', code: 40, charCode: 40}));
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, isOpen: true}}
  `('$Name supports a controlled open state ', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    await waitForDomChange();

    menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange, defaultOpen: true}}
  `('$Name supports a uncontrolled default open state ', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    expect(onOpenChange).toBeCalledTimes(0);

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let triggerButton = tree.getByRole('button');
    triggerPress(triggerButton);
    await waitForDomChange();

    menu = tree.queryByRole('menu');
    expect(menu).toBeFalsy();
    expect(onOpenChange).toBeCalledTimes(1);
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name supports having multiple menus open', async function ({Component, props}) {
    let tree = render(
      <Provider theme={theme}>
        <Component {...props}>
          <Button>Button 1</Button>
          <Menu id={menuId}>
            <li>Foo</li>
            <li>Bar</li>
            <li>Baz</li>
          </Menu>
        </Component>
        <Component {...props}>
          <Button>Button 2</Button>
          <Menu id={menuId}>
            <li>1</li>
            <li>2</li>
            <li>3</li>
          </Menu>
        </Component>
      </Provider>
    );
    let button1 = tree.getByText('Button 1');
    let button2 = tree.getByText('Button 2');
    triggerPress(button1);
    triggerPress(button2);
    await waitForDomChange();

    let menu1 = tree.getByText('Foo');
    let menu2 = tree.getByText('1');
    expect(menu1).toBeTruthy();
    expect(menu2).toBeTruthy();
  });

  // New functionality in v3
  it.each`
    Name             | Component      | props
    ${'MenuTrigger'} | ${MenuTrigger} | ${{onOpenChange}}
  `('$Name closes the menu upon trigger body scroll', async function ({Component, props}) {
    let tree = renderComponent(Component, props);
    let button = tree.getByRole('button');
    triggerPress(button);
    await waitForDomChange();

    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();

    let scrollable = tree.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    await waitForDomChange();
    menu = tree.queryByRole('menu');
    expect(menu).toBeFalsy();
  });
});
