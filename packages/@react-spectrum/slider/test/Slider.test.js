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
const press = {
  ArrowRight: (button) => pressKeyOnButton('ArrowRight', button),
  ArrowLeft: (button) => pressKeyOnButton('ArrowLeft', button),
  Home: (button) => pressKeyOnButton('Home', button),
  End: (button) => pressKeyOnButton('End', button)
};

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

  it('can be focused', function () {
    let {getByRole, getAllByRole} = render(<div>
      <button>A</button>
      <Slider label="The Label" defaultValue={20} />
      <button>B</button>
    </div>);

    let slider = getByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');
    act(() => {
      slider.focus();
    });

    expect(document.activeElement).toBe(slider);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonA);
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

  describe('keyboard interactions', () => {
    // Can't test arrow/page up/down arrows because they are handled by the browser and JSDOM doesn't feel like it.

    it.each`
      Name                          | props                 | run
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${(slider) => {let v = Number(slider.value); press.ArrowRight(slider); expect(slider).toHaveProperty('value', String(v + 1)); press.ArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${(slider) => {let v = Number(slider.value); press.ArrowRight(slider); expect(slider).toHaveProperty('value', String(v - 1)); press.ArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
      ${'(home/end, ltr)'}          | ${{locale: 'de-DE'}}  | ${(slider) => {press.Home(slider); expect(slider).toHaveProperty('value', '0'); press.End(slider); expect(slider).toHaveProperty('value', '100');}}
      ${'(home/end, rtl)'}          | ${{locale: 'ar-AE'}}  | ${(slider) => {press.Home(slider); expect(slider).toHaveProperty('value', '0'); press.End(slider); expect(slider).toHaveProperty('value', '100');}}
    `('$Name moves the slider in the correct direction', function ({Name, props, run}) {
      let tree = render(
        <Provider theme={theme} locale={props.locale}>
          <Slider label="Label" defaultValue={50} minValue={0} maxValue={100} />
        </Provider>
      );
      let slider = tree.getByRole('slider');
      userEvent.tab();
      expect(document.activeElement).toBe(slider);
      run(slider);
    });

    it.each`
      Name                          | props                 | run
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${(slider) => {let v = Number(slider.value); press.ArrowRight(slider); expect(slider).toHaveProperty('value', String(v + 10)); press.ArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${(slider) => {let v = Number(slider.value); press.ArrowRight(slider); expect(slider).toHaveProperty('value', String(v - 10)); press.ArrowLeft(slider); expect(slider).toHaveProperty('value', String(v));}}
    `('$Name respects the step size', function ({Name, props, run}) {
      let tree = render(
        <Provider theme={theme} locale={props.locale}>
          <Slider label="Label" step={10} defaultValue={50} />
        </Provider>
      );
      let slider = tree.getByRole('slider');
      userEvent.tab();
      expect(document.activeElement).toBe(slider);
      run(slider);
    });

    it.each`
      Name                          | props                 | run
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${(slider) => {
        let v = Number(slider.value);
        press.ArrowRight(slider);
        expect(slider).toHaveProperty('value', String(v + 1));
        press.ArrowRight(slider);
        expect(slider).toHaveProperty('value', String(v + 1));
        press.ArrowLeft(slider);
        press.ArrowLeft(slider);
        expect(slider).toHaveProperty('value', String(v - 1));
        press.ArrowLeft(slider);
        expect(slider).toHaveProperty('value', String(v - 1));
      }}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${(slider) => {
        let v = Number(slider.value);
        press.ArrowRight(slider);
        expect(slider).toHaveProperty('value', String(v - 1));
        press.ArrowRight(slider);
        expect(slider).toHaveProperty('value', String(v - 1));
        press.ArrowLeft(slider);
        press.ArrowLeft(slider);
        expect(slider).toHaveProperty('value', String(v + 1));
        press.ArrowLeft(slider);
        expect(slider).toHaveProperty('value', String(v + 1));
      }}
    `('$Name is clamped by min/max', function ({Name, props, run}) {
      let tree = render(
        <Provider theme={theme} locale={props.locale}>
          <Slider label="Label" minValue={-1} defaultValue={0} maxValue={1} />
        </Provider>
      );
      let slider = tree.getByRole('slider');
      userEvent.tab();
      expect(document.activeElement).toBe(slider);
      run(slider);
    });
  });

  describe('mouse interactions', () => {
    it.skip('can click and drag handle', () => {

    });

    it.skip('can click on track to move handle', () => {

    });
  });
});
