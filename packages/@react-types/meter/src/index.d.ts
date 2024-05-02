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

import {AriaProgressBarBaseProps, ProgressBarBaseProps, SpectrumProgressBarBaseProps} from '@react-types/progress';

export type MeterProps = ProgressBarBaseProps;
export interface AriaMeterProps extends AriaProgressBarBaseProps {}
export interface SpectrumMeterProps extends SpectrumProgressBarBaseProps {
  /** 
   * The [visual style](https://spectrum.adobe.com/page/meter/#Options) of the Meter. 
   * @default 'informative'
   */
  variant?: 'informative' | 'positive' | 'warning' | 'critical'
}
