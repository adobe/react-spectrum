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

import {act, render} from '@testing-library/react';
import React from 'react';
import {useCheckboxGroupState} from '../';

describe('useCheckboxGroupState', () => {
  it('should return basic interface when no props are provided', () => {
    function Test() {
      const state = useCheckboxGroupState();

      expect(typeof state.name).toBe('string');
      expect(state.value).toEqual([]);
      expect(typeof state.setValue).toBe('function');
      expect(typeof state.addValue).toBe('function');
      expect(typeof state.removeValue).toBe('function');
      expect(typeof state.toggleValue).toBe('function');

      return null;
    }
    render(<Test />);
  });

  it('should return the same `name` that has been provided', () => {
    function Test() {
      const state = useCheckboxGroupState({name: 'foo'});

      expect(state.name).toBe('foo');

      return null;
    }
    render(<Test />);
  });

  it('should be possible to provide the initial value', () => {
    function Test() {
      const state = useCheckboxGroupState({value: ['foo', 'bar']});

      expect(state.value).toEqual(['foo', 'bar']);

      return null;
    }
    render(<Test />);
  });

  it('should be possible to provide a default value', () => {
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo', 'bar']});

      expect(state.value).toEqual(['foo', 'bar']);

      return null;
    }
    render(<Test />);
  });

  it('should be possible to control the value', () => {
    function Test({value}: {value: string[]}) {
      const state = useCheckboxGroupState({value});
      return <>{state.value.join(', ')}</>;
    }
    const {container, rerender} = render(<Test value={['foo']} />);

    expect(container.textContent).toBe('foo');

    rerender(<Test value={['foo', 'bar']} />);

    expect(container.textContent).toBe('foo, bar');
  });

  it('should be possible to have the value uncontrolled', () => {
    let setValue: (value: string[]) => void;
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo']});
      setValue = state.setValue;
      return <>{state.value.join(', ')}</>;
    }
    const {container} = render(<Test />);

    expect(container.textContent).toBe('foo');

    act(() => {
      setValue(['foo', 'bar']);
    });

    expect(container.textContent).toBe('foo, bar');
  });

  it('should call the provided `onChange` callback whenever value changes', () => {
    const onChangeSpy = jest.fn();
    const nextValue = ['foo', 'bar'];
    let setValue: (value: string[]) => void;

    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo'], onChange: onChangeSpy});
      setValue = state.setValue;
      return <>{state.value.join(', ')}</>;
    }

    render(<Test />);

    act(() => {
      setValue(nextValue);
    });

    expect(onChangeSpy).toHaveBeenCalledWith(nextValue);
  });

  it('should be possible to add a value using `addValue`', () => {
    let addValue: (value: string) => void;
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo']});
      addValue = state.addValue;
      return <>{state.value.join(', ')}</>;
    }
    const {container} = render(<Test />);

    act(() => {
      addValue('baz');
    });

    expect(container.textContent).toBe('foo, baz');
  });

  it('should not add the same value multiple times when using `addValue`', () => {
    let addValue: (value: string) => void;
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo']});
      addValue = state.addValue;
      return <>{state.value.join(', ')}</>;
    }
    const {container} = render(<Test />);

    act(() => {
      addValue('baz');
      addValue('baz');
      addValue('baz');
      addValue('baz');
    });

    expect(container.textContent).toBe('foo, baz');
  });

  it('should be possible to remove a value using `removeValue`', () => {
    let removeValue: (value: string) => void;
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo', 'qwe']});
      removeValue = state.removeValue;
      return <>{state.value.join(', ')}</>;
    }
    const {container} = render(<Test />);

    act(() => {
      removeValue('foo');
    });

    expect(container.textContent).toBe('qwe');
  });

  it('should be possible to add & remove value based on it being or not in the stored value using `toggleValue`', () => {
    let toggleValue: (value: string) => void;
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo', 'qwe']});
      toggleValue = state.toggleValue;
      return <>{state.value.join(', ')}</>;
    }
    const {container} = render(<Test />);

    act(() => {
      toggleValue('foo');
    });

    expect(container.textContent).toBe('qwe');

    act(() => {
      toggleValue('foo');
    });

    expect(container.textContent).toBe('qwe, foo');
  });

  it('should go back to the initial value after `toggleState` being called twice with the same value synchronously', () => {
    let toggleValue: (value: string) => void;
    function Test() {
      const state = useCheckboxGroupState({defaultValue: ['foo', 'qwe']});
      toggleValue = state.toggleValue;
      return <>{state.value.join(', ')}</>;
    }
    const {container} = render(<Test />);

    act(() => {
      toggleValue('qwe');
      toggleValue('qwe');
    });

    expect(container.textContent).toBe('foo, qwe');
  });

  it('should not update state for readonly group', () => {
    let addValue: (value: string) => void;
    let removeValue: (value: string) => void;
    let toggleValue: (value: string) => void;

    function Test() {
      const state = useCheckboxGroupState({isReadOnly: true, defaultValue: ['test']});
      addValue = state.addValue;
      removeValue = state.removeValue;
      toggleValue = state.toggleValue;

      return <>{state.value.join(', ')}</>;
    }

    const {container} = render(<Test />);

    expect(container.textContent).toBe('test');

    act(() => {
      addValue('foo');
    });

    expect(container.textContent).toBe('test');

    act(() => {
      removeValue('test');
    });

    expect(container.textContent).toBe('test');

    act(() => {
      toggleValue('foo');
    });

    expect(container.textContent).toBe('test');
  });
});
