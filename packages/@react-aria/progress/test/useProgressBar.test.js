/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
    let {progressBarProps} = renderProgressBarHook({});
    expect(progressBarProps.role).toBe('progressbar');
    expect(progressBarProps['aria-valuemin']).toBe(0);
    expect(progressBarProps['aria-valuemax']).toBe(100);
    expect(progressBarProps['aria-valuenow']).toBe(0);
    expect(progressBarProps['aria-valuetext']).toBe('0%');
    expect(progressBarProps['aria-label']).toBeUndefined();
    expect(progressBarProps['aria-labelledby']).toBeUndefined();
  });

  it('supports labeling', () => {
    let {progressBarProps, labelProps} = renderProgressBarHook({label: 'Test'});
    expect(labelProps.id).toBeDefined();
    expect(progressBarProps['aria-labelledby']).toBe(labelProps.id);
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

  it('with custom label', () => {
    let props = {label: 'React test', value: 25};
    let {progressBarProps, labelProps} = renderProgressBarHook(props);
    expect(progressBarProps['aria-labelledby']).toBe(labelProps.id);
  });
});
