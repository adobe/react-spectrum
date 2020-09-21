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

import {act, fireEvent, render} from '@testing-library/react';
import {Provider} from '@adobe/react-spectrum';
import React, {useState} from 'react';
import {Slider} from '../';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

function pressKeyOnButton(key, button) {
  act(() => {fireEvent.keyDown(button, {key});});
}

function pressArrowRight(button) {
  return pressKeyOnButton('ArrowRight', button);
}

function pressArrowLeft(button) {
  return pressKeyOnButton('ArrowLeft', button);
}

function pressArrowUp(button) {
  return pressKeyOnButton('ArrowUp', button);
}

function pressArrowDown(button) {
  return pressKeyOnButton('ArrowDown', button);
}

describe('Slider', function () {
  it('supports aria-label', function () {
    let {getByRole} = render(<Slider aria-label="The Label" />);

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'The Label');

    // No label/value
    expect(group.textContent).toBeFalsy();
  });

  it('supports label', function () {
    let {getByRole} = render(<Slider label="The Label" />);

    let group = getByRole('group');
    let labelId = group.getAttribute('aria-labelledby');
    let slider = getByRole('slider');
    expect(slider.getAttribute('aria-labelledby')).toBe(labelId);

    expect(document.getElementById(labelId)).toHaveTextContent(/^The Label$/);

    // Shows value as well
    expect(group.textContent).toBe('The Label0');
  });

  it('supports showValueLabel: false', function () {
    let {getByRole} = render(<Slider label="The Label" showValueLabel={false} />);
    let group = getByRole('group');

    expect(group.textContent).toBe('The Label');
  });

  it('supports disabled', function () {
    let {getByRole} = render(<Slider label="The Label" isDisabled />);

    let slider = getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('supports defaultValue', function () {
    let {getByRole} = render(<Slider label="The Label" defaultValue={20} />);

    let slider = getByRole('slider');

    expect(slider).toHaveProperty('value', '20');
    fireEvent.change(slider, {target: {value: '40'}});
    expect(slider).toHaveProperty('value', '40');
  });

  it('can be controlled', function () {
    let renders = [];

    function Test() {
      let [value, setValue] = useState(50);
      renders.push(value);

      return (<Slider label="The Label" value={value} onChange={setValue} />);
    }

    let {getByRole} = render(<Test />);

    let slider = getByRole('slider');

    expect(slider).toHaveProperty('value', '50');
    fireEvent.change(slider, {target: {value: '55'}});
    expect(slider).toHaveProperty('value', '55');

    expect(renders).toStrictEqual([50, 55]);
  });

  it('supports a custom valueLabel', function () {
    function Test() {
      let [value, setValue] = useState(50);
      return (<Slider label="The Label" value={value} onChange={setValue} valueLabel={`A${value}B`} />);
    }

    let {getByRole} = render(<Test />);

    let group = getByRole('group');
    let slider = getByRole('slider');

    expect(group.textContent).toBe('The LabelA50B');
    fireEvent.change(slider, {target: {value: '55'}});
    expect(group.textContent).toBe('The LabelA55B');
  });

  describe('formatOptions', () => {
    it('prefixes the value with a plus sign if needed', function () {
      let {getByRole} = render(
        <Slider
          label="The Label"
          minValue={-50}
          maxValue={50}
          defaultValue={10} />
      );

      let group = getByRole('group');
      let slider = getByRole('slider');

      expect(group.textContent).toBe('The Label+10');
      fireEvent.change(slider, {target: {value: '0'}});
      expect(group.textContent).toBe('The Label0');
    });

    it('supports setting custom formatOptions', function () {
      let {getByRole} = render(
        <Slider
          label="The Label"
          minValue={0}
          maxValue={1}
          step={0.01}
          defaultValue={0.2}
          formatOptions={{style: 'percent'}} />
      );

      let group = getByRole('group');
      let slider = getByRole('slider');

      expect(group.textContent).toBe('The Label20%');
      fireEvent.change(slider, {target: {value: 0.5}});
      expect(group.textContent).toBe('The Label50%');
    });
  });

  // formatOptions
  // min max

  // TODO: assert DOM structure for isFilled/fillOffset, ticks, trackBackground?

  describe('keyboard interactions', () => {
    // See comment on onKeyDown in useDrag1D
    // ${'(up/down arrows, rtl)'}    | ${{locale: 'ar-AE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowUp(slider);    expect(slider).toHaveProperty('value', String(v - 1)); pressArrowDown(slider); expect(slider).toHaveProperty('value', String(v));}}
    // ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowRight(slider); expect(slider).toHaveProperty('value', String(v - 1)); pressArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
    it.skip.each`
      Name                          | props                 | run
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowRight(slider); expect(slider).toHaveProperty('value', String(v + 1)); pressArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
      ${'(up/down arrows, ltr)'}    | ${{locale: 'de-DE'}}  | ${(slider) => {let v = Number(slider.value); pressArrowUp(slider);    expect(slider).toHaveProperty('value', String(v + 1)); pressArrowDown(slider); expect(slider).toHaveProperty('value', String(v));}}
    `('$Name shifts button focus in the correct direction on key press', function ({Name, props, run}) {
      let tree = render(
        <Provider theme={theme} locale={props.locale}>
          <Slider label="Label" defaultValue={50} />
        </Provider>
      );

      let slider = tree.getByRole('slider');

      userEvent.tab();
      expect(document.activeElement).toBe(slider);

      run(slider);
    });

    // TODO verify that it's clamped by min/max

    // TODO step
  });

  // TODO
  // describe('mouse interactions', () => {  });
});
