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

import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button, ButtonContext, ProgressBar, Text} from '../';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  it('should render a button with default class', () => {
    let {getByRole} = render(<Button>Test</Button>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'react-aria-Button');
  });

  it('should render a button with custom class', () => {
    let {getByRole} = render(<Button className="test">Test</Button>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = render(<Button data-foo="bar">Test</Button>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('data-foo', 'bar');
  });

  it('should support form props', () => {
    let {getByRole} = render(<form id="foo"><Button form="foo" formMethod="post">Test</Button></form>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('form', 'foo');
    expect(button).toHaveAttribute('formMethod', 'post');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ButtonContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Button slot="test">Test</Button>
      </ButtonContext.Provider>
    );

    let button = getByRole('button');
    expect(button).toHaveAttribute('slot', 'test');
    expect(button).toHaveAttribute('aria-label', 'test');
  });

  it('should support hover', async () => {
    let hoverStartSpy = jest.fn();
    let hoverChangeSpy = jest.fn();
    let hoverEndSpy = jest.fn();
    let {getByRole} = render(<Button className={({isHovered}) => isHovered ? 'hover' : ''} onHoverStart={hoverStartSpy} onHoverChange={hoverChangeSpy} onHoverEnd={hoverEndSpy}>Test</Button>);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-hovered');
    expect(button).not.toHaveClass('hover');

    await user.hover(button);
    expect(button).toHaveAttribute('data-hovered', 'true');
    expect(button).toHaveClass('hover');
    expect(hoverStartSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(1);

    await user.unhover(button);
    expect(button).not.toHaveAttribute('data-hovered');
    expect(button).not.toHaveClass('hover');
    expect(hoverEndSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeSpy).toHaveBeenCalledTimes(2);
  });

  it('should support focus ring', async () => {
    let {getByRole} = render(<Button className={({isFocusVisible}) => isFocusVisible ? 'focus' : ''}>Test</Button>);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-focus-visible');
    expect(button).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(button);
    expect(button).toHaveAttribute('data-focus-visible', 'true');
    expect(button).toHaveClass('focus');

    await user.tab();
    expect(button).not.toHaveAttribute('data-focus-visible');
    expect(button).not.toHaveClass('focus');
  });

  it('should support press state', () => {
    let onPress = jest.fn();
    let {getByRole} = render(<Button className={({isPressed}) => isPressed ? 'pressed' : ''} onPress={onPress}>Test</Button>);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    expect(button).not.toHaveClass('pressed');

    fireEvent.mouseDown(button);
    expect(button).toHaveAttribute('data-pressed', 'true');
    expect(button).toHaveClass('pressed');

    fireEvent.mouseUp(button);
    expect(button).not.toHaveAttribute('data-pressed');
    expect(button).not.toHaveClass('pressed');

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should support disabled state', () => {
    let {getByRole} = render(<Button isDisabled className={({isDisabled}) => isDisabled ? 'disabled' : ''}>Test</Button>);
    let button = getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled');
  });

  it('should support render props', () => {
    let {getByRole} = render(<Button>{({isPressed}) => isPressed ? 'Pressed' : 'Test'}</Button>);
    let button = getByRole('button');

    expect(button).toHaveTextContent('Test');

    fireEvent.mouseDown(button);
    expect(button).toHaveTextContent('Pressed');

    fireEvent.mouseUp(button);
    expect(button).toHaveTextContent('Test');
  });

  // isPending state
  it('displays a spinner after a short delay when isPending prop is true', async function () {
    let onPressSpy = jest.fn();
    function TestComponent() {
      let [pending, setPending] = useState(false);
      return (
        <Button
          onPress={() => {
            setPending(true);
            onPressSpy();
          }}
          isPending={pending}>
          {({isPending}) => (
            <>
              <Text style={{visibility: isPending ? 'hidden' : undefined}}>Test</Text>
              <ProgressBar
                aria-label="loading"
                style={{visibility: isPending ? undefined : 'hidden'}}
                isIndeterminate>
                loading
              </ProgressBar>
            </>
          )}
        </Button>
      );
    }
    let {getByRole} = render(<TestComponent />);
    let button = getByRole('button');
    expect(button).not.toHaveAttribute('aria-disabled');
    await user.click(button);
    // Button is disabled immediately, but spinner visibility is delayed
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // Multiple clicks shouldn't call onPressSpy
    await user.click(button);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  // isPending anchor element
  it('removes href attribute from anchor element when isPending is true', () => {
    let {getByRole} = render(
      <Button href="//example.com" isPending>
        {({isPending}) => (
          <>
            <Text style={{visibility: isPending ? 'hidden' : undefined}}>Click me</Text>
            <ProgressBar
              aria-label="loading"
              style={{visibility: isPending ? undefined : 'hidden'}}
              isIndeterminate>
              loading
            </ProgressBar>
          </>
        )}
      </Button>
    );
    let button = getByRole('button');
    expect(button).not.toHaveAttribute('href');
  });
});
