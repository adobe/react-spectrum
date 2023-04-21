/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, render} from '@react-spectrum/test-utils';
import {Label, Slider, SliderContext, SliderOutput, SliderThumb, SliderTrack} from '../';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestSlider = ({sliderProps, thumbProps, trackProps}) => (
  <Slider {...sliderProps}>
    <Label>Opacity</Label>
    <SliderOutput />
    <SliderTrack {...trackProps}>
      <SliderThumb {...thumbProps} />
    </SliderTrack>
  </Slider>
);

let renderSlider = (sliderProps, thumbProps, trackProps) => render(<TestSlider {...{sliderProps, thumbProps, trackProps}} />);

describe('Slider', () => {
  it('should render a button with default class', () => {
    let {getByRole} = renderSlider();
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'react-aria-Slider');
    expect(group).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(group.getAttribute('aria-labelledby'))).toHaveTextContent('Opacity');
    expect(getByRole('status')).toHaveTextContent('0');
    expect(group.querySelector('.react-aria-SliderTrack')).toBeInTheDocument();
    expect(group.querySelector('.react-aria-SliderThumb')).toBeInTheDocument();
  });

  it('should render a button with custom class', () => {
    let {getByRole} = renderSlider({className: 'test'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = renderSlider({'data-foo': 'bar'}, {'data-bar': 'foo'}, {'data-test': 'test'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-foo', 'bar');
    expect(group.querySelector('.react-aria-SliderThumb')).toHaveAttribute('data-bar', 'foo');
    expect(group.querySelector('.react-aria-SliderTrack')).toHaveAttribute('data-test', 'test');
  });

  it('should support render props', () => {
    let {getByTestId} = render(
      <Slider orientation="vertical">
        {({orientation}) => (
          <div className={`slider-${orientation}`} data-testid="wrapper">
            <Label>Opacity</Label>
            <SliderOutput />
            <SliderTrack>
              <SliderThumb />
            </SliderTrack>
          </div>
        )}
      </Slider>
    );
    expect(getByTestId('wrapper')).toHaveClass('slider-vertical');
  });

  it('should support slot', () => {
    let {getByRole} = render(
      <SliderContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <TestSlider sliderProps={{slot: 'test'}} />
      </SliderContext.Provider>
    );

    let group = getByRole('group');
    expect(group).toHaveAttribute('slot', 'test');
    expect(group).toHaveAttribute('aria-label', 'test');
  });

  it('should support focus ring', () => {
    let {getByRole} = renderSlider({}, {className: ({isFocusVisible}) => `thumb ${isFocusVisible ? 'focus' : ''}`});
    let slider = getByRole('slider');
    let thumb = slider.closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-focus-visible');
    expect(thumb).not.toHaveClass('focus');

    userEvent.tab();
    expect(document.activeElement).toBe(slider);
    expect(thumb).toHaveAttribute('data-focus-visible', 'true');
    expect(thumb).toHaveClass('focus');

    userEvent.tab();
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

  it('should support hover state', () => {
    let {getByRole} = renderSlider({}, {className: ({isHovered}) => `thumb ${isHovered ? 'hovered' : ''}`});
    let thumb = getByRole('slider').closest('.thumb');

    expect(thumb).not.toHaveAttribute('data-hovered');
    expect(thumb).not.toHaveClass('hovered');

    userEvent.hover(thumb);
    expect(thumb).toHaveAttribute('data-hovered', 'true');
    expect(thumb).toHaveClass('hovered');

    userEvent.unhover(thumb);
    expect(thumb).not.toHaveAttribute('data-hovered');
    expect(thumb).not.toHaveClass('hovered');
  });

  it('should support disabled state', () => {
    let {getByRole} = renderSlider({isDisabled: true, className: ({isDisabled}) => isDisabled ? 'disabled' : ''}, {className: ({isDisabled}) => `thumb ${isDisabled ? 'disabled' : ''}`});
    let group = getByRole('group');
    let slider = getByRole('slider');
    let thumb = slider.closest('.thumb');

    expect(slider).toBeDisabled();
    expect(thumb).toHaveAttribute('data-disabled', 'true');
    expect(thumb).toHaveClass('disabled');

    expect(group).toHaveAttribute('data-disabled', 'true');
    expect(group).toHaveClass('disabled');
  });

  it('should support orientation', () => {
    let {getByRole} = renderSlider({orientation: 'vertical', className: ({orientation}) => orientation});
    let group = getByRole('group');
    let slider = getByRole('slider');

    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveClass('vertical');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should support multiple thumbs', () => {
    let {getByRole, getAllByRole} = render(
      <Slider defaultValue={[30, 60]}>
        <Label>Test</Label>
        <SliderOutput>
          {(state) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
        </SliderOutput>
        <SliderTrack>
          {(state) => state.values.map((_, i) => <SliderThumb key={i} index={i} />)}
        </SliderTrack>
      </Slider>
    );

    let sliders = getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveValue('30');
    expect(sliders[1]).toHaveValue('60');

    let output = getByRole('status');
    expect(output).toHaveTextContent('30 – 60');
  });
});
