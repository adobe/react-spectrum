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

import {Label} from '../src/Label';

import {Meter, MeterContext} from '../src/Meter';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

let TestMeter = props => (
  <Meter value={25} data-foo="bar" {...props}>
    {({percentage, valueText}) => (
      <>
        <Label>Storage space</Label>
        <span className="value">{valueText}</span>
        <span className="percentage">{percentage}</span>
        <div className="bar" style={{width: percentage + '%'}} />
      </>
    )}
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
    expect(document.getElementById(meter.getAttribute('aria-labelledby'))).toHaveTextContent(
      'Storage space'
    );

    let value = meter.querySelector('.value');
    expect(value).toHaveTextContent('25%');

    let bar = meter.querySelector('.bar');
    expect(bar).toHaveStyle('width: 25%');
  });

  it('supports a custom range', () => {
    let {getByRole} = render(<TestMeter value={3} minValue={0} maxValue={6} />);

    let meter = getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '6');
    expect(meter).toHaveAttribute('aria-valuetext', '50%');

    let value = meter.querySelector('.value');
    expect(value).toHaveTextContent('50%');

    let percentage = meter.querySelector('.percentage');
    expect(percentage).toHaveTextContent('50');

    let bar = meter.querySelector('.bar');
    expect(bar).toHaveStyle('width: 50%');
  });

  it('renders 0 percent for an empty range', () => {
    let {getByRole} = render(<TestMeter value={0} minValue={0} maxValue={0} />);

    let meter = getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '0');
    expect(meter).toHaveAttribute('aria-valuetext', '0%');
    expect(meter).not.toHaveAttribute('aria-valuetext', 'NaN%');

    let value = meter.querySelector('.value');
    expect(value).toHaveTextContent('0%');

    let percentage = meter.querySelector('.percentage');
    expect(percentage).toHaveTextContent('0');

    let bar = meter.querySelector('.bar');
    expect(bar).toHaveStyle('width: 0%');
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

  it('should support custom render function', () => {
    let {getByRole} = render(<TestMeter render={props => <div {...props} data-custom="bar" />} />);
    let meter = getByRole('meter');
    expect(meter).toHaveAttribute('data-custom', 'bar');
  });
});
