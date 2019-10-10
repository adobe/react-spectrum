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
    let {progressBarProps, labelAriaProps, labelProps, barProps} = renderProgressBarHook({});
    expect(progressBarProps.role).toBe('progressbar');
    expect(progressBarProps['aria-valuenow']).toBe(0);
    expect(progressBarProps['aria-valuemin']).toBe(0);
    expect(progressBarProps['aria-valuemax']).toBe(100);
    expect(progressBarProps['aria-valuetext']).toBe('0%');
    expect(progressBarProps['aria-label']).toBeUndefined();
    expect(progressBarProps['aria-labelledby']).toBeUndefined();
    expect(progressBarProps.id).toBeDefined();
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
    let {progressBarProps} = renderProgressBarHook({value: 25});
    expect(progressBarProps['aria-valuenow']).toBe(25);
    expect(progressBarProps['aria-valuetext']).toBe('25%');
  });

  it('with provided props value -1', () => {
    let {progressBarProps} = renderProgressBarHook({value: -1});
    expect(progressBarProps['aria-valuenow']).toBe(0);
    expect(progressBarProps['aria-valuetext']).toBe('0%');
  });

  it('with provided props value 1000', () => {
    let {progressBarProps} = renderProgressBarHook({value: 1000});
    expect(progressBarProps['aria-valuenow']).toBe(100);
    expect(progressBarProps['aria-valuetext']).toBe('100%');
  });

  it('with custom format options', () => {
    let props = {value: 25, formatOptions: {style: 'currency', currency: 'JPY'}};
    let {progressBarProps, labelProps, barProps} = renderProgressBarHook(props);
    expect(progressBarProps['aria-valuenow']).toBe(25);
    expect(progressBarProps['aria-valuetext']).toBe('¥25');
    expect(labelProps.formattedValueLabel).toBe('¥25');
    expect(barProps.percentage).toBe(25);
  });

  it('with custom children label', () => {
    let props = {children: 'React test', value: 25};
    let {progressBarProps, labelAriaProps} = renderProgressBarHook(props);
    expect(progressBarProps['aria-labelledby']).toBe(labelAriaProps.id);
  });
});
