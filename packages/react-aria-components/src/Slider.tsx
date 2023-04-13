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

import {AriaSliderProps, AriaSliderThumbProps, mergeProps, Orientation, useFocusRing, useHover, useNumberFormatter, useSlider, useSliderThumb, VisuallyHidden} from 'react-aria';
import {ContextValue, forwardRefType, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {DOMAttributes} from '@react-types/shared';
import {LabelContext} from './Label';
import {mergeRefs} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, OutputHTMLAttributes, RefObject, useContext, useRef} from 'react';
import {SliderState, useSliderState} from 'react-stately';

export interface SliderProps<T = number | number[]> extends AriaSliderProps<T>, RenderProps<SliderState>, SlotProps {
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

export const SliderContext = createContext<ContextValue<SliderProps, HTMLDivElement>>(null);
const InternalSliderContext = createContext<SliderContextValue | null>(null);

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

function Slider<T extends number | number[]>(props: SliderProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SliderContext);
  let trackRef = useRef<HTMLDivElement>(null);
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
        slot={props.slot}
        data-orientation={state.orientation}
        data-disabled={state.isDisabled || undefined} />
    </Provider>
  );
}

/**
 * A slider allows a user to select one or more values within a range.
 */
const _Slider = /*#__PURE__*/ (forwardRef as forwardRefType)(Slider);
export {_Slider as Slider};

export interface SliderOutputProps extends RenderProps<SliderState> {}

function SliderOutput({children, style, className}: SliderOutputProps, ref: ForwardedRef<HTMLOutputElement>) {
  let {state, outputProps} = useContext(InternalSliderContext)!;
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

function SliderTrack(props: SliderTrackProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state, trackProps, trackRef} = useContext(InternalSliderContext)!;
  let domRef = mergeRefs(ref, trackRef);
  let renderProps = useRenderProps({
    ...props,
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
   * Whether the thumb is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
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
  let {state, trackRef} = useContext(InternalSliderContext)!;
  let {index = 0} = props;
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let {thumbProps, inputProps, labelProps, isDragging, isFocused, isDisabled} = useSliderThumb({
    ...props,
    index,
    trackRef,
    inputRef,
    label
  }, state);

  let {focusProps, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SliderThumb',
    values: {state, isHovered, isDragging, isFocused, isFocusVisible, isDisabled}
  });

  return (
    <div
      {...mergeProps(thumbProps, hoverProps)}
      {...renderProps}
      ref={ref}
      style={{...thumbProps.style, ...renderProps.style}}
      data-hovered={isHovered || undefined}
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
