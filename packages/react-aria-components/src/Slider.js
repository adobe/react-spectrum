import {useRef, createContext, useContext} from 'react';
import {useSliderState} from 'react-stately';
import {useNumberFormatter, useSlider, useSliderThumb, VisuallyHidden, mergeProps, useFocusRing} from 'react-aria';
import {LabelContext} from './Label';
import {Provider, useRenderProps} from './utils';

const SliderContext = createContext();

export function Slider(props) {
  let trackRef = useRef(null);
  let numberFormatter = useNumberFormatter(props.formatOptions);
  let state = useSliderState({ ...props, numberFormatter });
  let {
    groupProps,
    trackProps,
    labelProps,
    outputProps
  } = useSlider({...props, label: 'd'}, state, trackRef);

  return (
    <Provider
      values={[
        [SliderContext, {state, trackProps, trackRef, outputProps}],
        [LabelContext, labelProps]
      ]}>
      <div
        {...groupProps}
        style={props.style}
        className={props.className}>
        {props.children}
      </div>
    </Provider>
  );
}

export function Output({children, style, className}) {
  let {state, outputProps} = useContext(SliderContext);
  let renderProps = useRenderProps({
    className,
    style,
    children,
    defaultChildren: state.getThumbValueLabel(0),
    values: state,
  });

  return (
    <output {...outputProps} {...renderProps} />
  );
}

export function Track({children, style, className}) {
  let {trackProps, trackRef} = useContext(SliderContext);

  return (
    <div
      {...trackProps}
      ref={trackRef}
      style={style}
      className={className}>
      {children}
    </div>
  );
}

export function Thumb(props) {
  let {state, trackRef} = useContext(SliderContext);
  let { index = 0 } = props;
  let inputRef = useRef(null);
  let { thumbProps, inputProps, isDragging } = useSliderThumb({
    index,
    trackRef,
    inputRef
  }, state);

  let {focusProps, isFocusVisible} = useFocusRing();

  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    values: {state, isDragging, isFocusVisible},
  });

  return (
    <div {...thumbProps} {...renderProps} style={{...thumbProps.style, ...renderProps.style}}>
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
    </div>
  );
}
