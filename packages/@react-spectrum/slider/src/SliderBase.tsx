/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, Direction, DOMRef, LabelableProps, LabelPosition, Orientation} from '@react-types/shared';
import {classNames, useDOMRef} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
import React, {CSSProperties, HTMLAttributes, MutableRefObject, ReactNode, ReactNodeArray, useRef} from 'react';
import {SliderProps, SpectrumSliderTicksBase} from '@react-types/slider';
import {SliderState, useSliderState} from '@react-stately/slider';
import styles from '@adobe/spectrum-css-temp/components/slider/vars.css';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useSlider, useSliderThumb} from '@react-aria/slider';

/**
 * Convert a number 0-1 into a CSS percentage value, mirroring it for rtl.
 */
export function toPercent(value: number, direction: Direction = 'ltr'): string {
  if (direction === 'rtl') {
    value = 1 - value;
  }
  return `${value * 100}%`;
}

export interface UseSliderBaseContainerProps extends AriaLabelingProps, LabelableProps {
  state: SliderState,
  trackRef: MutableRefObject<undefined>,
  hoverProps: HTMLAttributes<HTMLElement>,
  isDisabled?: boolean,
  orientation?: Orientation,
  labelPosition?: LabelPosition,
  showValueLabel?: boolean,
  valueLabel?: ReactNode,
  containerProps: HTMLAttributes<HTMLElement>,
  trackProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>,
  direction: Direction
}

export interface UseSliderBaseInputProps extends Omit<SliderProps, 'direction'>, SpectrumSliderTicksBase {
  orientation?: Orientation,
  labelPosition?: LabelPosition,
  showValueLabel?: boolean,
  valueLabel?: ReactNode
}

export interface UseSliderBaseOutputProps extends UseSliderBaseContainerProps {
  inputRefs: MutableRefObject<undefined>[],
  thumbProps: HTMLAttributes<HTMLElement>[],
  inputProps: HTMLAttributes<HTMLElement>[],
  isHovered: boolean,
  ticks: ReactNode
}

/** Count mustn't change during the lifetime! */
export function useSliderBase(count: number, props: UseSliderBaseInputProps): UseSliderBaseOutputProps {
  props = useProviderProps(props);
  let inputRefs = [];
  let thumbProps = [];
  let inputProps = [];

  // TODO the two handles on the range slider should have individual hover effects
  let {hoverProps, isHovered} = useHover({/* isDisabled */ });

  // Assumes that DEFAULT_MIN_VALUE and DEFAULT_MAX_VALUE are both positive, this value needs to be passed to useSliderState, so
  // getThumbMinValue/getThumbMaxValue cannot be used here.
  // `Math.abs(Math.sign(a) - Math.sign(b)) === 2` is true if the values have a different sign and neither is null.
  let alwaysDisplaySign = props.minValue != null && props.maxValue != null && Math.abs(Math.sign(props.minValue) - Math.sign(props.maxValue)) === 2;

  if (alwaysDisplaySign) {
    if (props.formatOptions != null) {
      if (!('signDisplay' in props.formatOptions)) {
        // @ts-ignore
        props.formatOptions.signDisplay = 'exceptZero';
      }
    } else {
      // @ts-ignore
      props.formatOptions = {signDisplay: 'exceptZero'};
    }
  }

  let state = useSliderState(props);

  let {direction} = useLocale();

  let trackRef = useRef();
  let {
    containerProps,
    trackProps,
    labelProps
  } = useSlider({...props, direction}, state, trackRef);

  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    inputRefs[i] = useRef();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let v = useSliderThumb({
      index: i,
      isReadOnly: props.isReadOnly,
      isDisabled: props.isDisabled,
      trackRef,
      inputRef: inputRefs[i],
      direction
    }, state);

    inputProps[i] = v.inputProps;
    thumbProps[i] = v.thumbProps;
    // TODO do we want to use the thumb's labelProps?
  }

  let {tickCount, showTickLabels, tickLabels, isDisabled} = props;

  let ticks = null;
  if (tickCount > 0) {
    let tickList = [];
    for (let i = 0; i < tickCount; i++) {
      let tickLabel = tickLabels ? tickLabels[i] : state.getFormattedValue(state.getPercentValue(i / (tickCount - 1)));
      tickList.push(
        <div className={classNames(styles, 'spectrum-Slider-tick')} key={i}>
          {showTickLabels &&
            <div className={classNames(styles, 'spectrum-Slider-tickLabel')}>
              {tickLabel}
            </div>
          }
        </div>
      );
    }
    ticks = (<div className={classNames(styles, 'spectrum-Slider-ticks')}>
      {tickList}
    </div>);
  }

  return {
    ticks,
    inputRefs, thumbProps, inputProps, trackRef, state,
    containerProps, trackProps, labelProps, direction,
    hoverProps, isHovered, isDisabled,
    label: props.label,
    showValueLabel: props.showValueLabel,
    labelPosition: props.labelPosition,
    orientation: props.orientation,
    valueLabel: props.valueLabel,
    'aria-label': props['aria-label'],
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': props['aria-describedby'],
    'aria-details': props['aria-details']
  };
}

export interface SliderBaseProps extends UseSliderBaseContainerProps, LabelableProps, AriaLabelingProps {
  children: ReactNodeArray,
  orientation?: Orientation,
  labelPosition?: LabelPosition,
  valueLabel?: ReactNode,
  formatOptions?: Intl.NumberFormatOptions,
  classes?: string[] | Object,
  style?: CSSProperties
}

function SliderBase(props: SliderBaseProps, ref: DOMRef) {
  // needed?
  useDOMRef(ref);

  let {
    state, children, classes, style,
    trackRef, hoverProps, isDisabled,
    labelProps, containerProps, trackProps,
    labelPosition = 'top', valueLabel, showValueLabel = !!props.label
  } = props;

  let displayValue = valueLabel;
  if (!displayValue) {
    switch (state.values.length) {
      case 1:
        displayValue = state.getThumbValueLabel(0);
        break;
      case 2:
        // This should really use the NumberFormat#formatRange proposal
        displayValue = `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`;
        break;
      default:
        throw new Error('Only sliders with 1 or 2 handles are supported!');
    }
  }

  let labelNode = <label className={classNames(styles, 'spectrum-Slider-label')} {...labelProps}>{props.label}</label>;
  let valueNode = <div className={classNames(styles, 'spectrum-Slider-value')} role="textbox" aria-readonly="true" aria-labelledby={labelProps.id}>{displayValue}</div>;

  return (
    <div
      className={classNames(styles,
        'spectrum-Slider',
        {
          'spectrum-Slider--label-side': labelPosition === 'side',
          'is-disabled': isDisabled
        },
        classes)}
      style={style}
      {...containerProps}>
      {(props.label) &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')} role="presentation">
          {props.label && labelNode}
          {labelPosition === 'top' && showValueLabel && valueNode}
        </div>
      }
      <div className={classNames(styles, 'spectrum-Slider-controls')} ref={trackRef} {...mergeProps(trackProps, hoverProps)} role="presentation">
        {children}
      </div>
      {labelPosition === 'side' &&
        <div className={classNames(styles, 'spectrum-Slider-labelContainer')} role="presentation">
          {showValueLabel && valueNode}
        </div>
      }
    </div>);
}

const _SliderBase = React.forwardRef(SliderBase);
export {_SliderBase as SliderBase};
