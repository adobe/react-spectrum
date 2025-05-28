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

  it('should return undefined initially and when updateDescription is called with empty string, null, or undefined', () => {
    let {result} = renderHook(() => useDynamicDescription());
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();

    act(() => {
      result.current.updateDescription('Test dynamic description');
    });
    expect(result.current.descriptionProps['aria-describedby']).not.toBeUndefined();
    let id1 = result.current.descriptionProps['aria-describedby'];

    act(() => {
      result.current.updateDescription('');
    });
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();
    expect(document.getElementById(id1!)).toBeNull(); // Element should be removed

    act(() => {
      result.current.updateDescription('Test dynamic description again');
    });
    expect(result.current.descriptionProps['aria-describedby']).not.toBeUndefined();
    let id2 = result.current.descriptionProps['aria-describedby'];


    act(() => {
      result.current.updateDescription(null);
    });
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();
    expect(document.getElementById(id2!)).toBeNull(); // Element should be removed

    act(() => {
      result.current.updateDescription('Test dynamic description yet again');
    });
    expect(result.current.descriptionProps['aria-describedby']).not.toBeUndefined();
    let id3 = result.current.descriptionProps['aria-describedby'];

    act(() => {
      result.current.updateDescription(undefined);
    });
    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();
    expect(document.getElementById(id3!)).toBeNull(); // Element should be removed
  });

  it('should update the description node text content and maintain same ID for same hook instance', () => {
    let {result} = renderHook(() => useDynamicDescription());
    act(() => {
      result.current.updateDescription('Initial description');
    });

    let id = result.current.descriptionProps['aria-describedby'];
    expect(document.getElementById(id!)?.textContent).toBe('Initial description');

    act(() => {
      result.current.updateDescription('Updated description');
    });
    expect(result.current.descriptionProps['aria-describedby']).toBe(id); // ID should remain the same
    expect(document.getElementById(id!)?.textContent).toBe('Updated description');
  });

  it('should clean up description node on unmount if not shared', () => {
    let {result, unmount} = renderHook(() => useDynamicDescription());
    act(() => {
      result.current.updateDescription('Test dynamic description');
    });
    let id = result.current.descriptionProps['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount();
    expect(document.getElementById(id!)).toBeNull();
  });

  it('should reuse the same id and DOM element for the same dynamic description text across multiple hook instances', () => {
    let {result: r1} = renderHook(() => useDynamicDescription());
    let {result: r2} = renderHook(() => useDynamicDescription());

    act(() => {
      r1.current.updateDescription('Shared Text');
    });
    act(() => {
      r2.current.updateDescription('Shared Text');
    });

    expect(r1.current.descriptionProps['aria-describedby']).toMatch(/^react-aria-dynamic-description-\d+$/);
    expect(r1.current.descriptionProps['aria-describedby']).toBe(r2.current.descriptionProps['aria-describedby']);
    const sharedId = r1.current.descriptionProps['aria-describedby'];
    expect(document.getElementById(sharedId!)?.textContent).toBe('Shared Text');
  });

  it('should not clean up shared description node if one hook instance unmounts but another still uses the text', () => {
    let {result: r1, unmount: unmount1} = renderHook(() => useDynamicDescription());
    let {result: r2, unmount: unmount2} = renderHook(() => useDynamicDescription());

    act(() => {
      r1.current.updateDescription('Shared Text');
    });
    act(() => {
      r2.current.updateDescription('Shared Text');
    });

    const sharedId = r1.current.descriptionProps['aria-describedby'];
    expect(document.getElementById(sharedId!)?.textContent).toBe('Shared Text');

    unmount1();
    expect(document.getElementById(sharedId!)).not.toBeNull();
    expect(document.getElementById(sharedId!)?.textContent).toBe('Shared Text'); // Still there for r2

    unmount2();
    expect(document.getElementById(sharedId!)).toBeNull(); // Now removed
  });

  it('should generate different ids for different dynamic description texts', () => {
    let {result: r1} = renderHook(() => useDynamicDescription());
    let {result: r2} = renderHook(() => useDynamicDescription());

    act(() => {
      r1.current.updateDescription('Text A');
    });
    act(() => {
      r2.current.updateDescription('Text B');
    });

    const idA = r1.current.descriptionProps['aria-describedby'];
    const idB = r2.current.descriptionProps['aria-describedby'];

    expect(idA).toMatch(/^react-aria-dynamic-description-\d+$/);
    expect(idB).toMatch(/^react-aria-dynamic-description-\d+$/);
    expect(idA).not.toBe(idB);
    expect(document.getElementById(idA!)?.textContent).toBe('Text A');
    expect(document.getElementById(idB!)?.textContent).toBe('Text B');
  });

  it('should reuse ID if text is changed then changed back to an active description', () => {
    let {result: r1} = renderHook(() => useDynamicDescription());
    let {result: r2} = renderHook(() => useDynamicDescription()); // r2 will keep 'Text A' active

    act(() => {
      r1.current.updateDescription('Text A');
    });
    const idA_r1_initial = r1.current.descriptionProps['aria-describedby'];

    act(() => {
      r2.current.updateDescription('Text A');
    });
    expect(r2.current.descriptionProps['aria-describedby']).toBe(idA_r1_initial); // Both share ID for Text A

    act(() => {
      r1.current.updateDescription('Text B');
    });
    const idB_r1 = r1.current.descriptionProps['aria-describedby'];
    expect(idB_r1).not.toBe(idA_r1_initial);
    expect(document.getElementById(idB_r1!)?.textContent).toBe('Text B');
    expect(document.getElementById(idA_r1_initial!)?.textContent).toBe('Text A'); // Still active due to r2

    act(() => {
      r1.current.updateDescription('Text A');
    });
    expect(r1.current.descriptionProps['aria-describedby']).toBe(idA_r1_initial); // r1 reuses ID for Text A
  });

  it('should switch between different shared texts correctly', () => {
    let {result: r1} = renderHook(() => useDynamicDescription());
    let {result: r2} = renderHook(() => useDynamicDescription());

    // Establish 'Text A'
    act(() => r1.current.updateDescription('Text A'));
    const idA = r1.current.descriptionProps['aria-describedby'];

    // Establish 'Text B'
    act(() => r2.current.updateDescription('Text B'));
    const idB = r2.current.descriptionProps['aria-describedby'];

    expect(idA).not.toBe(idB);

    // r1 switches to 'Text B'
    act(() => r1.current.updateDescription('Text B'));
    expect(r1.current.descriptionProps['aria-describedby']).toBe(idB);
    expect(document.getElementById(idA!)).toBeNull(); // 'Text A' was only used by r1, should be cleaned up
    expect(document.getElementById(idB!)?.textContent).toBe('Text B');


    // r1 switches back to 'Text A' (re-creating it)
    act(() => r1.current.updateDescription('Text A'));
    const newIdA = r1.current.descriptionProps['aria-describedby'];
    expect(newIdA).not.toBe(idA); // Original idA was cleaned up, so this is a new one for 'Text A'
    expect(newIdA).not.toBe(idB);
    expect(document.getElementById(newIdA!)?.textContent).toBe('Text A');
    expect(document.getElementById(idB!)?.textContent).toBe('Text B'); // Still active due to r2
  });
}); 
