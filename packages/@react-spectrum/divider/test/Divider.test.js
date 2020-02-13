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
import {cleanup, render} from '@testing-library/react';
import {Divider} from '../';
import React from 'react';
import Rule from '@react/react-spectrum/Rule';

describe('Divider', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name         | Component  | props
    ${'Divider'} | ${Divider} | ${{}}
    ${'v2 Rule'}    | ${Rule}    | ${{}}
    ${'Divider'} | ${Divider} | ${{size: 'M'}}
    ${'v2 Rule'}    | ${Rule}    | ${{variant: 'medium'}}
    ${'Divider'} | ${Divider} | ${{size: 'S'}}
    ${'v2 Rule'}    | ${Rule}    | ${{variant: 'small'}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} aria-label="divides" />);

    let divider = getByRole('separator');
    expect(divider).toBeTruthy();
    expect(divider).not.toHaveAttribute('aria-orientation');
    expect(divider).toHaveAttribute('aria-label', 'divides');
  });

  // V2 doesn't have a vertical Rule, this is new to Divider
  it.each`
    Name         | Component  | props
    ${'Divider'} | ${Divider} | ${{orientation: 'vertical'}}
    ${'Divider'} | ${Divider} | ${{orientation: 'vertical', size: 'M'}}
    ${'Divider'} | ${Divider} | ${{orientation: 'vertical', size: 'S'}}
  `('$Name can be vertical', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} aria-label="divides" />);

    let divider = getByRole('separator');
    expect(divider).toBeTruthy();
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('aria-label', 'divides');
  });

  it.each`
    Name         | Component
    ${'Divider'} | ${Divider}
  `('$Name should not include implicit attributes', function ({Component}) {
    let {getByRole} = render(<Component aria-label="divides" />);

    let divider = getByRole('separator');
    expect(divider).not.toHaveAttribute('aria-orientation');
  });

  it.each`
    Name         | Component
    ${'Divider'} | ${Divider}
  `('$Name forwards the ref', function ({Component}) {
    let ref = React.createRef();
    let {getByRole} = render(<Component aria-label="divides" ref={ref} />);

    let divider = getByRole('separator');
    expect(divider).toBe(ref.current.UNSAFE_getDOMNode());
  });
});
