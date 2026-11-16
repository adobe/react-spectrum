import {act} from '@testing-library/react';
import {runAfterTransition} from '../../src/utils/runAfterTransition';

class MockTransitionEvent extends Event {
  propertyName: string;

  constructor(type: string, eventInitDict?: TransitionEventInit) {
    super(type, eventInitDict);
    this.propertyName = eventInitDict?.propertyName || '';
  }
}

describe('runAfterTransition', () => {
  const originalTransitionEvent = global.TransitionEvent;
  const nodes = new Set<Node>();

  beforeAll(() => {
    global.TransitionEvent = MockTransitionEvent as any;
  });

  afterAll(() => {
    global.TransitionEvent = originalTransitionEvent;
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanupElements();
    runAfterTransition(jest.fn());
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function appendElement(element: HTMLElement) {
    nodes.add(element);
    document.body.appendChild(element);
    return element;
  }

  function cleanupElements() {
    for (const node of nodes) {
      document.body.removeChild(node);
      nodes.delete(node);
    }
  }

  it('calls callback immediately when no transition is running', () => {
    const callback = jest.fn();
    runAfterTransition(callback);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(callback).toHaveBeenCalled();
  });

  it('defers callback until transition end when a transition is running', () => {
    const element = appendElement(document.createElement('div'));

    const callback = jest.fn();

    element.dispatchEvent(
      new TransitionEvent('transitionrun', {
        propertyName: 'opacity',
        bubbles: true
      })
    );

    runAfterTransition(callback);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // Callback should not be called immediately since a transition is active.
    expect(callback).not.toHaveBeenCalled();

    // Dispatch a transitionend event to finish the transition.
    element.dispatchEvent(
      new TransitionEvent('transitionend', {
        propertyName: 'opacity',
        bubbles: true
      })
    );
    expect(callback).toHaveBeenCalled();
  });

  it('calls multiple queued callbacks after transition ends', () => {
    const element = appendElement(document.createElement('div'));
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    element.dispatchEvent(
      new TransitionEvent('transitionrun', {
        propertyName: 'width',
        bubbles: true
      })
    );

    runAfterTransition(callback1);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    runAfterTransition(callback2);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    // Callbacks should not be called during transition.
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    element.dispatchEvent(
      new TransitionEvent('transitionend', {
        propertyName: 'width',
        bubbles: true
      })
    );

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('clears out detached elements from transitionsByElement', () => {
    const element = document.createElement('div');
    element.id = 'test-element';
    appendElement(element);
    const callback = jest.fn();

    element.dispatchEvent(
      new TransitionEvent('transitionrun', {
        propertyName: 'width',
        bubbles: true
      })
    );

    cleanupElements();

    runAfterTransition(callback);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(callback).toHaveBeenCalled();
  });

  it('calls transition end only after all its multiple transitions are cancelled', () => {
    const element = appendElement(document.createElement('div'));
    const callback = jest.fn();

    for (const propertyName of ['opacity', 'transform']) {
      element.dispatchEvent(
        new TransitionEvent('transitionrun', {
          propertyName,
          bubbles: true
        })
      );
    }

    runAfterTransition(callback);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(callback).not.toHaveBeenCalled();

    // Browsers dispatch one transitioncancel per property.
    element.dispatchEvent(
      new TransitionEvent('transitioncancel', {
        propertyName: 'opacity',
        bubbles: true
      })
    );
    expect(callback).not.toHaveBeenCalled();

    element.dispatchEvent(
      new TransitionEvent('transitioncancel', {
        propertyName: 'transform',
        bubbles: true
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls transition end after multiple transitions are cancelled even after being removed from the document', () => {
    const element = appendElement(document.createElement('div'));
    const callback = jest.fn();

    for (const propertyName of ['opacity', 'transform']) {
      element.dispatchEvent(
        new TransitionEvent('transitionrun', {
          propertyName,
          bubbles: true
        })
      );
    }

    runAfterTransition(callback);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(callback).not.toHaveBeenCalled();

    cleanupElements();

    element.dispatchEvent(
      new TransitionEvent('transitioncancel', {
        propertyName: 'opacity',
        bubbles: true
      })
    );
    expect(callback).not.toHaveBeenCalled();

    element.dispatchEvent(
      new TransitionEvent('transitioncancel', {
        propertyName: 'transform',
        bubbles: true
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
  });

  function startTransition(element: Element, callback = jest.fn()) {
    element.dispatchEvent(
      new TransitionEvent('transitionrun', {propertyName: 'opacity', bubbles: true})
    );
    const cancel = runAfterTransition(callback);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(callback).not.toHaveBeenCalled();
    return {callback, cancel};
  }

  it('releases queued callbacks when a transitioning subtree is removed without completion events', async () => {
    const parent = appendElement(document.createElement('section'));
    const element = document.createElement('div');
    parent.appendChild(element);
    const {callback} = startTransition(element);
    const secondCallback = jest.fn();
    runAfterTransition(secondCallback);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    parent.replaceChildren();
    await Promise.resolve();

    expect(callback.mock.calls).toEqual([[true]]);
    expect(secondCallback.mock.calls).toEqual([[true]]);
  });

  it('keeps waiting for connected transitions after another target is removed', async () => {
    const parent = appendElement(document.createElement('section'));
    const removed = document.createElement('div');
    parent.appendChild(removed);
    const connected = appendElement(document.createElement('div'));
    const {callback} = startTransition(removed);
    connected.dispatchEvent(
      new TransitionEvent('transitionrun', {propertyName: 'opacity', bubbles: true})
    );

    removed.remove();
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();

    connected.dispatchEvent(
      new TransitionEvent('transitionend', {propertyName: 'opacity', bubbles: true})
    );
    expect(callback.mock.calls).toEqual([[true]]);
  });

  it('does not complete transitions when a target is moved within the document', async () => {
    const parent = appendElement(document.createElement('section'));
    const element = appendElement(document.createElement('div'));
    const {callback} = startTransition(element);

    parent.appendChild(element);
    nodes.delete(element);
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();

    element.dispatchEvent(
      new TransitionEvent('transitionend', {propertyName: 'opacity', bubbles: true})
    );
    expect(callback.mock.calls).toEqual([[true]]);
  });

  it('does not call cancelled callbacks when a transitioning element is removed', async () => {
    const parent = appendElement(document.createElement('section'));
    const element = document.createElement('div');
    parent.appendChild(element);
    const {callback, cancel} = startTransition(element);

    cancel();
    element.remove();
    await Promise.resolve();
    expect(callback).not.toHaveBeenCalled();
  });

  it('releases transitions over repeated removals without another runAfterTransition call', async () => {
    const parent = appendElement(document.createElement('section'));
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      parent.appendChild(element);
      const {callback} = startTransition(element);
      element.remove();
      await Promise.resolve();
      expect(callback.mock.calls).toEqual([[true]]);
    }
  });
});
