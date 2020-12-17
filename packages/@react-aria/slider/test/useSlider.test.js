import {fireEvent, render, screen} from '@testing-library/react';
import {installMouseEvent, installPointerEvent} from '@react-spectrum/test-utils';
import * as React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useRef} from 'react';
import {useSlider, useSliderThumb} from '../src';
import {useSliderState} from '@react-stately/slider';

describe('useSlider', () => {
  let numberFormatter = new Intl.NumberFormat('en-US', {});
  describe('aria labels', () => {
    function renderUseSlider(sliderProps) {
      return renderHook(() => {
        let trackRef = useRef(null);
        let inputRef = useRef(null);
        let state = useSliderState({...sliderProps, numberFormatter});
        let props = useSlider(sliderProps, state, trackRef);
        let {inputProps} = useSliderThumb({
          index: 0,
          trackRef,
          inputRef
        }, state);
        return {state, props, trackRef, inputProps};
      }).result;
    }

    it('should have the right labels when setting label', () => {
      let result = renderUseSlider({
        defaultValue: [0],
        label: 'Slider'
      });

      let {props: {labelProps, containerProps}, inputProps} = result.current;

      expect(containerProps.role).toBe('group');
      expect(labelProps.htmlFor).toBe(inputProps.id);
    });

    it('should have the right labels when setting aria-label', () => {
      let result = renderUseSlider({
        defaultValue: [0],
        'aria-label': 'Slider'
      });

      let {labelProps, containerProps} = result.current.props;

      expect(labelProps).toEqual({});
      expect(containerProps.role).toBe('group');
      expect(containerProps['aria-label']).toBe('Slider');
    });
  });

  describe('interactions on track', () => {
    let widthStub, heightStub;
    beforeAll(() => {
      widthStub = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 100);
      heightStub = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 100);
    });
    afterAll(() => {
      widthStub.mockReset();
      heightStub.mockReset();
    });

    installMouseEvent();

    let stateRef = React.createRef();

    function Example(props) {
      let trackRef = useRef(null);
      let state = useSliderState({...props, numberFormatter});
      stateRef.current = state;
      let {trackProps} = useSlider(props, state, trackRef);
      return <div data-testid="track" ref={trackRef} {...trackProps} />;
    }

    it('should allow you to set value of closest thumb by clicking on track', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 20, pageX: 20});
      fireEvent.mouseUp(track, {clientX: 20, pageX: 20});

      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(stateRef.current.values).toEqual([20, 80]);

      track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 90, pageX: 90});
      fireEvent.mouseUp(track, {clientX: 90, pageX: 90});

      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 90]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([20, 90]);
      expect(stateRef.current.values).toEqual([20, 90]);
    });

    it('should allow you to set value of closest thumb by dragging on track', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 20, pageX: 20});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([20, 80]);

      fireEvent.mouseMove(track, {clientX: 30, pageX: 30});
      expect(onChangeSpy).toHaveBeenLastCalledWith([30, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([30, 80]);

      fireEvent.mouseMove(track, {clientX: 40, pageX: 40});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 80]);

      fireEvent.mouseUp(track, {clientX: 40, pageX: 40});
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(stateRef.current.values).toEqual([40, 80]);
    });

    it('should not allow you to set value if disabled', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} isDisabled />);

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 20, pageX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);

      fireEvent.mouseMove(track, {clientX: 30, pageX: 30});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);

      fireEvent.mouseUp(track, {clientX: 40, pageX: 40});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);
    });

    it('should allow you to set value of closest thumb by dragging on track (vertical)', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} orientation="vertical" />);

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientY: 80, pageY: 80});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([20, 80]);

      fireEvent.mouseMove(track, {clientY: 70, pageY: 70});
      expect(onChangeSpy).toHaveBeenLastCalledWith([30, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([30, 80]);

      fireEvent.mouseMove(track, {clientY: 60, pageY: 60});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 80]);

      fireEvent.mouseUp(track, {clientY: 60, pageY: 60});
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(stateRef.current.values).toEqual([40, 80]);
    });
  });

  describe('interactions on track using pointerEvents', () => {
    let widthStub;
    beforeAll(() => {
      widthStub = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 100);
    });
    afterAll(() => {
      widthStub.mockReset();
    });

    installPointerEvent();

    let stateRef = React.createRef();

    function Example(props) {
      let trackRef = useRef(null);
      let state = useSliderState({...props, numberFormatter});
      stateRef.current = state;
      let {trackProps} = useSlider(props, state, trackRef);
      return <div data-testid="track" ref={trackRef} {...trackProps} />;
    }

    it('should allow you to set value of closest thumb by clicking on track', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      let track = screen.getByTestId('track');
      fireEvent.pointerDown(track, {pageX: 20, clientX: 20});
      fireEvent.pointerUp(track, {pageX: 20, clientX: 20});

      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(stateRef.current.values).toEqual([20, 80]);

      track = screen.getByTestId('track');
      fireEvent.pointerDown(track, {pageX: 90, clientX: 90});
      fireEvent.pointerUp(track, {pageX: 90, clientX: 90});

      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 90]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([20, 90]);
      expect(stateRef.current.values).toEqual([20, 90]);
    });

    it('should allow you to set value of closest thumb by dragging on track', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();

      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      let track = screen.getByTestId('track');
      fireEvent.pointerDown(track, {pageX: 20, clientX: 20});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([20, 80]);

      fireEvent.pointerMove(track, {pageX: 30, clientX: 30});
      expect(onChangeSpy).toHaveBeenLastCalledWith([30, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([30, 80]);

      fireEvent.pointerMove(track, {pageX: 40, clientX: 40});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 80]);

      fireEvent.pointerUp(track, {pageX: 40, clientX: 40});
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(stateRef.current.values).toEqual([40, 80]);
    });

    it('should not allow you to set value if disabled', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} isDisabled />);

      let track = screen.getByTestId('track');
      fireEvent.pointerDown(track, {pageX: 20, clientX: 20});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);

      fireEvent.pointerMove(track, {pageX: 30, clientX: 30});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);

      fireEvent.pointerUp(track, {pageX: 40, clientX: 40});
      expect(onChangeSpy).not.toHaveBeenCalled();
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([10, 80]);
    });
  });
});
