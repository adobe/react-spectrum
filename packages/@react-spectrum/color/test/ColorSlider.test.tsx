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
import {ColorSlider} from '../';
import {installMouseEvent, installPointerEvent} from '@react-spectrum/test-utils';
import {parseColor} from '@react-stately/color';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('ColorSlider', () => {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  beforeAll(() => {
    jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 100);
    jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 100);
    // @ts-ignore
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
    jest.useFakeTimers();
  });
  afterAll(() => {
    // @ts-ignore
    window.HTMLElement.prototype.offsetWidth.mockReset();
    // @ts-ignore
    window.HTMLElement.prototype.offsetHeight.mockReset();
    jest.useRealTimers();
    // @ts-ignore
    window.requestAnimationFrame.mockReset();
  });

  afterEach(() => {
    // for restoreTextSelection
    jest.runAllTimers();
  });

  it('sets input props', () => {
    let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" />);
    let slider = getByRole('slider');

    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '255');
    expect(slider).toHaveAttribute('step', '1');
  });

  describe('labeling', () => {
    it('defaults to showing the channel as a label', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(slider).toHaveAttribute('aria-labelledby');
      expect(slider).not.toHaveAttribute('aria-label');

      let label = document.getElementById(slider.getAttribute('aria-labelledby'));
      expect(label).toHaveTextContent('Red');
      expect(label).toHaveAttribute('id');

      expect(group).toHaveAttribute('aria-labelledby', label.id);
      expect(group).not.toHaveAttribute('aria-label');
    });

    it('sets a default aria-label when label={null}', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" label={null} />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).toHaveAttribute('aria-label', 'Red');
      expect(group).not.toHaveAttribute('aria-labelledby');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);
    });

    it('allows a custom label', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" label="Test" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(slider).toHaveAttribute('aria-labelledby');
      expect(slider).not.toHaveAttribute('aria-label');

      let label = document.getElementById(slider.getAttribute('aria-labelledby'));
      expect(label).toHaveTextContent('Test');
      expect(label).toHaveAttribute('id');

      expect(group).toHaveAttribute('aria-labelledby', label.id);
      expect(group).not.toHaveAttribute('aria-label');
    });

    it('allows a custom aria-label', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" aria-label="Test" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).toHaveAttribute('aria-label', 'Test');
      expect(group).not.toHaveAttribute('aria-labelledby');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);
    });

    it('allows a custom aria-labelledby', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" aria-labelledby="label-id" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).not.toHaveAttribute('aria-label');
      expect(group).toHaveAttribute('aria-labelledby', 'label-id');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);
    });

    it('clicking on label should focus input', () => {
      let {getByRole, getByText} = render(<ColorSlider defaultValue="#000000" channel="red" />);
      let label = getByText('Red');
      let slider = getByRole('slider');

      act(() => label.click());

      expect(document.activeElement).toBe(slider);
    });

    it('shows value label by default', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#7f0000" channel="red" />);
      let output = getByRole('status');
      expect(output).toHaveTextContent('127');
      expect(output).toHaveAttribute('for', getByRole('slider').id);
      expect(output).not.toHaveAttribute('aria-labelledby');
      expect(output).toHaveAttribute('aria-live', 'off');
    });

    it('shows value label with custom label', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#7f0000" channel="red" label="Test" />);
      let output = getByRole('status');
      expect(output).toHaveTextContent('127');
      expect(output).toHaveAttribute('for', getByRole('slider').id);
      expect(output).not.toHaveAttribute('aria-labelledby');
      expect(output).toHaveAttribute('aria-live', 'off');
    });

    it('hides value label with showValueLabel=false', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#7f0000" channel="red" showValueLabel={false} />);
      expect(() => getByRole('status')).toThrow();
    });

    it('hides value label when no visible label', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#7f0000" channel="red" label={null} />);
      expect(() => getByRole('status')).toThrow();
    });

    it('hides value label when aria-label is specified', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#7f0000" channel="red" aria-label="Test" />);
      expect(() => getByRole('status')).toThrow();
    });

    it('hides value label when aria-labelledby is specified', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#7f0000" channel="red" aria-labelledby="label-id" />);
      expect(() => getByRole('status')).toThrow();
    });

    it('hides label and value label and has default aria-label when orientation=vertical', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" orientation="vertical" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).toHaveAttribute('aria-label', 'Red');
      expect(group).not.toHaveAttribute('aria-labelledby');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);

      expect(() => getByRole('status')).toThrow();
    });

    it('uses custom label as aria-label orientation=vertical', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" label="Test" orientation="vertical" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).toHaveAttribute('aria-label', 'Test');
      expect(group).not.toHaveAttribute('aria-labelledby');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);

      expect(() => getByRole('status')).toThrow();
    });

    it('supports custom aria-label with orientation=vertical', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" aria-label="Test" orientation="vertical" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).toHaveAttribute('aria-label', 'Test');
      expect(group).not.toHaveAttribute('aria-labelledby');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);

      expect(() => getByRole('status')).toThrow();
    });

    it('supports custom aria-labelledby with orientation=vertical', () => {
      let {getByRole} = render(<ColorSlider defaultValue="#000000" channel="red" aria-labelledby="label-id" orientation="vertical" />);
      let slider = getByRole('slider');
      let group = getByRole('group');

      expect(group).not.toHaveAttribute('aria-label');
      expect(group).toHaveAttribute('aria-labelledby', 'label-id');
      expect(group).toHaveAttribute('id');
      expect(slider).toHaveAttribute('aria-labelledby', group.id);

      expect(() => getByRole('status')).toThrow();
    });
  });

  it('the slider is focusable', () => {
    let {getAllByRole, getByRole} = render(<div>
      <button>A</button>
      <ColorSlider defaultValue="#000000" channel="red" />
      <button>B</button>
    </div>);
    let slider = getByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(slider);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(slider);
  });

  it('disabled', () => {
    let {getAllByRole, getByRole} = render(<div>
      <button>A</button>
      <ColorSlider defaultValue="#000000" channel="red" isDisabled />
      <button>B</button>
    </div>);
    let slider = getByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');
    expect(slider).toHaveAttribute('disabled');

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonA);
  });

  describe('keyboard events', () => {
    it('works', () => {
      let defaultColor = parseColor('#000000');
      let {getByRole} = render(<ColorSlider defaultValue={defaultColor} onChange={onChangeSpy} channel="red" />);
      let slider = getByRole('slider');
      act(() => {slider.focus();});

      fireEvent.keyDown(slider, {key: 'Right'});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hexa')).toBe(defaultColor.withChannelValue('red', 1).toString('hexa'));
      fireEvent.keyDown(slider, {key: 'Left'});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hexa')).toBe(defaultColor.withChannelValue('red', 0).toString('hexa'));
    });

    it('doesn\'t work when disabled', () => {
      let defaultColor = parseColor('#000000');
      let {getByRole} = render(<ColorSlider defaultValue={defaultColor} onChange={onChangeSpy} channel="red" isDisabled />);
      let slider = getByRole('slider');
      act(() => {slider.focus();});

      fireEvent.keyDown(slider, {key: 'Right'});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      fireEvent.keyDown(slider, {key: 'Left'});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
    });

    it('respects step', () => {
      let defaultColor = parseColor('#000000');
      let {getByRole} = render(<ColorSlider defaultValue={defaultColor} onChange={onChangeSpy} channel="red" step={10} />);
      let slider = getByRole('slider');
      act(() => {slider.focus();});

      fireEvent.keyDown(slider, {key: 'Right'});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hexa')).toBe(defaultColor.withChannelValue('red', 10).toString('hexa'));
      fireEvent.keyDown(slider, {key: 'Left'});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hexa')).toBe(defaultColor.withChannelValue('red', 0).toString('hexa'));
    });
  });

  describe.each`
    type                | prepare               | actions
    ${'Mouse Events'}   | ${installMouseEvent}  | ${[
      (el, {pageX, pageY}) => fireEvent.mouseDown(el, {button: 0, pageX, clientX: pageX, pageY, clientY: pageY}),
      (el, {pageX, pageY}) => fireEvent.mouseMove(el, {button: 0, pageX, clientX: pageX, pageY, clientY: pageY}),
      (el, {pageX, pageY}) => fireEvent.mouseUp(el, {button: 0, pageX, clientX: pageX, pageY, clientY: pageY})
    ]}
    ${'Pointer Events'} | ${installPointerEvent}| ${[
      (el, {pageX, pageY}) => fireEvent.pointerDown(el, {button: 0, pointerId: 1, pageX, clientX: pageX, pageY, clientY: pageY}),
      (el, {pageX, pageY}) => fireEvent.pointerMove(el, {button: 0, pointerId: 1, pageX, clientX: pageX, pageY, clientY: pageY}),
      (el, {pageX, pageY}) => fireEvent.pointerUp(el, {button: 0, pointerId: 1, pageX, clientX: pageX, pageY, clientY: pageY})
    ]}
    ${'Touch Events'}   | ${() => {}}           | ${[
      (el, {pageX, pageY}) => fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX, clientX: pageX, pageY, clientY: pageY}]}),
      (el, {pageX, pageY}) => fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX, clientX: pageX, pageY, clientY: pageY}]}),
      (el, {pageX, pageY}) => fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX, clientX: pageX, pageY, clientY: pageY}]})
    ]}
  `('$type', ({actions: [start, move, end], prepare}) => {
    prepare();

    it('dragging the thumb works', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" defaultValue={defaultColor} onChange={onChangeSpy} />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;

      expect(document.activeElement).not.toBe(slider);
      start(thumb, {pageX: 0});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).toBe(slider);

      move(thumb, {pageX: 40});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 144).toString('hsla'));
      expect(document.activeElement).toBe(slider);

      end(thumb, {pageX: 40});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(slider);
    });

    it('dragging the thumb works when vertical', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" defaultValue={defaultColor} onChange={onChangeSpy} orientation="vertical" />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;

      expect(document.activeElement).not.toBe(slider);
      start(thumb, {pageY: 100});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).toBe(slider);

      move(thumb, {pageY: 60});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 144).toString('hsla'));
      expect(document.activeElement).toBe(slider);

      end(thumb, {pageY: 60});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(slider);
    });

    it('dragging the thumb doesn\'t works when disabled', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" isDisabled defaultValue={defaultColor} onChange={onChangeSpy} />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;

      expect(document.activeElement).not.toBe(slider);
      start(thumb, {pageX: 0});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).not.toBe(slider);

      move(thumb, {pageX: 40});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).not.toBe(slider);

      end(thumb, {pageX: 40});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).not.toBe(slider);
    });

    it('dragging the thumb respects the step', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" defaultValue={defaultColor} onChange={onChangeSpy} step={120} />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;

      start(thumb, {pageX: 0});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      move(thumb, {pageX: 20});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 120).toString('hsla'));
      end(thumb, {pageX: 20});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('clicking and dragging on the track works', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" defaultValue={defaultColor} onChange={onChangeSpy} />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;
      let container = getByRole('group').firstChild;

      expect(document.activeElement).not.toBe(slider);
      start(container, {pageX: 50});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 180).toString('hsla'));
      expect(document.activeElement).toBe(slider);

      move(thumb, {pageX: 70});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 252).toString('hsla'));
      expect(document.activeElement).toBe(slider);

      end(thumb, {pageX: 70});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(document.activeElement).toBe(slider);
    });

    it('clicking and dragging on the track works when vertical', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" defaultValue={defaultColor} onChange={onChangeSpy} orientation="vertical" />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;
      let container = getByRole('group').firstChild;

      expect(document.activeElement).not.toBe(slider);
      start(container, {pageY: 50});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 180).toString('hsla'));
      expect(document.activeElement).toBe(slider);

      move(thumb, {pageY: 30});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('hue', 252).toString('hsla'));
      expect(document.activeElement).toBe(slider);

      end(thumb, {pageY: 30});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(document.activeElement).toBe(slider);
    });

    it('clicking and dragging on the track doesn\'t work when disabled', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="hue" defaultValue={defaultColor} onChange={onChangeSpy} isDisabled />);
      let slider = getByRole('slider');
      let container = getByRole('group').firstChild;

      expect(document.activeElement).not.toBe(slider);
      start(container, {pageX: 50});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).not.toBe(slider);

      move(container, {pageX: 70});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).not.toBe(slider);

      end(container, {pageX: 70});
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
      expect(document.activeElement).not.toBe(slider);
    });

    it('clicking and dragging on the track respects the step', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getByRole} = render(<ColorSlider channel="saturation" defaultValue={defaultColor} onChange={onChangeSpy} step={25} />);
      let slider = getByRole('slider');
      let thumb = slider.parentElement;
      let container = getByRole('group').firstChild;

      start(container, {pageX: 30});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 25).toString('hsla'));
      move(thumb, {pageX: 50});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 50).toString('hsla'));
      end(thumb, {pageX: 50});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
    });
  });
});
