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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button, ButtonContext, ProgressBar, Text} from '../';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    // clear any live announcers from pending buttons
    act(() => jest.runAllTimers());
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

  it('should support accessibility props', () => {
    let {getByRole} = render(<Button aria-current="page">Test</Button>);
    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-current', 'page');
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

  it('should support press state', async () => {
    let onPress = jest.fn();
    let {getByRole} = render(<Button className={({isPressed}) => isPressed ? 'pressed' : ''} onPress={onPress}>Test</Button>);
    let button = getByRole('button');

    expect(button).not.toHaveAttribute('data-pressed');
    expect(button).not.toHaveClass('pressed');

    await user.pointer({target: button, keys: '[MouseLeft>]'});
    expect(button).toHaveAttribute('data-pressed', 'true');
    expect(button).toHaveClass('pressed');

    await user.pointer({target: button, keys: '[/MouseLeft]'});
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

  it('should support render props', async () => {
    let {getByRole} = render(<Button>{({isPressed}) => isPressed ? 'Pressed' : 'Test'}</Button>);
    let button = getByRole('button');

    expect(button).toHaveTextContent('Test');

    await user.pointer({target: button, keys: '[MouseLeft>]'});
    expect(button).toHaveTextContent('Pressed');

    await user.pointer({target: button, keys: '[/MouseLeft]'});
    expect(button).toHaveTextContent('Test');
  });

  // isPending state
  it('displays a spinner when isPending prop is true', async function () {
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
              <Text style={{opacity: isPending ? '0' : undefined}}>Test</Text>
              <ProgressBar
                aria-label="loading"
                style={{opacity: isPending ? undefined : '0'}}
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

  it('should prevent explicit mouse form submission when isPending', async function () {
    let onSubmitSpy = jest.fn(e => e.preventDefault());
    function TestComponent() {
      let [pending, setPending] = useState(false);
      return (
        <Button
          type="submit"
          onPress={() => {
            // immediately setting pending to true will remove the click handler before the form is submitted
            setTimeout(() => {
              setPending(true);
            }, 0);
          }}
          isPending={pending}>
          {({isPending}) => (
            <>
              <Text style={{opacity: isPending ? '0' : undefined}}>Test</Text>
              <ProgressBar
                aria-label="loading"
                style={{opacity: isPending ? undefined : '0'}}
                isIndeterminate>
                loading
              </ProgressBar>
            </>
          )}
        </Button>
      );
    }
    let {getByRole} = render(
      <form onSubmit={onSubmitSpy}>
        <TestComponent />
      </form>
    );
    let button = getByRole('button');
    expect(button).not.toHaveAttribute('aria-disabled');

    await user.click(button);
    expect(onSubmitSpy).toHaveBeenCalled();
    onSubmitSpy.mockClear();

    // run timer to set pending
    act(() => jest.runAllTimers());

    await user.click(button);
    expect(onSubmitSpy).not.toHaveBeenCalled();
  });

  it('should prevent explicit keyboard form submission when isPending', async function () {
    let onSubmitSpy = jest.fn(e => e.preventDefault());
    function TestComponent() {
      let [pending, setPending] = useState(false);
      return (
        <Button
          type="submit"
          onPress={() => {
            // immediately setting pending to true will remove the click handler before the form is submitted
            setTimeout(() => {
              setPending(true);
            }, 0);
          }}
          isPending={pending}>
          {({isPending}) => (
            <>
              <Text style={{opacity: isPending ? '0' : undefined}}>Test</Text>
              <ProgressBar
                aria-label="loading"
                style={{opacity: isPending ? undefined : '0'}}
                isIndeterminate>
                loading
              </ProgressBar>
            </>
          )}
        </Button>
      );
    }
    render(
      <form onSubmit={onSubmitSpy}>
        <TestComponent />
      </form>
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onSubmitSpy).toHaveBeenCalled();
    onSubmitSpy.mockClear();
    act(() => jest.runAllTimers());

    await user.keyboard('{Enter}');
    expect(onSubmitSpy).not.toHaveBeenCalled();
  });

  // Note: two inputs are needed, otherwise https://www.w3.org/TR/2011/WD-html5-20110525/association-of-controls-and-forms.html#implicit-submission
  // Implicit form submission can happen if there's only one.
  it('should prevent implicit form submission when isPending', async function () {
    let onSubmitSpy = jest.fn(e => e.preventDefault());
    function TestComponent(props) {
      let [pending, setPending] = useState(false);
      return (
        <form
          onSubmit={(e) => {
            // forms are submitted implicitly on keydown, so we need to wait to set pending until after to set pending
            props.onSubmit(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // keyup could theoretically happen elsewhere if focus is moved during submission
              document.body.addEventListener('keyup', () => {
                setPending(true);
              }, {capture: true, once: true});
            }
          }}>
          <label htmlFor="foo">Test</label>
          <input id="foo" type="text" />
          <input id="bar" type="text" />
          <Button
            type="submit"
            isPending={pending}>
            {({isPending}) => (
              <>
                <Text style={{opacity: isPending ? '0' : undefined}}>Test</Text>
                <ProgressBar
                  aria-label="loading"
                  style={{opacity: isPending ? undefined : '0'}}
                  isIndeterminate>
                  loading
                </ProgressBar>
              </>
            )}
          </Button>
        </form>
      );
    }
    render(
      <TestComponent onSubmit={onSubmitSpy} />
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onSubmitSpy).toHaveBeenCalled();
    onSubmitSpy.mockClear();

    await user.keyboard('{Enter}');
    expect(onSubmitSpy).not.toHaveBeenCalled();
  });
});
