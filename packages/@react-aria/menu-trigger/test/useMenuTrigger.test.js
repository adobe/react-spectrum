import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useMenuTrigger} from '../';

describe('useMenuTrigger', function () {

  let renderMenuTriggerHook = (menuProps, menuTriggerProps, isOpen) => {
    let {result} = renderHook(() => useMenuTrigger(menuProps, menuTriggerProps, isOpen));
    return result.current;
  };

  it('should return default props for menu and menu trigger', function () {
    let props = {
      menuProps: {},
      triggerProps: {},
      state: {}
    };
    let {menuTriggerProps, menuProps} = renderMenuTriggerHook(props);
    expect(menuTriggerProps['aria-haspopup']).toBe('true');
    expect(menuTriggerProps['aria-controls']).toBeFalsy();
    expect(menuTriggerProps['aria-expanded']).toBeFalsy();
    expect(menuTriggerProps.role).toBe('button');
    expect(menuTriggerProps.type).toBe('button');

    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
    expect(menuProps.role).toBe('menu');
  });

  it('should return proper aria props for menu and menu trigger if menu is open', function () {
    let props = {
      menuProps: {},
      triggerProps: {},
      state: {
        isOpen: true
      }
    };

    let {menuTriggerProps, menuProps} = renderMenuTriggerHook(props);
    expect(menuTriggerProps['aria-haspopup']).toBe('true');
    expect(menuTriggerProps['aria-controls']).toBe(menuProps.id);
    expect(menuTriggerProps['aria-expanded']).toBeTruthy();
    expect(menuTriggerProps.role).toBe('button');
    expect(menuTriggerProps.type).toBe('button');

    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
    expect(menuProps.role).toBe('menu');
  });

  it('allows the user to define ids', function () {
    let props = {
      menuProps: {
        id: 'menuId'
      }, 
      triggerProps: {
        id: 'triggerId'
      },
      state: {
        isOpen: true
      }
    };

    let {menuTriggerProps, menuProps} = renderMenuTriggerHook(props);
    expect(menuTriggerProps.id).toBe('triggerId');
    expect(menuProps.id).toBe('menuId');
    expect(menuProps['aria-labelledby']).toBe(menuTriggerProps.id);
  });

  it('returns the proper aria-haspopup based on the menu\'s role', function () {
    let props = {
      menuProps: {
        role: 'listbox'
      },
      triggerProps: {},
      state: {
        isOpen: true
      }
    };

    let {menuTriggerProps, menuProps} = renderMenuTriggerHook(props);
    expect(menuProps.role).toBe('listbox');
    expect(menuTriggerProps['aria-haspopup']).toBe('listbox');
  });
});
