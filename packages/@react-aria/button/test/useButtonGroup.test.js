import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useButtonGroup} from '../';

describe('useButton tests', function () {
  let renderButtonGroupHook = (props) => {
    let {result} = renderHook(() => useButtonGroup(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {buttonGroupProps, buttonProps} = renderButtonGroupHook({});
    expect(buttonGroupProps.role).toBe('radiogroup');
    expect(buttonGroupProps['aria-orientation']).toBe('horizontal');
    expect(buttonGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBe('radio');
  });

  it('handles vertical orientation', function () {
    let {buttonGroupProps} = renderButtonGroupHook({orientation: 'vertical'});
    expect(buttonGroupProps['aria-orientation']).toBe('vertical');
  });

  it('handles multiple selection', function () {
    let {buttonGroupProps, buttonProps} = renderButtonGroupHook({allowsMultipleSelection: true});
    expect(buttonGroupProps.role).toBe('toolbar');
    expect(buttonGroupProps.id).toBeDefined();
    expect(buttonProps.role).toBe('checkbox');
  });

  it('handles isDisabled', function () {
    let {buttonGroupProps} = renderButtonGroupHook({isDisabled: true});
    expect(buttonGroupProps['aria-disabled']).toBeTruthy();
  });
});
