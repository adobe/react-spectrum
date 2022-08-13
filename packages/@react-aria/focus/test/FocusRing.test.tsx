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

import {act, render} from '@react-spectrum/test-utils';
import {FocusRing} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';


describe('FocusScope', function () {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    // make sure to clean up any raf's that may be running to restore focus on unmount
    act(() => {jest.runAllTimers();});
  });

  describe('focus containment', function () {
    it('should contain focus within the scope', function () {
      let {getByTestId, rerender} = render(
        <>
          <FocusRing focusRingClass="bar">
            <FocusRing focusRingClass="foo">
              <input data-testid="input1" />
            </FocusRing>
          </FocusRing>
        </>
      );

      let input1 = getByTestId('input1');
      userEvent.tab();
      expect(document.activeElement).toBe(input1);
      rerender((<>
        <FocusRing focusRingClass="bar"><div /></FocusRing>
      </>));
      expect(input1).not.toBeInTheDocument();
    });
  });
});
