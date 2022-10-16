import {AriaSliderProps, mergeProps, useFocusRing, useNumberFormatter, useSlider, useSliderThumb, VisuallyHidden} from 'react-aria';
import {AriaSliderThumbProps} from '@react-types/slider';
import {DOMAttributes, Orientation} from '@react-types/shared';
import {LabelContext} from './Label';
import {mergeRefs} from '@react-aria/utils';
import {Provider, RenderProps, useContextProps, useRenderProps, useSlot, WithRef} from './utils';
import React, {createContext, ForwardedRef, forwardRef, OutputHTMLAttributes, RefObject, useContext, useRef} from 'react';
import {SliderState, useSliderState} from 'react-stately';

export interface SliderProps extends AriaSliderProps, RenderProps<SliderState> {
  /**
   * The display format of the value label.
   */
   formatOptions?: Intl.NumberFormatOptions
}

interface SliderContextValue {
  state: SliderState,
  trackProps: DOMAttributes,
  outputProps: OutputHTMLAttributes<HTMLOutputElement>,
  trackRef: RefObject<HTMLDivElement>
}

export const SliderContext = createContext<WithRef<SliderProps, HTMLDivElement>>(null);
const InternalSliderContext = createContext<SliderContextValue>(null);

export interface SliderRenderProps {
  /**
   * The orientation of the slider.
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation,
  /**
   * Whether the slider is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

function Slider(props: SliderProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SliderContext);
  let trackRef = useRef(null);
  let numberFormatter = useNumberFormatter(props.formatOptions);
  let state = useSliderState({...props, numberFormatter});
  let [labelRef, label] = useSlot();
  let {
    groupProps,
    trackProps,
    labelProps,
    outputProps
  } = useSlider({...props, label}, state, trackRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-Slider'
  });

  return (
    <Provider
      values={[
        [InternalSliderContext, {state, trackProps, trackRef, outputProps}],
        [LabelContext, {...labelProps, ref: labelRef}]
      ]}>
      <div
        {...groupProps}
        {...renderProps}
        ref={ref}
        data-orientation={state.orientation}
        data-disabled={state.isDisabled || undefined} />
    </Provider>
  );
}

/**
 * A slider allows a user to select one or more values within a range.
 */
const _Slider = forwardRef(Slider);
export {_Slider as Slider};

export interface SliderOutputProps extends RenderProps<SliderState> {}

function SliderOutput({children, style, className}: SliderOutputProps, ref: ForwardedRef<HTMLOutputElement>) {
  let {state, outputProps} = useContext(InternalSliderContext);
  let renderProps = useRenderProps({
    className,
    style,
    children,
    defaultChildren: state.getThumbValueLabel(0),
    defaultClassName: 'react-aria-SliderOutput',
    values: state
  });

  return <output {...outputProps} {...renderProps} ref={ref} />;
}

/**
 * A slider output displays the current value of a slider as text.
 */
const _SliderOutput = forwardRef(SliderOutput);
export {_SliderOutput as SliderOutput};

export interface SliderTrackProps extends RenderProps<SliderState> {}

function SliderTrack({children, style, className}: SliderTrackProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state, trackProps, trackRef} = useContext(InternalSliderContext);
  let domRef = mergeRefs(ref, trackRef);
  let renderProps = useRenderProps({
    className,
    style,
    children,
    defaultClassName: 'react-aria-SliderTrack',
    values: state
  });

  return <div {...trackProps} {...renderProps} ref={domRef} />;
}

/**
 * A slider track is a container for one or more slider thumbs.
 */
const _SliderTrack = forwardRef(SliderTrack);
export {_SliderTrack as SliderTrack};

export interface SliderThumbRenderProps {
  /** The slider state object. */
  state: SliderState,
  /**
   * Whether this thumb is currently being dragged.
   * @selector [data-dragging]
   */
  isDragging: boolean,
  /**
   * Whether the thumb is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the thumb is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the thumb is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface SliderThumbProps extends AriaSliderThumbProps, RenderProps<SliderThumbRenderProps> {}

function SliderThumb(props: SliderThumbProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state, trackRef} = useContext(InternalSliderContext);
  let {index = 0} = props;
  let inputRef = useRef(null);
  let [labelRef, label] = useSlot();
  let {thumbProps, inputProps, labelProps, isDragging, isFocused, isDisabled} = useSliderThumb({
    index,
    trackRef,
    inputRef,
    label
  }, state);

  let {focusProps, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    children: props.children,
    defaultClassName: 'react-aria-SliderThumb',
    values: {state, isDragging, isFocused, isFocusVisible, isDisabled}
  });

  return (
    <div
      {...thumbProps}
      {...renderProps}
      ref={ref}
      style={{...thumbProps.style, ...renderProps.style}}
      data-dragging={isDragging || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}>
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A slider thumb represents an individual value that the user can adjust within a slider track.
 */
const _SliderThumb = forwardRef(SliderThumb);
export {_SliderThumb as SliderThumb};
