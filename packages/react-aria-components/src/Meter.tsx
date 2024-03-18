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

import {AriaMeterProps, useMeter} from 'react-aria';
import {clamp} from '@react-stately/utils';
import {ContextValue, forwardRefType, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef} from 'react';

export interface MeterProps extends Omit<AriaMeterProps, 'label'>, RenderProps<MeterRenderProps>, SlotProps {}

export interface MeterRenderProps {
  /**
   * The value as a percentage between the minimum and maximum.
   */
  percentage: number,
  /**
   * A formatted version of the value.
   * @selector [aria-valuetext]
   */
  valueText: string | undefined
}

export const MeterContext = createContext<ContextValue<MeterProps, HTMLDivElement>>(null);

function Meter(props: MeterProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, MeterContext);
  let {
    value = 0,
    minValue = 0,
    maxValue = 100
  } = props;
  value = clamp(value, minValue, maxValue);

  let [labelRef, label] = useSlot();
  let {
    meterProps,
    labelProps
  } = useMeter({...props, label});

  // Calculate the width of the progress bar as a percentage
  let percentage = (value - minValue) / (maxValue - minValue) * 100;

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Meter',
    values: {
      percentage,
      valueText: meterProps['aria-valuetext']
    }
  });

  return (
    <div {...meterProps} {...renderProps} ref={ref} slot={props.slot || undefined}>
      <LabelContext.Provider value={{...labelProps, ref: labelRef, elementType: 'span'}}>
        {renderProps.children}
      </LabelContext.Provider>
    </div>
  );
}

/**
 * A meter represents a quantity within a known range, or a fractional value.
 */
const _Meter = /*#__PURE__*/ (forwardRef as forwardRefType)(Meter);
export {_Meter as Meter};
