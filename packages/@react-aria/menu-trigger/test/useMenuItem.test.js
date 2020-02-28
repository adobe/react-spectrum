import {renderHook} from 'react-hooks-testing-library';
import {useMenuItem} from '../';

describe('useMenuItem', function () {
  let setFocusedKey = jest.fn();
  let mockState = {
    selectionManager: {
      setFocusedKey
    }
  };
  let onClose = jest.fn();

  let renderMenuHook = (menuItemProps, closeOnSelect) => {
    let ref = {
      current: {
        focus: jest.fn()
      }
    };
    let {result} = renderHook(() => useMenuItem(menuItemProps, ref, mockState, onClose, closeOnSelect));
    return result.current;
  };
  // All interactions (keydown, press interactions) and aria props are tested within Menu.test.js

  it('should return default props for a menuitem', function () {
    let {menuItemProps} = renderMenuHook({});
    expect(menuItemProps['aria-disabled']).toBeUndefined();
    expect(menuItemProps.role).toBe('menuitem');
    expect(menuItemProps.id).toBeTruthy();
    expect(menuItemProps.tabIndex).toBe(0);
    expect(menuItemProps.onKeyDown).toBeTruthy();
    expect(menuItemProps.onKeyUp).toBeTruthy();
    expect(menuItemProps.onFocus).toBeTruthy();
    expect(menuItemProps.onMouseDown).toBeTruthy();
    expect(menuItemProps.onMouseOver).toBeTruthy();
    expect(menuItemProps.onMouseEnter).toBeTruthy();
    expect(menuItemProps.onMouseLeave).toBeTruthy();
    expect(menuItemProps.onTouchStart).toBeTruthy();
    expect(menuItemProps.onTouchMove).toBeTruthy();
    expect(menuItemProps.onTouchEnd).toBeTruthy();
    expect(menuItemProps.onTouchCancel).toBeTruthy();
    expect(menuItemProps.onClick).toBeTruthy();
  });

  it('should accommodate user defined aria attributes', function () {
    let props = {
      role: 'option'
    };
    let {menuItemProps} = renderMenuHook(props);
    expect(menuItemProps.role).toBe('option');
  });

  it('should call setFocusedKey if item is moused over', function () {    
    let props = {
      key: 'testkey'
    };
    let {menuItemProps} = renderMenuHook(props);
    menuItemProps.onMouseOver();
    expect(setFocusedKey).toHaveBeenCalledWith(props.key);
  });
});
