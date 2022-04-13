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

import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render as render_} from '@testing-library/react';
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
});
