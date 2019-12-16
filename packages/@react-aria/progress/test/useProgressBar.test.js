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
    let {progressBarProps, labelProps} = renderProgressBarHook({});
    expect(progressBarProps.role).toBe('progressbar');
    expect(progressBarProps['aria-valuemin']).toBe(0);
    expect(progressBarProps['aria-valuemax']).toBe(100);
    expect(progressBarProps['aria-valuenow']).toBe(0);
    expect(progressBarProps['aria-valuetext']).toBe('0%');
    expect(progressBarProps['aria-label']).toBeUndefined();
    expect(progressBarProps['aria-labelledby']).toBeUndefined();
    expect(progressBarProps.id).toBeDefined();
    expect(labelProps.id).toBeDefined();
    expect(labelProps.htmlFor).toBeDefined();
  });

  it('with value of 25%', () => {
    let {progressBarProps} = renderProgressBarHook({value: 25});
    expect(progressBarProps['aria-valuenow']).toBe(25);
    expect(progressBarProps['aria-valuetext']).toBe('25%');
  });

  it('with indeterminate prop', () => {
    let {progressBarProps} = renderProgressBarHook({isIndeterminate: true});
    expect(progressBarProps['aria-valuemin']).toBe(0);
    expect(progressBarProps['aria-valuemax']).toBe(100);
    expect(progressBarProps['aria-valuenow']).toBeUndefined();
    expect(progressBarProps['aria-valuetext']).toBeUndefined();
  });

  it('with custom text value', () => {
    let props = {value: 25, textValue: '¥25'};
    let {progressBarProps} = renderProgressBarHook(props);
    expect(progressBarProps['aria-valuenow']).toBe(25);
    expect(progressBarProps['aria-valuetext']).toBe('¥25');
  });

  it('with custom children label', () => {
    let props = {children: 'React test', value: 25};
    let {progressBarProps, labelProps} = renderProgressBarHook(props);
    expect(progressBarProps['aria-labelledby']).toBe(labelProps.id);
  });
});
