import {act, renderHook} from 'react-hooks-testing-library';
import {useTextFieldState} from '../';

describe('useTextFieldState', () => {
  let onChange = jest.fn();
  let newValue = 'newValue';

  afterEach(() => {
    onChange.mockClear();
  });

  it('should be controlled if props.value is defined', () => {
    let props = {
      value: 'blah',
      onChange
    };
    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe(props.value);
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(props.value);
    expect(onChange).toHaveBeenCalledWith(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should start with value = props.defaultValue if props.value is not defined and props.defaultValue is defined', () => {
    let props = {
      defaultValue: 'blah',
      onChange
    };
    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe(props.defaultValue);
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should default to uncontrolled with value = "" if defaultValue and value aren\'t defined', () => {
    let props = {
      onChange
    };
    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe('');
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should convert numeric values to strings (uncontrolled)', () => {
    let props = {
      defaultValue: 13
    };

    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe(props.defaultValue.toString()); 
  });

  it('should convert an array of string values to a string (uncontrolled)', () => {
    let props = {
      defaultValue: ['hi', 'this', 'is', 'me']
    };

    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe(props.defaultValue.toString()); 
  });

  it('should convert numeric values to strings (controlled)', () => {
    let props = {
      value: 13
    };
    
    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe(props.value.toString()); 
  });

  it('should convert an array of string values to a string (controlled)', () => {
    let props = {
      value: ['hi', 'this', 'is', 'me']
    };

    let {result} = renderHook(() => useTextFieldState(props));
    expect(result.current.value).toBe(props.value.toString()); 
  });
});
