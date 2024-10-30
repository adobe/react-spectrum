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

import {DismissButton} from '..';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';


describe('DismissButton', function () {
  it('should have a default aria-label', function () {
    let {getByRole} = render(<DismissButton />);
    expect(getByRole('button', {hidden: true})).toHaveAttribute('aria-label', 'Dismiss');
  });

  it('should accept an aria-label', function () {
    let {getByRole} = render(<DismissButton aria-label="foo" />);
    expect(getByRole('button', {hidden: true})).toHaveAttribute('aria-label', 'foo');
  });

  it('should accept an aria-labelledby', function () {
    let {getByRole} = render(
      <>
        <span id="span-id">bar</span>
        <DismissButton aria-labelledby="span-id" />
      </>
    );
    expect(getByRole('button', {hidden: true})).toHaveAttribute('aria-labelledby', 'span-id');
    expect(getByRole('button', {hidden: true})).not.toHaveAttribute('aria-label');
  });

  it('should accept an aria-labelledby and aria-label', function () {
    let {getByRole} = render(
      <>
        <span id="span-id">bar</span>
        <DismissButton aria-labelledby="span-id" aria-label="foo" id="self" />
      </>
    );
    expect(getByRole('button', {hidden: true})).toHaveAttribute('aria-labelledby', 'self span-id');
    expect(getByRole('button', {hidden: true})).toHaveAttribute('aria-label', 'foo');
  });

});
