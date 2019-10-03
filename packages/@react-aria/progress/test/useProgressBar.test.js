import {cleanup} from '@testing-library/react';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useProgressBar} from '../';

describe('useProgressCircle', function () {
  afterEach(cleanup);

  let state = {};

  let renderProgressBarHook = (props) => {
    let {result} = renderHook(() => useProgressBar(props, state));
    return result.current;
  };

  it('with default props if no props are provided', () => {
    let {ariaProps} = renderProgressBarHook({});
    expect(ariaProps.role).toBe('progressbar');
    expect(ariaProps['aria-valuenow']).toBe(0);
    expect(ariaProps['aria-valuemin']).toBe(0);
    expect(ariaProps['aria-valuemax']).toBe(100);
    expect(ariaProps['aria-valuetext']).toBe('0%');
    expect(ariaProps['aria-label']).toBeUndefined();
    expect(ariaProps['aria-labelledby']).toBeUndefined();
    expect(ariaProps.id).toBeDefined();
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
    let {ariaProps, formattedValueLabel, percentage} = renderProgressBarHook(props);
    expect(ariaProps['aria-valuenow']).toBe(25);
    expect(ariaProps['aria-valuetext']).toBe('¥25');
    expect(formattedValueLabel).toBe('¥25');
    expect(percentage).toBe(25);
  });

  it('with custom children label', () => {
    let props = {children: 'React test', value: 25};
    let {ariaProps, labelAriaProps} = renderProgressBarHook(props);
    expect(ariaProps['aria-labelledby']).toBe(labelAriaProps.id);
  });
});
