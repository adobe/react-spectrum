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

import {Checkbox} from '../src/Checkbox';
import {CheckboxGroup} from '../src/CheckboxGroup';
import {expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';
import {User} from '@react-aria/test-utils';

function CheckboxGroupExample() {
  return (
    <CheckboxGroup>
      <Checkbox value="product" description="Get notified about new features and improvements">
        Product Updates
      </Checkbox>
      <Checkbox value="security" description="Important notifications about your account safety">
        Security Alerts
      </Checkbox>
      <Checkbox value="marketing" description="Receive promotions, offers, and newsletters">
        Marketing Emails
      </Checkbox>
    </CheckboxGroup>
  );
}

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('toggles a checkbox via $interactionType', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<CheckboxGroupExample />);

  let tester = testUtilUser.createTester('CheckboxGroup', {
    root: container.querySelector('[role=group]') as HTMLElement,
    interactionType
  });
  let checkboxes = tester.checkboxes();
  await tester.toggleCheckbox({checkbox: checkboxes[2]});
  expect(tester.selectedCheckboxes()).toContain(checkboxes[2]);
});
