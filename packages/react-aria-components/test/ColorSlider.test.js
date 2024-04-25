/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ColorSlider, ColorSliderContext, ColorThumb, Label, SliderOutput, SliderTrack} from '../';
import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestColorSlider = ({sliderProps, thumbProps, trackProps, outputProps}) => (
  <ColorSlider defaultValue="rgb(255, 0, 0)" channel="red" {...sliderProps}>
    <Label />
    <SliderOutput {...outputProps} />
    <SliderTrack {...trackProps}>
      <ColorThumb {...thumbProps} />
    </SliderTrack>
  </ColorSlider>
);

let renderSlider = (sliderProps, thumbProps, trackProps, outputProps) => render(<TestColorSlider {...{sliderProps, thumbProps, trackProps, outputProps}} />);

describe('ColorSlider', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a slider with default class', () => {
    let {getByRole} = renderSlider();
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'react-aria-SliderTrack');
    expect(group.parentElement).toHaveAttribute('class', 'react-aria-ColorSlider');
    expect(group).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(group.getAttribute('aria-labelledby'))).toHaveTextContent('Red');
    expect(getByRole('status')).toHaveTextContent('255');
    expect(group.querySelector('.react-aria-ColorThumb')).toBeInTheDocument();
  });

  it('should render a slider with custom class', () => {
    let {getByRole} = renderSlider({className: 'test'});
    let group = getByRole('group');
    expect(group.parentElement).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = renderSlider({'data-foo': 'bar'}, {'data-bar': 'foo'}, {'data-test': 'test'}, {'data-output': 'output'});
    let slider = getByRole('group').parentElement;
    expect(slider).toHaveAttribute('data-foo', 'bar');
    expect(slider.querySelector('.react-aria-ColorThumb')).toHaveAttribute('data-bar', 'foo');
    expect(slider.querySelector('.react-aria-SliderTrack')).toHaveAttribute('data-test', 'test');
    expect(slider.querySelector('.react-aria-SliderOutput')).toHaveAttribute('data-output', 'output');
  });

  it('should support render props', () => {
    let {getByTestId} = render(
      <ColorSlider orientation="vertical" defaultValue="rgb(255, 0, 0)" channel="red">
        {({orientation}) => (
          <div className={`slider-${orientation}`} data-testid="wrapper">
            <Label />
            <SliderOutput />
            <SliderTrack>
              <ColorThumb />
            </SliderTrack>
          </div>
        )}
      </ColorSlider>
    );
    expect(getByTestId('wrapper')).toHaveClass('slider-vertical');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <ColorSliderContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestColorSlider sliderProps={{slot: 'test'}} />
      </ColorSliderContext.Provider>
    );

    let group = getByRole('group');
    expect(group.parentElement).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support focus ring', async () => {
    let {getByRole} = renderSlider({}, {className: ({isFocusVisible}) => `thumb ${isFocusVisible ? 'focus' : ''}`});
    let slider = getByRole('slider');
    let thumb = slider.closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-focus-visible');
    expect(thumb).not.toHaveClass('focus');

    await user.tab();
    expect(document.activeElement).toBe(slider);
    expect(thumb).toHaveAttribute('data-focus-visible', 'true');
    expect(thumb).toHaveClass('focus');

    await user.tab();
    expect(thumb).not.toHaveAttribute('data-focus-visible');
    expect(thumb).not.toHaveClass('focus');
  });

  it('should support dragging state', () => {
    let {getByRole} = renderSlider({}, {className: ({isDragging}) => `thumb ${isDragging ? 'dragging' : ''}`});
    let thumb = getByRole('slider').closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-dragging');
    expect(thumb).not.toHaveClass('dragging');

    fireEvent.mouseDown(thumb);
    expect(thumb).toHaveAttribute('data-dragging', 'true');
    expect(thumb).toHaveClass('dragging');

    fireEvent.mouseUp(thumb);
    expect(thumb).not.toHaveAttribute('data-dragging');
    expect(thumb).not.toHaveClass('dragging');
  });

  it('should support hover state', async () => {
    let hoverStartTrackSpy = jest.fn();
    let hoverChangeTrackSpy = jest.fn();
    let hoverEndTrackSpy = jest.fn();
    let hoverStartThumbSpy = jest.fn();
    let hoverChangeThumbSpy = jest.fn();
    let hoverEndThumbSpy = jest.fn();
    let {getByRole} = renderSlider({}, {className: ({isHovered}) => `thumb ${isHovered ? 'hovered' : ''}`, onHoverStart: hoverStartThumbSpy, onHoverChange: hoverChangeThumbSpy, onHoverEnd: hoverEndThumbSpy}, {className: ({isHovered}) => `track ${isHovered ? 'hovered' : ''}`, onHoverStart: hoverStartTrackSpy, onHoverChange: hoverChangeTrackSpy, onHoverEnd: hoverEndTrackSpy});
    let thumb = getByRole('slider').closest('.thumb');
    let track = getByRole('slider').closest('.track');

    expect(thumb).not.toHaveAttribute('data-hovered');
    expect(thumb).not.toHaveClass('hovered');
    expect(track).not.toHaveAttribute('data-hovered');
    expect(track).not.toHaveClass('hovered');

    await user.hover(thumb);
    expect(thumb).toHaveAttribute('data-hovered', 'true');
    expect(thumb).toHaveClass('hovered');
    expect(hoverStartThumbSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeThumbSpy).toHaveBeenCalledTimes(1);

    await user.unhover(thumb);
    expect(thumb).not.toHaveAttribute('data-hovered');
    expect(thumb).not.toHaveClass('hovered');
    expect(hoverEndThumbSpy).toHaveBeenCalledTimes(1);
    expect(hoverChangeThumbSpy).toHaveBeenCalledTimes(2);

    await user.hover(track);
    expect(track).toHaveAttribute('data-hovered', 'true');
    expect(track).toHaveClass('hovered');
    expect(hoverStartTrackSpy).toHaveBeenCalledTimes(2);
    expect(hoverChangeTrackSpy).toHaveBeenCalledTimes(3);

    await user.unhover(track);
    expect(track).not.toHaveAttribute('data-hovered');
    expect(track).not.toHaveClass('hovered');
    expect(hoverEndTrackSpy).toHaveBeenCalledTimes(2);
    expect(hoverChangeTrackSpy).toHaveBeenCalledTimes(4);
  });

  it('should support disabled state', () => {
    let {getByRole} = renderSlider({isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : ''}, {className: ({isDisabled}) => `thumb ${isDisabled ? 'disabled' : ''}`});
    let wrapper = getByRole('group').parentElement;
    let slider = getByRole('slider');
    let thumb = slider.closest('.thumb');

    expect(slider).toBeDisabled();
    expect(thumb).toHaveAttribute('data-disabled', 'true');
    expect(thumb).toHaveClass('disabled');

    expect(wrapper).toHaveAttribute('data-disabled', 'true');
    expect(wrapper).toHaveClass('disabled');
  });

  it('should support orientation', () => {
    let {getByRole} = renderSlider({orientation: 'vertical', className: ({orientation}) => orientation});
    let wrapper = getByRole('group').parentElement;
    let slider = getByRole('slider');

    expect(wrapper).toHaveAttribute('data-orientation', 'vertical');
    expect(wrapper).toHaveClass('vertical');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });
});
