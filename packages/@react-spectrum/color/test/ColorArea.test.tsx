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
import {XBlueYGreen as DefaultColorArea} from '../stories/ColorArea.stories';
import {defaultTheme} from '@adobe/react-spectrum';
import {fireEvent, render} from '@testing-library/react';
import {installMouseEvent, installPointerEvent} from '@react-spectrum/test-utils';
import {parseColor} from '@react-stately/color';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import userEvent from '@testing-library/user-event';

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

  beforeAll(() => {
    jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => SIZE);
    // @ts-ignore
    jest.useFakeTimers('modern');
  });
  afterAll(() => {
    // @ts-ignore
    jest.useRealTimers();
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
        let sliders = getAllByRole('slider');

        let [xSlider, ySlider] = sliders;

        expect(xSlider).toHaveAttribute('type', 'range');
        expect(xSlider).toHaveAttribute('aria-label', 'Blue / Green');
        expect(xSlider).toHaveAttribute('min', '0');
        expect(xSlider).toHaveAttribute('max', '255');
        expect(xSlider).toHaveAttribute('step', '1');
        expect(xSlider).toHaveAttribute('aria-valuetext', 'Blue: 255, Green: 0');

        expect(ySlider).toHaveAttribute('type', 'range');
        expect(ySlider).toHaveAttribute('aria-label', 'Blue / Green');
        expect(ySlider).toHaveAttribute('min', '0');
        expect(ySlider).toHaveAttribute('max', '255');
        expect(ySlider).toHaveAttribute('step', '1');
        expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, Blue: 255');
      });

      it('disabled', () => {
        let {getAllByRole} = render(<div>
          <button>A</button>
          <Component defaultValue={'#ff00ff'} isDisabled />
          <button>B</button>
        </div>);
        let sliders = getAllByRole('slider');
        let [buttonA, buttonB] = getAllByRole('button');
        sliders.forEach(slider => {
          expect(slider).toHaveAttribute('disabled');
        });

        userEvent.tab();
        expect(document.activeElement).toBe(buttonA);
        userEvent.tab();
        expect(document.activeElement).toBe(buttonB);
        userEvent.tab({shift: true});
        expect(document.activeElement).toBe(buttonA);
      });

      // TODO: don't know how to do this yet
      describe.skip('labelling', () => {
        it('should support a custom aria-label', () => {
          let {getAllByRole} = render(<Component defaultValue={'#ff00ff'} aria-label="Color hue" />);
          let slider = getAllByRole('slider');

          expect(slider).toHaveAttribute('aria-label', 'Color hue');
          expect(slider).not.toHaveAttribute('aria-labelledby');
        });

        it('should support a custom aria-labelledby', () => {
          let {getAllByRole} = render(<Component defaultValue={'#ff00ff'} aria-labelledby="label-id" />);
          let slider = getAllByRole('slider');

          expect(slider).not.toHaveAttribute('aria-label');
          expect(slider).toHaveAttribute('aria-labelledby', 'label-id');
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
          ${'left/right'}           | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowLeft'}), backward: (elem) => pressKey(elem, {key: 'ArrowRight'})}}                                 | ${parseColor('#ff00fe')}
          ${'up/down'}              | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp'}), backward: (elem) => pressKey(elem, {key: 'ArrowDown'})}}                                    | ${parseColor('#ff01ff')}
          ${'shiftleft/shiftright'} | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowLeft', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowRight', shiftKey: true})}} | ${parseColor('#f000df')}
          ${'shiftup/shiftdown'}    | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowDown', shiftKey: true})}}    | ${parseColor('#f011f0')}
          ${'pageup/pagedown'}      | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'PageUp'}), backward: (elem) => pressKey(elem, {key: 'PageDown'})}}                                      | ${parseColor('#f011f0')}
          ${'home/end'}             | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'Home'}), backward: (elem) => pressKey(elem, {key: 'End'})}}                                             | ${parseColor('#f000df')}
        `('$Name', ({props, actions: {forward, backward}, result}) => {
          let {getAllByRole} = render(
            <Component
              {...props}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let sliders = getAllByRole('slider');
          userEvent.tab();

          forward(sliders[0]);
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));

          backward(sliders[0]);
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(2);
          expect(onChangeEndSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
        });

        it.each`
          Name                      | props                                          | actions                                                                                                                                                            | result
          ${'left/right'}           | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowRight'}), backward: (elem) => pressKey(elem, {key: 'ArrowLeft'})}}                                 | ${parseColor('#ff00fe')}
          ${'up/down'}              | ${{defaultValue: parseColor('#ff00ff')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp'}), backward: (elem) => pressKey(elem, {key: 'ArrowDown'})}}                                    | ${parseColor('#ff01ff')}
          ${'shiftleft/shiftright'} | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowRight', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowLeft', shiftKey: true})}} | ${parseColor('#f000df')}
          ${'shiftup/shiftdown'}    | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'ArrowUp', shiftKey: true}), backward: (elem) => pressKey(elem, {key: 'ArrowDown', shiftKey: true})}}    | ${parseColor('#f011f0')}
          ${'pageup/pagedown'}      | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'PageUp'}), backward: (elem) => pressKey(elem, {key: 'PageDown'})}}                                      | ${parseColor('#f011f0')}
          ${'home/end'}             | ${{defaultValue: parseColor('#f000f0')}} | ${{forward: (elem) => pressKey(elem, {key: 'End'}), backward: (elem) => pressKey(elem, {key: 'Home'})}}                                             | ${parseColor('#f000df')}
        `('$Name RTL', ({props, actions: {forward, backward}, result}) => {
          let {getAllByRole} = render(
            <Provider locale="ar-AE" theme={defaultTheme}>
              <Component
                {...props}
                onChange={onChangeSpy}
                onChangeEnd={onChangeEndSpy} />
            </Provider>
          );
          let sliders = getAllByRole('slider');
          userEvent.tab();

          forward(sliders[0]);
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(result.toString('rgba'));

          backward(sliders[0]);
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(2);
          expect(onChangeEndSpy.mock.calls[1][0].toString('rgba')).toBe(props.defaultValue.toString('rgba'));
        });

        it('no events when disabled', () => {
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
          let sliders = getAllByRole('slider');
          userEvent.tab();
          expect(buttonA).toBe(document.activeElement);

          pressKey(sliders[0], {key: 'LeftArrow'});
          expect(onChangeSpy).not.toHaveBeenCalled();
          expect(onChangeEndSpy).not.toHaveBeenCalled();
          pressKey(sliders[0], {key: 'RightArrow'});
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
          let sliders = getAllByRole('slider');
          let groups = getAllByRole('group');
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(sliders[0]);
          start(container, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#ff80EC').toString('rgba'));
          expect(document.activeElement).toBe(sliders[0]);

          end(container, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#ff80EC').toString('rgba'));
          expect(document.activeElement).toBe(sliders[0]);
        });

        it('dragging the thumb works', () => {
          let defaultColor = parseColor('#ff00ff');
          let {getAllByRole} = render(
            <Component
              defaultValue={defaultColor}
              onChange={onChangeSpy}
              onChangeEnd={onChangeEndSpy} />
          );
          let sliders = getAllByRole('slider');
          let groups = getAllByRole('group');
          let thumb = sliders[0].parentElement;
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(sliders[0]);
          start(thumb, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).toBe(sliders[0]);

          move(thumb, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#ff0093').toString('rgba'));
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).toBe(sliders[0]);

          end(thumb, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#ff0093').toString('rgba'));
          expect(document.activeElement).toBe(sliders[0]);
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
          let sliders = getAllByRole('slider');
          let groups = getAllByRole('group');
          let thumb = sliders[0].parentElement;
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(sliders[0]);
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
          let sliders = getAllByRole('slider');
          let groups = getAllByRole('group');
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(sliders[0]);
          start(container, {pageX: CENTER + THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(0);
          expect(onChangeSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#ff80EC').toString('rgba'));
          expect(document.activeElement).toBe(sliders[0]);

          move(container, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy.mock.calls[1][0].toString('rgba')).toBe(parseColor('#ff1480').toString('rgba'));
          expect(document.activeElement).toBe(sliders[0]);

          end(container, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeEndSpy).toHaveBeenCalledTimes(1);
          expect(onChangeEndSpy.mock.calls[0][0].toString('rgba')).toBe(parseColor('#ff1480').toString('rgba'));
          expect(document.activeElement).toBe(sliders[0]);
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
          let sliders = getAllByRole('slider');
          let groups = getAllByRole('group');
          let container = groups[groupIndex];
          container.getBoundingClientRect = getBoundingClientRect;

          expect(document.activeElement).not.toBe(sliders[0]);
          start(container, {pageX: CENTER, pageY: CENTER + THUMB_RADIUS});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).not.toBe(sliders[0]);

          move(container, {pageX: CENTER - THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).not.toBe(sliders[0]);

          end(container, {pageX: CENTER - THUMB_RADIUS, pageY: CENTER});
          expect(onChangeSpy).toHaveBeenCalledTimes(0);
          expect(document.activeElement).not.toBe(sliders[0]);
        });
      });
    });
  });
  describe('defaults uncontrolled', () => {
    it('sets input props', () => {
      let {getAllByRole} = render(<ColorArea />);
      let sliders = getAllByRole('slider');

      let [xSlider, ySlider] = sliders;

      expect(xSlider).toHaveAttribute('type', 'range');
      expect(xSlider).toHaveAttribute('aria-label', 'Blue / Green');
      expect(xSlider).toHaveAttribute('min', '0');
      expect(xSlider).toHaveAttribute('max', '255');
      expect(xSlider).toHaveAttribute('step', '1');
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Blue: 255, Green: 255');

      expect(ySlider).toHaveAttribute('type', 'range');
      expect(ySlider).toHaveAttribute('aria-label', 'Blue / Green');
      expect(ySlider).toHaveAttribute('min', '0');
      expect(ySlider).toHaveAttribute('max', '255');
      expect(ySlider).toHaveAttribute('step', '1');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 255, Blue: 255');
    });

    it('the slider is focusable', () => {
      let {getAllByRole} = render(<div>
        <button>A</button>
        <ColorArea defaultValue={'#ff00ff'} />
        <button>B</button>
      </div>);
      let sliders = getAllByRole('slider');
      let [buttonA, buttonB] = getAllByRole('button');

      userEvent.tab();
      expect(document.activeElement).toBe(buttonA);
      userEvent.tab();
      expect(document.activeElement).toBe(sliders[0]);
      userEvent.tab();
      expect(document.activeElement).toBe(buttonB);
      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(sliders[0]);
    });
  });
  describe('full implementation controlled', () => {
    it('sets input props', () => {
      let {getAllByRole, getByLabelText} = render(<DefaultColorArea />);
      let sliders = getAllByRole('slider');

      expect(sliders.length).toBe(3);
      let [xSlider, ySlider, zSlider] = sliders;

      expect(xSlider).toHaveAttribute('type', 'range');
      expect(xSlider).toHaveAttribute('aria-label', 'Blue / Green');
      expect(xSlider).toHaveAttribute('min', '0');
      expect(xSlider).toHaveAttribute('max', '255');
      expect(xSlider).toHaveAttribute('step', '1');
      expect(xSlider).toHaveAttribute('aria-valuetext', 'Blue: 255, Green: 0');

      expect(ySlider).toHaveAttribute('type', 'range');
      expect(ySlider).toHaveAttribute('aria-label', 'Blue / Green');
      expect(ySlider).toHaveAttribute('min', '0');
      expect(ySlider).toHaveAttribute('max', '255');
      expect(ySlider).toHaveAttribute('step', '1');
      expect(ySlider).toHaveAttribute('aria-valuetext', 'Green: 0, Blue: 255');

      let redSlider = getByLabelText('Red', {selector: 'input'});
      expect(zSlider).toHaveAttribute('type', 'range');
      expect(zSlider).not.toHaveAttribute('aria-label');
      expect(zSlider).toBe(redSlider);
      expect(zSlider).toHaveAttribute('min', '0');
      expect(zSlider).toHaveAttribute('max', '255');
      expect(zSlider).toHaveAttribute('step', '1');
      expect(zSlider).toHaveAttribute('aria-valuetext', '255');
    });

    it('the slider is focusable', () => {
      let {getAllByRole} = render(<div>
        <button>A</button>
        <DefaultColorArea defaultValue={'#ff00ff'} />
        <button>B</button>
      </div>);
      let sliders = getAllByRole('slider');
      let [buttonA, buttonB] = getAllByRole('button');

      userEvent.tab();
      expect(document.activeElement).toBe(buttonA);
      userEvent.tab();
      expect(document.activeElement).toBe(sliders[0]);
      userEvent.tab();
      expect(document.activeElement).toBe(sliders[2]);
      userEvent.tab();
      expect(document.activeElement).toBe(buttonB);
      userEvent.tab({shift: true});
      expect(document.activeElement).toBe(sliders[2]);
    });
  });
});
