import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useMenuTrigger} from '../';

// TODO: Refactor this so I can actually render a component and use hooks and stuff
describe('useMenuTrigger', function () {
  let state = {};
  let setOpen = jest.fn();

  let renderMenuTriggerHook = (menuProps, menuTriggerProps, isOpen) => {
    let {result} = renderHook(() => useMenuTrigger(menuProps, menuTriggerProps, isOpen));
    return result.current;
  };

  beforeEach(() => {
    state.isOpen = false;
    state.setOpen = setOpen;
  });

  it('should return default props for menu and menu trigger', function () {
    let {menuTriggerProps, menuProps} = renderMenuTriggerHook({}, state);
    expect(menuTriggerProps['aria-controls']).toBeFalsy();
    expect(menuTriggerProps['aria-expanded']).toBeFalsy();
    expect(menuTriggerProps['aria-haspopup']).toBeFalsy();
    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
    expect(menuProps.id).toBeTruthy();
  });

  it('should return proper aria props for menu and menu trigger if menu is open', function () {
    state.isOpen = true;

    let {menuTriggerProps, menuProps} = renderMenuTriggerHook({}, state);
    expect(menuTriggerProps['aria-controls']).toBe(menuProps.id);
    expect(menuTriggerProps['aria-expanded']).toBeTruthy();
    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
    expect(menuProps.id).toBeTruthy();
  });

  it('returns the proper aria-haspopup based on the menu\'s type', function () {
    let props = {
      type: 'menu'
    };

    let {menuTriggerProps} = renderMenuTriggerHook(props, state);
    expect(menuTriggerProps['aria-haspopup']).toBeTruthy();
  });

  it('returns a onPress that toggles the menu open state', function () {
    // TODO, perhaps test this in the MenuTrigger test instead?
  });

  it('returns a onKeyDown that toggles the menu open state for specific key strokes', function () {
   // TODO, perhaps test this in the MenuTrigger test instead?
  });
});
