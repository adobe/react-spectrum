/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  act,
  createShadowRoot,
  fireEvent,
  installPointerEvent,
  render,
  within
} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {CalendarCell, CalendarGrid, CalendarHeading, RangeCalendar} from '../src/Calendar';
import {CalendarDate} from '@internationalized/date';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import React from 'react';

let TestCalendar = props => (
  <RangeCalendar aria-label="Trip dates" {...props}>
    <header>
      <Button slot="previous">◀</Button>
      <CalendarHeading />
      <Button slot="next">▶</Button>
    </header>
    <CalendarGrid>{date => <CalendarCell date={date} />}</CalendarGrid>
  </RangeCalendar>
);

if (parseInt(React.version, 10) >= 17) {
  describe('RangeCalendar shadow DOM', () => {
    installPointerEvent();

    beforeAll(() => {
      enableShadowDOM();
    });

    let pointerOpts = {
      pointerType: 'mouse',
      pointerId: 1,
      width: 1,
      height: 1,
      detail: 1,
      pressure: 0.5
    };
    let pointerClick = (element: Element) => {
      fireEvent.pointerDown(element, pointerOpts);
      fireEvent.pointerUp(element, pointerOpts);
      fireEvent.click(element, {detail: 1});
    };

    let renderInShadowRoot = (calendarProps = {}, attachTo?: HTMLElement) => {
      let {shadowRoot, cleanup} = createShadowRoot(attachTo);
      let container = document.createElement('div');
      shadowRoot.appendChild(container);
      let onChange = jest.fn();
      render(
        <TestCalendar
          onChange={onChange}
          defaultFocusedValue={new CalendarDate(2019, 6, 5)}
          {...calendarProps}
        />,
        {container}
      );

      return {
        onChange,
        shadowRoot,
        cleanup,
        calendar: shadowRoot.querySelector<HTMLElement>('[role="application"]')!,
        grid: shadowRoot.querySelector<HTMLElement>('[role="grid"]')!
      };
    };

    it('should support selecting a range by clicking two dates', () => {
      let {grid, onChange, cleanup} = renderInShadowRoot();

      let startCell = within(grid).getByText('17');
      pointerClick(startCell);

      expect(startCell).toHaveAttribute('data-selection-start', 'true');
      expect(startCell).toHaveAttribute('data-selection-end', 'true');
      expect(onChange).not.toHaveBeenCalled();

      let endCell = within(grid).getByText('23');
      pointerClick(endCell);

      expect(startCell).toHaveAttribute('data-selection-start', 'true');
      expect(endCell).toHaveAttribute('data-selection-end', 'true');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      cleanup();
    });

    it('should support selecting a range by dragging', () => {
      let {grid, onChange, cleanup} = renderInShadowRoot();

      fireEvent.pointerDown(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerLeave(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerEnter(within(grid).getByText('20'), pointerOpts);
      fireEvent.pointerLeave(within(grid).getByText('20'), pointerOpts);
      fireEvent.pointerEnter(within(grid).getByText('23'), pointerOpts);
      expect(onChange).not.toHaveBeenCalled();

      let endCell = within(grid).getByText('23');
      fireEvent.pointerUp(endCell, pointerOpts);
      fireEvent.click(endCell, {detail: 1});

      expect(within(grid).getByText('17')).toHaveAttribute('data-selection-start', 'true');
      expect(endCell).toHaveAttribute('data-selection-end', 'true');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      cleanup();
    });

    it('should not commit the selection when pressing the month navigation buttons', () => {
      let {calendar, grid, onChange, cleanup} = renderInShadowRoot();

      pointerClick(within(grid).getByText('17'));
      expect(onChange).not.toHaveBeenCalled();

      pointerClick(within(calendar).getAllByRole('button', {name: /Next/i})[0]);
      expect(onChange).not.toHaveBeenCalled();

      pointerClick(within(grid).getByText('5'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 7, 5)
      });

      cleanup();
    });

    it('should not clear the selection when clicking a date with commitBehavior="clear"', () => {
      let {grid, onChange, cleanup} = renderInShadowRoot({
        commitBehavior: 'clear',
        defaultValue: {start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 20)}
      });

      let startCell = within(grid).getByText('17');
      pointerClick(startCell);

      expect(startCell).toHaveAttribute('data-selection-start', 'true');
      expect(onChange).not.toHaveBeenCalled();

      pointerClick(within(grid).getByText('23'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      cleanup();
    });

    it('should support selecting a range inside nested shadow roots', () => {
      let outer = createShadowRoot();
      let wrapper = document.createElement('div');
      outer.shadowRoot.appendChild(wrapper);
      let {grid, onChange, cleanup} = renderInShadowRoot({}, wrapper);

      pointerClick(within(grid).getByText('17'));
      expect(onChange).not.toHaveBeenCalled();

      pointerClick(within(grid).getByText('23'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      cleanup();
      outer.cleanup();
    });

    it('should commit the selection when tabbing away mid selection', () => {
      let {shadowRoot, grid, onChange, cleanup} = renderInShadowRoot();
      let outsideButton = document.createElement('button');
      document.body.appendChild(outsideButton);

      pointerClick(within(grid).getByText('17'));
      fireEvent.pointerLeave(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerEnter(within(grid).getByText('23'), pointerOpts);
      expect(onChange).not.toHaveBeenCalled();

      // userEvent's tab doesn't work in shadow, so fire the focus/blur events the browser
      // would. The focused cell blurs with the outside button as relatedTarget, and the button
      // takes focus. The blur path commits via relatedTarget rather than the pointerup target,
      // so it must still resolve the outside control as outside the calendar across the boundary.
      let focusedCell = shadowRoot.activeElement!;
      fireEvent.keyDown(focusedCell, {key: 'Tab'});
      act(() => {
        outsideButton.focus();
      });
      fireEvent.keyUp(outsideButton, {key: 'Tab'});

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      document.body.removeChild(outsideButton);
      cleanup();
    });

    it('should commit the selection when releasing a drag outside the calendar', () => {
      let {grid, onChange, cleanup} = renderInShadowRoot();

      fireEvent.pointerDown(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerLeave(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerEnter(within(grid).getByText('23'), pointerOpts);
      fireEvent.pointerLeave(within(grid).getByText('23'), pointerOpts);
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.pointerUp(document.body, pointerOpts);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      cleanup();
    });

    it('should commit the selection when releasing a drag outside the calendar but inside the shadow root', () => {
      let {shadowRoot, grid, onChange, cleanup} = renderInShadowRoot();
      let sibling = document.createElement('div');
      shadowRoot.appendChild(sibling);

      fireEvent.pointerDown(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerLeave(within(grid).getByText('17'), pointerOpts);
      fireEvent.pointerEnter(within(grid).getByText('23'), pointerOpts);
      fireEvent.pointerLeave(within(grid).getByText('23'), pointerOpts);
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.pointerUp(sibling, pointerOpts);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        start: new CalendarDate(2019, 6, 17),
        end: new CalendarDate(2019, 6, 23)
      });

      cleanup();
    });
  });
} else {
  describe('RangeCalendar shadow DOM', () => {
    it('should not run tests in React 16, we do not support it anyways', () => {
      expect(true).toBe(true);
    });
  });
}
