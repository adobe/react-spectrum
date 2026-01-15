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
import {Separator, SeparatorContext} from '../';

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
});
