import React, { useState } from 'react';
import { render, act } from '@react-spectrum/test-utils-internal';

describe('useId', () => {
  let OriginalFinalizationRegistry = global.FinalizationRegistry;

  afterEach(() => {
    global.FinalizationRegistry = OriginalFinalizationRegistry;
    jest.resetModules();
  });

  it('does not register with FinalizationRegistry multiple times on re-renders', () => {
    let registerCount = 0;
    let unregisterCount = 0;
    
    // Mock FinalizationRegistry
    global.FinalizationRegistry = class {
      constructor(cleanup) {}
      register(target, heldValue, unregisterToken) {
        registerCount++;
        expect(unregisterToken).toBeDefined();
        expect(unregisterToken).not.toBe(target);
      }
      unregister() {
        unregisterCount++;
      }
    } as any;

    const { useId, mergeIds } = require('../../src/utils/useId');

    function TestComponent() {
      let [count, setCount] = useState(0);
      let id = useId();
      let otherId = useId();
      
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
          <button onClick={() => { mergeIds(id, 'new-merged-id'); setCount(c => c + 1); }}>Change ID</button>
          <div data-testid="id">{id}</div>
          <div data-testid="count">{count}</div>
        </div>
      );
    }

    let { getByRole, unmount } = render(<TestComponent />);
    
    // Should register twice on mount (2 useId calls)
    expect(registerCount).toBe(2);
    expect(unregisterCount).toBe(0);
    
    // Trigger a re-render
    act(() => {
      let button = getByRole('button', { name: 'Increment' });
      button.click();
    });
    
    // Should still only have registered twice
    expect(registerCount).toBe(2);
    expect(unregisterCount).toBe(0);

    // Trigger ID change (mergeIds triggers state update via effect)
    act(() => {
      let changeIdButton = getByRole('button', { name: 'Change ID' });
      changeIdButton.click();
    });
    
    // Should register new ID (so 3 total registrations)
    expect(registerCount).toBe(3);
    // The old ID from the first useId should be unregistered
    expect(unregisterCount).toBe(1);
    
    // Unmount
    unmount();
    
    // Should unregister remaining on unmount
    expect(unregisterCount).toBe(3);
  });
});
