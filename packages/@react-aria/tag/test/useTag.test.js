import {renderHook} from 'react-hooks-testing-library';
import {useTag} from '../';

describe('useTag tests', () => {
  it('handles defaults', () => {
    let props = {};
    let {result} = renderHook(() => useTag(props));
    expect(result.current.tagProps.onKeyDown).toBeDefined();
    expect(result.current.tagProps['aria-selected']).not.toBeDefined();
    expect(result.current.tagProps['aria-invalid']).not.toBeDefined();
    expect(result.current.clearButtonProps.onPress).toBeDefined();
    expect(result.current.labelProps.id).toBeDefined();
  });

  it('set correct aria if it is invalid', () => {
    let props = {validationState: 'invalid'};
    let {result} = renderHook(() => useTag(props));
    expect(result.current.tagProps['aria-invalid']).toBe(true);
  });

  it('set correct aria if it is selected', () => {
    let props = {isSelected: true};
    let hook = renderHook(() => useTag(props));
    expect(hook.result.current.tagProps['aria-selected']).toBe(true);

    props = {isSelected: true, isDisabled: true};
    hook = renderHook(() => useTag(props));
    expect(hook.result.current.tagProps['aria-selected']).toBe(false);
  });

  it('handles isDisabled flag', () => {
    let props = {isDisabled: true};
    let {result} = renderHook(() => useTag(props));
    expect(result.current.tagProps.onKeyDown).toBe(null);
    expect(result.current.tagProps.tabIndex).toBe(-1);
    expect(result.current.clearButtonProps.isDisabled).toBe(true);
  });
});
