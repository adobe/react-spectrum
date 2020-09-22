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
import {press, testKeypresses} from './utils';
import {Provider} from '@adobe/react-spectrum';
import React, {useState} from 'react';
import {Slider} from '../';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';

describe('Slider', function () {
  it('supports aria-label', function () {
    let {getByRole} = render(<Slider aria-label="The Label" />);

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'The Label');

    // No label/value
    expect(group.textContent).toBeFalsy();

    let slider = getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '0');
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
    expect(slider).toHaveAttribute('aria-valuetext', '0');
  });

  it('supports showValueLabel: false', function () {
    let {getByRole} = render(<Slider label="The Label" showValueLabel={false} />);
    let group = getByRole('group');
    expect(group.textContent).toBe('The Label');

    let slider = getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuetext', '0');
  });

  it('supports disabled', function () {
    let {getByRole, getAllByRole} = render(<div>
      <button>A</button>
      <Slider label="The Label" defaultValue={20} isDisabled />
      <button>B</button>
    </div>);

    let slider = getByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');
    expect(slider).toBeDisabled();

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
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
    expect(slider).toHaveAttribute('aria-valuetext', '20');
    fireEvent.change(slider, {target: {value: '40'}});
    expect(slider).toHaveProperty('value', '40');
    expect(slider).toHaveAttribute('aria-valuetext', '40');
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
    expect(slider).toHaveAttribute('aria-valuetext', '50');
    fireEvent.change(slider, {target: {value: '55'}});
    expect(slider).toHaveProperty('value', '55');
    expect(slider).toHaveAttribute('aria-valuetext', '55');

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
    // TODO should aria-valuetext be formatted as well?
    expect(slider).toHaveAttribute('aria-valuetext', '50');
    fireEvent.change(slider, {target: {value: '55'}});
    expect(group.textContent).toBe('The LabelA55B');
    expect(slider).toHaveAttribute('aria-valuetext', '55');
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
      expect(slider).toHaveAttribute('aria-valuetext', '+10');
      fireEvent.change(slider, {target: {value: '0'}});
      expect(group.textContent).toBe('The Label0');
      expect(slider).toHaveAttribute('aria-valuetext', '0');
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
      expect(slider).toHaveAttribute('aria-valuetext', '20%');
      fireEvent.change(slider, {target: {value: 0.5}});
      expect(group.textContent).toBe('The Label50%');
      expect(slider).toHaveAttribute('aria-valuetext', '50%');
    });
  });

  describe('keyboard interactions', () => {
    // Can't test arrow/page up/down arrows because they are handled by the browser and JSDOM doesn't feel like it.

    it.each`
      Name                               | props                                 | commands
      ${'(left/right arrows, ltr)'}      | ${{locale: 'de-DE'}}                  | ${[{left: press.ArrowRight, result: +1}, {left: press.ArrowLeft, result: -1}]}
      ${'(left/right arrows, rtl)'}      | ${{locale: 'ar-AE'}}                  | ${[{left: press.ArrowRight, result: -1}, {left: press.ArrowLeft, result: +1}]}
      ${'(home/end, ltr)'}               | ${{locale: 'de-DE'}}                  | ${[{left: press.End, result: '100'}, {left: press.Home, result: '0'}]}
      ${'(home/end, rtl)'}               | ${{locale: 'ar-AE'}}                  | ${[{left: press.End, result: '100'}, {left: press.Home, result: '0'}]}
      ${'(left/right arrows, disabled)'} | ${{locale: 'de-DE', isDisabled: true}}| ${[{left: press.ArrowRight, result: 0}, {left: press.ArrowLeft, result: 0}]}
      ${'(home/end, disabled)'}          | ${{locale: 'de-DE', isDisabled: true}}| ${[{left: press.End, result: 0}, {left: press.Home, result: 0}]}
    `('$Name moves the slider in the correct direction', function ({props, commands}) {
      let tree = render(
        <Provider theme={theme} {...props}>
          <Slider label="Label" defaultValue={50} minValue={0} maxValue={100} />
        </Provider>
      );
      let slider = tree.getByRole('slider');
      testKeypresses([slider, slider], commands);
    });

    it.each`
      Name                          | props                 | commands
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${[{left: press.ArrowRight, result: +10}, {left: press.ArrowLeft, result: -10}]}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${[{left: press.ArrowRight, result: -10}, {left: press.ArrowLeft, result: +10}]}
    `('$Name respects the step size', function ({props, commands}) {
      let tree = render(
        <Provider theme={theme} {...props}>
          <Slider label="Label" step={10} defaultValue={50} />
        </Provider>
      );
      let slider = tree.getByRole('slider');
      testKeypresses([slider, slider], commands);
    });

    it.each`
      Name                          | props                 | commands
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${[{left: press.ArrowLeft, result: -1}, {left: press.ArrowLeft, result: 0}]}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${[{left: press.ArrowRight, result: -1}, {left: press.ArrowRight, result: 0}]}
    `('$Name is clamped by min/max', function ({props, commands}) {
      let tree = render(
        <Provider theme={theme} {...props}>
          <Slider label="Label" minValue={-1} defaultValue={0} maxValue={1} />
        </Provider>
      );
      let slider = tree.getByRole('slider');
      testKeypresses([slider, slider], commands);
    });
  });

  describe('mouse interactions', () => {
    beforeAll(() => {
      jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 100);
    });
    afterAll(() => {
      // @ts-ignore
      window.HTMLElement.prototype.offsetWidth.mockReset();
    });

    it('can click and drag handle', () => {
      let onChangeSpy = jest.fn();
      let {getByRole} = render(
        <Slider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={50} />
      );

      let slider = getByRole('slider');
      let thumb = slider.parentElement;
      fireEvent.mouseDown(thumb, {clientX: 50});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(slider);

      fireEvent.mouseMove(thumb, {clientX: 10});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith(10);
      fireEvent.mouseMove(thumb, {clientX: -10});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy).toHaveBeenLastCalledWith(0);
      fireEvent.mouseMove(thumb, {clientX: 120});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);
      expect(onChangeSpy).toHaveBeenLastCalledWith(100);
      fireEvent.mouseUp(thumb, {clientX: 120});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);
    });

    it('cannot click and drag handle when disabled', () => {
      let onChangeSpy = jest.fn();
      let {getByRole} = render(
        <Slider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={50}
          isDisabled />
      );

      let slider = getByRole('slider');
      let thumb = slider.parentElement;
      fireEvent.mouseDown(thumb, {clientX: 50});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).not.toBe(slider);
      fireEvent.mouseMove(thumb, {clientX: 10});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      fireEvent.mouseUp(thumb, {clientX: 10});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
    });

    it('can click on track to move handle', () => {
      let onChangeSpy = jest.fn();
      let {getByRole} = render(
        <Slider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={50} />
      );

      let slider = getByRole('slider');
      let thumb = slider.parentElement.parentElement;
      // @ts-ignore
      let [leftTrack, rightTrack] = [...thumb.parentElement.children].filter(c => c !== thumb);

      // left track
      fireEvent.mouseDown(leftTrack, {clientX: 20});
      expect(document.activeElement).toBe(slider);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith(20);
      fireEvent.mouseUp(thumb, {clientX: 20});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);

      // right track
      onChangeSpy.mockClear();
      fireEvent.mouseDown(rightTrack, {clientX: 70});
      expect(document.activeElement).toBe(slider);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith(70);
      fireEvent.mouseUp(thumb, {clientX: 70});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('cannot click on track to move handle when disabled', () => {
      let onChangeSpy = jest.fn();
      let {getByRole} = render(
        <Slider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={50}
          isDisabled />
      );

      let slider = getByRole('slider');
      let thumb = slider.parentElement.parentElement;
      // @ts-ignore
      let [leftTrack, rightTrack] = [...thumb.parentElement.children].filter(c => c !== thumb);

      // left track
      fireEvent.mouseDown(leftTrack, {clientX: 20});
      expect(document.activeElement).not.toBe(slider);
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      fireEvent.mouseUp(thumb, {clientX: 20});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);

      // right track
      onChangeSpy.mockClear();
      fireEvent.mouseDown(rightTrack, {clientX: 70});
      expect(document.activeElement).not.toBe(slider);
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      fireEvent.mouseUp(thumb, {clientX: 70});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
    });
  });
});
