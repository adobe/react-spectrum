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
import {classNames} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {ProgressBarBase} from '@react-spectrum/progress';
import React from 'react';
import {SpectrumMeterProps} from '@react-types/meter';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useMeter} from '@react-aria/meter';

function Meter(props: SpectrumMeterProps, ref: DOMRef<HTMLDivElement>) {
  let {variant, ...otherProps} = props;
  const {
    meterProps,
    labelProps
  } = useMeter({...otherProps, textValue: otherProps.valueLabel as any});

  return (
    <ProgressBarBase
      {...otherProps}
      ref={ref}
      barProps={meterProps}
      labelProps={labelProps}
      barClassName={
        classNames(
          styles,
          {
            'is-positive': variant === 'positive',
            'is-warning': variant === 'warning',
            'is-critical': variant === 'critical'
          }
        )
      } />
  );
}

let _Meter = React.forwardRef(Meter);
export {_Meter as Meter};
