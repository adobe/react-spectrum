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

import {RangeSlider} from '../';
import React from 'react';
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


describe('Slider', function () {
  it('can be focused', function () {
    let {getAllByRole} = render(<div>
      <button>A</button>
      <RangeSlider label="The Label" defaultValue={20} />
      <button>B</button>
    </div>);

    let [sliderLeft, sliderRight] = getAllByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(sliderLeft);
    userEvent.tab();
    expect(document.activeElement).toBe(sliderRight);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(sliderRight);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(sliderLeft);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonA);
  });
});
