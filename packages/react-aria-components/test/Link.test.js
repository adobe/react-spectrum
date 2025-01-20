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

import {Link, LinkContext, RouterProvider} from '../';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Link', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

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

  it('should support render props', async () => {
    let {getByRole} = render(<Link>{({isHovered}) => isHovered ? 'Hovered' : 'Test'}</Link>);
    let link = getByRole('link');
    expect(link).toHaveTextContent('Test');
    await user.hover(link);
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
    let {getByRole} = render(<Link href="test">Test</Link>);
    let link = getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('class', 'react-aria-Link');
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByRole} = render(<Link className={({isHovered}) => isHovered ? 'hover' : ''} onHoverStart={hoverStartSpy} onHoverChange={hoverChangeSpy} onHoverEnd={hoverEndSpy}>Test</Link>);
    let link = getByRole('link');

    expect(link).not.toHaveAttribute('data-hovered');
    expect(link).not.toHaveClass('hover');

    await user.hover(link);
    expect(link).toHaveAttribute('data-hovered', 'true');
    expect(link).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(link);
    expect(link).not.toHaveAttribute('data-hovered');
    expect(link).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should support focus ring', async () => {
    let {getByRole} = render(<Link className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>Test</Link>);
    let link = getByRole('link');

    expect(link).not.toHaveAttribute('data-focus-visible');
    expect(link).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(link);
    expect(link).toHaveAttribute('data-focus-visible', 'true');
    expect(link).toHaveClass('focus');

    await user.tab();
    expect(link).not.toHaveAttribute('data-focus-visible');
    expect(link).not.toHaveClass('focus');
  });

  it('should support press state', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(<Link className={({isPressed}) => isPressed ? 'pressed' : ''} onPress={onPress}>Test</Link>);
    let link = getByRole('link');

    expect(link).not.toHaveAttribute('data-pressed');
    expect(link).not.toHaveClass('pressed');

    await user.pointer({target: link, keys: '[MouseLeft>]'});
    expect(link).toHaveAttribute('data-pressed', 'true');
    expect(link).toHaveClass('pressed');

    await user.pointer({target: link, keys: '[/MouseLeft]'});
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

  it('should work with RouterProvider', async () => {
    let navigate = jest.fn();
    let useHref = href => '/base' + href;
    let {getByRole} = render(
      <RouterProvider navigate={navigate} useHref={useHref}>
        <Link href="/foo" routerOptions={{foo: 'bar'}}>Test</Link>
      </RouterProvider>
    );
    let link = getByRole('link');
    expect(link).toHaveAttribute('href', '/base/foo');
    await user.click(link);
    expect(navigate).toHaveBeenCalledWith('/foo', {foo: 'bar'});
  });
});
