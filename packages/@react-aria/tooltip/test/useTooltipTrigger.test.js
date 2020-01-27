import React from 'react';
import {fireEvent, renderHook, waitForDomChange} from 'react-hooks-testing-library';
import {useTooltipTrigger} from '../';

describe('useTooltipTrigger', function () {
  let state = {};
  let setOpen = jest.fn();

  let renderTooltipTriggerHook = (props, isOpen) => {
    let {result} = renderHook(() => useTooltipTrigger(props));
    return result.current;
  };

  beforeEach(() => {
    state.isOpen = false;
    state.setOpen = setOpen;
  });

  afterEach(() => {
    setOpen.mockClear();
  });

  it('should have an id if tooltip is open', function () {
    let props = {
      ref: {current: true}
    };
    state.isOpen = true;

    let {triggerProps} = renderTooltipTriggerHook(props, state);
    expect(triggerProps.id).toBeTruthy();
  });

  it('returns a onKeyDown that toggles the tooltip open state', async function () {
    let props = {
      ref: {current: true}
    };

    let preventDefault = jest.fn();
    let stopPropagation = jest.fn();

    let {tooltipTriggerProps} = renderTooltipTriggerHook(props, state);
    expect(typeof tooltipTriggerProps.onKeyDownTrigger).toBe('function');

    tooltipTriggerProps.onKeyDownTrigger({
      pointerType: 'mouse',
      key: 'Escape',
      preventDefault,
      stopPropagation
    });
    await waitForDomChange(); // wait for animation
    expect(setOpen).toHaveBeenCalledTimes(1);
    expect(setOpen).toHaveBeenCalledWith(!state.isOpen);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);


    let button = getByRole('button');

    fireEvent.keyDown(button, {key: 'Escape'});
    await waitForDomChange(); // wait for animation
    expect(setOpen).toHaveBeenCalledTimes(2);
    expect(setOpen).toHaveBeenCalledWith(!state.isOpen);
    expect(stopPropagation).toHaveBeenCalledTimes(2);
    expect(preventDefault).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(button, {key: 'ArrowDown', altKey: true});
    await waitForDomChange(); // wait for animation
    expect(setOpen).toHaveBeenCalledTimes(3);
    expect(setOpen).toHaveBeenCalledWith(!state.isOpen);
    expect(stopPropagation).toHaveBeenCalledTimes(3);
    expect(preventDefault).toHaveBeenCalledTimes(3);
  });
});
