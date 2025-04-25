import {act} from '@testing-library/react';
import {runAfterTransition} from '../src/runAfterTransition';

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
    for (const node of nodes) {
      document.body.removeChild(node);
      nodes.delete(node);
    }
  }

  it('calls callback immediately when no transition is running', () => {
    const callback = jest.fn();
    runAfterTransition(callback);
    act(() => {jest.runOnlyPendingTimers();});
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
    act(() => {jest.runOnlyPendingTimers();});

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
    act(() => {jest.runOnlyPendingTimers();});
    runAfterTransition(callback2);
    act(() => {jest.runOnlyPendingTimers();});
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
    act(() => {jest.runOnlyPendingTimers();});

    expect(callback).toHaveBeenCalled();
  });
});
