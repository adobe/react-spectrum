/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {Separator, SeparatorContext} from '../src/Separator';

describe('Separator', () => {
  it('should render a separator with default class', () => {
    let {getByRole} = render(<Separator />);
    let separator = getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).toHaveAttribute('class', 'react-aria-Separator');
  });

  it('should render a separator with custom class', () => {
    let {getByRole} = render(<Separator className="test" />);
    let separator = getByRole('separator');
    expect(separator).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = render(<Separator data-foo="bar" />);
    let separator = getByRole('separator');
    expect(separator).toHaveAttribute('data-foo', 'bar');
  });

  it('should support custom render function', () => {
    let {getByRole} = render(<Separator render={props => <hr {...props} data-custom="true" />} />);
    let separator = getByRole('separator');
    expect(separator).toHaveAttribute('data-custom', 'true');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <SeparatorContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <Separator slot="test" />
      </SeparatorContext.Provider>
    );

    let separator = getByRole('separator');
    expect(separator).toHaveAttribute('slot', 'test');
    expect(separator).toHaveAttribute('aria-label', 'test');
  });

  it('should support accessibility props', () => {
    let {getByRole} = render(<Separator aria-label="label" />);
    let separator = getByRole('separator');
    expect(separator).toHaveAttribute('aria-label', 'label');
  });

  it('should not add a redundant role to the default hr element', () => {
    let {getByRole} = render(<Separator />);
    let separator = getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).not.toHaveAttribute('role');
    expect(separator).not.toHaveAttribute('aria-orientation');
  });

  it('should add role to a horizontal div element', () => {
    let {getByRole} = render(<Separator elementType="div" />);
    let separator = getByRole('separator');
    expect(separator.tagName).toBe('DIV');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).not.toHaveAttribute('aria-orientation');
  });

  it.each([
    ['default', {}],
    ['hr', {elementType: 'hr'}],
    ['div', {elementType: 'div'}]
  ])('should expose role and orientation for a vertical separator (%s element)', (_, props) => {
    let {getByRole} = render(<Separator {...props} orientation="vertical" />);
    let separator = getByRole('separator');
    expect(separator.tagName).toBe('DIV');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });
});
