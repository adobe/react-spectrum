import {act} from '@testing-library/react';
import {runAfterTransition} from '../src/runAfterTransition';


function dispatchTransitionEvent(
  element: HTMLElement,
  type: 'transitionrun' | 'transitionend' | 'transitioncancel',
  propertyName = 'opacity'
) {
  const event = new window.Event(type, {bubbles: true});

  Object.defineProperty(event, 'propertyName', {
    value: propertyName,
    configurable: true
  });

  element.dispatchEvent(event);
}

describe('runAfterTransition', () => {
  const originalRAF = global.requestAnimationFrame;
  const nodes = new Set<Node>();

  beforeAll(() => {
    global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      return setTimeout(() => cb(Date.now()), 0) as unknown as number;
    };
  });

  afterAll(() => {
    global.requestAnimationFrame = originalRAF;
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Evita vazamento de timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    cleanupElements();
  });

  function appendElement(element: HTMLElement) {
    nodes.add(element);
    document.body.appendChild(element);
    return element;
  }

  function cleanupElements() {
    for (const node of Array.from(nodes)) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      nodes.delete(node);
    }
  }

  it('calls callback immediately when no transition is running', () => {
    const callback = jest.fn();

    runAfterTransition(callback);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('defers callback until transition ends', () => {
    const element = appendElement(document.createElement('div'));
    const callback = jest.fn();

    dispatchTransitionEvent(element, 'transitionrun', 'opacity');

    runAfterTransition(callback);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(callback).not.toHaveBeenCalled();

    dispatchTransitionEvent(element, 'transitionend', 'opacity');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls multiple queued callbacks after transition ends', () => {
    const element = appendElement(document.createElement('div'));
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    dispatchTransitionEvent(element, 'transitionrun', 'width');

    runAfterTransition(cb1);
    runAfterTransition(cb2);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();

    dispatchTransitionEvent(element, 'transitionend', 'width');

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('waits for all elements transitions to finish', () => {
    const el1 = appendElement(document.createElement('div'));
    const el2 = appendElement(document.createElement('div'));
    const callback = jest.fn();

    dispatchTransitionEvent(el1, 'transitionrun', 'width');
    dispatchTransitionEvent(el2, 'transitionrun', 'height');

    runAfterTransition(callback);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(callback).not.toHaveBeenCalled();

    dispatchTransitionEvent(el1, 'transitionend', 'width');
    expect(callback).not.toHaveBeenCalled();

    dispatchTransitionEvent(el2, 'transitionend', 'height');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('fires callback on transitioncancel', () => {
    const element = appendElement(document.createElement('div'));
    const callback = jest.fn();

    dispatchTransitionEvent(element, 'transitionrun', 'opacity');

    runAfterTransition(callback);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(callback).not.toHaveBeenCalled();

    dispatchTransitionEvent(element, 'transitioncancel', 'opacity');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback more than once', () => {
    const element = appendElement(document.createElement('div'));
    const callback = jest.fn();

    dispatchTransitionEvent(element, 'transitionrun', 'opacity');

    runAfterTransition(callback);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    dispatchTransitionEvent(element, 'transitionend', 'opacity');
    dispatchTransitionEvent(element, 'transitionend', 'opacity');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('preserves callback execution order', () => {
    const element = appendElement(document.createElement('div'));
    const calls: number[] = [];

    dispatchTransitionEvent(element, 'transitionrun', 'transform');

    runAfterTransition(() => calls.push(1));
    runAfterTransition(() => calls.push(2));
    runAfterTransition(() => calls.push(3));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    dispatchTransitionEvent(element, 'transitionend', 'transform');

    expect(calls).toEqual([1, 2, 3]);
  });

  it('executes callback if element is removed during transition', () => {
    const element = appendElement(document.createElement('div'));
    const callback = jest.fn();

    dispatchTransitionEvent(element, 'transitionrun', 'opacity');

    cleanupElements();

    runAfterTransition(callback);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('executes callback immediately when document.body is unavailable', () => {
    const callback = jest.fn();

    const spy = jest.spyOn(document, 'body', 'get').mockReturnValue(null as any);

    runAfterTransition(callback);

    expect(callback).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});
