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
import {RangeSlider} from '../src/RangeSlider';
import {Slider} from '../src/Slider';
import {SliderInput} from '../src/SliderInput';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';

describe('Slider and RangeSlider with SliderInput', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders an editable number input without steppers or status output when SliderInput is provided', async () => {
    let onChange = jest.fn();
    let onChangeEnd = jest.fn();
    let {getByRole, queryByRole, queryAllByRole, rerender} = render(
      <Slider
        label="Opacity"
        defaultValue={0.5}
        maxValue={1}
        step={0.01}
        formatOptions={{style: 'percent'}}
        onChange={onChange}
        onChangeEnd={onChangeEnd}>
        <SliderInput />
      </Slider>
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
        isDisabled
        defaultValue={0.5}
        maxValue={1}
        step={0.01}
        formatOptions={{style: 'percent'}}>
        <SliderInput />
      </Slider>
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
          <Slider label="Cookies" name="cookies" value={value} onChange={setValue}>
            <SliderInput />
          </Slider>
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

  it('supports RangeSlider with SliderInput, arrow handoff, equal bounds, and Form submission', async () => {
    let onChange = jest.fn();
    let onChangeEnd = jest.fn();
    let entries: [string, FormDataEntryValue][] = [];
    let {getByRole, queryByRole} = render(
      <Form
        onSubmit={e => {
          e.preventDefault();
          entries = Array.from(new FormData(e.currentTarget).entries());
        }}>
        <RangeSlider
          label="Price"
          startName="minPrice"
          endName="maxPrice"
          defaultValue={{start: 25, end: 75}}
          onChange={onChange}
          onChangeEnd={onChangeEnd}>
          <SliderInput />
        </RangeSlider>
        <button type="submit">Submit</button>
      </Form>
    );

    expect(queryByRole('status')).not.toBeInTheDocument();
    let minSlider = getByRole('slider', {name: 'Minimum Price'});
    let maxSlider = getByRole('slider', {name: 'Maximum Price'});
    let minInput = getByRole('textbox', {name: 'Minimum Price'});
    let maxInput = getByRole('textbox', {name: 'Maximum Price'});
    expect(minInput).toHaveValue('25');
    expect(maxInput).toHaveValue('75');

    // Edit start input and arrow right into end input
    await user.click(minInput);
    await user.clear(minInput);
    await user.keyboard('50{ArrowRight}');
    expect(document.activeElement).toBe(maxInput);
    expect(minSlider).toHaveValue('50');
    expect(onChange).toHaveBeenLastCalledWith({start: 50, end: 75});
    expect(onChangeEnd).toHaveBeenLastCalledWith({start: 50, end: 75});

    // Setting end equal to start keeps two distinct editable values
    await user.clear(maxInput);
    await user.keyboard('50{Enter}');
    expect(maxSlider).toHaveValue('50');
    expect(minInput).toHaveValue('50');
    expect(maxInput).toHaveValue('50');

    await user.click(getByRole('button', {name: 'Submit'}));
    expect(entries).toEqual([
      ['minPrice', '50'],
      ['maxPrice', '50']
    ]);
  });
});
