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

import {actHook as act, pointerMap, render, renderHook} from '@react-spectrum/test-utils-internal';
import React, {useEffect, useState} from 'react';
import {useControlledState} from '../src';
import userEvent from '@testing-library/user-event';

describe('useControlledState tests', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('can handle default setValue behavior, wont invoke onChange for the same value twice in a row', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState<string>(undefined, 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('defaultValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => setValue('newValue'));
    [value, setValue] = result.current;
    expect(value).toBe('newValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

    act(() => setValue('newValue2'));
    [value, setValue] = result.current;
    expect(value).toBe('newValue2');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue2');

    // clear it so we can check more easily that it's not called in the next expect
    onChangeSpy.mockClear();

    act(() => setValue('newValue2'));
    [value, setValue] = result.current;
    expect(value).toBe('newValue2');
    expect(onChangeSpy).not.toHaveBeenCalled();

    // it should call onChange with a new but not immediately previously run value
    act(() => setValue('newValue'));
    [value, setValue] = result.current;
    expect(value).toBe('newValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');
  });

  it('using NaN will only trigger onChange once', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState<number | null>(undefined, null, onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe(null);
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => setValue(NaN));
    [value, setValue] = result.current;
    expect(value).toBe(NaN);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenLastCalledWith(NaN);

    act(() => setValue(NaN));
    [value, setValue] = result.current;
    expect(value).toBe(NaN);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  // @deprecated - ignore TS
  it('can handle callback setValue behavior', () => {
    let onChangeSpy = jest.fn();
    let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {result} = renderHook(() => useControlledState<string>(undefined, 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('defaultValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
    // @ts-ignore
    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('defaultValue');
      return 'newValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('newValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');
    expect(consoleWarnSpy).toHaveBeenLastCalledWith('We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320');
  });

  it('does not trigger too many renders', async () => {
    let renderSpy = jest.fn();

    let TestComponent = (props) => {
      let [state, setState] = useControlledState(props.value, props.defaultValue, props.onChange);
      useEffect(() => renderSpy(), [state]);
      return <button onClick={() => setState(state + 1)} data-testid={state} />;
    };

    let TestComponentWrapper = (props) => {
      let [state, setState] = useState(props.defaultValue);
      return <TestComponent onChange={(value) => setState(value)} value={state} />;
    };

    let {getByRole, getByTestId} = render(<TestComponentWrapper defaultValue={5} />);
    let button = getByRole('button');
    getByTestId('5');
    if (!process.env.STRICT_MODE) {
      expect(renderSpy).toBeCalledTimes(1);
    }
    await user.click(button);
    getByTestId('6');
    if (!process.env.STRICT_MODE) {
      expect(renderSpy).toBeCalledTimes(2);
    }
  });

  it('can handle controlled setValue behavior', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState<string>('controlledValue', 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();

    act(() => setValue('newValue'));
    [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

    onChangeSpy.mockClear();

    act(() => setValue('controlledValue'));
    [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  // @deprecated - ignore TS
  it('can handle controlled callback setValue behavior', () => {
    let onChangeSpy = jest.fn();
    let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {result} = renderHook(() => useControlledState('controlledValue', 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();

    // @ts-ignore
    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('controlledValue');
      return 'newValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

    onChangeSpy.mockClear();

    // @ts-ignore
    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('controlledValue');
      return 'controlledValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenLastCalledWith('We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320');
  });

  // @deprecated - ignore TS
  it('can handle controlled callback setValue behavior after prop change', () => {
    let onChangeSpy = jest.fn();
    let propValue = 'controlledValue';
    let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {result, rerender} = renderHook(() => useControlledState(propValue, 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();

    propValue = 'updated';
    rerender();
    [value, setValue] = result.current;

    // @ts-ignore
    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('updated');
      return 'newValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('updated');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

    onChangeSpy.mockClear();

    // @ts-ignore
    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('updated');
      return 'updated';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('updated');
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    expect(consoleWarnSpy).toHaveBeenLastCalledWith('We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320');

  });

  it('will console warn if the programmer tries to switch from controlled to uncontrolled', () => {
    let onChangeSpy = jest.fn();
    let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {result, rerender} = renderHook(
      ({value, defaultValue, onChange}) => useControlledState(value, defaultValue, onChange),
      {
        initialProps: {
          value: 'controlledValue',
          defaultValue: 'defaultValue',
          onChange: onChangeSpy
        }
      }
    );
    let [value] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
    // @ts-ignore this is an invalid case anyways
    rerender({value: undefined, defaultValue: 'defaultValue', onChange: onChangeSpy});
    expect(consoleWarnSpy).toHaveBeenLastCalledWith('WARN: A component changed from controlled to uncontrolled.');
  });

  it('will console warn if the programmer tries to switch from uncontrolled to controlled', () => {
    let onChangeSpy = jest.fn();
    let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {result, rerender} = renderHook(
      ({value, defaultValue, onChange}) => useControlledState(value, defaultValue, onChange),
      {
        initialProps: {
          value: undefined,
          defaultValue: 'defaultValue',
          onChange: onChangeSpy
        }
      }
    );
    let [value] = result.current;
    expect(value).toBe('defaultValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
    // @ts-ignore this is an invalid case anyways
    rerender({value: 'controlledValue', defaultValue: 'defaultValue', onChange: onChangeSpy});
    expect(consoleWarnSpy).toHaveBeenLastCalledWith('WARN: A component changed from uncontrolled to controlled.');
  });

  it('should work with suspense when controlled', async () => {
    if (parseInt(React.version, 10) < 18) {
      return;
    }

    const AsyncChild = React.lazy(() => new Promise(() => {}));
    function Test(props) {
      let [value, setValue] = useState(1);
      let [showChild, setShowChild] = useState(false);

      return (
        <>
          <TransitionButton
            onClick={() => {
              setValue(3);
              setShowChild(true);
            }} />
          <Child
            value={value}
            onChange={(v) => {
              setValue(v);
              props.onChange(v);
            }} />
          {showChild && <AsyncChild />}
        </>
      );
    }

    function Child(props) {
      let [value, setValue] = useControlledState(props.value, props.defaultValue, props.onChange);
      return (
        <button data-testid="value" onClick={() => setValue(value + 1)}>{value}</button>
      );
    }

    function TransitionButton({onClick}) {
      let [isPending, startTransition] = React.useTransition();
      return (
        <button
          data-testid="show"
          onClick={() => {
            startTransition(() => {
              onClick();
            });
          }}>
          {isPending ? 'Loading' : 'Show'}
        </button>
      );
    }

    let onChange = jest.fn();
    let tree = render(<Test onChange={onChange} />);
    let value = tree.getByTestId('value');
    let show = tree.getByTestId('show');

    expect(value).toHaveTextContent('1');
    await user.click(value);

    // Clicking the button should update the value as normal.
    expect(value).toHaveTextContent('2');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2);

    // Clicking the show button starts a transition. The new value of 3
    // will be thrown away by React since the component suspended.
    expect(show).toHaveTextContent('Show');
    await user.click(show);
    expect(show).toHaveTextContent('Loading');
    expect(value).toHaveTextContent('2');

    // Since the previous render was thrown away, the current value shown
    // to the user is still 2. Clicking the button should bump it to 3 again.
    await user.click(value);
    expect(value).toHaveTextContent('3');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('should work with suspense when uncontrolled', async () => {
    if (parseInt(React.version, 10) < 18) {
      return;
    }

    let resolve;
    const AsyncChild = React.lazy(() => new Promise((r) => {resolve = r;}));
    function Test(props) {
      let [value, setValue] = useControlledState<number>(undefined, 1, props.onChange);
      let [showChild, setShowChild] = useState(false);
      let [isPending, startTransition] = React.useTransition();

      return (
        <>
          <button
            data-testid="value"
            onClick={() => {
              startTransition(() => {
                setValue(value + 1);
                setShowChild(true);
              });
            }}>
            {value}
            {isPending ? ' (Loading)' : ''}
          </button>
          {showChild && <AsyncChild />}
        </>
      );
    }

    function LoadedComponent() {
      return <div>Hello</div>;
    }

    let onChange = jest.fn();
    let tree = render(<Test onChange={onChange} />);
    let value = tree.getByTestId('value');

    expect(value).toHaveTextContent('1');
    await user.click(value);

    // React aborts the render, so the value stays at 1.
    expect(value).toHaveTextContent('1 (Loading)');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2);

    // Attempting to change the value will be aborted again.
    await user.click(value);
    expect(value).toHaveTextContent('1 (Loading)');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2);

    // Now resolve the suspended component.
    // Value should now update to the latest one.
    resolve({default: LoadedComponent});
    await act(() => Promise.resolve());
    expect(value).toHaveTextContent('2');

    // Now incrementing works again.
    await user.click(value);
    expect(value).toHaveTextContent('3');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(3);
  });
});
