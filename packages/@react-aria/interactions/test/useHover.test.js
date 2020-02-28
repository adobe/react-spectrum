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
import React from 'react';
import {useHover} from '../';

function Example(props) {
  let {hoverProps} = useHover(props);
  return <div {...hoverProps}>test</div>;
}

describe('useHover', function () {
  afterEach(cleanup);

  it('does not handle hover events if disabled', function () {
    let events = [];
    let addEvent = (e) => events.push(e);
    let res = render(
      <Example
        isDisabled
        onHoverEnd={addEvent}
        onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})}
        onHover={addEvent} />
    );

    let el = res.getByText('test');
    fireEvent.mouseEnter(el);
    fireEvent.mouseLeave(el);

    expect(events).toEqual([]);
  });

  describe('mouse events', function () {
    it('should fire hover events based on mouse events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})}
          onHover={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.mouseEnter(el);
      fireEvent.mouseLeave(el);

      expect(events).toEqual([
        {
          type: 'hover',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: true
        },
        {
          type: 'hoverend',
          target: el,
          pointerType: 'mouse'
        },
        {
          type: 'hoverchange',
          isHovering: false
        }
      ]);
    });
  });

  describe('touch events', function () {
    it('should not fire hover events based on touch events', function () {
      let events = [];
      let addEvent = (e) => events.push(e);
      let res = render(
        <Example
          onHoverEnd={addEvent}
          onHoverChange={isHovering => addEvent({type: 'hoverchange', isHovering})}
          onHover={addEvent} />
      );

      let el = res.getByText('test');
      fireEvent.touchStart(el);
      fireEvent.touchMove(el);
      fireEvent.touchEnd(el);

      expect(events).toEqual([]);
    });
  });
});
