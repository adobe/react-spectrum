import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useMenuTrigger} from '../';

describe('useMenuTrigger', function () {

  let renderMenuTriggerHook = (menuProps, menuTriggerProps, isOpen) => {
    let {result} = renderHook(() => useMenuTrigger(menuProps, menuTriggerProps, isOpen));
    return result.current;
  };

  it('should return default props for menu and menu trigger', function () {
    let {menuTriggerAriaProps, menuAriaProps} = renderMenuTriggerHook({}, {});
    expect(menuTriggerAriaProps['aria-haspopup']).toBe('true');
    expect(menuTriggerAriaProps['aria-controls']).toBeFalsy();
    expect(menuTriggerAriaProps['aria-expanded']).toBeFalsy();
    expect(menuTriggerAriaProps.role).toBe('button');
    expect(menuTriggerAriaProps.type).toBe('button');

    expect(menuAriaProps['aria-labelledby']).toBe(menuTriggerAriaProps.id);
    expect(menuAriaProps.role).toBe('menu');
  });

  it('should return proper aria props for menu and menu trigger if menu is open', function () {
    let {menuTriggerAriaProps, menuAriaProps} = renderMenuTriggerHook({}, {}, true);
    expect(menuTriggerAriaProps['aria-haspopup']).toBe('true');
    expect(menuTriggerAriaProps['aria-controls']).toBe(menuAriaProps.id);
    expect(menuTriggerAriaProps['aria-expanded']).toBeTruthy();
    expect(menuTriggerAriaProps.role).toBe('button');
    expect(menuTriggerAriaProps.type).toBe('button');

    expect(menuAriaProps['aria-labelledby']).toBe(menuTriggerAriaProps.id);
    expect(menuAriaProps.role).toBe('menu');
  });

  it('allows the user to define ids', function () {
    let {menuTriggerAriaProps, menuAriaProps} = renderMenuTriggerHook({id: 'menuId'}, {id: 'triggerId'});
    expect(menuTriggerAriaProps.id).toBe('triggerId');
    expect(menuAriaProps.id).toBe('menuId');
    expect(menuAriaProps['aria-labelledby']).toBe(menuTriggerAriaProps.id);
  });

  it('returns the proper aria-haspopup based on the menu\'s role', function () {
    let {menuTriggerAriaProps, menuAriaProps} = renderMenuTriggerHook({role: 'listbox'}, {});
    expect(menuAriaProps.role).toBe('listbox');
    expect(menuTriggerAriaProps['aria-haspopup']).toBe('listbox');
  });
});
