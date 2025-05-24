/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Label, Meter, MeterContext} from 'react-aria-components';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

let TestMeter = (props) => (
  <Meter value={25} data-foo="bar" {...props}>
    {({percentage, valueText}) => (<>
      <Label>Storage space</Label>
      <span className="value">{valueText}</span>
      <div className="bar" style={{width: percentage + '%'}} />
    </>)}
  </Meter>
);

describe('Meter', () => {
  it('renders', () => {
    let {getByRole} = render(<TestMeter />);

    let meter = getByRole('meter');
    expect(meter).toHaveClass('react-aria-Meter');
    expect(meter).toHaveAttribute('aria-valuenow', '25');
    expect(meter).toHaveAttribute('aria-labelledby');
    expect(meter).toHaveAttribute('data-foo', 'bar');
    expect(document.getElementById(meter.getAttribute('aria-labelledby'))).toHaveTextContent('Storage space');

    let value = meter.querySelector('.value');
    expect(value).toHaveTextContent('25%');

    let bar = meter.querySelector('.bar');
    expect(bar).toHaveStyle('width: 25%');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <MeterContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestMeter slot="test" />
      </MeterContext.Provider>
    );

    let meter = getByRole('meter');
    expect(meter).toHaveAttribute('slot', 'test');
    expect(meter).toHaveAttribute('aria-label', 'test');
  });
});
