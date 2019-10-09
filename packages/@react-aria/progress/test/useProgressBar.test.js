import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useProgressBar} from '../';

describe('useProgressBar', function () {
  afterEach(cleanup);

  let renderProgressBarHook = (props) => {
    let {result} = renderHook(() => useProgressBar(props));
    return result.current;
  };

  it('with default props if no props are provided', () => {
    let {ariaProps, labelAriaProps, labelProps, barProps} = renderProgressBarHook({});
    expect(ariaProps.role).toBe('progressbar');
    expect(ariaProps['aria-valuenow']).toBe(0);
    expect(ariaProps['aria-valuemin']).toBe(0);
    expect(ariaProps['aria-valuemax']).toBe(100);
    expect(ariaProps['aria-valuetext']).toBe('0%');
    expect(ariaProps['aria-label']).toBeUndefined();
    expect(ariaProps['aria-labelledby']).toBeUndefined();
    expect(ariaProps.id).toBeDefined();
    expect(labelAriaProps.id).toBeDefined();
    expect(labelAriaProps.htmlFor).toBeDefined();
    expect(labelProps.formattedValueLabel).toBe('0%');
    expect(barProps.percentage).toBe(0);
  });

  it('warns user if no aria-label is provided', () => {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderProgressBarHook({value: 25});
    expect(spyWarn).toHaveBeenCalledWith('If you do not provide children, you must specify an aria-label for accessibility');
  });

  it('with value of 25%', () => {
    let {ariaProps} = renderProgressBarHook({value: 25});
    expect(ariaProps['aria-valuenow']).toBe(25);
    expect(ariaProps['aria-valuetext']).toBe('25%');
  });

  it('with provided props value -1', () => {
    let {ariaProps} = renderProgressBarHook({value: -1});
    expect(ariaProps['aria-valuenow']).toBe(0);
    expect(ariaProps['aria-valuetext']).toBe('0%');
  });

  it('with provided props value 1000', () => {
    let {ariaProps} = renderProgressBarHook({value: 1000});
    expect(ariaProps['aria-valuenow']).toBe(100);
    expect(ariaProps['aria-valuetext']).toBe('100%');
  });

  it('with custom format options', () => {
    let props = {value: 25, formatOptions: {style: 'currency', currency: 'JPY'}};
    let {ariaProps, labelProps, barProps} = renderProgressBarHook(props);
    expect(ariaProps['aria-valuenow']).toBe(25);
    expect(ariaProps['aria-valuetext']).toBe('¥25');
    expect(labelProps.formattedValueLabel).toBe('¥25');
    expect(barProps.percentage).toBe(25);
  });

  it('with custom children label', () => {
    let props = {children: 'React test', value: 25};
    let {ariaProps, labelAriaProps} = renderProgressBarHook(props);
    expect(ariaProps['aria-labelledby']).toBe(labelAriaProps.id);
  });
});
