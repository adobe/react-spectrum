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
import {describe, expect, it, vi} from 'vitest';
import {Radio, RadioGroup} from '../src/RadioGroup';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Switch} from '../src/Switch';
import {userEvent} from 'vitest/browser';

let toggles = [
  {
    name: 'Checkbox',
    role: 'checkbox',
    render: props => <Checkbox {...props}>Subscribe</Checkbox>
  },
  {
    name: 'Switch',
    role: 'switch',
    render: props => <Switch {...props}>Wi-Fi</Switch>
  },
  {
    name: 'Radio',
    role: 'radio',
    render: props => (
      <RadioGroup aria-label="Favorite sport">
        <Radio value="soccer" {...props}>
          Soccer
        </Radio>
      </RadioGroup>
    )
  }
];

describe('Toggle keyboard activation', () => {
  it.each(toggles)(
    'should activate a $name once per keyboard press',
    async ({role, render: renderToggle}) => {
      let onPress = vi.fn();
      let onClick = vi.fn();
      let {getByRole} = await render(renderToggle({onPress, onClick, autoFocus: true}));
      let element = getByRole(role);
      await expect.element(element).toHaveFocus();

      for (let index of [0, 1]) {
        await userEvent.keyboard(' ');
        expect(onPress).toHaveBeenCalledTimes(index + 1);
        expect(onClick).toHaveBeenCalledTimes(index + 1);
        expect(onPress).toHaveBeenLastCalledWith(
          expect.objectContaining({pointerType: 'keyboard'})
        );
      }

      (element.element() as HTMLInputElement).click();
      expect(onPress).toHaveBeenCalledTimes(3);
      expect(onClick).toHaveBeenCalledTimes(3);
      expect(onPress).toHaveBeenLastCalledWith(expect.objectContaining({pointerType: 'virtual'}));
    }
  );
});
