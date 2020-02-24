/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {cleanup, fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useInteractOutside} from '../';

function Example(props) {
  let ref = useRef();
  useInteractOutside({ref, ...props});
  return <div ref={ref}>test</div>;
}

function pointerEvent(type, opts) {
  let evt = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(evt, opts);
  return evt;
}

describe('useInteractOutside', function () {
  afterEach(cleanup);

  // TODO: JSDOM doesn't yet support pointer events. Once they do, convert these tests.
  // https://github.com/jsdom/jsdom/issues/2527
  describe('pointer events', function () {
    beforeEach(() => {
      global.PointerEvent = {};
    });

    afterEach(() => {
      delete global.PointerEvent;
    });

    it('should fire interact outside events based on pointer events', function () {
      let onInteractOutside = jest.fn();
      let res = render(
        <Example onInteractOutside={onInteractOutside} />
      );

      let el = res.getByText('test');
      fireEvent(el, pointerEvent('pointerup'));
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent(document.body, pointerEvent('pointerup'));
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it('should only listen for the left mouse button', function () {
      let onInteractOutside = jest.fn();
      render(
        <Example onInteractOutside={onInteractOutside} />
      );

      fireEvent(document.body, pointerEvent('pointerup', {button: 1}));
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent(document.body, pointerEvent('pointerup', {button: 0}));
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });
  });

  describe('mouse events', function () {
    it('should fire interact outside events based on mouse events', function () {
      let onInteractOutside = jest.fn();
      let res = render(
        <Example onInteractOutside={onInteractOutside} />
      );

      let el = res.getByText('test');
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it('should only listen for the left mouse button', function () {
      let onInteractOutside = jest.fn();
      render(
        <Example onInteractOutside={onInteractOutside} />
      );

      fireEvent.mouseUp(document.body, {button: 1});
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.mouseUp(document.body, {button: 0});
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });
  });

  describe('touch events', function () {
    it('should fire interact outside events based on mouse events', function () {
      let onInteractOutside = jest.fn();
      let res = render(
        <Example onInteractOutside={onInteractOutside} />
      );

      let el = res.getByText('test');
      fireEvent.touchEnd(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchEnd(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });

    it('should ignore emulated mouse events', function () {
      let onInteractOutside = jest.fn();
      let res = render(
        <Example onInteractOutside={onInteractOutside} />
      );

      let el = res.getByText('test');
      fireEvent.touchEnd(el);
      fireEvent.mouseUp(el);
      expect(onInteractOutside).not.toHaveBeenCalled();

      fireEvent.touchEnd(document.body);
      fireEvent.mouseUp(document.body);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
    });
  });
});
