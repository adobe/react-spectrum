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

import {Label, ProgressBar} from 'react-aria-components';
import React from 'react';
import {render} from '@react-spectrum/test-utils';

describe('ProgressBar', () => {
  it('renders', () => {
    let {getByRole} = render(
      <ProgressBar value={25}>
        {({percentage, valueText}) => (<>
          <Label>Loading…</Label>
          <span className="value">{valueText}</span>
          <div className="bar" style={{width: percentage + '%'}} />
        </>)}
      </ProgressBar>
    );

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveClass('react-aria-ProgressBar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');
    expect(progressbar).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(progressbar.getAttribute('aria-labelledby'))).toHaveTextContent('Loading…');

    let value = progressbar.querySelector('.value');
    expect(value).toHaveTextContent('25%');

    let bar = progressbar.querySelector('.bar');
    expect(bar).toHaveStyle('width: 25%');
  });

  it('supports indeterminate state', () => {
    let {getByRole} = render(
      <ProgressBar isIndeterminate className={({isIndeterminate}) => `progressbar ${isIndeterminate ? 'indeterminate' : ''}`}>
        {({percentage, valueText}) => (<>
          <Label>Loading…</Label>
          <div className="bar" style={{width: percentage + '%'}} />
        </>)}
      </ProgressBar>
    );

    let progressbar = getByRole('progressbar');
    expect(progressbar).toHaveAttribute('class', 'progressbar indeterminate');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');

    let bar = progressbar.querySelector('.bar');
    expect(bar.style.width).toBe('');
  });
});
