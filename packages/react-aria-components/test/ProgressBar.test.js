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

import {ProgressBar, ProgressBarContext} from '../src/ProgressBar';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

let TestProgressBar = props => (
  <ProgressBar value={25} data-foo="bar" {...props}>
    {({percentage, valueText}) => (
      <>
        <Label>Loading…</Label>
        <span className="value">{valueText}</span>
        <span className="percentage">{percentage}</span>
        <div className="bar" style={{width: percentage + '%'}} />
      </>
    )}
  </ProgressBar>
);

describe('ProgressBar', () => {
  it('renders', () => {
    let {getByRole} = render(<TestProgressBar />);

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveClass('react-aria-ProgressBar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');
    expect(progressbar).toHaveAttribute('aria-labelledby');
    expect(progressbar).toHaveAttribute('data-foo', 'bar');
    expect(document.getElementById(progressbar.getAttribute('aria-labelledby'))).toHaveTextContent(
      'Loading…'
    );

    let value = progressbar.querySelector('.value');
    expect(value).toHaveTextContent('25%');

    let bar = progressbar.querySelector('.bar');
    expect(bar).toHaveStyle('width: 25%');
  });

  it('supports a custom range', () => {
    let {getByRole} = render(<TestProgressBar value={3} minValue={0} maxValue={6} />);

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '6');
    expect(progressbar).toHaveAttribute('aria-valuetext', '50%');

    let value = progressbar.querySelector('.value');
    expect(value).toHaveTextContent('50%');

    let percentage = progressbar.querySelector('.percentage');
    expect(percentage).toHaveTextContent('50');

    let bar = progressbar.querySelector('.bar');
    expect(bar).toHaveStyle('width: 50%');
  });

  it('renders 0 percent for an empty range', () => {
    let {getByRole} = render(<TestProgressBar value={0} minValue={0} maxValue={0} />);

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
    expect(progressbar).toHaveAttribute('aria-valuetext', '0%');
    expect(progressbar).not.toHaveAttribute('aria-valuetext', 'NaN%');

    let value = progressbar.querySelector('.value');
    expect(value).toHaveTextContent('0%');

    let percentage = progressbar.querySelector('.percentage');
    expect(percentage).toHaveTextContent('0');

    let bar = progressbar.querySelector('.bar');
    expect(bar).toHaveStyle('width: 0%');
  });

  it('renders 0 percent for an empty range with a non-zero bound', () => {
    let {getByRole} = render(<TestProgressBar value={5} minValue={5} maxValue={5} />);

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '5');
    expect(progressbar).toHaveAttribute('aria-valuemin', '5');
    expect(progressbar).toHaveAttribute('aria-valuemax', '5');
    expect(progressbar).toHaveAttribute('aria-valuetext', '0%');

    let percentage = progressbar.querySelector('.percentage');
    expect(percentage).toHaveTextContent('0');

    let bar = progressbar.querySelector('.bar');
    expect(bar).toHaveStyle('width: 0%');
  });

  it('supports indeterminate state', () => {
    let renderedPercentage;
    let {getByRole} = render(
      <ProgressBar
        isIndeterminate
        className={({isIndeterminate}) => `progressbar ${isIndeterminate ? 'indeterminate' : ''}`}>
        {({percentage}) => {
          renderedPercentage = percentage;
          return (
            <>
              <Label>Loading…</Label>
              <div className="bar" style={{width: percentage + '%'}} />
            </>
          );
        }}
      </ProgressBar>
    );

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('class', 'progressbar indeterminate');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(renderedPercentage).toBeUndefined();

    let bar = progressbar.querySelector('.bar');
    expect(bar.style.width).toBe('');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ProgressBarContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestProgressBar slot="test" />
      </ProgressBarContext.Provider>
    );

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('slot', 'test');
    expect(progressbar).toHaveAttribute('aria-label', 'test');
  });

  it('should support custom render function', () => {
    let {getByRole} = render(
      <TestProgressBar render={props => <div {...props} data-custom="bar" />} />
    );
    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('data-custom', 'bar');
  });
});
