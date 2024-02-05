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

import {AriaProgressBarProps, useProgressBar} from 'react-aria';
import {clamp} from '@react-stately/utils';
import {ContextValue, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'label'>, RenderProps<ProgressBarRenderProps>, SlotProps {}

export interface ProgressBarRenderProps {
  /**
   * The value as a percentage between the minimum and maximum.
   */
  percentage?: number,
  /**
   * A formatted version of the value.
   * @selector [aria-valuetext]
   */
  valueText: string | undefined,
  /**
   * Whether the progress bar is indeterminate.
   * @selector :not([aria-valuenow])
   */
  isIndeterminate: boolean
}

export const ProgressBarContext = createContext<ContextValue<ProgressBarProps, HTMLDivElement>>(null);

function ProgressBar(props: ProgressBarProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ProgressBarContext);
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    isIndeterminate = false
  } = props;
  value = clamp(value, minValue, maxValue);

  let [labelRef, label] = useSlot();
  let {
    progressBarProps,
    labelProps
  } = useProgressBar({...props, label});

  // Calculate the width of the progress bar as a percentage
  let percentage = isIndeterminate ? undefined : (value - minValue) / (maxValue - minValue) * 100;

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ProgressBar',
    values: {
      percentage,
      valueText: progressBarProps['aria-valuetext'],
      isIndeterminate
    }
  });

  return (
    <div {...progressBarProps} {...renderProps} ref={ref} slot={props.slot || undefined}>
      <LabelContext.Provider value={{...labelProps, ref: labelRef, elementType: 'span'}}>
        {renderProps.children}
      </LabelContext.Provider>
    </div>
  );
}

/**
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
const _ProgressBar = forwardRef(ProgressBar);
export {_ProgressBar as ProgressBar};
