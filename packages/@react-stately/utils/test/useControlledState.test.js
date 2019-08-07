import {act, renderHook} from 'react-hooks-testing-library';
import {useControlledState} from '../src';

describe('useControlledState tests', function () {
  it('can handle default setValue behavior, wont invoke onChange for the same value twice in a row', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState(undefined, 'defaultValue', onChangeSpy));
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

  it('can handle callback setValue behavior', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState(undefined, 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('defaultValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('defaultValue');
      return 'newValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('newValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');
  });

  it('can handle controlled setValue behavior', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState('controlledValue', 'defaultValue', onChangeSpy));
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

  it('can handle controlled callback setValue behavior', () => {
    let onChangeSpy = jest.fn();
    let {result} = renderHook(() => useControlledState('controlledValue', 'defaultValue', onChangeSpy));
    let [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();

    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('controlledValue');
      return 'newValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).toHaveBeenLastCalledWith('newValue');

    onChangeSpy.mockClear();

    act(() => setValue((prevValue) => {
      expect(prevValue).toBe('controlledValue');
      return 'controlledValue';
    }));
    [value, setValue] = result.current;
    expect(value).toBe('controlledValue');
    expect(onChangeSpy).not.toHaveBeenCalled();
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
    rerender({value: 'controlledValue', defaultValue: 'defaultValue', onChange: onChangeSpy});
    expect(consoleWarnSpy).toHaveBeenLastCalledWith('WARN: A component changed from uncontrolled to controlled.');
  });
});
