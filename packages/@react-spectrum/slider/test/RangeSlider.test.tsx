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

import {fireEvent, render} from '@testing-library/react';
import {press, testKeypresses} from './utils';
import {Provider} from '@adobe/react-spectrum';
import {RangeSlider} from '../';
import React, {useState} from 'react';
import {theme} from '@react-spectrum/theme-default';
import userEvent from '@testing-library/user-event';


describe('Slider', function () {
  it('supports aria-label', function () {
    let {getByRole} = render(<RangeSlider aria-label="The Label" />);

    let group = getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'The Label');

    // No label/value
    expect(group.textContent).toBeFalsy();
  });

  it('supports label', function () {
    let {getAllByRole, getByRole} = render(<RangeSlider label="The Label" />);

    let group = getByRole('group');
    let labelId = group.getAttribute('aria-labelledby');
    let [leftSlider, rightSlider] = getAllByRole('slider');
    expect(leftSlider.getAttribute('aria-labelledby')).toBe(labelId);
    expect(rightSlider.getAttribute('aria-labelledby')).toBe(labelId);

    expect(document.getElementById(labelId)).toHaveTextContent(/^The Label$/);

    // Shows value as well
    expect(group.textContent).toBe('The Label0 - 100');
  });

  it('supports showValueLabel: false', function () {
    let {getByRole} = render(<RangeSlider label="The Label" showValueLabel={false} />);
    let group = getByRole('group');

    expect(group.textContent).toBe('The Label');
  });

  it('supports disabled', function () {
    let {getAllByRole} = render(<div>
      <button>A</button>
      <RangeSlider label="The Label" isDisabled />
      <button>B</button>
    </div>);

    let [leftSlider, rightSlider] = getAllByRole('slider');
    expect(leftSlider).toBeDisabled();
    expect(rightSlider).toBeDisabled();
    let [buttonA, buttonB] = getAllByRole('button');

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
  });

  it('can be focused', function () {
    let {getAllByRole} = render(<div>
      <button>A</button>
      <RangeSlider label="The Label" defaultValue={{start: 20, end: 50}} />
      <button>B</button>
    </div>);

    let [sliderLeft, sliderRight] = getAllByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(sliderLeft);
    userEvent.tab();
    expect(document.activeElement).toBe(sliderRight);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(sliderRight);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(sliderLeft);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonA);
  });

  it('supports defaultValue', function () {
    let {getAllByRole} = render(<RangeSlider label="The Label" defaultValue={{start: 20, end: 40}} />);

    let [sliderLeft, sliderRight] = getAllByRole('slider');

    expect(sliderLeft).toHaveProperty('value', '20');
    expect(sliderRight).toHaveProperty('value', '40');
    fireEvent.change(sliderLeft, {target: {value: '30'}});
    expect(sliderLeft).toHaveProperty('value', '30');
    fireEvent.change(sliderRight, {target: {value: '50'}});
    expect(sliderRight).toHaveProperty('value', '50');
  });

  it('can be controlled', function () {
    let renders = [];

    function Test() {
      let [value, setValue] = useState({start: 20, end: 40});
      renders.push(value);

      return (<RangeSlider label="The Label" value={value} onChange={setValue} />);
    }

    let {getAllByRole} = render(<Test />);
    let [sliderLeft, sliderRight] = getAllByRole('slider');

    expect(sliderLeft).toHaveProperty('value', '20');
    expect(sliderLeft).toHaveAttribute('aria-valuetext', '20');
    expect(sliderRight).toHaveProperty('value', '40');
    expect(sliderRight).toHaveAttribute('aria-valuetext', '40');
    fireEvent.change(sliderLeft, {target: {value: '30'}});
    expect(sliderLeft).toHaveProperty('value', '30');
    expect(sliderLeft).toHaveAttribute('aria-valuetext', '30');
    fireEvent.change(sliderRight, {target: {value: '50'}});
    expect(sliderRight).toHaveProperty('value', '50');
    expect(sliderRight).toHaveAttribute('aria-valuetext', '50');

    expect(renders).toStrictEqual([{start: 20, end: 40}, {start: 30, end: 40}, {start: 30, end: 50}]);
  });

  it('supports a custom valueLabel', function () {
    function Test() {
      let [value, setValue] = useState({start: 10, end: 40});
      return (<RangeSlider label="The Label" value={value} onChange={setValue} valueLabel={`A${value.start}B${value.end}C`} />);
    }

    let {getAllByRole, getByRole} = render(<Test />);

    let group = getByRole('group');
    let [sliderLeft, sliderRight] = getAllByRole('slider');

    expect(group.textContent).toBe('The LabelA10B40C');
    // TODO should aria-valuetext be formatted as well?
    expect(sliderLeft).toHaveAttribute('aria-valuetext', '10');
    expect(sliderRight).toHaveAttribute('aria-valuetext', '40');
    fireEvent.change(sliderLeft, {target: {value: '5'}});
    expect(sliderLeft).toHaveAttribute('aria-valuetext', '5');
    expect(group.textContent).toBe('The LabelA5B40C');
    fireEvent.change(sliderRight, {target: {value: '60'}});
    expect(group.textContent).toBe('The LabelA5B60C');
    expect(sliderRight).toHaveAttribute('aria-valuetext', '60');
  });

  describe('formatOptions', () => {
    it('prefixes the value with a plus sign if needed', function () {
      let {getAllByRole, getByRole} = render(
        <RangeSlider
          label="The Label"
          minValue={-50}
          maxValue={50}
          defaultValue={{start: 10, end: 20}} />
      );

      let group = getByRole('group');
      let [sliderLeft, sliderRight] = getAllByRole('slider');

      expect(group.textContent).toBe('The Label+10 - +20');
      expect(sliderLeft).toHaveAttribute('aria-valuetext', '+10');
      expect(sliderRight).toHaveAttribute('aria-valuetext', '+20');
      fireEvent.change(sliderLeft, {target: {value: '-35'}});
      expect(sliderLeft).toHaveAttribute('aria-valuetext', '-35');
      expect(group.textContent).toBe('The Label-35 - +20');
      fireEvent.change(sliderRight, {target: {value: '0'}});
      expect(group.textContent).toBe('The Label-35 - 0');
      expect(sliderRight).toHaveAttribute('aria-valuetext', '0');
    });

    it('supports setting custom formatOptions', function () {
      let {getAllByRole, getByRole} = render(
        <RangeSlider
          label="The Label"
          minValue={0}
          maxValue={1}
          step={0.01}
          defaultValue={{start: 0.2, end: 0.6}}
          formatOptions={{style: 'percent'}} />
      );

      let group = getByRole('group');
      let [sliderLeft, sliderRight] = getAllByRole('slider');

      expect(group.textContent).toBe('The Label20% - 60%');
      expect(sliderLeft).toHaveAttribute('aria-valuetext', '20%');
      expect(sliderRight).toHaveAttribute('aria-valuetext', '60%');
      fireEvent.change(sliderLeft, {target: {value: '0.3'}});
      expect(group.textContent).toBe('The Label30% - 60%');
      expect(sliderLeft).toHaveAttribute('aria-valuetext', '30%');
      fireEvent.change(sliderRight, {target: {value: '0.7'}});
      expect(group.textContent).toBe('The Label30% - 70%');
      expect(sliderRight).toHaveAttribute('aria-valuetext', '70%');
    });
  });

  describe('keyboard interactions', () => {
    // Can't test arrow/page up/down arrows because they are handled by the browser and JSDOM doesn't feel like it.

    it.each`
      Name                                 | props                                 | commands
      ${'(left/right arrows, ltr)'}        | ${{locale: 'de-DE'}}                  | ${[{left: press.ArrowRight, result: +1}, {left: press.ArrowLeft, result: -1}, {right: press.ArrowRight, result: +1}, {right: press.ArrowLeft, result: -1}]}
      ${'(left/right arrows, rtl)'}        | ${{locale: 'ar-AE'}}                  | ${[{left: press.ArrowRight, result: -1}, {left: press.ArrowLeft, result: +1}, {right: press.ArrowRight, result: -1}, {right: press.ArrowLeft, result: +1}]}
      ${'(home/end, ltr)'}                 | ${{locale: 'de-DE'}}                  | ${[{left: press.End, result: '50'}, {left: press.Home, result: '0'}, {left: press.ArrowRight, result: '1'}, {right: press.Home, result: '1'}, {right: press.End, result: '100'}]}
      ${'(home/end, rtl)'}                 | ${{locale: 'ar-AE'}}                  | ${[{left: press.End, result: '50'}, {left: press.Home, result: '0'}, {left: press.ArrowLeft,  result: '1'}, {right: press.Home, result: '1'}, {right: press.End, result: '100'}]}
      ${'(left/right arrows, isDisabled)'} | ${{locale: 'de-DE', isDisabled: true}}| ${[{left: press.ArrowRight, result: 0}, {left: press.ArrowLeft, result: 0}, {right: press.ArrowRight, result: 0}, {right: press.ArrowLeft, result: 0}]}
      ${'(home/end, isDisabled)'}          | ${{locale: 'de-DE', isDisabled: true}}| ${[{left: press.End, result: 0}, {left: press.Home, result: 0}, {right: press.End, result: 0}, {right: press.Home, result: 0}]}
      ${'(left/right arrows, isReadOnly)'} | ${{locale: 'de-DE', isReadOnly: true}}| ${[{left: press.ArrowRight, result: 0}, {left: press.ArrowLeft, result: 0}, {right: press.ArrowRight, result: 0}, {right: press.ArrowLeft, result: 0}]}
      ${'(home/end, isReadOnly)'}          | ${{locale: 'de-DE', isReadOnly: true}}| ${[{left: press.End, result: 0}, {left: press.Home, result: 0}, {right: press.End, result: 0}, {right: press.Home, result: 0}]}
    `('$Name moves the slider in the correct direction', function ({props, commands}) {
      let tree = render(
        <Provider theme={theme} {...props}>
          <RangeSlider label="Label" defaultValue={{start: 20, end: 50}} minValue={0} maxValue={100} />
        </Provider>
      );
      let sliders = tree.getAllByRole('slider') as [HTMLInputElement, HTMLInputElement];
      testKeypresses(sliders, commands);
    });

    it.each`
      Name                          | props                 | commands
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${[{left: press.ArrowRight, result: +10}, {left: press.ArrowLeft, result: -10}, {right: press.ArrowRight, result: +10}, {right: press.ArrowLeft, result: -10}]}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${[{left: press.ArrowRight, result: -10}, {left: press.ArrowLeft, result: +10}, {right: press.ArrowRight, result: -10}, {right: press.ArrowLeft, result: +10}]}
    `('$Name respects the step size', function ({props, commands}) {
      let tree = render(
        <Provider theme={theme} {...props}>
          <RangeSlider label="Label" step={10} defaultValue={{start: 20, end: 50}} />
        </Provider>
      );
      let sliders = tree.getAllByRole('slider') as [HTMLInputElement, HTMLInputElement];
      testKeypresses(sliders, commands);
    });

    it.each`
      Name                          | props                 | commands
      ${'(left/right arrows, ltr)'} | ${{locale: 'de-DE'}}  | ${[{left: press.ArrowLeft, result: -1}, {left: press.ArrowLeft, result: 0}, {right: press.ArrowRight, result: +1}, {right: press.ArrowRight, result: 0}]}
      ${'(left/right arrows, rtl)'} | ${{locale: 'ar-AE'}}  | ${[{left: press.ArrowRight, result: -1}, {left: press.ArrowRight, result: 0}, {right: press.ArrowLeft, result: +1}, {right: press.ArrowLeft, result: 0}]}
    `('$Name is clamped by min/max', function ({props, commands}) {
      let tree = render(
        <Provider theme={theme} {...props}>
          <RangeSlider label="Label" minValue={-5} defaultValue={{start: -4, end: 4}} maxValue={5} />
        </Provider>
      );
      let sliders = tree.getAllByRole('slider') as [HTMLInputElement, HTMLInputElement];
      testKeypresses(sliders, commands);
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
      let {getAllByRole} = render(
        <RangeSlider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={{start: 20, end: 50}} />
      );

      let [sliderLeft, sliderRight] = getAllByRole('slider');
      let [thumbLeft, thumbRight] = [sliderLeft.parentElement.parentElement, sliderRight.parentElement.parentElement];

      fireEvent.mouseDown(thumbLeft, {clientX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(sliderLeft);
      fireEvent.mouseMove(thumbLeft, {clientX: 10});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 10, end: 50});
      fireEvent.mouseMove(thumbLeft, {clientX: -10});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 0, end: 50});
      fireEvent.mouseMove(thumbLeft, {clientX: 120});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 50, end: 50});
      fireEvent.mouseUp(thumbLeft, {clientX: 120});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);

      onChangeSpy.mockClear();

      fireEvent.mouseDown(thumbRight, {clientX: 50});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(sliderRight);
      fireEvent.mouseMove(thumbRight, {clientX: 60});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 50, end: 60});
      fireEvent.mouseMove(thumbRight, {clientX: -10});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 50, end: 50});
      fireEvent.mouseMove(thumbRight, {clientX: 120});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 50, end: 100});
      fireEvent.mouseUp(thumbRight, {clientX: 120});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);
    });

    it('cannot click and drag handle when disabled', () => {
      let onChangeSpy = jest.fn();
      let {getAllByRole} = render(
        <RangeSlider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={{start: 20, end: 50}}
          isDisabled />
      );

      let [sliderLeft, sliderRight] = getAllByRole('slider');
      let [thumbLeft, thumbRight] = [sliderLeft.parentElement.parentElement, sliderRight.parentElement.parentElement];

      fireEvent.mouseDown(thumbLeft, {clientX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).not.toBe(sliderLeft);
      fireEvent.mouseMove(thumbLeft, {clientX: 10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbLeft, {clientX: -10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbLeft, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbLeft, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();

      onChangeSpy.mockClear();

      fireEvent.mouseDown(thumbRight, {clientX: 50});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).not.toBe(sliderRight);
      fireEvent.mouseMove(thumbRight, {clientX: 60});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbRight, {clientX: -10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbRight, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbRight, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('cannot click and drag handle when read only', () => {
      let onChangeSpy = jest.fn();
      let {getAllByRole} = render(
        <RangeSlider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={{start: 20, end: 50}}
          isReadOnly />
      );

      let [sliderLeft, sliderRight] = getAllByRole('slider');
      let [thumbLeft, thumbRight] = [sliderLeft.parentElement.parentElement, sliderRight.parentElement.parentElement];

      fireEvent.mouseDown(thumbLeft, {clientX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(sliderLeft);
      fireEvent.mouseMove(thumbLeft, {clientX: 10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbLeft, {clientX: -10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbLeft, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbLeft, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();

      onChangeSpy.mockClear();

      fireEvent.mouseDown(thumbRight, {clientX: 50});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(sliderRight);
      fireEvent.mouseMove(thumbRight, {clientX: 60});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbRight, {clientX: -10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseMove(thumbRight, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbRight, {clientX: 120});
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it('can click on track to move nearest handle', () => {
      let onChangeSpy = jest.fn();
      let {getAllByRole} = render(
        <RangeSlider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={{start: 40, end: 70}} />
      );

      let [sliderLeft, sliderRight] = getAllByRole('slider');
      let [thumbLeft, thumbRight] = [sliderLeft.parentElement.parentElement, sliderRight.parentElement.parentElement];

      // @ts-ignore
      let [leftTrack, middleTrack, rightTrack] = [...thumbLeft.parentElement.children].filter(c => c !== thumbLeft && c !== thumbRight);

      // left track
      fireEvent.mouseDown(leftTrack, {clientX: 20});
      expect(document.activeElement).toBe(sliderLeft);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 20, end: 70});
      fireEvent.mouseUp(thumbLeft, {clientX: 20});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);

      // middle track, near left slider
      onChangeSpy.mockClear();
      fireEvent.mouseDown(middleTrack, {clientX: 40});
      expect(document.activeElement).toBe(sliderLeft);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 40, end: 70});
      fireEvent.mouseUp(thumbLeft, {clientX: 40});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);

      // middle track, near right slider
      onChangeSpy.mockClear();
      fireEvent.mouseDown(middleTrack, {clientX: 60});
      expect(document.activeElement).toBe(sliderRight);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 40, end: 60});
      fireEvent.mouseUp(thumbRight, {clientX: 60});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);

      // right track
      onChangeSpy.mockClear();
      fireEvent.mouseDown(rightTrack, {clientX: 90});
      expect(document.activeElement).toBe(sliderRight);
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenLastCalledWith({start: 40, end: 90});
      fireEvent.mouseUp(thumbRight, {clientX: 90});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('cannot click on track to move nearest handle when disabled', () => {
      let onChangeSpy = jest.fn();
      let {getAllByRole} = render(
        <RangeSlider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={{start: 40, end: 70}}
          isDisabled />
      );

      let [sliderLeft, sliderRight] = getAllByRole('slider');
      let [thumbLeft, thumbRight] = [sliderLeft.parentElement.parentElement, sliderRight.parentElement.parentElement];

      // @ts-ignore
      let [leftTrack, middleTrack, rightTrack] = [...thumbLeft.parentElement.children].filter(c => c !== thumbLeft && c !== thumbRight);

      // left track
      fireEvent.mouseDown(leftTrack, {clientX: 20});
      expect(document.activeElement).not.toBe(sliderLeft);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbLeft, {clientX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();

      // middle track, near left slider
      onChangeSpy.mockClear();
      fireEvent.mouseDown(middleTrack, {clientX: 40});
      expect(document.activeElement).not.toBe(sliderLeft);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbLeft, {clientX: 40});
      expect(onChangeSpy).not.toHaveBeenCalled();

      // middle track, near right slider
      onChangeSpy.mockClear();
      fireEvent.mouseDown(middleTrack, {clientX: 60});
      expect(document.activeElement).not.toBe(sliderRight);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbRight, {clientX: 60});
      expect(onChangeSpy).not.toHaveBeenCalled();

      // right track
      onChangeSpy.mockClear();
      fireEvent.mouseDown(rightTrack, {clientX: 90});
      expect(document.activeElement).not.toBe(sliderRight);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbRight, {clientX: 90});
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it.only('cannot click on track to move nearest handle when read only', () => {
      let onChangeSpy = jest.fn();
      let {getAllByRole} = render(
        <RangeSlider
          label="The Label"
          onChange={onChangeSpy}
          defaultValue={{start: 40, end: 70}}
          isDisabled />
      );

      let [sliderLeft, sliderRight] = getAllByRole('slider');
      let [thumbLeft, thumbRight] = [sliderLeft.parentElement.parentElement, sliderRight.parentElement.parentElement];

      // @ts-ignore
      let [leftTrack, middleTrack, rightTrack] = [...thumbLeft.parentElement.children].filter(c => c !== thumbLeft && c !== thumbRight);

      // left track
      fireEvent.mouseDown(leftTrack, {clientX: 20});
      // TODO what should happen here?
      // expect(document.activeElement).not.toBe(sliderLeft);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbLeft, {clientX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();

      // middle track, near left slider
      onChangeSpy.mockClear();
      fireEvent.mouseDown(middleTrack, {clientX: 40});
      // TODO what should happen here?
      // expect(document.activeElement).not.toBe(sliderLeft);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbLeft, {clientX: 40});
      expect(onChangeSpy).not.toHaveBeenCalled();

      // middle track, near right slider
      onChangeSpy.mockClear();
      fireEvent.mouseDown(middleTrack, {clientX: 60});
      // TODO what should happen here?
      // expect(document.activeElement).not.toBe(sliderRight);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbRight, {clientX: 60});
      expect(onChangeSpy).not.toHaveBeenCalled();

      // right track
      onChangeSpy.mockClear();
      fireEvent.mouseDown(rightTrack, {clientX: 90});
      // TODO what should happen here?
      // expect(document.activeElement).not.toBe(sliderRight);
      expect(onChangeSpy).not.toHaveBeenCalled();
      fireEvent.mouseUp(thumbRight, {clientX: 90});
      expect(onChangeSpy).not.toHaveBeenCalled();
    });
  });
});
