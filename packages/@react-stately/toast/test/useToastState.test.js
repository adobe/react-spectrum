import {act, renderHook} from 'react-hooks-testing-library';
import {useToastState} from '../';

describe('useToastState', () => {
  let newValue = [{
    content: 'Toast Message',
    props: {}
  }];

  it('should be able to update via setToasts', () => {
    let value = [];
    let {result} = renderHook(() => useToastState(value));
    expect(result.current.toasts).toBe(value);
    act(() => result.current.setToasts(newValue));
    expect(result.current.toasts).toStrictEqual(newValue);
  });

  it('should add a new toast via onAdd', () => {
    let value = [];
    let {result} = renderHook(() => useToastState(value));
    expect(result.current.toasts).toBe(value);
    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    expect(result.current.toasts).toStrictEqual(newValue);
  });

  it('should be able to add multiple toasts', () => {
    let value = [];
    let secondToast = {
      content: 'Second Toast',
      props: {variant: 'info'}
    };
    let {result} = renderHook(() => useToastState(value));
    expect(result.current.toasts).toBe(value);
    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    expect(result.current.toasts).toStrictEqual(newValue);
    act(() => result.current.onAdd(secondToast.content, secondToast.props));
    expect(result.current.toasts.length).toBe(2);
    expect(result.current.toasts[0]).toStrictEqual(newValue[0]);
    expect(result.current.toasts[1]).toStrictEqual(secondToast);
  });
});
