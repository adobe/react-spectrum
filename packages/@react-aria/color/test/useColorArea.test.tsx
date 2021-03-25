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
import {ColorAreaProps} from '@react-types/color';
import {parseColor, useColorAreaState} from '@react-stately/color';
import React, {useRef} from 'react';
import {useColorArea} from '../';
import userEvent from '@testing-library/user-event';

const SIZE = 100;

function ColorArea(props: ColorAreaProps) {
  let state = useColorAreaState(props);
  let xInputRef = useRef(null);
  let yInputRef = useRef(null);

  let {colorAreaProps, gradientProps, xInputProps, yInputProps, thumbProps} = useColorArea(
    {
      ...props,
      width: SIZE,
      height: SIZE
    }, state, xInputRef, yInputRef);

  return (<div data-testid="container" {...colorAreaProps}>
    <div data-testid="gradient" {...gradientProps} />
    <div data-testid="thumb" {...thumbProps}>
      <input {...xInputProps} ref={xInputRef} />
      <input {...yInputProps} ref={xInputRef} />
    </div>
  </div>);
}

describe('useColorArea', () => {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
    // @ts-ignore
    window.requestAnimationFrame.mockRestore();
  });

  afterEach(() => {
    // for restoreTextSelection
    jest.runAllTimers();
  });

  it('sets input props', () => {
    let {getAllByRole} = render(<ColorArea />);
    let sliders = getAllByRole('slider');

    sliders.forEach((slider, i) => {
      expect(slider).toHaveAttribute('type', 'range');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '1');
      expect(slider).toHaveAttribute('value', '100');
      expect(slider).toHaveAttribute('aria-label', 'Saturation / Brightness');
      expect(slider).toHaveAttribute('aria-roledescription', 'two-dimensional slider');
      expect(slider).toHaveAttribute('aria-valuetext', i === 0 ? 'Saturation: 100%, Brightness: 100%' : 'Brightness: 100%, Saturation: 100%');
      expect(slider).toHaveAttribute('title', 'Hue: 0°, Saturation: 100%, Brightness: 100%');
      expect(slider).toHaveAttribute('tabindex', i === 0 ? '0' : '-1');
      expect(slider).toHaveAttribute('style', 'opacity: 0.0001; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 0; margin: 0px; pointer-events: none;');
      if (i === 1) {
        expect(slider).toHaveAttribute('aria-orientation', 'vertical');
      } else {
        expect(slider).not.toHaveAttribute('aria-orientation');
      }
    });
  });

  it('the horizontal slider is focusable', () => {
    let {getAllByRole} = render(<div>
      <button>A</button>
      <ColorArea />
      <button>B</button>
    </div>);
    let slider = getAllByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(slider[0]);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(slider[0]);
  });

  it('disabled', () => {
    let {getAllByRole} = render(<div>
      <button>A</button>
      <ColorArea isDisabled />
      <button>B</button>
    </div>);
    let sliders = getAllByRole('slider');
    let [buttonA, buttonB] = getAllByRole('button');
    sliders.forEach(slider => expect(slider).toHaveAttribute('disabled'));

    userEvent.tab();
    expect(document.activeElement).toBe(buttonA);
    userEvent.tab();
    expect(document.activeElement).toBe(buttonB);
    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(buttonA);
  });

  describe('keyboard events', () => {
    it('left/right works', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getAllByRole} = render(<ColorArea defaultValue={defaultColor} onChange={onChangeSpy} />);
      let sliders = getAllByRole('slider');
      act(() => sliders[0].focus());

      fireEvent.keyDown(sliders[0], {key: 'Left'});
      act(() => jest.runAllTimers());
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 99).toString('hsla'));
      expect(sliders[0]).toHaveAttribute('value', '99');
      fireEvent.keyDown(sliders[0], {key: 'Right'});
      act(() => jest.runAllTimers());
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 100).toString('hsla'));
      expect(sliders[0]).toHaveAttribute('value', '100');
    });

    it('up/down works', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getAllByRole} = render(<ColorArea defaultValue={defaultColor} onChange={onChangeSpy} />);
      let sliders = getAllByRole('slider');
      act(() => {sliders[0].focus();});

      fireEvent.keyDown(sliders[0], {key: 'Down'});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('lightness', 49).toString('hsla'));
      expect(sliders[1]).toHaveAttribute('value', '49');
      fireEvent.keyDown(sliders[1], {key: 'Up'});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('lightness', 50).toString('hsla'));
      expect(sliders[1]).toHaveAttribute('value', '50');
    });

    it('page up/page down/shift + up/shift + down, home/end/shift + left/shift + right, works', () => {
      let defaultColor = parseColor('hsl(0, 100%, 50%)');
      let {getAllByRole} = render(<ColorArea defaultValue={defaultColor} onChange={onChangeSpy} />);
      let sliders = getAllByRole('slider');
      act(() => {sliders[0].focus();});
      fireEvent.keyDown(sliders[0], {key: 'PageDown'});
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 100).withChannelValue('lightness', 40).toString('hsla'));
      expect(sliders[1]).toHaveAttribute('value', '40');
      fireEvent.keyDown(sliders[1], {key: 'Home'});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 90).withChannelValue('lightness', 40).toString('hsla'));
      expect(sliders[0]).toHaveAttribute('value', '90');
      fireEvent.keyDown(sliders[0], {key: 'PageUp'});
      expect(onChangeSpy).toHaveBeenCalledTimes(3);
      expect(onChangeSpy.mock.calls[2][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 90).withChannelValue('lightness', 50).toString('hsla'));
      expect(sliders[1]).toHaveAttribute('value', '50');
      fireEvent.keyDown(sliders[1], {key: 'End'});
      expect(onChangeSpy).toHaveBeenCalledTimes(4);
      expect(onChangeSpy.mock.calls[3][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 100).withChannelValue('lightness', 50).toString('hsla'));
      expect(sliders[0]).toHaveAttribute('value', '100');

      onChangeSpy.mockClear();
      fireEvent.keyDown(sliders[0], {key: 'ArrowDown', shiftKey: true});
      expect(onChangeSpy).toHaveBeenCalledTimes(2);
      expect(onChangeSpy.mock.calls[0][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 100).withChannelValue('lightness', 49).toString('hsla'));
      expect(onChangeSpy.mock.calls[1][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 100).withChannelValue('lightness', 40).toString('hsla'));
      expect(sliders[1]).toHaveAttribute('value', '40');
      fireEvent.keyDown(sliders[1], {key: 'ArrowLeft', shiftKey: true});
      expect(onChangeSpy).toHaveBeenCalledTimes(4);
      expect(onChangeSpy.mock.calls[2][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 99).withChannelValue('lightness', 40).toString('hsla'));
      expect(onChangeSpy.mock.calls[3][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 90).withChannelValue('lightness', 40).toString('hsla'));
      expect(sliders[0]).toHaveAttribute('value', '90');
      fireEvent.keyDown(sliders[0], {key: 'ArrowUp', shiftKey: true});
      expect(onChangeSpy).toHaveBeenCalledTimes(6);
      expect(onChangeSpy.mock.calls[4][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 90).withChannelValue('lightness', 41).toString('hsla'));
      expect(onChangeSpy.mock.calls[5][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 90).withChannelValue('lightness', 50).toString('hsla'));
      expect(sliders[1]).toHaveAttribute('value', '50');
      fireEvent.keyDown(sliders[1], {key: 'ArrowRight', shiftKey: true});
      expect(onChangeSpy).toHaveBeenCalledTimes(8);
      expect(onChangeSpy.mock.calls[6][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 91).withChannelValue('lightness', 50).toString('hsla'));
      expect(onChangeSpy.mock.calls[7][0].toString('hsla')).toBe(defaultColor.withChannelValue('saturation', 100).withChannelValue('lightness', 50).toString('hsla'));
      expect(sliders[0]).toHaveAttribute('value', '100');
    });
  });
});
