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

import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Label, Slider, SliderContext, SliderOutput, SliderThumb, SliderTrack} from '../';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

let TestSlider = ({sliderProps, thumbProps, trackProps, outputProps}) => (
  <Slider {...sliderProps}>
    <Label>Opacity</Label>
    <SliderOutput {...outputProps} />
    <SliderTrack {...trackProps}>
      <SliderThumb {...thumbProps} />
    </SliderTrack>
  </Slider>
);

let renderSlider = (sliderProps, thumbProps, trackProps, outputProps) => render(<TestSlider {...{sliderProps, thumbProps, trackProps, outputProps}} />);

describe('Slider', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should render a slider with default class', () => {
    let {getByRole} = renderSlider();
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'react-aria-Slider');
    expect(group).toHaveAttribute('aria-labelledby');
    expect(document.getElementById(group.getAttribute('aria-labelledby'))).toHaveTextContent('Opacity');
    expect(getByRole('status')).toHaveTextContent('0');
    expect(group.querySelector('.react-aria-SliderTrack')).toBeInTheDocument();
    expect(group.querySelector('.react-aria-SliderThumb')).toBeInTheDocument();
  });

  it('should render a slider with custom class', () => {
    let {getByRole} = renderSlider({className: 'test'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = renderSlider({'data-foo': 'bar'}, {'data-bar': 'foo'}, {'data-test': 'test'}, {'data-output': 'output'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-foo', 'bar');
    expect(group.querySelector('.react-aria-SliderThumb')).toHaveAttribute('data-bar', 'foo');
    expect(group.querySelector('.react-aria-SliderTrack')).toHaveAttribute('data-test', 'test');
    expect(group.querySelector('.react-aria-SliderOutput')).toHaveAttribute('data-output', 'output');
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
          {({state}) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
        </SliderOutput>
        <SliderTrack>
          {({state}) => state.values.map((_, i) => <SliderThumb key={i} index={i} />)}
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

  it('should support multiple thumbs (controlled)', async () => {
    function SliderClient() {
      const [value, setValue] = useState([30, 60]);
      return (<div>
        <Slider value={value} onChange={setValue}>
          <Label>Test</Label>
          <SliderOutput>
            {({state}) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
          </SliderOutput>
          <SliderTrack>
            {({state}) => state.values.map((_, i) => <SliderThumb key={i} index={i} className="thumb" />)}
          </SliderTrack>
        </Slider>
        <button data-testid="reset-button" onClick={() => setValue([0, 100])}>reset</button>
      </div>);
    }

    let {getAllByRole, getByTestId} = render(<SliderClient />);

    let sliders = getAllByRole('slider');
    
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveValue('30');
    expect(sliders[1]).toHaveValue('60');

    let resetButton = getByTestId('reset-button');
    await user.click(resetButton);
    expect(sliders[0]).toHaveValue('0');
    expect(sliders[1]).toHaveValue('100');

    await user.tab();  // body (because we've clicked the reset button?)
    await user.tab();
    expect(document.activeElement).toBe(sliders[0]);
    
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    expect(sliders[0]).toHaveValue('3');
    expect(sliders[1]).toHaveValue('100');

    await user.click(resetButton);
    expect(sliders[0]).toHaveValue('0');
    expect(sliders[1]).toHaveValue('100');

    await user.tab();  // body
    await user.tab();  // sliders[0]
    await user.tab();
    expect(document.activeElement).toBe(sliders[1]);
    
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    expect(sliders[0]).toHaveValue('0');
    expect(sliders[1]).toHaveValue('97');
  });

  it('should support clicking on the track to move the thumb', async () => {
    let onChange = jest.fn();
    let {getByRole} = renderSlider({onChange});
    let group = getByRole('group');
    let track = group.querySelector('.react-aria-SliderTrack');

    await user.pointer([{target: track, keys: '[MouseLeft]', coords: {x: 20}}]);
    expect(onChange).toHaveBeenCalled();
  });
});

it('should support input ref', () => {
  let inputRef = React.createRef();

  let {getByRole} = render(
    <Slider>
      <Label>Test</Label>
      <SliderOutput />
      <SliderTrack>
        <SliderThumb inputRef={inputRef} />
      </SliderTrack>
    </Slider>
  );

  let group = getByRole('group');
  let thumbInput = group.querySelector('input');
  expect(inputRef.current).toBe(thumbInput);
});
