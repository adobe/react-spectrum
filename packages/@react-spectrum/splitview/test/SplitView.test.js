import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {SplitView} from '../';
import V2SplitView from '@react/react-spectrum/SplitView';

describe('SplitView tests', function () {
  // Stub offsetWidth/offsetHeight so we can calculate min/max sizes correctly
  let stub1, stub2;
  beforeAll(function () {
    stub1 = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    stub2 = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
  });

  afterAll(function () {
    stub1.mockReset();
    stub2.mockReset();
  });

  afterEach(function () {
    document.body.style.cursor = null;
    cleanup();
  });

  it.each`
    Name             | Component
    ${'SplitView'}   | ${SplitView}
    ${'V2SplitView'} | ${V2SplitView}
  `('$Name handles defaults', async function ({Name, Component}) {
    let onResizeSpy = jest.fn();
    let onResizeEndSpy = jest.fn();
    let {getByRole} = render(
      <Component className="splitview" onResize={onResizeSpy} onResizeEnd={onResizeEndSpy} style={{width: '100%'}}>
        <div>Left</div>
        <div>Right</div>
      </Component>
    );

    let splitview = document.querySelector('.splitview');
    splitview.getBoundingClientRect = jest.fn(() => ({left: 0, right: 1000}));
    let splitSeparator = getByRole('separator');
    let primaryPane = splitview.childNodes[0];
    expect(splitview.childNodes[1]).toEqual(splitSeparator);
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    let id = primaryPane.getAttribute('id');
    expect(splitSeparator).toHaveAttribute('aria-controls', id);
    expect(splitSeparator).toHaveAttribute('tabindex', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemin', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemax', '100');
    expect(onResizeSpy).not.toHaveBeenCalled();
    expect(onResizeEndSpy).not.toHaveBeenCalled();

    let clientY = 20; // arbitrary
    // move mouse over to 310 and verify that the size changed to 310
    fireEvent.mouseEnter(splitSeparator, {clientX: 304, clientY});
    fireEvent.mouseMove(splitSeparator, {clientX: 304, clientY});
    expect(document.body.style.cursor).toBe('e-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 304, clientY, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 307, clientY}); // extra move so cursor change flushes
    expect(onResizeSpy).toHaveBeenLastCalledWith(307);
    fireEvent.mouseMove(splitSeparator, {clientX: 310, clientY});
    expect(onResizeSpy).toHaveBeenLastCalledWith(310);
    expect(document.body.style.cursor).toBe('ew-resize');
    fireEvent.mouseUp(splitSeparator, {clientX: 310, clientY, button: 0});
    expect(onResizeEndSpy).toHaveBeenLastCalledWith(310);
    expect(primaryPane).toHaveAttribute('style', 'width: 310px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '1');

    // move mouse to the far end so that it maxes out 1000px - secondaryMin(304px) = 696px
    // visual state: primary is maxed out, secondary is at minimum, mouse is beyond the container width
    fireEvent.mouseEnter(splitSeparator, {clientX: 310, clientY});
    fireEvent.mouseMove(splitSeparator, {clientX: 310, clientY});
    expect(document.body.style.cursor).toBe('ew-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 310, clientY, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 1001, clientY});
    expect(onResizeSpy).toHaveBeenLastCalledWith(696);
    fireEvent.mouseUp(splitSeparator, {clientX: 1001, clientY, button: 0});
    expect(onResizeEndSpy).toHaveBeenLastCalledWith(696);
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // move mouse so we shrink to the far left for minimum, non-collapisble = 304px;
    // visual state: primary is at minimum size, secondary is maxed out, mouse is to the left of the split by a lot
    fireEvent.mouseEnter(splitSeparator, {clientX: 696, clientY});
    fireEvent.mouseMove(splitSeparator, {clientX: 696, clientY});
    expect(document.body.style.cursor).toBe('w-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 696, clientY, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 0, clientY});
    expect(onResizeSpy).toHaveBeenLastCalledWith(304);
    fireEvent.mouseUp(splitSeparator, {clientX: 0, clientY, button: 0});
    expect(onResizeEndSpy).toHaveBeenLastCalledWith(304);
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate right 304px + 10px = 314px
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(onResizeSpy).toHaveBeenLastCalledWith(314);
    expect(onResizeEndSpy).toHaveBeenLastCalledWith(314);
    expect(primaryPane).toHaveAttribute('style', 'width: 314px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '2');

    // use keyboard to navigate left 314px - 10px = 304px
    fireEvent.keyDown(splitSeparator, {key: 'Left'});
    expect(onResizeSpy).toHaveBeenLastCalledWith(304);
    expect(onResizeEndSpy).toHaveBeenLastCalledWith(304);
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Left'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate left a second time should do nothing
    let countResizeEndCall = onResizeEndSpy.mock.calls.length;
    fireEvent.keyDown(splitSeparator, {key: 'Left'});
    expect(onResizeEndSpy.mock.calls.length).toBe(countResizeEndCall);
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Left'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate up shouldn't move
    fireEvent.keyDown(splitSeparator, {key: 'Up'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Up'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate down shouldn't move
    fireEvent.keyDown(splitSeparator, {key: 'Down'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Down'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate End should maximize the primary view -> 696px
    fireEvent.keyDown(splitSeparator, {key: 'End'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'End'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate right at max size should do nothing
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate Home should minimize the primary view -> 304px
    fireEvent.keyDown(splitSeparator, {key: 'Home'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Home'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate Enter should do nothing because default does not allow collapsing
    fireEvent.keyDown(splitSeparator, {key: 'Enter'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Enter'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate right 304px + 10px = 314px and then use Enter, should put primary at min size of 304
    // in V2, this didn't work right, and instead it did nothing
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(primaryPane).toHaveAttribute('style', 'width: 314px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    fireEvent.keyDown(splitSeparator, {key: 'Enter'});
    if (Name === 'V2SplitView') {
      expect(primaryPane).toHaveAttribute('style', 'width: 314px;');
    } else {
      expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    }
    fireEvent.keyUp(splitSeparator, {key: 'Enter'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '2');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    }
  });

  it.each`
    Name             | Component
    ${'SplitView'}   | ${SplitView}
    ${'V2SplitView'} | ${V2SplitView}
  `('$Name handles primaryPane being second', function ({Component}) {
    let {getByRole} = render(
      <Component className="splitview" primaryPane={1} style={{width: '100%'}}>
        <div>Left</div>
        <div>Right</div>
      </Component>
    );

    let splitview = document.querySelector('.splitview');
    splitview.getBoundingClientRect = jest.fn(() => ({left: 0, right: 1000}));
    let splitSeparator = getByRole('separator');
    let primaryPane = splitview.childNodes[2];
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    let id = primaryPane.getAttribute('id');
    expect(splitSeparator).toHaveAttribute('aria-controls', id);
    expect(splitSeparator).toHaveAttribute('tabindex', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemin', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemax', '100');
    expect(document.body.style.cursor).toBe('');

    // primary as second means mouse needs to go to 696px to get the handle
    // move mouse over to 670 and verify that the size changed to 1000px - 670px = 330px
    fireEvent.mouseEnter(splitSeparator, {clientX: 696, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 696, clientY: 20});
    expect(document.body.style.cursor).toBe('w-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 696, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 680, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 670, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 670, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 330px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '6');

    // move mouse to the far end so that it maxes out 1000px - secondaryMin(304px) = 696px
    fireEvent.mouseEnter(splitSeparator, {clientX: 670, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 670, clientY: 20});
    expect(document.body.style.cursor).toBe('ew-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 670, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 0, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 0, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate right 696px - 10px = 686px
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(primaryPane).toHaveAttribute('style', 'width: 686px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '97');

    // use keyboard to navigate left 686px + 10px = 696px
    fireEvent.keyDown(splitSeparator, {key: 'Left'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'Left'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate Home should minimize the primary view -> 304px
    fireEvent.keyDown(splitSeparator, {key: 'Home'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Home'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate right at min size should do nothing
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');

    // use keyboard to navigate End should maximize the primary view -> 696px
    fireEvent.keyDown(splitSeparator, {key: 'End'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'End'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate left at max size should do nothing
    fireEvent.keyDown(splitSeparator, {key: 'Left'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'Left'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');
  });


  it.each`
    Name             | Component     | props
    ${'SplitView'}   | ${SplitView}  | ${{allowsCollapsing: true}}
    ${'V2SplitView'} | ${V2SplitView}| ${{collapsible: true}}
  `('$Name handles allowsCollapsing', function ({Name, Component, props}) {
    let {getByRole} = render(
      <Component {...props} className="splitview" style={{width: '100%'}}>
        <div>Left</div>
        <div>Right</div>
      </Component>
    );

    let splitview = document.querySelector('.splitview');
    splitview.getBoundingClientRect = jest.fn(() => ({left: 0, right: 1000}));
    let splitSeparator = getByRole('separator');
    let primaryPane = splitview.childNodes[0];
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    let id = primaryPane.getAttribute('id');
    expect(splitSeparator).toHaveAttribute('aria-controls', id);
    expect(splitSeparator).toHaveAttribute('tabindex', '0');
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '43');
    }
    expect(splitSeparator).toHaveAttribute('aria-valuemin', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemax', '100');
    expect(document.body.style.cursor).toBe('');

    // move mouse over to 310 and verify that the size changed
    fireEvent.mouseEnter(splitSeparator, {clientX: 304, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 304, clientY: 20});
    expect(document.body.style.cursor).toBe('e-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 304, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 310, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 310, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 310px;');
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '1');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '44');
    }

    // move mouse to the far end so that it maxes out 1000px - secondaryMin(304px) = 696px
    fireEvent.mouseEnter(splitSeparator, {clientX: 310, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 310, clientY: 20});
    expect(document.body.style.cursor).toBe('ew-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 310, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 1001, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 1001, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // move mouse so we shrink to the collapse point 304px - 50px threshold - 1px = 253px
    fireEvent.mouseEnter(splitSeparator, {clientX: 696, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 696, clientY: 20});
    expect(document.body.style.cursor).toBe('w-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 696, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 253, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 253, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 0px;');
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '-77');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    }

    // move mouse so we recover from the collapsing
    fireEvent.mouseEnter(splitSeparator, {clientX: 0, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 0, clientY: 20});
    expect(document.body.style.cursor).toBe('e-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 0, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 254, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 254, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '43');
    }

    // use keyboard to navigate right 304px + 10px = 314px
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(primaryPane).toHaveAttribute('style', 'width: 314px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '2');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '45');
    }

    // use keyboard to navigate left 314px - 10px = 304px
    fireEvent.keyDown(splitSeparator, {key: 'Left'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Left'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '43');
    }

    // use keyboard to navigate left a second time should do nothing
    fireEvent.keyDown(splitSeparator, {key: 'Left'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Left'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '43');
    }

    // use keyboard to navigate up shouldn't move
    fireEvent.keyDown(splitSeparator, {key: 'Up'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Up'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '43');
    }

    // use keyboard to navigate down shouldn't move
    fireEvent.keyDown(splitSeparator, {key: 'Down'});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    fireEvent.keyUp(splitSeparator, {key: 'Down'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '43');
    }

    // use keyboard to navigate End should maximize the primary view -> 696px
    fireEvent.keyDown(splitSeparator, {key: 'End'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'End'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate right at max should do nothing
    fireEvent.keyDown(splitSeparator, {key: 'Right'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'Right'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // use keyboard to navigate Home should minimize the primary view, b/c of allows collapsing -> 0px
    fireEvent.keyDown(splitSeparator, {key: 'Home'});
    expect(primaryPane).toHaveAttribute('style', 'width: 0px;');
    fireEvent.keyUp(splitSeparator, {key: 'Home'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '-77');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    }

    // reset us to max size -> 696px
    fireEvent.keyDown(splitSeparator, {key: 'End'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'End'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // collapse us with Enter
    fireEvent.keyDown(splitSeparator, {key: 'Enter'});
    expect(primaryPane).toHaveAttribute('style', 'width: 0px;');
    fireEvent.keyUp(splitSeparator, {key: 'Enter'});
    if (Name === 'V2SplitView') {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '-77');
    } else {
      expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    }

    // use keyboard to navigate Right should restore it to the last size
    fireEvent.keyDown(splitSeparator, {key: 'Enter'});
    expect(primaryPane).toHaveAttribute('style', 'width: 696px;');
    fireEvent.keyUp(splitSeparator, {key: 'Enter'});
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');
  });

  it.each`
    Name             | Component
    ${'SplitView'}   | ${SplitView}
    ${'V2SplitView'} | ${V2SplitView}
  `('$Name should render a vertical split view', function ({Component}) {
    let {getByRole} = render(
      <Component className="splitview" orientation="vertical">
        <div>Left</div>
        <div>Right</div>
      </Component>
    );

    let splitview = document.querySelector('.splitview');
    splitview.getBoundingClientRect = jest.fn(() => ({top: 0, bottom: 1000}));
    let splitSeparator = getByRole('separator');
    let primaryPane = splitview.childNodes[0];
    expect(primaryPane).toHaveAttribute('style', 'height: 304px;');
    let id = primaryPane.getAttribute('id');
    expect(splitSeparator).toHaveAttribute('aria-controls', id);
    expect(splitSeparator).toHaveAttribute('tabindex', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemin', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemax', '100');

    // move mouse over to 310 and verify that the size changed
    fireEvent.mouseEnter(splitSeparator, {clientX: 20, clientY: 304});
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 304});
    expect(document.body.style.cursor).toBe('s-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 20, clientY: 304, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 307}); // extra move so cursor change flushes
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 310});
    expect(document.body.style.cursor).toBe('ns-resize');
    fireEvent.mouseUp(splitSeparator, {clientX: 20, clientY: 310, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'height: 310px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '1');

    // move mouse to the far end so that it maxes out 1000px - secondaryMin(304px) = 696px
    fireEvent.mouseEnter(splitSeparator, {clientX: 20, clientY: 310});
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 310});
    expect(document.body.style.cursor).toBe('ns-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 20, clientY: 310, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 1001});
    fireEvent.mouseUp(splitSeparator, {clientX: 20, clientY: 1001, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'height: 696px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '100');

    // move mouse so we shrink to the far left for minimum, non-collapisble = 304px;
    fireEvent.mouseEnter(splitSeparator, {clientX: 20, clientY: 696});
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 696});
    expect(document.body.style.cursor).toBe('n-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: 20, clientY: 696, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 20, clientY: 0});
    fireEvent.mouseUp(splitSeparator, {clientX: 20, clientY: 0, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'height: 304px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
  });


  it.each`
    Name             | Component      | props
    ${'SplitView'}   | ${SplitView}   | ${{allowsResizing: false}}
    ${'V2SplitView'} | ${V2SplitView} | ${{resizable: false}}
  `('$Name can be non-resizable', async function ({Component, props}) {
    let {getByRole} = render(
      <Component {...props} className="splitview" style={{width: '100%'}}>
        <div>Left</div>
        <div>Right</div>
      </Component>
    );

    let splitview = document.querySelector('.splitview');
    splitview.getBoundingClientRect = jest.fn(() => ({left: 0, right: 1000}));
    let splitSeparator = getByRole('separator');
    let primaryPane = splitview.childNodes[0];
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    let id = primaryPane.getAttribute('id');
    expect(splitSeparator).toHaveAttribute('aria-controls', id);
    expect(splitSeparator).not.toHaveAttribute('tabindex');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemin', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemax', '100');

    // move mouse over to 310 and verify that the size changed
    fireEvent.mouseEnter(splitSeparator, {clientX: 304, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: 304, clientY: 20});
    expect(document.body.style.cursor).toBe('');
    fireEvent.mouseDown(splitSeparator, {clientX: 304, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: 307, clientY: 20}); // extra move so cursor change flushes
    fireEvent.mouseMove(splitSeparator, {clientX: 310, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: 310, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', 'width: 304px;');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '0');
  });

  // V2 version doesn't have this capability, firstly limited by onMouseDown `if (this.props.primarySize !== undefined) {`
  it.each`
    Name             | Component      | props
    ${'SplitView'}   | ${SplitView}   | ${{primarySize: 500}}
  `('$Name can have its size controlled', async function ({Component, props}) {
    let onResizeSpy = jest.fn();
    let {getByRole} = render(
      <Component {...props} className="splitview" onResize={onResizeSpy} style={{width: '100%'}}>
        <div>Left</div>
        <div>Right</div>
      </Component>
    );

    let splitview = document.querySelector('.splitview');
    splitview.getBoundingClientRect = jest.fn(() => ({left: 0, right: 1000}));
    let splitSeparator = getByRole('separator');
    let primaryPane = splitview.childNodes[0];
    expect(primaryPane).toHaveAttribute('style', `width: ${props.primarySize}px;`);
    let id = primaryPane.getAttribute('id');
    expect(splitSeparator).toHaveAttribute('aria-controls', id);
    expect(splitSeparator).toHaveAttribute('tabindex', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '50');
    expect(splitSeparator).toHaveAttribute('aria-valuemin', '0');
    expect(splitSeparator).toHaveAttribute('aria-valuemax', '100');

    // move mouse over to 505 and verify that the size didn't change
    fireEvent.mouseEnter(splitSeparator, {clientX: props.primarySize, clientY: 20});
    fireEvent.mouseMove(splitSeparator, {clientX: props.primarySize, clientY: 20});
    expect(document.body.style.cursor).toBe('ew-resize');
    fireEvent.mouseDown(splitSeparator, {clientX: props.primarySize, clientY: 20, button: 0});
    fireEvent.mouseMove(splitSeparator, {clientX: props.primarySize + 5, clientY: 20});
    fireEvent.mouseUp(splitSeparator, {clientX: props.primarySize + 5, clientY: 20, button: 0});
    expect(primaryPane).toHaveAttribute('style', `width: ${props.primarySize}px;`);
    expect(onResizeSpy).toHaveBeenCalledWith(props.primarySize + 5);
    expect(splitSeparator).toHaveAttribute('aria-valuenow', '50');
  });
});
