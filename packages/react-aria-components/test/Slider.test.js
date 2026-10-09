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
import {Label} from '../src/Label';
import React, {useState} from 'react';
import {
  Slider,
  SliderContext,
  SliderFill,
  SliderMark,
  SliderOutput,
  SliderThumb,
  SliderTrack
} from '../src/Slider';
import userEvent from '@testing-library/user-event';

let TestSlider = ({sliderProps, thumbProps, trackProps, outputProps, fillProps}) => (
  <Slider {...sliderProps}>
    <Label>Opacity</Label>
    <SliderOutput {...outputProps} />
    <SliderTrack {...trackProps}>
      <SliderFill {...fillProps} />
      <SliderThumb {...thumbProps} />
    </SliderTrack>
  </Slider>
);

let renderSlider = (sliderProps, thumbProps, trackProps, outputProps) =>
  render(<TestSlider {...{sliderProps, thumbProps, trackProps, outputProps}} />);

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
    expect(document.getElementById(group.getAttribute('aria-labelledby'))).toHaveTextContent(
      'Opacity'
    );
    expect(getByRole('status')).toHaveTextContent('0');
    expect(group.querySelector('.react-aria-SliderTrack')).toBeInTheDocument();
    expect(group.querySelector('.react-aria-SliderThumb')).toBeInTheDocument();
    expect(group.querySelector('.react-aria-SliderFill')).toBeInTheDocument();
  });

  it('should render a slider with custom class', () => {
    let {getByRole} = renderSlider({className: 'test'});
    let group = getByRole('group');
    expect(group).toHaveAttribute('class', 'test');
  });

  it('should support DOM props', () => {
    let {getByRole} = renderSlider(
      {'data-foo': 'bar'},
      {'data-bar': 'foo'},
      {'data-test': 'test'},
      {'data-output': 'output'}
    );
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-foo', 'bar');
    expect(group.querySelector('.react-aria-SliderThumb')).toHaveAttribute('data-bar', 'foo');
    expect(group.querySelector('.react-aria-SliderTrack')).toHaveAttribute('data-test', 'test');
    expect(group.querySelector('.react-aria-SliderOutput')).toHaveAttribute(
      'data-output',
      'output'
    );
  });

  it('should support custom render function', () => {
    let {getByRole} = renderSlider(
      {render: props => <div {...props} data-custom="true" />},
      {render: props => <div {...props} data-custom="true" />},
      {render: props => <div {...props} data-custom="true" />},
      {render: props => <output {...props} data-custom="true" />}
    );
    let group = getByRole('group');
    expect(group).toHaveAttribute('data-custom', 'true');
    expect(group.querySelector('.react-aria-SliderThumb')).toHaveAttribute('data-custom', 'true');
    expect(group.querySelector('.react-aria-SliderTrack')).toHaveAttribute('data-custom', 'true');
    expect(group.querySelector('.react-aria-SliderOutput')).toHaveAttribute('data-custom', 'true');
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
    let {getByRole} = renderSlider(
      {},
      {className: ({isFocusVisible}) => `thumb ${isFocusVisible ? 'focus' : ''}`}
    );
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
    let {getByRole} = renderSlider(
      {},
      {className: ({isDragging}) => `thumb ${isDragging ? 'dragging' : ''}`}
    );
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
    let {getByRole} = renderSlider(
      {},
      {
        className: ({isHovered}) => `thumb ${isHovered ? 'hovered' : ''}`,
        onHoverStart: hoverStartThumbSpy,
        onHoverChange: hoverChangeThumbSpy,
        onHoverEnd: hoverEndThumbSpy
      },
      {
        className: ({isHovered}) => `track ${isHovered ? 'hovered' : ''}`,
        onHoverStart: hoverStartTrackSpy,
        onHoverChange: hoverChangeTrackSpy,
        onHoverEnd: hoverEndTrackSpy
      }
    );
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
    let {getByRole} = renderSlider(
      {isDisabled: true, className: ({isDisabled}) => (isDisabled ? 'disabled' : '')},
      {className: ({isDisabled}) => `thumb ${isDisabled ? 'disabled' : ''}`}
    );
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
    let {getByRole} = renderSlider({
      orientation: 'vertical',
      className: ({orientation}) => orientation
    });
    let group = getByRole('group');
    let slider = getByRole('slider');

    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveClass('vertical');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should support two thumbs', () => {
    let {getByRole, getAllByRole} = render(
      <Slider defaultValue={[30, 60]}>
        <Label>Test</Label>
        <SliderOutput />
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
    expect(output).toHaveTextContent('30–60');
  });

  it('should support three thumbs', () => {
    let {getByRole, getAllByRole} = render(
      <Slider defaultValue={[30, 60, 80]}>
        <Label>Test</Label>
        <SliderOutput />
        <SliderTrack>
          {({state}) => state.values.map((_, i) => <SliderThumb key={i} index={i} />)}
        </SliderTrack>
      </Slider>
    );

    let sliders = getAllByRole('slider');
    expect(sliders).toHaveLength(3);
    expect(sliders[0]).toHaveValue('30');
    expect(sliders[1]).toHaveValue('60');
    expect(sliders[2]).toHaveValue('80');

    let output = getByRole('status');
    expect(output).toHaveTextContent('30, 60, 80');
  });

  it('should support multiple thumbs (controlled)', async () => {
    function SliderClient() {
      const [value, setValue] = useState([30, 60]);
      return (
        <div>
          <Slider value={value} onChange={setValue}>
            <Label>Test</Label>
            <SliderOutput />
            <SliderTrack>
              {({state}) =>
                state.values.map((_, i) => <SliderThumb key={i} index={i} className="thumb" />)
              }
            </SliderTrack>
          </Slider>
          <button data-testid="reset-button" onClick={() => setValue([0, 100])}>
            reset
          </button>
        </div>
      );
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

    await user.tab(); // body (because we've clicked the reset button?)
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

    await user.tab(); // body
    await user.tab(); // sliders[0]
    await user.tab();
    expect(document.activeElement).toBe(sliders[1]);

    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowLeft}');
    expect(sliders[0]).toHaveValue('0');
    expect(sliders[1]).toHaveValue('97');
  });

  it('should support repeat keydown events when holding Page Up/Page Down', async () => {
    // Default pageSize for a 0-100 slider is 10.
    let {getByRole} = renderSlider({defaultValue: 20});

    let slider = getByRole('slider');
    await user.tab();
    expect(document.activeElement).toBe(slider);

    await user.keyboard('{PageUp>3/}');
    expect(slider).toHaveValue('50');

    await user.keyboard('{PageDown>3/}');
    expect(slider).toHaveValue('20');
  });

  it('should support clicking on the track to move the thumb', async () => {
    let onChange = jest.fn();
    let {getByRole} = renderSlider({onChange});
    let group = getByRole('group');
    let track = group.querySelector('.react-aria-SliderTrack');

    await user.pointer([{target: track, keys: '[MouseLeft]', coords: {x: 20}}]);
    expect(onChange).toHaveBeenCalled();
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

  it('should support form prop', () => {
    let {getByRole} = renderSlider({}, {form: 'test'});
    let input = getByRole('slider');
    expect(input).toHaveAttribute('form', 'test');
  });

  it('should support horizontal SliderFill', () => {
    let {getByRole} = render(<TestSlider sliderProps={{value: 30}} />);
    let group = getByRole('group');
    let fill = group.querySelector('.react-aria-SliderFill');
    expect(fill).toHaveAttribute('data-orientation', 'horizontal');
    expect(fill).toHaveStyle({
      position: 'absolute',
      insetInlineStart: '0%',
      width: '30%',
      height: '100%'
    });
  });

  it('should support horizontal SliderFill with offset', () => {
    let {getByRole, rerender} = render(
      <TestSlider sliderProps={{value: 30}} fillProps={{offset: 50}} />
    );
    let group = getByRole('group');
    let fill = group.querySelector('.react-aria-SliderFill');
    expect(fill).toHaveAttribute('data-orientation', 'horizontal');
    expect(fill).toHaveStyle({
      position: 'absolute',
      insetInlineStart: '30%',
      width: '20%',
      height: '100%'
    });

    rerender(<TestSlider sliderProps={{value: 80}} fillProps={{offset: 50}} />);
    expect(fill).toHaveStyle({
      position: 'absolute',
      insetInlineStart: '50%',
      width: '30%',
      height: '100%'
    });
  });

  it('should support vertical SliderFill', () => {
    let {getByRole} = render(<TestSlider sliderProps={{value: 30, orientation: 'vertical'}} />);
    let group = getByRole('group');
    let fill = group.querySelector('.react-aria-SliderFill');
    expect(fill).toHaveAttribute('data-orientation', 'vertical');
    expect(fill).toHaveStyle({position: 'absolute', bottom: '0%', height: '30%', width: '100%'});
  });

  it('should support vertical SliderFill with offset', () => {
    let {getByRole, rerender} = render(
      <TestSlider sliderProps={{value: 30, orientation: 'vertical'}} fillProps={{offset: 50}} />
    );
    let group = getByRole('group');
    let fill = group.querySelector('.react-aria-SliderFill');
    expect(fill).toHaveAttribute('data-orientation', 'vertical');
    expect(fill).toHaveStyle({position: 'absolute', bottom: '30%', height: '20%', width: '100%'});

    rerender(
      <TestSlider sliderProps={{value: 80, orientation: 'vertical'}} fillProps={{offset: 50}} />
    );
    expect(fill).toHaveStyle({position: 'absolute', bottom: '50%', height: '30%', width: '100%'});
  });

  describe('SliderMark', () => {
    let renderMarks = (sliderProps = {}, markProps, markValues = [0, 25, 50]) => {
      let values = [].concat(sliderProps.defaultValue ?? 0);
      return render(
        <Slider defaultValue={0} {...sliderProps}>
          <Label>Opacity</Label>
          <SliderTrack>
            {markValues.map(value => (
              <SliderMark key={value} value={value} {...markProps}>
                {value}
              </SliderMark>
            ))}
            {values.map((_, i) => (
              <SliderThumb key={i} index={i} aria-label={`thumb ${i}`} />
            ))}
          </SliderTrack>
        </Slider>
      );
    };

    it('should render marks positioned along the track', () => {
      let {getByRole} = renderMarks();
      let marks = getByRole('group').querySelectorAll('.react-aria-SliderMark');

      expect(marks).toHaveLength(3);
      expect(marks[1]).toHaveTextContent('25');
      expect(marks[1]).toHaveAttribute('data-orientation', 'horizontal');
      expect(marks[1]).toHaveStyle({
        position: 'absolute',
        left: '25%',
        transform: 'translate(-50%, -50%)'
      });
    });

    it('should position marks from the end when vertical', () => {
      let {getByRole} = renderMarks({orientation: 'vertical'});
      let marks = getByRole('group').querySelectorAll('.react-aria-SliderMark');

      expect(marks[1]).toHaveAttribute('data-orientation', 'vertical');
      expect(marks[1]).toHaveStyle({position: 'absolute', top: '75%'});
    });

    it('should support render props', () => {
      let {getByRole} = renderMarks(
        {},
        {className: ({value, isDisabled}) => `mark-${value} ${isDisabled ? 'disabled' : ''}`.trim()}
      );
      let marks = getByRole('group').querySelectorAll('[class^="mark-"]');

      expect(marks[1]).toHaveClass('mark-25');
    });

    it('should move the nearest thumb to the mark value when pressed', () => {
      let onChange = jest.fn();
      let onChangeEnd = jest.fn();
      let {getByRole} = renderMarks({onChange, onChangeEnd});
      let marks = getByRole('group').querySelectorAll('.react-aria-SliderMark');

      fireEvent.mouseDown(marks[2]);
      expect(getByRole('slider')).toHaveValue('50');
      expect(onChange).toHaveBeenCalledWith(50);
      expect(onChangeEnd).toHaveBeenCalledWith(50);
    });

    it('should not let the track handle a press on a mark', () => {
      let {getByRole} = renderMarks({}, {style: {width: 200}});
      let marks = getByRole('group').querySelectorAll('.react-aria-SliderMark');

      // The track has no layout in JSDOM, so if it handled the press the thumb would land on 0.
      fireEvent.mouseDown(marks[1]);
      expect(getByRole('slider')).toHaveValue('25');
    });

    it('should move the closest of multiple thumbs', () => {
      let {getAllByRole, getByRole} = renderMarks({defaultValue: [10, 80]});
      let marks = getByRole('group').querySelectorAll('.react-aria-SliderMark');
      let sliders = getAllByRole('slider');

      fireEvent.mouseDown(marks[2]);
      expect(sliders[0]).toHaveValue('10');
      expect(sliders[1]).toHaveValue('50');
    });

    it('should round a mark that is not a snap point to the nearest step', () => {
      let onChange = jest.fn();
      let {getByRole} = renderMarks({onChange, step: 5}, undefined, [12.5]);

      fireEvent.mouseDown(getByRole('group').querySelector('.react-aria-SliderMark'));
      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('should land exactly on a mark that is also a snap point', () => {
      let onChange = jest.fn();
      let {getByRole} = renderMarks({onChange, step: 5, snapPoints: [12.5]}, undefined, [12.5]);

      fireEvent.mouseDown(getByRole('group').querySelector('.react-aria-SliderMark'));
      expect(onChange).toHaveBeenCalledWith(12.5);
    });

    it('should do nothing when the slider is disabled', () => {
      let onChange = jest.fn();
      let {getByRole} = renderMarks({onChange, isDisabled: true});
      let marks = getByRole('group').querySelectorAll('.react-aria-SliderMark');

      expect(marks[1]).toHaveAttribute('data-disabled', 'true');
      fireEvent.mouseDown(marks[1]);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should support hover state', async () => {
      let onHoverChange = jest.fn();
      let {getByRole} = renderMarks(
        {},
        {onHoverChange, className: ({isHovered}) => (isHovered ? 'mark hovered' : 'mark')}
      );
      let mark = getByRole('group').querySelector('.mark');

      expect(mark).not.toHaveAttribute('data-hovered');

      await user.hover(mark);
      expect(mark).toHaveAttribute('data-hovered', 'true');
      expect(mark).toHaveClass('hovered');
      expect(onHoverChange).toHaveBeenCalledWith(true);

      await user.unhover(mark);
      expect(mark).not.toHaveAttribute('data-hovered');
    });
  });
});
