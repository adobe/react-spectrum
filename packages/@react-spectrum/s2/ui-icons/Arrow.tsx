/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Arrow_M from './S2_ArrowSize100.svg';
import Arrow_XXL from './S2_ArrowSize400.svg';
import {SVGProps} from 'react';

export default function Arrow(props: SVGProps<SVGSVGElement> & {size?: 'M' | 'XXL'}) {
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'M':
      return <Arrow_M {...otherProps} />;
    case 'XXL':
      return <Arrow_XXL {...otherProps} />;
  }
}
