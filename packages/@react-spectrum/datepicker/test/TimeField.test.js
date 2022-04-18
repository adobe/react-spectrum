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

import {act, render as render_, within} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {theme} from '@react-spectrum/theme-default';
import {Time} from '@internationalized/date';
import {TimeField} from '../';

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
});
