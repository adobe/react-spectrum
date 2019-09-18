import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useButton} from '../';

describe('useButton tests', function () {
  it('handles defaults', function () {
    let props = {};
    let {result} = renderHook(() => useButton(props));
    expect(typeof result.current.buttonProps.onClick).toBe('function');
  });
  it('handles elements other than button', function () {
    let props = {elementType: 'a'};
    let {result} = renderHook(() => useButton(props));
    expect(result.current.buttonProps.role).toBe('button');
    expect(result.current.buttonProps.tabIndex).toBe(0);
    expect(result.current.buttonProps['aria-disabled']).toBeUndefined();
    expect(result.current.buttonProps.href).toBeUndefined();
    expect(typeof result.current.buttonProps.onKeyDown).toBe('function');
  });
});
