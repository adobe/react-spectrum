import {fireEvent, render, screen} from '@testing-library/react';
import * as React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useRef} from 'react';
import {useSlider, useSliderThumb} from '../src';
import {useSliderState} from '@react-stately/slider';

describe('useSliderThumb', () => {
  describe('aria labels', () => {
    it('should have the right labels with Slider-level label', () => {
      let result = renderHook(() => {
        let trackRef = React.createRef(null);
        let inputRef = React.createRef(null);
        let sliderProps = {
          label: 'slider',
          defaultValue: [50],
          minValue: 10,
          maxValue: 200,
          step: 2
        };
        let state = useSliderState(sliderProps);
        let {labelProps, containerProps} = useSlider(sliderProps, state, trackRef);
        let props = useSliderThumb({
          index: 0,
          trackRef,
          inputRef
        }, state);
        return {props, labelProps, containerProps};
      }).result;

      let {inputProps} = result.current.props;
      let labelId = result.current.labelProps.id;
      expect(inputProps).toMatchObject({type: 'range', step: 2, value: 50, min: 10, max: 200, 'aria-labelledby': `${labelId}`});
    });
    it('should have the right labels with Slider thumb label', () => {
      let result = renderHook(() => {
        let trackRef = React.createRef(null);
        let inputRef = React.createRef(null);
        let sliderProps = {
          'aria-label': 'slider',
          defaultValue: [50],
          minValue: 10,
          maxValue: 200,
          step: 2
        };
        let state = useSliderState(sliderProps);
        let {labelProps, containerProps} = useSlider(sliderProps, state, trackRef);
        let props = useSliderThumb({
          index: 0,
          label: 'thumb',
          trackRef,
          inputRef
        }, state);
        return {props, labelProps, containerProps};
      }).result;

      let {inputProps, labelProps} = result.current.props;
      let labelId = result.current.containerProps.id;
      expect(inputProps).toMatchObject({type: 'range', step: 2, value: 50, min: 10, max: 200, 'aria-labelledby': `${labelId} ${labelProps.id}`, id: labelProps.htmlFor});
    });
    it('should have the right labels with Slider thumb aria-label', () => {
      let result = renderHook(() => {
        let trackRef = React.createRef(null);
        let inputRef = React.createRef(null);
        let sliderProps = {
          'aria-label': 'slider',
          defaultValue: [50, 70],
          minValue: 10,
          maxValue: 200,
          step: 2
        };
        let state = useSliderState(sliderProps);
        let {labelProps, containerProps} = useSlider(sliderProps, state, trackRef);
        let props0 = useSliderThumb({
          index: 0,
          'aria-label': 'thumb0',
          trackRef,
          inputRef
        }, state);
        let props1 = useSliderThumb({
          index: 1,
          'aria-label': 'thumb1',
          trackRef,
          inputRef
        }, state);
        return {props0, props1, labelProps, containerProps};
      }).result;

      let {inputProps: inputProps0} = result.current.props0;
      let {inputProps: inputProps1} = result.current.props1;
      let labelId = result.current.containerProps.id;
      expect(inputProps0).toMatchObject({type: 'range', step: 2, value: 50, min: 10, max: 70, 'aria-labelledby': `${labelId} ${inputProps0.id}`});
      expect(inputProps1).toMatchObject({type: 'range', step: 2, value: 70, min: 50, max: 200, 'aria-labelledby': `${labelId} ${inputProps1.id}`});
    });
  });

  describe('interactions on thumbs', () => {
    let widthStub;
    beforeAll(() => {
      widthStub = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 100);
    });
    afterAll(() => {
      widthStub.mockReset();
    });

    let stateRef = React.createRef();

    function RangeExample(props) {
      let trackRef = useRef(null);
      let input0Ref = useRef(null);
      let input1Ref = useRef(null);
      let state = useSliderState(props);
      stateRef.current = state;
      let {trackProps, thumbProps: commonThumbProps} = useSlider(props, state, trackRef);
      let {inputProps: input0Props, thumbProps: thumb0Props} = useSliderThumb({
        ...commonThumbProps,
        'aria-label': 'Min',
        index: 0,
        trackRef,
        inputRef: input0Ref
      }, state);
      let {inputProps: input1Props, thumbProps: thumb1Props} = useSliderThumb({
        ...commonThumbProps,
        'aria-label': 'Max',
        index: 1,
        trackRef,
        inputRef: input1Ref
      }, state);
      return (
        <div data-testid="track" ref={trackRef} {...trackProps}>
          <div data-testid="thumb0" {...thumb0Props}>
            <input {...input0Props} />
          </div>
          <div data-testid="thumb1" {...thumb1Props}>
            <input {...input1Props} />
          </div>
        </div>
      );
    }

    it('can be moved by dragging', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<RangeExample onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      // Drag thumb0
      let thumb0 = screen.getByTestId('thumb0');
      fireEvent.mouseDown(thumb0, {clientX: 10});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);

      fireEvent.mouseMove(thumb0, {clientX: 20});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([20, 80]);

      fireEvent.mouseMove(thumb0, {clientX: 30});
      expect(onChangeSpy).toHaveBeenLastCalledWith([30, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([30, 80]);

      fireEvent.mouseUp(thumb0, {clientX: 40});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(stateRef.current.values).toEqual([40, 80]);

      onChangeSpy.mockClear();
      onChangeEndSpy.mockClear();

      // Drag thumb1 past thumb0
      let thumb1 = screen.getByTestId('thumb1');
      fireEvent.mouseDown(thumb1, {clientX: 80});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 80]);

      fireEvent.mouseMove(thumb1, {clientX: 60});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 60]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 60]);

      fireEvent.mouseMove(thumb1, {clientX: 30});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 40]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 40]);

      fireEvent.mouseUp(thumb1, {clientX: 30});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 40]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([40, 40]);
      expect(stateRef.current.values).toEqual([40, 40]);
    });
  });
});
