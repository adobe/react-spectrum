import {fireEvent, render, screen} from '@testing-library/react';
import * as React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useRef} from 'react';
import {useSlider} from '../src';
import {useSliderState} from '@react-stately/slider';

describe('useSlider', () => {
  describe('aria labels', () => {
    function renderUseSlider(sliderProps) {
      return renderHook(() => {
        let trackRef = useRef(null);
        let state = useSliderState(sliderProps);
        let props = useSlider(sliderProps, state, trackRef);
        return {state, props, trackRef};
      }).result;
    }

    it('should have the right labels when setting label', () => {
      let result = renderUseSlider({
        defaultValue: [0],
        label: 'Slider'
      });

      let {labelProps, containerProps} = result.current.props;

      expect(containerProps.role).toBe('group');
      expect(containerProps.id).toBe(labelProps.htmlFor);
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
    let widthStub;
    beforeAll(() => {
      widthStub = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 100);
    });
    afterAll(() => {
      widthStub.mockReset();
    });

    let stateRef = React.createRef();

    function Example(props) {
      let trackRef = useRef(null);
      let state = useSliderState(props);
      stateRef.current = state;
      let {trackProps} = useSlider(props, state, trackRef);
      return <div data-testid="track" ref={trackRef} {...trackProps} />;
    }

    it('should allow you to set value of closest thumb by clicking on track', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 20});
      fireEvent.mouseUp(track, {clientX: 20});

      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(stateRef.current.values).toEqual([20, 80]);

      track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 90});
      fireEvent.mouseUp(track, {clientX: 90});

      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 90]);
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([20, 90]);
      expect(stateRef.current.values).toEqual([20, 90]);
    });

    it('should allow you to set value of closest thumb by dragging on track', () => {
      let onChangeSpy = jest.fn();
      let onChangeEndSpy = jest.fn();
      render(<Example onChange={onChangeSpy} onChangeEnd={onChangeEndSpy} aria-label="Slider" defaultValue={[10, 80]} />);

      let track = screen.getByTestId('track');
      fireEvent.mouseDown(track, {clientX: 20});
      expect(onChangeSpy).toHaveBeenLastCalledWith([20, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([20, 80]);

      fireEvent.mouseMove(track, {clientX: 30});
      expect(onChangeSpy).toHaveBeenLastCalledWith([30, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([30, 80]);

      fireEvent.mouseMove(track, {clientX: 40});
      expect(onChangeSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(onChangeEndSpy).not.toHaveBeenCalled();
      expect(stateRef.current.values).toEqual([40, 80]);

      fireEvent.mouseUp(track, {clientX: 40});
      expect(onChangeEndSpy).toHaveBeenLastCalledWith([40, 80]);
      expect(stateRef.current.values).toEqual([40, 80]);
    });
  });
});
