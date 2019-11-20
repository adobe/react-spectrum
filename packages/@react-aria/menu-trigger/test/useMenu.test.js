import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useMenu} from '../';

describe('useMenu', function () {

  let renderMenuHook = (menuProps) => {
    let {result} = renderHook(() => useMenu(menuProps));
    return result.current;
  };

  it('should return default aria props for a menu', function () {
    let props = {};
    let {menuProps} = renderMenuHook(props);
    expect(menuProps['aria-orientation']).toBe('vertical');
    expect(menuProps.role).toBe('menu');
    expect(menuProps.id).toBeTruthy();
    
  });

  it('should return correct aria props for a menu with predefined aria attributes', function () {
    let props = {
      'aria-label': 'blah',
      'aria-labelledby': 'heh',
      role: 'menubar',
      'aria-orientation': 'horizontal'
    };
    let {menuProps} = renderMenuHook(props);
    expect(menuProps['aria-orientation']).toBe('horizontal');
    expect(menuProps['aria-label']).toBe('blah');
    expect(menuProps['aria-labelledby']).toBe(`heh ${menuProps.id}`);
    expect(menuProps.role).toBe('menubar');
    expect(menuProps.id).toBeTruthy();
  });
  

  // TODO: add testing for keyboard commands and focus stuff. Will add after integrating
  // Devon's focus and selection work 
});
