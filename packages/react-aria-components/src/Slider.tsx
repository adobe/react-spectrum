import {AriaSliderProps, mergeProps, useFocusRing, useNumberFormatter, useSlider, useSliderThumb, VisuallyHidden} from 'react-aria';
import {AriaSliderThumbProps} from '@react-types/slider';
import {DOMAttributes} from '@react-types/shared';
import {DOMProps, Provider, RenderProps, useRenderProps, useSlot} from './utils';
import {LabelContext} from './Label';
import {mergeRefs} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, OutputHTMLAttributes, RefObject, useContext, useRef} from 'react';
import {SliderState, useSliderState} from 'react-stately';

interface SliderProps extends AriaSliderProps, DOMProps {
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

const InternalSliderContext = createContext<SliderContextValue>(null);

function Slider(props: SliderProps, ref: ForwardedRef<HTMLDivElement>) {
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

  return (
    <Provider
      values={[
        [InternalSliderContext, {state, trackProps, trackRef, outputProps}],
        [LabelContext, {...labelProps, ref: labelRef}]
      ]}>
      <div
        {...groupProps}
        ref={ref}
        style={props.style}
        className={props.className}>
        {props.children}
      </div>
    </Provider>
  );
}

const _Slider = forwardRef(Slider);
export {_Slider as Slider};

interface SliderOutputProps extends RenderProps<SliderState> {}

function SliderOutput({children, style, className}: SliderOutputProps, ref: ForwardedRef<HTMLOutputElement>) {
  let {state, outputProps} = useContext(InternalSliderContext);
  let renderProps = useRenderProps({
    className,
    style,
    children,
    defaultChildren: state.getThumbValueLabel(0),
    values: state
  });

  return <output {...outputProps} {...renderProps} ref={ref} />;
}

const _SliderOutput = forwardRef(SliderOutput);
export {_SliderOutput as SliderOutput};

interface SliderTrackProps extends RenderProps<SliderState> {}

function SliderTrack({children, style, className}: SliderTrackProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state, trackProps, trackRef} = useContext(InternalSliderContext);
  let domRef = mergeRefs(ref, trackRef);
  let renderProps = useRenderProps({
    className,
    style,
    children,
    values: state
  });

  return <div {...trackProps} {...renderProps} ref={domRef} />;
}

const _SliderTrack = forwardRef(SliderTrack);
export {_SliderTrack as SliderTrack};

interface ThumbRenderProps {
  state: SliderState,
  isDragging: boolean,
  isFocused: boolean,
  isDisabled: boolean,
  isFocusVisible: boolean
}

interface SliderThumbProps extends AriaSliderThumbProps, RenderProps<ThumbRenderProps> {}

function SliderThumb(props: SliderThumbProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state, trackRef} = useContext(InternalSliderContext);
  let {index = 0} = props;
  let inputRef = useRef(null);
  let [labelRef, hasLabel] = useSlot();
  let {thumbProps, inputProps, labelProps, isDragging, isFocused, isDisabled} = useSliderThumb({
    index,
    trackRef,
    inputRef,
    label: hasLabel ? 'd' : null
  }, state);

  let {focusProps, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    children: props.children,
    values: {state, isDragging, isFocused, isDisabled, isFocusVisible}
  });

  return (
    <div {...thumbProps} {...renderProps} ref={ref} style={{...thumbProps.style, ...renderProps.style}}>
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

const _SliderThumb = forwardRef(SliderThumb);
export {_SliderThumb as SliderThumb};
