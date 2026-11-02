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

import {Button} from '../src/Button';
import {expect, it} from 'vitest';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Popover} from '../src/Popover';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Select, SelectProps, SelectValue} from '../src/Select';
import {User} from '@react-aria/test-utils';
import {userEvent} from 'vitest/browser';

function ResetForm(props: SelectProps<object, 'single' | 'multiple'>) {
  return (
    <form>
      <Select {...props} aria-label="Favorite Animal" name="select">
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem id="cat">Cat</ListBoxItem>
            <ListBoxItem id="dog">Dog</ListBoxItem>
            <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
      <button type="reset">Reset</button>
    </form>
  );
}

it.each([
  {
    selectionMode: 'single',
    props: {defaultSelectedKey: 'dog'},
    defaultFormValue: ['dog'],
    option: 'Cat',
    changedFormValue: ['cat']
  },
  {
    selectionMode: 'multiple',
    props: {selectionMode: 'multiple', defaultValue: ['cat', 'kangaroo']},
    defaultFormValue: ['cat', 'kangaroo'],
    option: 'Dog',
    changedFormValue: ['cat', 'dog', 'kangaroo']
  }
] as const)(
  'submits the default value after clicking a reset button ($selectionMode)',
  async ({props, defaultFormValue, option, changedFormValue}) => {
    let {container} = await render(<ResetForm {...props} />);
    let form = container.querySelector('form')!;
    let reset = container.querySelector('button[type=reset]')!;

    await userEvent.click(reset);
    expect(new FormData(form).getAll('select')).toEqual(defaultFormValue);

    let selectTester = new User().createTester('Select', {
      root: container.querySelector<HTMLElement>('.react-aria-Select')!
    });
    await selectTester.toggleOptionSelection({option});
    await selectTester.close();
    expect(new FormData(form).getAll('select')).toEqual(changedFormValue);

    await userEvent.click(reset);
    expect(new FormData(form).getAll('select')).toEqual(defaultFormValue);
  }
);
