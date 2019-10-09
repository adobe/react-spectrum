import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useProgressCircle} from '../';

describe('useProgressCircle', function () {
  afterEach(cleanup);

  let renderProgressCircleHook = (props) => {
    let {result} = renderHook(() => useProgressCircle(props));
    return result.current;
  };

  it('with default props if no props are provided', () => {
    let {ariaProps} = renderProgressCircleHook({});
    expect(ariaProps.role).toBe('progressbar');
    expect(ariaProps['aria-valuenow']).toBeUndefined();
    expect(ariaProps['aria-valuemin']).toBe(0);
    expect(ariaProps['aria-valuemax']).toBe(100);
    expect(ariaProps.id).toBeDefined();
  });

  it('warns user if no aria-label is provided', () => {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderProgressCircleHook({});
    expect(spyWarn).toHaveBeenCalledWith('You must specify an aria-label for accessibility');
  });

  it('with provided props', () => {
    let {ariaProps} = renderProgressCircleHook({value: 25, isIndeterminate: false});
    expect(ariaProps['aria-valuenow']).toBe(25);
    expect(ariaProps['aria-valuetext']).toBe('25%');
  });

  it('with provided props value -1', () => {
    let {ariaProps} = renderProgressCircleHook({value: -1, isIndeterminate: false});
    expect(ariaProps['aria-valuenow']).toBe(0);
    expect(ariaProps['aria-valuetext']).toBe('0%');
  });

  it('with provided props value 1000', () => {
    let {ariaProps} = renderProgressCircleHook({value: 1000, isIndeterminate: false});
    expect(ariaProps['aria-valuenow']).toBe(100);
    expect(ariaProps['aria-valuetext']).toBe('100%');
  });
});
