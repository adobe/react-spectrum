import {act, render, within} from '@testing-library/react';
import {ActionMenu, Item} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';


describe('ActionMenu', function () {

  beforeAll(function () {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it('basic test', function () {
    let tree = render(<Provider theme={theme}>
      <ActionMenu>
        <Item>Foo</Item>
        <Item>Bar</Item>
        <Item>Baz</Item>
      </ActionMenu>
    </Provider>);
    
    let button = tree.getByRole('button');
    triggerPress(button);
    
    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    expect(menu).toHaveAttribute('aria-labelledby', button.id);
    
    let menuItem1 = within(menu).getByText('Foo');
    let menuItem2 = within(menu).getByText('Bar');
    let menuItem3 = within(menu).getByText('Baz');
    expect(menuItem1).toBeTruthy();
    expect(menuItem2).toBeTruthy();
    expect(menuItem3).toBeTruthy();
  });

});
