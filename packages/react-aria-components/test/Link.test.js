/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, render} from '@react-spectrum/test-utils';
import {Link, LinkContext} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Link', () => {
  it('should render a link with default class', () => {
    let {getByRole} = render(<Link>Test</Link>);
    let link = getByRole('link');
    expect(link.tagName).toBe('SPAN');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
  });

  it('should render a link with custom class', () => {
    let {getByRole} = render(<Link className="test">Test</Link>);
    let link = getByRole('link');
    expect(link).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = render(<Link data-foo="bar">Test</Link>);
    let link = getByRole('link');
    expect(link).toHaveAttribute('data-foo', 'bar');
  });

  it('should support render props', () => {
    let {getByRole} = render(<Link>{({isHovered}) => isHovered ? 'Hovered' : 'Test'}</Link>);
    let link = getByRole('link');
    expect(link).toHaveTextContent('Test');
    userEvent.hover(link);
    expect(link).toHaveTextContent('Hovered');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <LinkContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Link slot="test">Test</Link>
      </LinkContext.Provider>
    );

    let link = getByRole('link');
    expect(link).toHaveAttribute('slot', 'test');
    expect(link).toHaveAttribute('aria-label', 'test');
  });

  it('should render a link with <a> element', () => {
    let {getByRole} = render(<Link><a href="test">Test</a></Link>);
    let link = getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
  });

  it('should support hover', () => {
    let {getByRole} = render(<Link className={({isHovered}) => isHovered ? 'hover' : ''}>Test</Link>);
    let link = getByRole('link');

    expect(link).not.toHaveAttribute('data-hovered');
    expect(link).not.toHaveClass('hover');

    userEvent.hover(link);
    expect(link).toHaveAttribute('data-hovered', 'true');
    expect(link).toHaveClass('hover');

    userEvent.unhover(link);
    expect(link).not.toHaveAttribute('data-hovered');
    expect(link).not.toHaveClass('hover');
  });

  it('should support focus ring', () => {
    let {getByRole} = render(<Link className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>Test</Link>);
    let link = getByRole('link');
    
    expect(link).not.toHaveAttribute('data-focus-visible');
    expect(link).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(link);
    expect(link).toHaveAttribute('data-focus-visible', 'true');
    expect(link).toHaveClass('focus');

    userEvent.tab();
    expect(link).not.toHaveAttribute('data-focus-visible');
    expect(link).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let onPress = jest.fn();
    let {getByRole} = render(<Link className={({isPressed}) => isPressed ? 'pressed' : ''} onPress={onPress}>Test</Link>);
    let link = getByRole('link');

    expect(link).not.toHaveAttribute('data-pressed');
    expect(link).not.toHaveClass('pressed');

    fireEvent.mouseDown(link);
    expect(link).toHaveAttribute('data-pressed', 'true');
    expect(link).toHaveClass('pressed');

    fireEvent.mouseUp(link);
    expect(link).not.toHaveAttribute('data-pressed');
    expect(link).not.toHaveClass('pressed');

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should support disabled state', () => {
    let {getByRole} = render(<Link isDisabled className={({isDisabled}) => isDisabled ? 'disabled' : ''}>Test</Link>);
    let link = getByRole('link');

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveClass('disabled');
  });
});
