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

import {
  AriaSliderProps,
  AriaSliderThumbProps,
  useSlider,
  useSliderThumb
} from 'react-aria/useSlider';

import {clamp, snapValueToStep} from 'react-stately/private/utils/number';
import {
  ClassNameOrFunction,
  ContextValue,
  DEFAULT_SLOT,
  dom,
  Provider,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps,
  useSlot,
  useSlottedContext,
  WithRef
} from './utils';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRefType, GlobalDOMAttributes, RefObject} from '@react-types/shared';
import {
  getActiveElement,
  getEventTarget,
  nodeContains
} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {GroupContext} from './Group';
import {HoverEvents, Orientation} from '@react-types/shared';
import {LabelContext} from './Label';
import {mergeProps} from 'react-aria/mergeProps';
import {NumberFieldContext, NumberFieldProps} from './NumberField';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  OutputHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {SliderState, useSliderState} from 'react-stately/useSliderState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useNumberFormatter} from 'react-aria/useNumberFormatter';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface SliderProps<T = number | number[]>
  extends
    Omit<AriaSliderProps<T>, 'label'>,
    RenderProps<SliderRenderProps>,
    SlotProps,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Slider'
   */
  className?: ClassNameOrFunction<SliderRenderProps>;
  /**
   * The display format of the value label.
   */
  formatOptions?: Intl.NumberFormatOptions;
}

export const SliderContext = createContext<ContextValue<SliderProps, HTMLDivElement>>(null);
export const SliderStateContext = createContext<SliderState | null>(null);
export const SliderTrackContext =
  createContext<ContextValue<SliderTrackContextValue, HTMLDivElement>>(null);
// useSliderState tracks per-thumb editability in a ref, so toggling SliderThumb's isDisabled
// wouldn't re-render Slider to update NumberFieldContext. Report it here instead.
const SliderThumbDisabledContext = createContext<
  ((index: number, isDisabled: boolean) => void) | null
>(null);
export const SliderFillContext = createContext<ContextValue<SliderFillProps, HTMLDivElement>>(null);
export const SliderOutputContext =
  createContext<ContextValue<SliderOutputContextValue, HTMLOutputElement>>(null);

export interface SliderRenderProps {
  /**
   * The orientation of the slider.
   *
   * @selector [data-orientation="horizontal | vertical"]
   */
  orientation: Orientation;
  /**
   * Whether the slider is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * State of the slider.
   */
  state: SliderState;
}

/**
 * A slider allows a user to select one or more values within a range.
 */
export const Slider = /*#__PURE__*/ (forwardRef as forwardRefType)(function Slider<
  T extends number | number[]
>(props: SliderProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SliderContext);
  let trackRef = useRef<HTMLDivElement>(null);
  let numberFieldRefs = useRef<(HTMLDivElement | null)[]>([]);
  let isResettingRef = useRef(false);
  let [disabledThumbs, setDisabledThumbs] = useState<Record<number, boolean>>({});
  let setThumbDisabled = useCallback((index: number, isDisabled: boolean) => {
    setDisabledThumbs(current =>
      Boolean(current[index]) === isDisabled ? current : {...current, [index]: isDisabled}
    );
  }, []);
  let {direction} = useLocale();
  let numberFormatter = useNumberFormatter(props.formatOptions);
  let state = useSliderState({...props, numberFormatter});
  let [labelRef, label] = useSlot(!props['aria-label'] && !props['aria-labelledby']);
  let {groupProps, trackProps, labelProps, outputProps} = useSlider(
    {...props, label},
    state,
    trackRef
  );

  // SliderThumb already handles form reset for each thumb. Ignore NumberField's own form reset
  // handler so it doesn't duplicate updates or fire onChangeEnd on reset.
  useEffect(() => {
    let form = trackRef.current?.closest('form');
    if (!form) {
      return;
    }
    let onReset = () => {
      isResettingRef.current = true;
      queueMicrotask(() => {
        isResettingRef.current = false;
      });
    };
    // oxlint-disable-next-line rsp-rules/no-non-composing-event-listener
    form.addEventListener('reset', onReset, true);
    return () => {
      form.removeEventListener('reset', onReset, true);
    };
  }, []);

  let renderProps = useRenderProps({
    ...props,
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      state
    },
    defaultClassName: 'react-aria-Slider'
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  // Props for a NumberField bound to the thumb at the given index. The NumberField displays and
  // edits that thumb's value, and its constraints mirror the thumb's (neighboring thumbs in a range
  // slider limit its min/max).
  let getNumberFieldProps = (index: number): WithRef<NumberFieldProps, HTMLDivElement> => ({
    ref: el => {
      numberFieldRefs.current[index] = el;
    },
    minValue: state.getThumbMinValue(index),
    maxValue: state.getThumbMaxValue(index),
    step: state.step,
    formatOptions: props.formatOptions,
    value: state.values[index],
    // A thumb can be individually disabled via SliderThumb's isDisabled.
    isDisabled: state.isDisabled || Boolean(disabledThumbs[index]),
    // Label the NumberField with the slider's labelling ids (its Label and any aria-labelledby
    // passed to the Slider), falling back to the slider group's id (e.g. aria-label only).
    'aria-labelledby': groupProps['aria-labelledby'] || groupProps.id,
    'aria-describedby': props['aria-describedby'],
    'aria-details': props['aria-details'],
    // In a range slider, the inputs behave like one continuous text field: pressing the arrow
    // key in the reading direction at the end of one input's text moves the caret into the next
    // enabled input, and vice versa at the start.
    onKeyDown(e) {
      if (
        state.values.length <= 1 ||
        e.nativeEvent.isComposing ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      let target = getEventTarget(e) as Element;
      if (target.tagName !== 'INPUT') {
        return;
      }
      let input = target as HTMLInputElement;

      let nextKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      let prevKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      if (
        e.key === nextKey &&
        index < state.values.length - 1 &&
        input.selectionStart === input.value.length &&
        input.selectionEnd === input.value.length
      ) {
        for (let next = index + 1; next < state.values.length; next++) {
          let nextInput = numberFieldRefs.current[next]?.querySelector('input');
          if (nextInput && !nextInput.disabled) {
            e.preventDefault();
            nextInput.focus();
            nextInput.setSelectionRange(0, 0);
            break;
          }
        }
      } else if (
        e.key === prevKey &&
        index > 0 &&
        input.selectionStart === 0 &&
        input.selectionEnd === 0
      ) {
        for (let prev = index - 1; prev >= 0; prev--) {
          let prevInput = numberFieldRefs.current[prev]?.querySelector('input');
          if (prevInput && !prevInput.disabled) {
            e.preventDefault();
            prevInput.focus();
            prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
            break;
          }
        }
      }
    },
    onChange(val) {
      // NumberField emits NaN when its input is cleared, and also fires onChange on form reset
      // (already handled by SliderThumb). Ignore both, and skip committing values that snap to
      // the thumb's current value so no redundant onChange/onChangeEnd fires.
      if (
        isResettingRef.current ||
        Number.isNaN(val) ||
        snapValueToStep(
          val,
          state.getThumbMinValue(index),
          state.getThumbMaxValue(index),
          state.step
        ) === state.getThumbValue(index)
      ) {
        return;
      }

      // A committed text value is a complete interaction, so wrap it in a drag start/end. Slider
      // state only fires onChangeEnd when a thumb stops dragging, so this makes typed values fire
      // onChangeEnd just like a keyboard or pointer interaction on the thumb.
      state.setThumbDragging(index, true);
      state.setThumbValue(index, val);
      state.setThumbDragging(index, false);
    }
  });

  // Only NumberFields with an explicit thumb index slot (e.g. slot="0", slot="1") are bound to the
  // slider. NumberFields without a slot keep their own state, so a slider can contain unrelated
  // NumberFields.
  let numberFieldContext = {
    slots: {
      [DEFAULT_SLOT]: {},
      ...Object.fromEntries(
        state.values.map((_, index) => [String(index), getNumberFieldProps(index)])
      )
    }
  };

  // When the user presses the track while a bound NumberField has uncommitted text, blur the
  // input first so the text is committed before the track press starts a drag. Otherwise the
  // commit (which toggles thumb dragging in onChange above) would happen mid-drag, ending the
  // gesture and firing onChangeEnd early.
  function onTrackPress(e: React.PointerEvent<HTMLDivElement>) {
    if (
      state.isDisabled ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      !nodeContains(trackRef.current, getEventTarget(e))
    ) {
      return;
    }

    // Commit pending text before the track handles the press and starts dragging.
    let active = getActiveElement(e.currentTarget.ownerDocument);
    if (
      active?.tagName === 'INPUT' &&
      numberFieldRefs.current.some(field => nodeContains(field, active))
    ) {
      (active as HTMLInputElement).blur();
    }
  }

  return (
    <Provider
      values={[
        [SliderStateContext, state],
        [SliderTrackContext, {...trackProps, ref: trackRef}],
        [SliderThumbDisabledContext, setThumbDisabled],
        [SliderOutputContext, outputProps],
        [LabelContext, {...labelProps, ref: labelRef}],
        // Lets a Group inside the slider (e.g. wrapping range inputs) inherit the disabled state.
        [GroupContext, {isDisabled: state.isDisabled}],
        [NumberFieldContext, numberFieldContext]
      ]}>
      <dom.div
        {...mergeProps(DOMProps, renderProps, groupProps, {
          // Capture phase so this runs before the track's own press handling.
          onPointerDownCapture: onTrackPress
        })}
        ref={ref}
        slot={props.slot || undefined}
        data-orientation={state.orientation}
        data-disabled={state.isDisabled || undefined}
      />
    </Provider>
  );
});

export interface SliderOutputProps
  extends RenderProps<SliderRenderProps, 'output'>, GlobalDOMAttributes<HTMLOutputElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SliderOutput'
   */
  className?: ClassNameOrFunction<SliderRenderProps>;
}
interface SliderOutputContextValue
  extends
    Omit<OutputHTMLAttributes<HTMLOutputElement>, 'children' | 'className' | 'style'>,
    SliderOutputProps {}

/**
 * A slider output displays the current value of a slider as text.
 */
export const SliderOutput = /*#__PURE__*/ (forwardRef as forwardRefType)(function SliderOutput(
  props: SliderOutputProps,
  ref: ForwardedRef<HTMLOutputElement>
) {
  [props, ref] = useContextProps(props, ref, SliderOutputContext);
  let {children, style, className, render, ...otherProps} = props;
  let state = useContext(SliderStateContext)!;
  let renderProps = useRenderProps({
    className,
    style,
    children,
    render,
    defaultChildren: state.getFormattedValue(),
    defaultClassName: 'react-aria-SliderOutput',
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      state
    }
  });

  return (
    <dom.output
      {...otherProps}
      {...renderProps}
      ref={ref}
      data-orientation={state.orientation || undefined}
      data-disabled={state.isDisabled || undefined}
    />
  );
});

export interface SliderTrackRenderProps extends SliderRenderProps {
  /**
   * Whether the slider track is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
}

export interface SliderTrackProps
  extends HoverEvents, RenderProps<SliderTrackRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SliderTrack'
   */
  className?: ClassNameOrFunction<SliderTrackRenderProps>;
}
interface SliderTrackContextValue
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'>,
    SliderTrackProps {}

/**
 * A slider track is a container for one or more slider thumbs.
 */
export const SliderTrack = /*#__PURE__*/ (forwardRef as forwardRefType)(function SliderTrack(
  props: SliderTrackProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, SliderTrackContext);
  let state = useContext(SliderStateContext)!;
  let {onHoverStart, onHoverEnd, onHoverChange, ...otherProps} = props;
  let {hoverProps, isHovered} = useHover({onHoverStart, onHoverEnd, onHoverChange});
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SliderTrack',
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      isHovered,
      state
    }
  });

  return (
    <dom.div
      {...mergeProps(otherProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-orientation={state.orientation || undefined}
      data-disabled={state.isDisabled || undefined}
    />
  );
});

export interface SliderThumbRenderProps {
  /**
   * State of the slider.
   */
  state: SliderState;
  /**
   * Whether this thumb is currently being dragged.
   *
   * @selector [data-dragging]
   */
  isDragging: boolean;
  /**
   * Whether the thumb is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the thumb is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the thumb is keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the thumb is disabled.
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
}

export interface SliderThumbProps
  extends
    Omit<AriaSliderThumbProps, 'label' | 'validationState'>,
    HoverEvents,
    RenderProps<SliderThumbRenderProps>,
    GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SliderThumb'
   */
  className?: ClassNameOrFunction<SliderThumbRenderProps>;
  /**
   * A ref for the HTML input element.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
}

/**
 * A slider thumb represents an individual value that the user can adjust within a slider track.
 */
export const SliderThumb = /*#__PURE__*/ (forwardRef as forwardRefType)(function SliderThumb(
  props: SliderThumbProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {inputRef: userInputRef = null} = props;
  let state = useContext(SliderStateContext)!;
  let setThumbDisabled = useContext(SliderThumbDisabledContext);
  let {ref: trackRef} = useSlottedContext(SliderTrackContext)!;
  let {index = 0} = props;
  useLayoutEffect(() => {
    if (props.isDisabled && setThumbDisabled) {
      setThumbDisabled(index, true);
      return () => setThumbDisabled(index, false);
    }
  }, [index, props.isDisabled, setThumbDisabled]);
  let defaultInputRef = useRef<HTMLInputElement>(null);
  let inputRef = userInputRef || defaultInputRef;
  let [labelRef, label] = useSlot(!props['aria-label'] && !props['aria-labelledby']);
  let {thumbProps, inputProps, labelProps, isDragging, isFocused, isDisabled} = useSliderThumb(
    {
      ...props,
      index,
      trackRef: trackRef as RefObject<HTMLDivElement | null>,
      inputRef,
      label
    },
    state
  );

  let {focusProps, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover(props);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SliderThumb',
    values: {
      state,
      isHovered,
      isDragging,
      isFocused,
      isFocusVisible,
      isDisabled
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});
  delete DOMProps.id;

  return (
    <dom.div
      {...mergeProps(DOMProps, thumbProps, hoverProps)}
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
      <Provider values={[[LabelContext, {...labelProps, ref: labelRef}]]}>
        {renderProps.children}
      </Provider>
    </dom.div>
  );
});

export interface SliderFillRenderProps extends SliderRenderProps {
  /**
   * Whether the slider fill is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
}

export interface SliderFillProps
  extends HoverEvents, RenderProps<SliderFillRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The offset from which to start the fill.
   *
   * @default 0
   */
  offset?: number;
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SliderFill'
   */
  className?: ClassNameOrFunction<SliderFillRenderProps>;
}

/**
 * Displays the selected range.
 */
export const SliderFill = /*#__PURE__*/ (forwardRef as forwardRefType)(function SliderFill(
  props: SliderFillProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, SliderFillContext);
  let state = useContext(SliderStateContext)!;
  let {onHoverStart, onHoverEnd, onHoverChange, ...otherProps} = props;
  let {hoverProps, isHovered} = useHover({onHoverStart, onHoverEnd, onHoverChange});

  let offset =
    props.offset != null
      ? clamp(props.offset, state.getThumbMinValue(0), state.getThumbMaxValue(0))
      : state.getThumbMinValue(0);
  let start =
    state.values.length > 1 ? state.getThumbPercent(0) * 100 : state.getValuePercent(offset) * 100;
  let end = state.values.length > 0 ? state.getThumbPercent(state.values.length - 1) * 100 : 0;
  let startPercent = Math.min(start, end);
  let endPercent = Math.max(start, end);
  let sizePercent = Math.max(0, endPercent - startPercent);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SliderFill',
    defaultStyle:
      state.orientation === 'vertical'
        ? {
            position: 'absolute',
            bottom: `${startPercent}%`,
            height: `${sizePercent}%`,
            width: '100%'
          }
        : {
            position: 'absolute',
            insetInlineStart: `${startPercent}%`,
            width: `${sizePercent}%`,
            height: '100%'
          },
    values: {
      orientation: state.orientation,
      isDisabled: state.isDisabled,
      isHovered,
      state
    }
  });

  return (
    <dom.div
      {...mergeProps(otherProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-orientation={state.orientation || undefined}
      data-disabled={state.isDisabled || undefined}
    />
  );
});
