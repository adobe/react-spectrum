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
import {FieldError} from '../src/FieldError';
import {Form} from '../src/Form';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {page, userEvent} from 'vitest/browser';
import React from 'react';
import {render} from 'vitest-browser-react';
import {TextField} from '../src/TextField';

it('shows the focus ring on the first invalid field when submitting with the mouse', async () => {
  await render(
    <Form>
      <TextField name="name" isRequired>
        <Label>Name</Label>
        <Input />
        <FieldError />
      </TextField>
      <Button type="submit">Submit</Button>
    </Form>
  );

  await userEvent.click(page.getByRole('button', {name: 'Submit'}));

  let input = page.getByRole('textbox', {name: 'Name'});
  await expect.element(input).toHaveFocus();
  await expect.element(input).toHaveAttribute('data-focus-visible', 'true');
});
