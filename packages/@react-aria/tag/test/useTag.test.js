import {renderHook} from 'react-hooks-testing-library';
import {useTag} from '../';

describe('useTag tests', () => {
  it('handles defaults', () => {
    let props = {};
    let {result} = renderHook(() => useTag(props));
    expect(result.current.tagProps.onKeyDown).toBeDefined();
    expect(result.current.clearButtonProps.onPress).toBeDefined();
  });

  it('handles disabled flag', () => {
    let props = {isDisabled: true};
    let {result} = renderHook(() => useTag(props));
    expect(result.current.tagProps.onKeyDown).toBe(null);
    expect(result.current.tagProps.tabIndex).toBe(-1);
    expect(result.current.clearButtonProps.isDisabled).toBe(true);
  });
});
