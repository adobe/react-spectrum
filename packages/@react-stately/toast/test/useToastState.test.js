import {act, renderHook} from 'react-hooks-testing-library';
import {useToastState} from '../';

describe('useToastState', () => {
  let newValue = [{
    content: 'Toast Message',
    props: {}
  }];

  it('should be able to update via setToasts', () => {
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);
    act(() => result.current.setToasts(newValue));
    expect(result.current.toasts).toStrictEqual(newValue);
  });

  it('should add a new toast via onAdd', () => {
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);
    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    // timeoutId is dynamic internal so removing it
    delete result.current.toasts[0].timeoutId;
    expect(result.current.toasts).toStrictEqual(newValue);
  });

  it('should be able to add multiple toasts', () => {
    let secondToast = {
      content: 'Second Toast',
      props: {variant: 'info'}
    };
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);
    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    // timeoutId is dynamic internal so removing it
    delete result.current.toasts[0].timeoutId;
    expect(result.current.toasts).toStrictEqual(newValue);

    act(() => result.current.onAdd(secondToast.content, secondToast.props));
    expect(result.current.toasts.length).toBe(2);
    // timeoutId is dynamic internal so removing it
    delete result.current.toasts[0].timeoutId;
    delete result.current.toasts[1].timeoutId;
    expect(result.current.toasts[0]).toStrictEqual(newValue[0]);
    expect(result.current.toasts[1]).toStrictEqual(secondToast);
  });
});
