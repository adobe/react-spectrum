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
import {ProgressBarBase} from './ProgressBarBase';
import React from 'react';
import {SpectrumProgressBarProps} from '@react-types/progress';
import styles from '@adobe/spectrum-css-temp/components/barloader/vars.css';
import {useProgressBar} from '@react-aria/progress';

/**
 * ProgressBars show the progression of a system operation: downloading, uploading, processing, etc., in a visual way.
 * They can represent either determinate or indeterminate progress.
 */
export const ProgressBar = React.forwardRef(function ProgressBar(props: SpectrumProgressBarProps, ref: DOMRef<HTMLDivElement>) {
  let {staticColor, variant, ...otherProps} = props;
  const {
    progressBarProps,
    labelProps
  } = useProgressBar(props);

  return (
    <ProgressBarBase
      {...otherProps}
      ref={ref}
      barProps={progressBarProps}
      labelProps={labelProps}
      barClassName={
        classNames(
          styles,
          {
            'spectrum-BarLoader--overBackground': variant === 'overBackground',
            'spectrum-BarLoader--staticWhite': staticColor === 'white',
            'spectrum-BarLoader--staticBlack': staticColor === 'black'
          }
        )
      } />
  );
});
