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

import {act, fireEvent, render as render_, within} from '@react-spectrum/test-utils';
import {parseZonedDateTime, Time} from '@internationalized/date';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {TimeField} from '../';
import userEvent from '@testing-library/user-event';

function render(el) {
  if (el.type === Provider) {
    return render_(el);
  }
  let res = render_(
    <Provider theme={theme}>
      {el}
    </Provider>
  );
  return {
    ...res,
    rerender(el) {
      return res.rerender(<Provider theme={theme}>{el}</Provider>);
    }
  };
}

describe('TimeField', function () {
  it('should include a selected value description', function () {
    let {getByRole, getAllByRole} = render(<TimeField label="Date" value={new Time(8, 45)} />);

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-describedby');

    let description = group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
    expect(description).toBe('Selected Time: 8:45 AM');

    let segments = getAllByRole('spinbutton');
    expect(segments[0]).toHaveAttribute('aria-describedby', group.getAttribute('aria-describedby'));

    for (let segment of segments.slice(1)) {
      expect(segment).not.toHaveAttribute('aria-describedby');
    }
  });

  it('should support focusing via a ref', function () {
    let ref = React.createRef();
    let {getAllByRole} = render(<TimeField label="Time" ref={ref} />);
    expect(ref.current).toHaveProperty('focus');

    act(() => ref.current.focus());
    expect(document.activeElement).toBe(getAllByRole('spinbutton')[0]);
  });

  it('should support autoFocus', function () {
    let {getAllByRole} = render(<TimeField label="Time" autoFocus />);
    expect(document.activeElement).toBe(getAllByRole('spinbutton')[0]);
  });

  it('should pass through data attributes', function () {
    let {getByTestId} = render(<TimeField label="Time" data-testid="foo" />);
    expect(getByTestId('foo')).toHaveAttribute('role', 'group');
  });

  it('should return the outer most DOM element from the ref', function () {
    let ref = React.createRef();
    render(<TimeField label="Time" ref={ref} />);
    expect(ref.current).toHaveProperty('UNSAFE_getDOMNode');

    let wrapper = ref.current.UNSAFE_getDOMNode();
    expect(wrapper).toBeInTheDocument();
    expect(within(wrapper).getByText('Time')).toBeInTheDocument();
    expect(within(wrapper).getAllByRole('spinbutton')[0]).toBeInTheDocument();
  });

  it('should respond to provider props', function () {
    let {getAllByRole} = render(
      <Provider theme={theme} isDisabled>
        <TimeField label="Time" />
      </Provider>
    );

    let segments = getAllByRole('spinbutton');
    for (let segment of segments) {
      expect(segment).toHaveAttribute('aria-disabled', 'true');
    }
  });

  describe('events', function () {
    let onBlurSpy = jest.fn();
    let onFocusChangeSpy = jest.fn();
    let onFocusSpy = jest.fn();
    let onKeyDownSpy = jest.fn();
    let onKeyUpSpy = jest.fn();

    afterEach(() => {
      onBlurSpy.mockClear();
      onFocusChangeSpy.mockClear();
      onFocusSpy.mockClear();
      onKeyDownSpy.mockClear();
      onKeyUpSpy.mockClear();
    });

    it('should focus field and switching segments via tab does not change focus', function () {
      let {getAllByRole} = render(<TimeField label="Time" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} />);
      let segments = getAllByRole('spinbutton');

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      userEvent.tab();
      expect(segments[0]).toHaveFocus();

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);

      userEvent.tab();
      expect(segments[1]).toHaveFocus();
      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('should call blur when focus leaves', function () {
      let {getAllByRole} = render(<TimeField label="Time" onBlur={onBlurSpy} onFocus={onFocusSpy} onFocusChange={onFocusChangeSpy} />);
      let segments = getAllByRole('spinbutton');
      // workaround bug in userEvent.tab(). hidden inputs aren't focusable.
      document.querySelector('input[type=hidden]').tabIndex = -1;

      expect(onBlurSpy).not.toHaveBeenCalled();
      expect(onFocusChangeSpy).not.toHaveBeenCalled();
      expect(onFocusSpy).not.toHaveBeenCalled();

      userEvent.tab();
      expect(segments[0]).toHaveFocus();

      userEvent.tab();
      expect(segments[1]).toHaveFocus();
      expect(onBlurSpy).toHaveBeenCalledTimes(0);

      userEvent.tab();
      expect(segments[2]).toHaveFocus();
      expect(onBlurSpy).toHaveBeenCalledTimes(0);

      userEvent.tab();
      expect(onBlurSpy).toHaveBeenCalledTimes(1);
      expect(onFocusChangeSpy).toHaveBeenCalledTimes(2);
      expect(onFocusSpy).toHaveBeenCalledTimes(1);
    });

    it('should trigger right arrow key event for segment navigation', function () {
      let {getAllByRole} = render(<TimeField label="Time" onKeyDown={onKeyDownSpy} onKeyUp={onKeyUpSpy} />);
      let segments = getAllByRole('spinbutton');

      expect(onKeyDownSpy).not.toHaveBeenCalled();
      expect(onKeyUpSpy).not.toHaveBeenCalled();

      userEvent.tab();
      expect(segments[0]).toHaveFocus();
      expect(onKeyDownSpy).not.toHaveBeenCalled();
      expect(onKeyUpSpy).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
      fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
      expect(segments[1]).toHaveFocus();
      expect(onKeyDownSpy).toHaveBeenCalledTimes(1);
      expect(onKeyUpSpy).toHaveBeenCalledTimes(2);
    });

    describe('timeZone', function () {
      it('should have a timeZone when set by defaultValue', function () {
        let {getByRole} = render(<TimeField label="Time" defaultValue={parseZonedDateTime('2023-07-01T00:45-07:00[America/Los_Angeles]')} />);
        let timezone = getByRole('textbox');

        expect(timezone.getAttribute('aria-label')).toBe('time zone, ');
        expect(within(timezone).getByText('PDT')).toBeInTheDocument();
      });

      it('should keep timeZone from defaultValue when minute segment cleared', function () {
        let {getAllByRole, getByRole} = render(<TimeField label="Time" defaultValue={parseZonedDateTime('2023-07-01T01:05-07:00[America/Los_Angeles]')} />);
        let timezone = getByRole('textbox');
        let segments = getAllByRole('spinbutton');

        userEvent.tab();
        expect(segments[0]).toHaveFocus();

        userEvent.tab();
        expect(segments[1]).toHaveFocus();
        expect(segments[1]).toHaveAttribute('aria-valuetext', '05');
        expect(timezone.getAttribute('aria-label')).toBe('time zone, ');
        expect(within(timezone).getByText('PDT')).toBeInTheDocument();

        fireEvent.keyDown(document.activeElement, {key: 'Backspace'});
        fireEvent.keyUp(document.activeElement, {key: 'Backspace'});
        expect(segments[1]).toHaveAttribute('aria-valuetext', 'Empty');
        expect(timezone.getAttribute('aria-label')).toBe('time zone, ');
        expect(within(timezone).getByText('PDT')).toBeInTheDocument();
      });

      it('should keep timeZone from defaultValue when minute segment cleared then set', function () {
        let {getAllByRole, getByRole} = render(<TimeField label="Time" defaultValue={parseZonedDateTime('2023-07-01T01:05-07:00[America/Los_Angeles]')} />);
        let timezone = getByRole('textbox');
        let segments = getAllByRole('spinbutton');

        userEvent.tab();
        expect(segments[0]).toHaveFocus();

        userEvent.tab();
        expect(segments[1]).toHaveFocus();
        expect(segments[1]).toHaveAttribute('aria-valuetext', '05');
        expect(timezone.getAttribute('aria-label')).toBe('time zone, ');
        expect(within(timezone).getByText('PDT')).toBeInTheDocument();

        fireEvent.keyDown(document.activeElement, {key: 'Backspace'});
        fireEvent.keyUp(document.activeElement, {key: 'Backspace'});
        expect(segments[1]).toHaveFocus();
        expect(segments[1]).toHaveAttribute('aria-valuetext', 'Empty');
        expect(timezone.getAttribute('aria-label')).toBe('time zone, ');
        expect(within(timezone).getByText('PDT')).toBeInTheDocument();

        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp'});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp'});
        expect(segments[1]).toHaveAttribute('aria-valuetext', '00');
        expect(timezone.getAttribute('aria-label')).toBe('time zone, ');
        expect(within(timezone).getByText('PDT')).toBeInTheDocument();
      });
    });
  });

  describe('forms', () => {
    it('supports form reset', () => {
      function Test() {
        let [value, setValue] = React.useState(new Time(8, 30));
        return (
          <form>
            <TimeField name="time" label="Value" value={value} onChange={setValue} />
            <input type="reset" data-testid="reset" />
          </form>
        );
      }

      let {getByTestId, getByRole, getAllByRole} = render(<Test />);
      let group = getByRole('group');
      let input = document.querySelector('input[name=time]');
      let segments = getAllByRole('spinbutton');

      let getDescription = () => group.getAttribute('aria-describedby').split(' ').map(d => document.getElementById(d).textContent).join(' ');
      expect(getDescription()).toBe('Selected Time: 8:30 AM');

      expect(input).toHaveValue('08:30:00');
      expect(input).toHaveAttribute('name', 'time');
      fireEvent.keyDown(segments[0], {key: 'ArrowUp'});
      fireEvent.keyUp(segments[0], {key: 'ArrowUp'});
      expect(getDescription()).toBe('Selected Time: 9:30 AM');
      expect(input).toHaveValue('09:30:00');

      let button = getByTestId('reset');
      act(() => userEvent.click(button));
      expect(getDescription()).toBe('Selected Time: 8:30 AM');
      expect(input).toHaveValue('08:30:00');
    });
  });
});
