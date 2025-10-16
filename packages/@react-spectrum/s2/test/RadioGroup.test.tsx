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

jest.mock('@react-aria/live-announcer');
import {Direction} from '@react-types/shared';
import {pointerMap, render, User} from '@react-spectrum/test-utils-internal';
import {Provider, Radio, RadioGroup} from '../src';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('RadioGroup', () => {
  let testUtilUser = new User();
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it.each`
    Name                    | props
    ${'ltr + vertical'}     | ${{locale: 'de-DE', orientation: 'vertical'}}
    ${'rtl + verfical'}     | ${{locale: 'ar-AE', orientation: 'vertical'}}
    ${'ltr + horizontal'}   | ${{locale: 'de-DE', orientation: 'horizontal'}}
    ${'rtl + horizontal'}   | ${{locale: 'ar-AE', orientation: 'horizontal'}}
  `('$Name should select the correct radio via keyboard regardless of orientation and disabled radios', async function ({props}) {
    let {getByRole} = render(
      <Provider locale={props.locale}>
        <RadioGroup aria-label="favorite pet" orientation={props.orientation}>
          <Radio value="dogs">Dogs</Radio>
          <Radio value="cats" isDisabled>Cats</Radio>
          <Radio value="dragons" isDisabled>Dragons</Radio>
          <Radio value="unicorns">Unicorns</Radio>
          <Radio value="chocobo">Chocobo</Radio>
        </RadioGroup>
      </Provider>
    );
    let direction = props.locale === 'ar-AE' ? 'rtl' : 'ltr' as Direction;
    let radioGroupTester = testUtilUser.createTester('RadioGroup', {root: getByRole('radiogroup'), direction});
    expect(radioGroupTester.radiogroup).toHaveAttribute('aria-orientation', props.orientation);
    let radios = radioGroupTester.radios;
    await radioGroupTester.triggerRadio({radio: radios[0]});
    expect(radios[0]).toBeChecked();

    await radioGroupTester.triggerRadio({radio: 4, interactionType: 'keyboard'});
    expect(radios[4]).toBeChecked();

    let radio4 = radioGroupTester.findRadio({radioIndexOrText: 3});
    await radioGroupTester.triggerRadio({radio: radio4, interactionType: 'keyboard'});
    expect(radios[3]).toBeChecked();

    await radioGroupTester.triggerRadio({radio: 'Dogs', interactionType: 'mouse'});
    expect(radios[0]).toBeChecked();

    let radio5 = radioGroupTester.findRadio({radioIndexOrText: 'Chocobo'});
    await radioGroupTester.triggerRadio({radio: radio5, interactionType: 'mouse'});
    expect(radios[4]).toBeChecked();

    // This isn't using the radioGroup tester because the tester uses the attached aria-orientation to determine
    // what arrow to press, which won't reproduce the original bug where we forgot to pass the orientation to the RadioGroup.
    // The tester ends up still pressing the correct keys (ArrowUp/ArrowDown) to navigate properly even in the horizontal orientation
    // instead of using ArrowLeft/ArrowRight
    await user.keyboard('[ArrowLeft]');
    if (props.locale === 'ar-AE' && props.orientation === 'horizontal') {
      expect(radioGroupTester.selectedRadio).toBe(radios[0]);
    } else {
      expect(radioGroupTester.selectedRadio).toBe(radios[3]);
    }
  });
});
