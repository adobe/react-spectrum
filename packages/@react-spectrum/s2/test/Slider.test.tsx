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

import {Form} from '../src/Form';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Slider} from '../src/Slider';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';

describe('Slider', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders an editable number input without steppers or status output when isEditable is true', async () => {
    let onChange = jest.fn();
    let onChangeEnd = jest.fn();
    let {getByRole, queryByRole, queryAllByRole, rerender} = render(
      <Slider
        label="Opacity"
        isEditable
        defaultValue={0.5}
        maxValue={1}
        step={0.01}
        formatOptions={{style: 'percent'}}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />
    );

    expect(queryByRole('status')).not.toBeInTheDocument();
    expect(queryAllByRole('button')).toHaveLength(0);

    let slider = getByRole('slider', {name: 'Opacity'});
    let input = getByRole('textbox', {name: 'Opacity'});
    expect(slider).toHaveValue('0.5');
    expect(input).toHaveValue('50%');

    await user.click(input);
    await user.clear(input);
    await user.keyboard('85{Enter}');
    expect(slider).toHaveValue('0.85');
    expect(input).toHaveValue('85%');
    expect(onChange).toHaveBeenLastCalledWith(0.85);
    expect(onChangeEnd).toHaveBeenLastCalledWith(0.85);

    await user.tab();
    rerender(
      <Slider
        label="Opacity"
        labelPosition="side"
        isEditable
        isDisabled
        defaultValue={0.5}
        maxValue={1}
        step={0.01}
        formatOptions={{style: 'percent'}}
      />
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
    expect(getByRole('slider', {name: 'Opacity'})).toBeDisabled();
    expect(getByRole('textbox', {name: 'Opacity'})).toBeDisabled();
  });

  it('supports controlled editable Slider and Form integration without duplicate form entries', async () => {
    let entries: [string, FormDataEntryValue][] = [];
    function ControlledExample() {
      let [value, setValue] = useState(30);
      return (
        <Form
          labelPosition="side"
          onSubmit={e => {
            e.preventDefault();
            entries = Array.from(new FormData(e.currentTarget).entries());
          }}>
          <Slider label="Cookies" name="cookies" isEditable value={value} onChange={setValue} />
          <button type="submit">Submit</button>
        </Form>
      );
    }

    let {getByRole} = render(<ControlledExample />);
    let slider = getByRole('slider', {name: 'Cookies'});
    let input = getByRole('textbox', {name: 'Cookies'});
    expect(input).toHaveValue('30');

    await user.click(input);
    await user.clear(input);
    await user.keyboard('45{Enter}');
    expect(slider).toHaveValue('45');
    expect(input).toHaveValue('45');

    await user.click(getByRole('button', {name: 'Submit'}));
    expect(entries).toEqual([['cookies', '45']]);
  });
});
