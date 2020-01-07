import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {useHover} from '../';

function Example(props) {
  let {hoverProps} = useHover(props);
  return <div {...hoverProps}>test</div>;
}

function pointerEvent(type) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  return evt;
}

describe('useHover', function () {
  afterEach(cleanup);

  describe('pointer events', function () {
    beforeEach(() => {
      global.PointerEvent = {};
    });

    afterEach(() => {
      delete global.PointerEvent;
    });

    it('should fire hover events based on pointer events', function () {

    });

    it('should fire hover change events when moving pointer outside target', function () {

    });
  });

  describe('mouse events', function () {
    it('should fire hover events based on mouse events', function () {

    });

    it('should fire hover change events when moving mouse outside target', function () {

    });
  });

  describe('touch events', function () {
    it('should not fire hover events based on touch events', function () {

    });

    it('should not fire hover change events when moving touch outside target', function () {

    });
  });

});
