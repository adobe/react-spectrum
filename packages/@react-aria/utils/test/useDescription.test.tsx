import {act, renderHook} from '@react-spectrum/test-utils-internal';
import {useDescription, useDynamicDescription} from '../src/useDescription';

describe('useDescription', () => {
  it('should return an id if description is provided', () => {
    let {result} = renderHook(() => useDescription('Test description'));
    expect(result.current['aria-describedby']).toMatch(/^react-aria-description-\d+$/);
  });

  it('should return undefined if no description is provided', () => {
    let {result} = renderHook(() => useDescription());
    expect(result.current['aria-describedby']).toBeUndefined();
  });

  it('should reuse the same id for the same description', () => {
    let {result: result1} = renderHook(() => useDescription('Test description'));
    let {result: result2} = renderHook(() => useDescription('Test description'));
    expect(result1.current['aria-describedby']).toBe(result2.current['aria-describedby']);
  });

  it('should create a new id for a new description', () => {
    let {result: result1} = renderHook(() => useDescription('Test description 1'));
    let {result: result2} = renderHook(() => useDescription('Test description 2'));
    expect(result1.current['aria-describedby']).not.toBe(result2.current['aria-describedby']);
  });

  it('should clean up description node on unmount', () => {
    let {result, unmount} = renderHook(() => useDescription('Test description'));
    let id = result.current['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount();
    expect(document.getElementById(id!)).toBeNull();
  });

  it('should not clean up if other components are using the same description', () => {
    let {result: result1, unmount: unmount1} = renderHook(() => useDescription('Test description'));
    let {unmount: unmount2} = renderHook(() => useDescription('Test description'));
    let id = result1.current['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount1();
    expect(document.getElementById(id!)).not.toBeNull();
    unmount2();
    expect(document.getElementById(id!)).toBeNull();
  });
});

describe('useDynamicDescription', () => {
  it('should return an id when updateDescription is called with non-empty string', () => {
    let {result} = renderHook(() => useDynamicDescription());
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();

    act(() => {
      result.current.updateDescription('Test dynamic description');
    });
    expect(result.current.descriptionProps['aria-describedby']).toMatch(/^react-aria-dynamic-description-\d+$/);
  });

  it('should return undefined initially and when updateDescription is called with empty string', () => {
    let {result} = renderHook(() => useDynamicDescription());
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();

    act(() => {
      result.current.updateDescription('Test dynamic description');
    });
    expect(result.current.descriptionProps['aria-describedby']).not.toBeUndefined();

    act(() => {
      result.current.updateDescription('');
    });
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();
  });

  it('should update the description node text content', () => {
    let {result} = renderHook(() => useDynamicDescription());
    act(() => {
      result.current.updateDescription('Initial description');
    });

    let id = result.current.descriptionProps['aria-describedby'];
    expect(document.getElementById(id!)?.textContent).toBe('Initial description');

    act(() => {
      result.current.updateDescription('Updated description');
    });
    expect(document.getElementById(id!)?.textContent).toBe('Updated description');
  });

  it('should clean up description node on unmount', () => {
    let {result, unmount} = renderHook(() => useDynamicDescription());
    act(() => {
      result.current.updateDescription('Test dynamic description');
    });
    let id = result.current.descriptionProps['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount();
    expect(document.getElementById(id!)).toBeNull();
  });
}); 
