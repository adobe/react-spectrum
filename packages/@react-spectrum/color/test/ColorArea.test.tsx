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

import {ColorArea} from '../';
import {composeStories} from '@storybook/react';
import {fireEvent, installMouseEvent, installPointerEvent, pointerMap, renderv3 as render} from '@react-spectrum/test-utils-internal';
import {parseColor} from '@react-stately/color';
import React from 'react';
import * as stories from '../stories/ColorArea.stories';
import userEvent from '@testing-library/user-event';

let {XRedYGreen: DefaultColorArea, XBlueYGreen, XSaturationYBrightness, XSaturationYLightness} = composeStories(stories);

const SIZE = 160;
const CENTER = SIZE / 2;
const THUMB_RADIUS = 68;

const getBoundingClientRect = () => ({
  width: SIZE, height: SIZE,
  x: 0, y: 0,
  top: 0, left: 0,
  bottom: SIZE, right: SIZE,
  toJSON() { return this; }
});

describe('ColorArea', () => {
  let onChangeSpy = jest.fn();
  let onChangeEndSpy = jest.fn();
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => SIZE);
    jest.useFakeTimers();
  });

  afterEach(() => {
    // for restoreTextSelection
    jest.runAllTimers();
    onChangeSpy.mockClear();
    onChangeEndSpy.mockClear();
  });

  // get group corresponds to the index returned by getAllByRole('group')
  describe.each`
  Name              | Component           | groupIndex
  ${'Controlled'}   | ${DefaultColorArea} | ${1}
  ${'Uncontrolled'} | ${ColorArea}        | ${0}
  `('$Name', ({Component, groupIndex}) => {
    describe('attributes', () => {
      it('sets input props', () => {
        let {getAllByRole} = render(<Component defaultValue={'#ff00ff'} />);
        let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});

        expect(xSlider).toHaveAttribute('type', 'range');
        expect(xSlider).toHaveAttribute('aria-label', 'Color picker');
        expect(xSlider).toHaveAttribute('min', '0');
        expect(xSlider).toHaveAttribute('max', '255');
        expect(xSlider).toHaveAttribute('step', '1');
        expect(xSlider).toHaveAttribute('aria-valuetext', 'Red: 255, Green: 0, Blue: 255, light vibrant magenta');
        expect(xSlider).not.toHaveAttribute('tabindex', '0');

        expect(ySlider).toHaveAttribute('type', 'range');
        expect(ySlider).toHaveAttribute('aria-label', 'Color picker');
        expect(ySlider).toHaveAttribute('min', '0');
        expect(ySlider).toHaveAttribute('max', '255');
        expect(ySlider).toHaveAttribute('step', '1');
        expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, Red: 255, Blue: 255, light vibrant magenta');
        expect(ySlider).toHaveAttribute('tabindex', '-1');
        expect(ySlider).toHaveAttribute('aria-hidden', 'true');
      });

      it('disabled', async () => {
        let {getAllByRole} = render(<div>
          <button>A</button>
          <Component defaultValue={'#ff00ff'} isDisabled />
          <button>B</button>
        </div>);
        let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});
        let [buttonA, buttonB] = getAllByRole('button');
        expect(xSlider).toHaveAttribute('disabled');
        expect(ySlider).toHaveAttribute('disabled');

        await user.tab();
        expect(document.activeElement).toBe(buttonA);
        await user.tab();
        expect(document.activeElement).toBe(buttonB);
        await user.tab({shift: true});
        expect(document.activeElement).toBe(buttonA);
      });

      describe('labelling', () => {
        it('should support a custom aria-label', () => {
          let {getAllByRole} = render(<Component defaultValue={'#ff00ff'} aria-label="Color hue" />);
          let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});

          expect(xSlider).toHaveAttribute('aria-label', 'Color hue, Color picker');
          expect(ySlider).toHaveAttribute('aria-label', 'Color hue, Color picker');
          expect(xSlider).not.toHaveAttribute('aria-labelledby');
          expect(ySlider).not.toHaveAttribute('aria-labelledby');

          let colorAreaGroup = xSlider.closest('[role="group"]');
          expect(colorAreaGroup).toHaveAttribute('aria-label', 'Color hue, Color picker');
          expect(colorAreaGroup).not.toHaveAttribute('aria-labelledby');
        });

        it('should support a custom aria-labelledby', () => {
          let {getAllByRole} = render(<Component defaultValue={'#ff00ff'} aria-labelledby="label-id" />);
          let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});

          expect(xSlider).toHaveAttribute('aria-label', 'Color picker');
          expect(ySlider).toHaveAttribute('aria-label', 'Color picker');
          expect(xSlider).toHaveAttribute('aria-labelledby', `${xSlider.id} label-id`);
          expect(ySlider).toHaveAttribute('aria-labelledby', `${ySlider.id} label-id`);

          let colorAreaGroup = xSlider.closest('[role="group"]');
          expect(colorAreaGroup).toHaveAttribute('aria-labelledby', 'label-id');
          expect(colorAreaGroup).not.toHaveAttribute('aria-label');
        });
      });
    });

    describe('behaviors', () => {
      let pressKey = (element, options) => {
        fireEvent.keyDown(element, options);
        fireEvent.keyUp(element, options);
      };
      describe('keyboard events', () => {
        it.each`
          Name                      | props                                          | actions                                                                                                                                                            | result
          ${'left/right'}           | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowLeft'}), backward: (elem) => pressKey(elem, {key: 'ArrowRight'})}}                                 | ${parseColor('#fe00ff')}
          ${'up/down'}              | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp'}), backward: (elem) => pressKey(elem, {key: 'ArrowDown'})}}                                    | ${parseColor('#ff01ff')}
          ${'shiftleft/shiftright'} | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowLeft', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowRight', shiftKey: true})}} | ${parseColor('#df00f0')}
          ${'shiftup/shiftdown'}    | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowDown', shiftKey: true})}}    | ${parseColor('#f011f0')}
          ${'pageup/pagedown'}      | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'PageUp'}), backward: (elem) => pressKey(elem, {key: 'PageDown'})}}                                      | ${parseColor('#f011f0')}
          ${'home/end'}             | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'Home'}), backward: (elem) => pressKey(elem, {key: 'End'})}}                                             | ${parseColor('#df00f0')}
        `('$Name', async ({props, actions: {forward, backward}, result}) => {
          let {getAllByRole} = render(
            <Component
              {...props}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});

          expect(xSlider.getAttribute('aria-valuetext')).toBe([
            `${props.defaultValue.getChannelName('red', 'en-US')}: ${props.defaultValue.formatChannelValue('red', 'en-US')}`,
            `${props.defaultValue.getChannelName('green', 'en-US')}: ${props.defaultValue.formatChannelValue('green', 'en-US')}`,
            `${props.defaultValue.getChannelName('blue', 'en-US')}: ${props.defaultValue.formatChannelValue('blue', 'en-US')}`,
            `${props.defaultValue.getColorName('en-US')}`
          ].join(', '));
          expect(ySlider.getAttribute('aria-valuetext')).toBe([
            `${props.defaultValue.getChannelName('green', 'en-US')}: ${props.defaultValue.formatChannelValue('green', 'en-US')}`,
            `${props.defaultValue.getChannelName('red', 'en-US')}: ${props.defaultValue.formatChannelValue('red', 'en-US')}`,
            `${props.defaultValue.getChannelName('blue', 'en-US')}: ${props.defaultValue.formatChannelValue('blue', 'en-US')}`,
            `${props.defaultValue.getColorName('en-US')}`
          ].join(', '));

          expect(xSlider).not.toHaveAttribute('tabindex');
          expect(xSlider).not.toHaveAttribute('aria-hidden', 'true');
          expect(ySlider).toHaveAttribute('tabindex', '-1');
          expect(ySlider).toHaveAttribute('aria-hidden', 'true');

          await user.tab();

          forward(xSlider);
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));
          expect(xSlider.getAttribute('aria-valuetext')).toBe(`${result.getChannelName('red', 'en-US')}: ${result.formatChannelValue('red', 'en-US')}, ${result.getColorName('en-US')}`);
          expect(document.activeElement).not.toHaveAttribute('tabindex', '0');
          expect(document.activeElement).not.toHaveAttribute('aria-hidden');
          expect(document.activeElement === xSlider ? ySlider : xSlider).toHaveAttribute('tabindex', '-1');
          expect(document.activeElement === xSlider ? ySlider : xSlider).not.toHaveAttribute('aria-hidden', 'true');

          backward(ySlider);
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(2);
          expect(onChangeEndSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
          expect(ySlider.getAttribute('aria-valuetext')).toBe(`${props.defaultValue.getChannelName('green', 'en-US')}: ${props.defaultValue.formatChannelValue('green', 'en-US')}, ${props.defaultValue.getColorName('en-US')}`);
          expect(document.activeElement).not.toHaveAttribute('tabindex', '0');
          expect(document.activeElement).not.toHaveAttribute('aria-hidden');
          expect(document.activeElement === xSlider ? ySlider : xSlider).toHaveAttribute('tabindex', '-1');
          expect(document.activeElement === xSlider ? ySlider : xSlider).not.toHaveAttribute('aria-hidden', 'true');
        });

        it.each`
          Name                      | props                                          | actions                                                                                                                                                            | result
          ${'left/right'}           | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowRight'}), backward: (elem) => pressKey(elem, {key: 'ArrowLeft'})}}                                 | ${parseColor('#fe00ff')}
          ${'up/down'}              | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp'}), backward: (elem) => pressKey(elem, {key: 'ArrowDown'})}}                                    | ${parseColor('#ff01ff')}
          ${'shiftleft/shiftright'} | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowRight', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowLeft', shiftKey: true})}} | ${parseColor('#df00f0')}
          ${'shiftup/shiftdown'}    | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowDown', shiftKey: true})}}    | ${parseColor('#f011f0')}
          ${'pageup/pagedown'}      | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'PageUp'}), backward: (elem) => pressKey(elem, {key: 'PageDown'})}}                                      | ${parseColor('#f011f0')}
          ${'home/end'}             | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'End'}), backward: (elem) => pressKey(elem, {key: 'Home'})}}                                             | ${parseColor('#df00f0')}
        `('$Name RTL', async ({props, actions: {forward, backward}, result}) => {
          let {getAllByRole} = render(
            <Component
              {...props}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          , undefined, {locale: 'ar-AE'});
          let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});

          expect(xSlider.getAttribute('aria-valuetext')).toBe([
            `${props.defaultValue.getChannelName('red', 'ar-AE')}: ${props.defaultValue.formatChannelValue('red', 'ar-AE')}`,
            `${props.defaultValue.getChannelName('green', 'ar-AE')}: ${props.defaultValue.formatChannelValue('green', 'ar-AE')}`,
            `${props.defaultValue.getChannelName('blue', 'ar-AE')}: ${props.defaultValue.formatChannelValue('blue', 'ar-AE')}`,
            `${props.defaultValue.getColorName('ar-AE')}`
          ].join(', '));
          expect(ySlider.getAttribute('aria-valuetext')).toBe([
            `${props.defaultValue.getChannelName('green', 'ar-AE')}: ${props.defaultValue.formatChannelValue('green', 'ar-AE')}`,
            `${props.defaultValue.getChannelName('red', 'ar-AE')}: ${props.defaultValue.formatChannelValue('red', 'ar-AE')}`,
            `${props.defaultValue.getChannelName('blue', 'ar-AE')}: ${props.defaultValue.formatChannelValue('blue', 'ar-AE')}`,
            `${props.defaultValue.getColorName('ar-AE')}`
          ].join(', '));

          expect(xSlider).not.toHaveAttribute('tabindex');
          expect(xSlider).not.toHaveAttribute('aria-hidden', 'true');
          expect(ySlider).toHaveAttribute('tabindex', '-1');
          expect(ySlider).toHaveAttribute('aria-hidden', 'true');

          await user.tab();

          forward(xSlider);
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));
          expect(xSlider.getAttribute('aria-valuetext')).toBe(`${result.getChannelName('red', 'ar-AE')}: ${result.formatChannelValue('red', 'ar-AE')}, ${result.getColorName('ar-AE')}`);
          expect(document.activeElement).not.toHaveAttribute('tabindex');
          expect(document.activeElement).not.toHaveAttribute('aria-hidden');
          expect(document.activeElement === xSlider ? ySlider : xSlider).toHaveAttribute('tabindex', '-1');
          expect(document.activeElement === xSlider ? ySlider : xSlider).not.toHaveAttribute('aria-hidden', 'true');

          backward(ySlider);
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(2);
          expect(onChangeEndSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
          expect(ySlider.getAttribute('aria-valuetext')).toBe(`${props.defaultValue.getChannelName('green', 'ar-AE')}: ${props.defaultValue.formatChannelValue('green', 'ar-AE')}, ${props.defaultValue.getColorName('ar-AE')}`);
          expect(document.activeElement).not.toHaveAttribute('tabindex');
          expect(document.activeElement).not.toHaveAttribute('aria-hidden');
          expect(document.activeElement === xSlider ? ySlider : xSlider).toHaveAttribute('tabindex', '-1');
          expect(document.activeElement === xSlider ? ySlider : xSlider).not.toHaveAttribute('aria-hidden', 'true');
        });

        it('no events when disabled', async () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole, getByRole} = render(<div>
            <Component
              isDisabled
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
            <button>B</button>
          </div>);
          let buttonA = getByRole('button');
          let [xSlider] = getAllByRole('slider');
          await user.tab();
          expect(buttonA).toBe(document.activeElement);

          pressKey(xSlider, {key: 'LeftArrow'});
          expect(onChangeSpy).not.toHaveBeenCalled();
          expect(onChangeEndSpy).not.toHaveBeenCalled();
          pressKey(xSlider, {key: 'RightArrow'});
          expect(onChangeSpy).not.toHaveBeenCalled();
          expect(onChangeEndSpy).not.toHaveBeenCalled();
        });
      });

      describe.each`
        type                | prepare               | actions
        ${'Mouse Events'}   | ${installMouseEvent}  | ${[
          (el, {pageX, pageY}) => fireEvent.mouseDown(el, {button: 0, pageX, pageY, clientX: pageX, clientY: pageY}),
          (el, {pageX, pageY}) => fireEvent.mouseMove(el, {button: 0, pageX, pageY, clientX: pageX, clientY: pageY}),
          (el, {pageX, pageY}) => fireEvent.mouseUp(el, {button: 0, pageX, pageY, clientX: pageX, clientY: pageY})
        ]}
        ${'Pointer Events'} | ${installPointerEvent}| ${[
          (el, {pageX, pageY}) => fireEvent.pointerDown(el, {button: 0, pointerId: 1, pageX, pageY, clientX: pageX, clientY: pageY}),
          (el, {pageX, pageY}) => fireEvent.pointerMove(el, {button: 0, pointerId: 1, pageX, pageY, clientX: pageX, clientY: pageY}),
          (el, {pageX, pageY}) => fireEvent.pointerUp(el, {button: 0, pointerId: 1, pageX, pageY, clientX: pageX, clientY: pageY})
        ]}
        ${'Touch Events'}   | ${() => {}}           | ${[
          (el, {pageX, pageY}) => fireEvent.touchStart(el, {changedTouches: [{identifier: 1, pageX, pageY, clientX: pageX, clientY: pageY}]}),
          (el, {pageX, pageY}) => fireEvent.touchMove(el, {changedTouches: [{identifier: 1, pageX, pageY, clientX: pageX, clientY: pageY}]}),
          (el, {pageX, pageY}) => fireEvent.touchEnd(el, {changedTouches: [{identifier: 1, pageX, pageY, clientX: pageX, clientY: pageY}]})
        ]}
      `('$type', ({actions: [start, move, end], prepare}) => {
        prepare();

        it('clicking on the area chooses the color at that point', () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole} = render(
            <Component
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let [xSlider] = getAllByRole('slider');
          let groups = getAllByRole('group');
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(xSlider);
          start(container, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#EC80FF').toString('rgba'));
          expect(document.activeElement).toBe(xSlider);

          end(container, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#EC80FF').toString('rgba'));
          expect(document.activeElement).toBe(xSlider);
        });

        it('dragging the thumb works', () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole} = render(
            <Component
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let [xSlider] = getAllByRole('slider');
          let groups = getAllByRole('group');
          let thumb = xSlider.parentElement;
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(xSlider);
          start(thumb, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).toBe(xSlider);

          move(thumb, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#9300FF').toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).toBe(xSlider);

          end(thumb, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#9300FF').toString('rgba'));
          expect(document.activeElement).toBe(xSlider);
        });

        it('dragging the thumb doesn\'t works when disabled', () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole} = render(
            <Component
              isDisabled
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let [xSlider] = getAllByRole('slider');
          let groups = getAllByRole('group');
          let thumb = xSlider.parentElement;
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(xSlider);
          start(thumb, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);

          move(thumb, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);

          end(thumb, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
        });

        it('clicking and dragging on the track works', () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole} = render(
            <Component
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let [xSlider] = getAllByRole('slider');
          let groups = getAllByRole('group');
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(xSlider);
          start(container, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#EC80FF').toString('rgba'));
          expect(document.activeElement).toBe(xSlider);

          move(container, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy.mock.calls[1][0].toString('rgba')).toBe(parseColor('#8014FF').toString('rgba'));
          expect(document.activeElement).toBe(xSlider);

          end(container, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#8014FF').toString('rgba'));
          expect(document.activeElement).toBe(xSlider);
        });

        it('clicking and dragging on the track doesn\'t work when disabled', () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole} = render(
            <Component
              isDisabled
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let [xSlider] = getAllByRole('slider');
          let groups = getAllByRole('group');
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(xSlider);
          start(container, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).not.toBe(xSlider);

          move(container, {pageX: CENTER - THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).not.toBe(xSlider);

          end(container, {pageX: CENTER - THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).not.toBe(xSlider);
        });
      });
    });
  });
  describe('defaults uncontrolled', () => {
    let pressKey = (element, options) => {
      fireEvent.keyDown(element, options);
      fireEvent.keyUp(element, options);
    };
    it('sets input props', () => {
      let {getAllByRole} = render(<ColorArea />);
      let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});

      expect(xSlider).toHaveAttribute('type', 'range');
      expect(xSlider).toHaveAttribute('aria-label', 'Color picker');
      expect(xSlider).toHaveAttribute('min', '0');
      expect(xSlider).toHaveAttribute('max', '255');
      expect(xSlider).toHaveAttribute('step', '1');
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Red: 255, Green: 255, Blue: 255, white');
      expect(xSlider).not.toHaveAttribute('tabindex');
      expect(xSlider).not.toHaveAttribute('aria-hidden');

      expect(ySlider).toHaveAttribute('type', 'range');
      expect(ySlider).toHaveAttribute('aria-label', 'Color picker');
      expect(ySlider).toHaveAttribute('min', '0');
      expect(ySlider).toHaveAttribute('max', '255');
      expect(ySlider).toHaveAttribute('step', '1');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 255, Red: 255, Blue: 255, white');
      expect(ySlider).toHaveAttribute('tabindex', '-1');
      expect(ySlider).toHaveAttribute('aria-hidden', 'true');
    });

    it('the slider is focusable', async () => {
      let {getAllByRole} = render(<div>
        <button>A</button>
        <ColorArea defaultValue={'#ff00ff'} />
        <button>B</button>
      </div>);
      let [xSlider, ySlider] = getAllByRole('slider', {hidden: true});
      let [buttonA, buttonB] = getAllByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(buttonA);
      await user.tab();
      expect(document.activeElement).toBe(xSlider);
      // focusing into ColorArea, value text for each slider will include name and value for each channel
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Red: 255, Green: 0, Blue: 255, light vibrant magenta');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, Red: 255, Blue: 255, light vibrant magenta');
      pressKey(xSlider, {key: 'ArrowLeft'});
      // following a keyboard event that changes a value, value text for each slider will include only the name and value for that channel.
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Red: 254, light vibrant magenta');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, light vibrant magenta');
      await user.tab();
      expect(document.activeElement).toBe(buttonB);
      // focusing out of ColorArea, value text for each slider will include name and value for each channel
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Red: 254, Green: 0, Blue: 255, light vibrant magenta');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, Red: 254, Blue: 255, light vibrant magenta');
      await user.tab({shift: true});
      expect(document.activeElement).toBe(xSlider);
      // focusing back into ColorArea, value text for each slider will include name and value for each channel
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Red: 254, Green: 0, Blue: 255, light vibrant magenta');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, Red: 254, Blue: 255, light vibrant magenta');
    });
  });
  describe('full implementation controlled', () => {
    it('sets input props rgb', () => {
      let {getAllByRole, getByLabelText} = render(<XBlueYGreen {...XBlueYGreen.args} />);
      let sliders = getAllByRole('slider');

      expect(sliders.length).toBe(2);
      let [xSlider, ySlider, zSlider] = getAllByRole('slider', {hidden: true});

      expect(xSlider).toHaveAttribute('type', 'range');
      expect(xSlider).toHaveAttribute('aria-label', 'Color picker');
      expect(xSlider).toHaveAttribute('min', '0');
      expect(xSlider).toHaveAttribute('max', '255');
      expect(xSlider).toHaveAttribute('step', '1');
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Blue: 255, Green: 255, Red: 0, very light vibrant cyan');
      expect(xSlider).not.toHaveAttribute('tabindex');
      expect(xSlider).not.toHaveAttribute('aria-hidden');

      expect(ySlider).toHaveAttribute('type', 'range');
      expect(ySlider).toHaveAttribute('aria-label', 'Color picker');
      expect(ySlider).toHaveAttribute('min', '0');
      expect(ySlider).toHaveAttribute('max', '255');
      expect(ySlider).toHaveAttribute('step', '1');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 255, Blue: 255, Red: 0, very light vibrant cyan');
      expect(ySlider).toHaveAttribute('tabindex', '-1');
      expect(ySlider).toHaveAttribute('aria-hidden', 'true');

      let redSlider = getByLabelText('Red', {selector: 'input'});
      expect(zSlider).toHaveAttribute('type', 'range');
      expect(zSlider).not.toHaveAttribute('aria-label');
      expect(zSlider).toBe(redSlider);
      expect(zSlider).toHaveAttribute('min', '0');
      expect(zSlider).toHaveAttribute('max', '255');
      expect(zSlider).toHaveAttribute('step', '1');
      expect(zSlider).toHaveAttribute('aria-valuetext', '0, very light vibrant cyan');
    });
    it('sets input props hsb', () => {
      let {getAllByRole, getByLabelText} = render(<XSaturationYBrightness {...XSaturationYBrightness.args} />);
      let sliders = getAllByRole('slider');

      expect(sliders.length).toBe(2);
      let [xSlider, ySlider, zSlider] = getAllByRole('slider', {hidden: true});

      expect(xSlider).toHaveAttribute('type', 'range');
      expect(xSlider).toHaveAttribute('aria-label', 'Color picker');
      expect(xSlider).toHaveAttribute('min', '0');
      expect(xSlider).toHaveAttribute('max', '100');
      expect(xSlider).toHaveAttribute('step', '1');
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Saturation: 100%, Brightness: 100%, Hue: 0°, vibrant red');
      expect(xSlider).not.toHaveAttribute('tabindex');
      expect(xSlider).not.toHaveAttribute('aria-hidden');

      expect(ySlider).toHaveAttribute('type', 'range');
      expect(ySlider).toHaveAttribute('aria-label', 'Color picker');
      expect(ySlider).toHaveAttribute('min', '0');
      expect(ySlider).toHaveAttribute('max', '100');
      expect(ySlider).toHaveAttribute('step', '1');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Brightness: 100%, Saturation: 100%, Hue: 0°, vibrant red');
      expect(ySlider).toHaveAttribute('tabindex', '-1');
      expect(ySlider).toHaveAttribute('aria-hidden', 'true');

      let hueSlider = getByLabelText('Hue', {selector: 'input'});
      expect(zSlider).toHaveAttribute('type', 'range');
      expect(zSlider).toHaveAttribute('aria-label', 'Hue');
      expect(zSlider).toBe(hueSlider);
      expect(zSlider).toHaveAttribute('min', '0');
      expect(zSlider).toHaveAttribute('max', '360');
      expect(zSlider).toHaveAttribute('step', '1');
      expect(zSlider).toHaveAttribute('aria-valuetext', '0°, red');
    });
    it('sets input props hsl', () => {
      let {getAllByRole, getByLabelText} = render(<XSaturationYLightness {...XSaturationYLightness.args} />);
      let sliders = getAllByRole('slider');

      expect(sliders.length).toBe(2);
      let [xSlider, ySlider, zSlider] = getAllByRole('slider', {hidden: true});

      expect(xSlider).toHaveAttribute('type', 'range');
      expect(xSlider).toHaveAttribute('aria-label', 'Color picker');
      expect(xSlider).toHaveAttribute('min', '0');
      expect(xSlider).toHaveAttribute('max', '100');
      expect(xSlider).toHaveAttribute('step', '1');
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Saturation: 100%, Lightness: 50%, Hue: 0°, vibrant red');
      expect(xSlider).not.toHaveAttribute('tabindex');
      expect(xSlider).not.toHaveAttribute('aria-hidden');

      expect(ySlider).toHaveAttribute('type', 'range');
      expect(ySlider).toHaveAttribute('aria-label', 'Color picker');
      expect(ySlider).toHaveAttribute('min', '0');
      expect(ySlider).toHaveAttribute('max', '100');
      expect(ySlider).toHaveAttribute('step', '1');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Lightness: 50%, Saturation: 100%, Hue: 0°, vibrant red');
      expect(ySlider).toHaveAttribute('tabIndex', '-1');
      expect(ySlider).toHaveAttribute('aria-hidden', 'true');

      let hueSlider = getByLabelText('Hue', {selector: 'input'});
      expect(zSlider).toHaveAttribute('type', 'range');
      expect(zSlider).toHaveAttribute('aria-label', 'Hue');
      expect(zSlider).toBe(hueSlider);
      expect(zSlider).toHaveAttribute('min', '0');
      expect(zSlider).toHaveAttribute('max', '360');
      expect(zSlider).toHaveAttribute('step', '1');
      expect(zSlider).toHaveAttribute('aria-valuetext', '0°, red');
    });

    it('the slider is focusable', async () => {
      let {getAllByRole, getByRole} = render(<div>
        <button>A</button>
        <DefaultColorArea defaultValue={'#ff00ff'} />
        <button>B</button>
      </div>);
      let [xSlider, zSlider] = getAllByRole('slider');
      let colorField = getByRole('textbox');
      let [buttonA, buttonB] = getAllByRole('button');

      await user.tab();
      expect(document.activeElement).toBe(buttonA);
      await user.tab();
      expect(document.activeElement).toBe(xSlider);
      await user.tab();
      expect(document.activeElement).toBe(zSlider);
      await user.tab();
      expect(document.activeElement).toBe(colorField);
      await user.tab();
      expect(document.activeElement).toBe(buttonB);
      await user.tab({shift: true});
      await user.tab({shift: true});
      expect(document.activeElement).toBe(zSlider);
    });
  });

  describe('forms', () => {
    it('supports form name', () => {
      let {getAllByRole} = render(<ColorArea xName="red" yName="green" />);
      let inputs = getAllByRole('slider', {hidden: true});
      expect(inputs[0]).toHaveAttribute('name', 'red');
      expect(inputs[0]).toHaveValue('255');
      expect(inputs[1]).toHaveAttribute('name', 'green');
      expect(inputs[1]).toHaveValue('255');
    });

    it('supports form reset', async () => {
      function Test() {
        let [value, setValue] = React.useState(parseColor('rgb(100, 200, 0)'));
        return (
          <form>
            <ColorArea value={value} onChange={setValue} />
            <input type="reset" data-testid="reset" />
          </form>
        );
      }

      let {getByTestId, getAllByRole} = render(<Test />);
      let inputs = getAllByRole('slider', {hidden: true});

      expect(inputs[0]).toHaveValue('100');
      expect(inputs[1]).toHaveValue('200');
      fireEvent.change(inputs[0], {target: {value: '10'}});
      fireEvent.change(inputs[1], {target: {value: '20'}});
      expect(inputs[0]).toHaveValue('10');
      expect(inputs[1]).toHaveValue('20');

      let button = getByTestId('reset');
      await user.click(button);
      expect(inputs[0]).toHaveValue('100');
      expect(inputs[1]).toHaveValue('200');
    });
  });
});
