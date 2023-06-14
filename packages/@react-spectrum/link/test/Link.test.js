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

import {act, fireEvent, render} from '@react-spectrum/test-utils';
import {Link} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';

// Triggers a "press" event on an element.
// TODO: import from somewhere more common
export function triggerPress(element) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}

describe('Link', function () {
  let onPressSpy = jest.fn();
  let onOpenChange = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    onOpenChange.mockClear();
    onPressSpy.mockClear();
  });

  it.each`
    Name        | Component | props
    ${'Link'}   | ${Link}   | ${{onPress: onPressSpy}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByText} = render(<Component {...props} >Click me</Component>);

    let link = getByText('Click me');
    expect(link).not.toBeNull();

    triggerPress(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name        | Component | props
    ${'Link'}   | ${Link}   | ${{UNSAFE_className: 'test-class'}}
  `('$Name supports UNSAFE_className', function ({Component, props}) {
    let {getByText} = render(<Component {...props} >Click me</Component>);
    let link = getByText('Click me');
    expect(link).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  it('Wraps string to span', () => {
    let {getByRole} = render(<Link >Click me</Link>);
    let link = getByRole('link');
    expect(link).toBeDefined();
    expect(link.nodeName).toBe('SPAN');
    expect(link).toHaveAttribute('tabIndex', '0');
  });

  it('Wraps custom child element', () => {
    let ref = React.createRef();
    let {getByRole} = render(
      <Link UNSAFE_className="test-class" onPress={onPressSpy} >
        <a href="#only-hash-in-jsdom" ref={ref}>Click me </a>
      </Link>
    );
    let link = getByRole('link');
    expect(link).toBeDefined();
    expect(link.nodeName).toBe('A');
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('class', expect.stringContaining('test-class'));
    expect(link).toHaveAttribute('href', '#only-hash-in-jsdom');
    triggerPress(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it('Handles deprecated onClick', () => {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {getByRole} = render(<Link onClick={onPressSpy} >Click me</Link>);
    let link = getByRole('link');
    triggerPress(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(spyWarn).toHaveBeenCalledWith('onClick is deprecated, please use onPress');
  });

  it('supports custom data attributes', () => {
    let {getByRole} = render(<Link data-testid="test">Click me</Link>);
    let link = getByRole('link');
    expect(link).toHaveAttribute('data-testid', 'test');
  });

  it('supports autofocus', () => {
    jest.useFakeTimers();
    let {getByRole} = render(<Link autoFocus>Click me</Link>);
    act(() => {jest.runAllTimers();});
    let link = getByRole('link');
    expect(document.activeElement).toBe(link);
    jest.useRealTimers();
  });

  it('supports a wrapping tooltip trigger', () => {
    let {getByRole, queryByRole} = render(
      <Provider theme={theme}>
        <TooltipTrigger onOpenChange={onOpenChange}>
          <Link>Click me</Link>
          <Tooltip>Helpful information.</Tooltip>
        </TooltipTrigger>
      </Provider>
    );

    expect(queryByRole('tooltip')).toBeNull();
    let link = getByRole('link');
    act(() => {
      link.focus();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();
    act(() => {
      link.blur();
    });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    act(() => {
      jest.runAllTimers();
    });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(tooltip).not.toBeInTheDocument();
  });
});
