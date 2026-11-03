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
import {expect, it, vi} from 'vitest';
import {Group} from '../src/Group';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {NumberField, NumberFieldProps} from '../src/NumberField';
import React, {useState} from 'react';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

function TestNumberField(props: NumberFieldProps) {
  return (
    <NumberField defaultValue={25} {...props}>
      <Label>Quantity</Label>
      <Group>
        <Input />
        <Button slot="decrement">-</Button>
        <Button slot="increment">+</Button>
      </Group>
    </NumberField>
  );
}

it('commits typed text once when a focused field is disabled after rerendering', async () => {
  let onChange = vi.fn();
  let onBlur = vi.fn();
  let nextOnBlur = vi.fn();
  let tree = await render(<TestNumberField onChange={onChange} onBlur={onBlur} />);
  let input = tree.getByRole('textbox');
  await userEvent.fill(input, '42');
  expect(onChange).not.toHaveBeenCalled();

  await tree.rerender(<TestNumberField onChange={onChange} onBlur={nextOnBlur} />);
  await tree.rerender(<TestNumberField onChange={onChange} onBlur={nextOnBlur} isDisabled />);

  await expect.element(input).toBeDisabled();
  await expect.element(input).toHaveValue('42');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(42);
  expect(onBlur).not.toHaveBeenCalled();
  expect(nextOnBlur).toHaveBeenCalledTimes(1);
});

it('keeps the incremented value when onChange disables a focused field', async () => {
  let onChange = vi.fn();
  let onDisabledBlur = vi.fn();
  function Example() {
    let [value, setValue] = useState(25);
    let [isDisabled, setDisabled] = useState(false);
    return (
      <TestNumberField
        value={value}
        isDisabled={isDisabled}
        onBlur={event => {
          // Pointer interactions may blur and refocus the enabled input first.
          if ((event.currentTarget as HTMLInputElement).disabled) {
            onDisabledBlur(event);
          }
        }}
        onChange={value => {
          onChange(value);
          setValue(value);
          setDisabled(true);
        }}
      />
    );
  }

  let tree = await render(<Example />);
  let input = tree.getByRole('textbox');
  await userEvent.click(input);
  await userEvent.click(tree.getByRole('button', {name: /Increase/}));

  await expect.element(input).toBeDisabled();
  await expect.element(input).toHaveValue('26');
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(26);
  expect(onDisabledBlur).toHaveBeenCalledTimes(1);
});
