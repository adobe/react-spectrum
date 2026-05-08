/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {expect, it} from 'vitest';
import {Radio, RadioGroup} from '../src/RadioGroup';
import React from 'react';
import {render} from './utils/render';
import {User} from '@react-aria/test-utils';

function RadioGroupExample() {
  return (
    <RadioGroup>
      <Radio value="standard" description="Delivers in 5–7 business days">
        Standard Shipping (Free)
      </Radio>
      <Radio value="expedited" description="Delivers in 2–3 business days">
        Expedited Shipping ($9.99)
      </Radio>
      <Radio value="dragon" description="Next-day delivery">
        Overnight Shipping ($19.99)
      </Radio>
    </RadioGroup>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('triggers a radio via $interactionType', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<RadioGroupExample />);

  let tester = testUtilUser.createTester('RadioGroup', {
    root: container.querySelector('[role=radiogroup]') as HTMLElement,
    interactionType
  });
  let radios = tester.getRadios();
  await tester.triggerRadio({radio: radios[1]});
  expect(tester.getSelectedRadio()).toBe(radios[1]);
});
